/**
 * LLM Engine — Simulated LLM intelligence layer for customer
 * classification, intent analysis, and contextual understanding
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { sleep } from '../utils/helpers.js';

class LLMEngine {
  constructor() {
    this.result = null;
  }

  async analyze(data) {
    logger.log(LOG_CATEGORIES.LLM, 'Starting LLM analysis...', {
      transcriptLength: data.transcript?.length || 0,
      hasEntities: !!data.entities,
    });

    // Simulate LLM processing time
    await sleep(1500 + Math.random() * 1000);

    const classification = this._classifyCustomer(data);
    const intentAnalysis = this._analyzeIntent(data);
    const riskBand = this._assessRiskBand(data);
    const recommendations = this._generateRecommendations(data);

    this.result = {
      classification,
      intentAnalysis,
      riskBand,
      recommendations,
      confidence: 0.82 + Math.random() * 0.15,
      model: 'Poonawalla-LLM-v2.1',
      processingTime: '1.2s',
      timestamp: new Date().toISOString(),
    };

    logger.log(LOG_CATEGORIES.LLM, 'LLM analysis complete', {
      riskBand: riskBand.band,
      persona: classification.persona,
      confidence: this.result.confidence.toFixed(2),
    });

    return this.result;
  }

  _classifyCustomer(data) {
    const income = data.entities?.income || 30000;
    const employment = data.entities?.employment || 'Salaried';
    const purpose = data.entities?.purpose || 'Personal Expense';

    let persona, segment, lifetime;

    if (income >= 100000 && employment === 'Salaried') {
      persona = 'Premium Professional';
      segment = 'High-Value Salaried';
      lifetime = 'High';
    } else if (income >= 50000) {
      persona = 'Mid-Career Professional';
      segment = 'Core Salaried';
      lifetime = 'Medium-High';
    } else if (employment === 'Self-Employed') {
      persona = 'Entrepreneurial Borrower';
      segment = 'Self-Employed';
      lifetime = 'Medium';
    } else {
      persona = 'Emerging Professional';
      segment = 'Entry-Level Salaried';
      lifetime = 'Medium';
    }

    return {
      persona,
      segment,
      lifetimeValue: lifetime,
      crossSellPotential: income >= 50000 ? 'High' : 'Medium',
      retentionRisk: income >= 75000 ? 'Low' : 'Medium',
    };
  }

  _analyzeIntent(data) {
    const purpose = data.entities?.purpose || 'Personal Expense';
    const transcript = data.transcriptText || '';

    const urgencyKeywords = ['urgent', 'immediately', 'asap', 'right away', 'emergency', 'quickly'];
    const isUrgent = urgencyKeywords.some(k => transcript.toLowerCase().includes(k));

    return {
      primaryIntent: `Seeking ${purpose.toLowerCase()} loan`,
      urgency: isUrgent ? 'High' : 'Normal',
      sentiment: 'Positive',
      cooperationLevel: 'High',
      clarityScore: data.entities?.name && data.entities?.income ? 'Clear' : 'Partial',
    };
  }

  _assessRiskBand(data) {
    const income = data.entities?.income || 30000;
    const employment = data.entities?.employment || 'Salaried';
    const consent = data.entities?.consent || false;
    const livenessPercent = data.livenessPercent || 85;

    let score = 30; // Base

    // Income factor
    if (income >= 100000) score -= 10;
    else if (income >= 50000) score -= 5;
    else if (income < 20000) score += 15;

    // Employment stability
    if (employment === 'Salaried') score -= 10;

    // Behavioral signals
    if (consent) score -= 5;
    if (livenessPercent >= 80) score -= 5;

    // Add slight randomness
    score += Math.floor(Math.random() * 10) - 5;
    score = Math.max(0, Math.min(100, score));

    let band;
    if (score <= 30) band = 'Low Risk';
    else if (score <= 60) band = 'Medium Risk';
    else band = 'High Risk';

    return {
      score,
      band,
      factors: [
        `Income stability: ${income >= 50000 ? 'Strong' : 'Moderate'}`,
        `Employment: ${employment}`,
        `Behavioral signals: ${consent ? 'Positive' : 'Neutral'}`,
        `Session quality: ${livenessPercent >= 80 ? 'High' : 'Moderate'}`,
      ],
    };
  }

  _generateRecommendations(data) {
    const income = data.entities?.income || 30000;
    const purpose = data.entities?.purpose || 'Personal Expense';

    const recs = [];

    if (income >= 75000) {
      recs.push('Eligible for premium loan tier with preferential rates');
      recs.push('Consider cross-selling credit card and investment products');
    }

    if (purpose === 'Home Renovation') {
      recs.push('Offer Loan Against Property as alternative product');
    } else if (purpose === 'Business Expansion') {
      recs.push('Route to Business Loan division for specialized assessment');
    }

    recs.push('Standard documentation post-disbursement required');

    return recs;
  }

  getResult() {
    return this.result;
  }
}

export const llmEngine = new LLMEngine();
