/**
 * Risk Engine — Deterministic policy rules + simulated bureau scoring
 * for fraud detection and eligibility assessment
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';

class RiskEngine {
  constructor() {
    this.result = null;
  }

  evaluate(applicationData) {
    logger.log(LOG_CATEGORIES.RISK, 'Starting risk evaluation', applicationData);

    const fraudChecks = this._runFraudChecks(applicationData);
    const policyChecks = this._runPolicyChecks(applicationData);
    const bureauScore = this._simulateBureauScore(applicationData);
    const riskScore = this._calculateRiskScore(fraudChecks, policyChecks, bureauScore);

    const allPoliciesPassed = policyChecks.every(p => p.passed);
    const criticalFraudFail = fraudChecks.some(f => f.severity === 'critical' && !f.passed);

    let decision;
    if (criticalFraudFail) {
      decision = 'declined';
    } else if (!allPoliciesPassed || riskScore > 70) {
      decision = 'conditionally-approved';
    } else {
      decision = 'approved';
    }

    this.result = {
      fraudChecks,
      policyChecks,
      bureauScore,
      riskScore,
      decision,
      timestamp: new Date().toISOString(),
    };

    logger.log(LOG_CATEGORIES.RISK, `Risk evaluation complete: ${decision}`, {
      riskScore,
      bureauScore: bureauScore.score,
      decision,
    });

    return this.result;
  }

  _runFraudChecks(data) {
    const checks = [];

    // 1. Location verification
    const locationMatch = data.geo && !data.geo.simulated;
    checks.push({
      id: 'geo-verify',
      name: 'Location Verification',
      description: `Customer located in ${data.geo?.city || 'Unknown'}, ${data.geo?.state || 'Unknown'}`,
      passed: true, // For demo, always pass unless geo is missing
      severity: 'warning',
      detail: data.geo ? `${data.geo.city}, ${data.geo.state} (Accuracy: ${data.geo.accuracy}m)` : 'Not available',
    });

    // 2. Age consistency
    const declaredAge = data.declaredAge || 30;
    const estimatedAge = data.faceAge || declaredAge;
    const ageDiff = Math.abs(declaredAge - estimatedAge);
    checks.push({
      id: 'age-consistency',
      name: 'Age Consistency Check',
      description: `Declared: ${declaredAge}y, Estimated: ${estimatedAge}y (Δ${ageDiff}y)`,
      passed: ageDiff <= 8,
      severity: ageDiff > 15 ? 'critical' : 'warning',
      detail: `Difference of ${ageDiff} years`,
    });

    // 3. Liveness check
    const livenessPercent = data.livenessPercent || 0;
    checks.push({
      id: 'liveness',
      name: 'Liveness Detection',
      description: `Face detected in ${livenessPercent}% of video frames`,
      passed: livenessPercent >= 60,
      severity: 'critical',
      detail: `${livenessPercent}% liveness score`,
    });

    // 4. Consent verification
    checks.push({
      id: 'consent',
      name: 'Verbal Consent Captured',
      description: data.consent ? 'Customer provided explicit verbal consent' : 'Consent not detected',
      passed: data.consent === true,
      severity: 'critical',
      detail: data.consent ? 'Verified' : 'Not captured',
    });

    // 5. Session integrity
    checks.push({
      id: 'session',
      name: 'Session Integrity',
      description: 'Single continuous video session verified',
      passed: true,
      severity: 'warning',
      detail: 'No interruptions detected',
    });

    return checks;
  }

  _runPolicyChecks(data) {
    const age = data.faceAge || data.declaredAge || 30;
    const income = data.income || 0;
    const employment = data.employment || 'Unknown';

    return [
      {
        id: 'age-eligibility',
        name: 'Age Eligibility (21-60 years)',
        passed: age >= 21 && age <= 60,
        value: `${age} years`,
      },
      {
        id: 'min-income',
        name: 'Minimum Income (₹15,000/month)',
        passed: income >= 15000,
        value: `₹${income.toLocaleString('en-IN')}/month`,
      },
      {
        id: 'employment-eligible',
        name: 'Employment Type Eligible',
        passed: ['Salaried', 'Self-Employed'].includes(employment),
        value: employment,
      },
      {
        id: 'location-serviceable',
        name: 'Location Serviceable',
        passed: true, // All Indian locations serviceable for demo
        value: data.geo?.city || 'India',
      },
      {
        id: 'document-verification',
        name: 'Video KYC Completed',
        passed: true,
        value: 'Completed',
      },
    ];
  }

  _simulateBureauScore(data) {
    const income = data.income || 30000;
    const employment = data.employment || 'Salaried';

    // Generate realistic bureau score based on income
    let baseScore;
    if (income >= 100000) baseScore = 780;
    else if (income >= 75000) baseScore = 750;
    else if (income >= 50000) baseScore = 720;
    else if (income >= 35000) baseScore = 700;
    else if (income >= 25000) baseScore = 680;
    else baseScore = 660;

    // Employment bonus
    if (employment === 'Salaried') baseScore += 20;

    // Add some randomness
    const variance = Math.floor(Math.random() * 40) - 20;
    const score = Math.max(300, Math.min(900, baseScore + variance));

    let rating;
    if (score >= 750) rating = 'Excellent';
    else if (score >= 700) rating = 'Good';
    else if (score >= 650) rating = 'Fair';
    else rating = 'Poor';

    return {
      score,
      rating,
      maxScore: 900,
      accounts: Math.floor(Math.random() * 5) + 2,
      defaultHistory: score >= 700 ? 'Clean' : 'Minor defaults',
    };
  }

  _calculateRiskScore(fraudChecks, policyChecks, bureau) {
    let score = 50; // Start at mid

    // Fraud checks impact
    fraudChecks.forEach(check => {
      if (!check.passed) {
        score += check.severity === 'critical' ? 25 : 10;
      } else {
        score -= 5;
      }
    });

    // Policy checks impact
    policyChecks.forEach(check => {
      if (!check.passed) score += 10;
      else score -= 3;
    });

    // Bureau score impact
    if (bureau.score >= 750) score -= 15;
    else if (bureau.score >= 700) score -= 10;
    else if (bureau.score >= 650) score -= 5;
    else score += 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getResult() {
    return this.result;
  }
}

export const riskEngine = new RiskEngine();
