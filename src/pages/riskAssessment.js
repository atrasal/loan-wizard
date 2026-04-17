/**
 * Risk Assessment Page — Animated risk evaluation dashboard with
 * fraud checks, bureau score, policy evaluation, and LLM insights
 */
import { router } from '../utils/router.js';
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { showToast, createGauge, animateGauges, sleep, formatPercent } from '../utils/helpers.js';
import { riskEngine } from '../modules/riskEngine.js';
import { llmEngine } from '../modules/llmEngine.js';

export function renderRiskAssessment() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Risk assessment page rendered');

  const page = document.createElement('div');
  page.className = 'risk-page page';
  page.innerHTML = `
    <div class="risk-header">
      <h2 class="risk-title">Risk Assessment</h2>
      <p style="color: var(--gray-400); font-size: 15px;">
        Automated evaluation of fraud signals, policy compliance, and creditworthiness
      </p>
    </div>

    <div class="risk-grid" id="risk-grid">
      <div class="glass-card glass-card--elevated" style="text-align: center; padding: 48px;">
        <div class="spinner" style="margin: 0 auto 16px;"></div>
        <p style="color: var(--gray-400);">Running risk evaluation...</p>
      </div>
    </div>
  `;

  setTimeout(() => runRiskEvaluation(), 500);

  return page;
}

async function runRiskEvaluation() {
  const data = window.__loanWizardData || {};
  const grid = document.getElementById('risk-grid');
  if (!grid) return;

  // Show loading state
  showToast('Analyzing fraud signals...', 'info');
  await sleep(800);

  // Run risk engine
  const riskResult = riskEngine.evaluate(data);

  // Run LLM analysis
  showToast('Running AI classification...', 'info');
  const llmResult = await llmEngine.analyze(data);

  // Store results globally
  window.__loanWizardRisk = riskResult;
  window.__loanWizardLLM = llmResult;

  // Determine gauge color
  const bureauScore = riskResult.bureauScore.score;
  let gaugeColor = 'var(--color-success)';
  if (bureauScore < 650) gaugeColor = 'var(--color-danger)';
  else if (bureauScore < 700) gaugeColor = 'var(--color-warning)';

  let riskGaugeColor = 'var(--color-success)';
  if (riskResult.riskScore > 60) riskGaugeColor = 'var(--color-danger)';
  else if (riskResult.riskScore > 35) riskGaugeColor = 'var(--color-warning)';

  // Render full dashboard
  grid.innerHTML = `
    <!-- Fraud Signal Checks -->
    <div class="glass-card glass-card--elevated">
      <div class="card-title">
        <i data-lucide="shield-alert"></i>
        Fraud Signal Analysis
      </div>
      <div class="check-list" id="check-list">
        ${riskResult.fraudChecks.map(check => `
          <div class="check-item">
            <div class="check-icon ${check.passed ? 'pass' : (check.severity === 'critical' ? 'fail' : 'warn')}">
              <i data-lucide="${check.passed ? 'check' : (check.severity === 'critical' ? 'x' : 'alert-triangle')}" style="width:14px;height:14px"></i>
            </div>
            <div style="flex:1;">
              <div style="font-weight: 600; color: var(--white); font-size: 13px;">${check.name}</div>
              <div style="font-size: 11px; color: var(--gray-500); margin-top: 2px;">${check.description}</div>
            </div>
            <span class="badge ${check.passed ? 'badge-success' : (check.severity === 'critical' ? 'badge-danger' : 'badge-warning')}">
              ${check.passed ? 'PASS' : 'FLAG'}
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Bureau Score -->
    <div class="glass-card glass-card--elevated bureau-section">
      <div class="card-title" style="align-self: flex-start;">
        <i data-lucide="bar-chart-3"></i>
        Bureau Score (CIBIL)
      </div>
      ${createGauge(bureauScore, 900, gaugeColor, 'CIBIL')}
      <div style="text-align: center; margin-top: 8px;">
        <span class="badge ${bureauScore >= 750 ? 'badge-success' : bureauScore >= 700 ? 'badge-info' : bureauScore >= 650 ? 'badge-warning' : 'badge-danger'}">
          ${riskResult.bureauScore.rating}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin-top: 12px;">
        <div class="stat-card" style="text-align: center;">
          <span class="stat-value" style="font-size: 18px;">${riskResult.bureauScore.accounts}</span>
          <span class="stat-label">Active Accounts</span>
        </div>
        <div class="stat-card" style="text-align: center;">
          <span class="stat-value" style="font-size: 14px; color: ${riskResult.bureauScore.defaultHistory === 'Clean' ? 'var(--color-success)' : 'var(--color-warning)'}">
            ${riskResult.bureauScore.defaultHistory}
          </span>
          <span class="stat-label">Default History</span>
        </div>
      </div>
    </div>

    <!-- Policy Evaluation -->
    <div class="glass-card glass-card--elevated">
      <div class="card-title">
        <i data-lucide="clipboard-check"></i>
        Policy Evaluation
      </div>
      <div class="policy-list">
        ${riskResult.policyChecks.map(policy => `
          <div class="policy-rule">
            <span class="policy-rule-name">${policy.name}</span>
            <span class="policy-rule-status" style="color: ${policy.passed ? 'var(--color-success)' : 'var(--color-danger)'}">
              ${policy.passed ? '✓ ' : '✗ '}${policy.value}
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- LLM Classification -->
    <div class="glass-card glass-card--elevated">
      <div class="card-title">
        <i data-lucide="brain"></i>
        AI Intelligence Layer
      </div>
      <div class="llm-output">
        <div class="llm-row">
          <span class="llm-key">Customer Persona</span>
          <span class="llm-value">${llmResult.classification.persona}</span>
        </div>
        <div class="llm-row">
          <span class="llm-key">Risk Band</span>
          <span class="llm-value">
            <span class="badge ${llmResult.riskBand.band === 'Low Risk' ? 'badge-success' : llmResult.riskBand.band === 'Medium Risk' ? 'badge-warning' : 'badge-danger'}">
              ${llmResult.riskBand.band}
            </span>
          </span>
        </div>
        <div class="llm-row">
          <span class="llm-key">Segment</span>
          <span class="llm-value">${llmResult.classification.segment}</span>
        </div>
        <div class="llm-row">
          <span class="llm-key">Lifetime Value</span>
          <span class="llm-value">${llmResult.classification.lifetimeValue}</span>
        </div>
        <div class="llm-row">
          <span class="llm-key">Intent</span>
          <span class="llm-value" style="font-size: 12px;">${llmResult.intentAnalysis.primaryIntent}</span>
        </div>
        <div class="llm-row">
          <span class="llm-key">Confidence</span>
          <span class="llm-value">${formatPercent(llmResult.confidence * 100)}</span>
        </div>
        <div class="llm-row">
          <span class="llm-key">Model</span>
          <span class="llm-value" style="font-size: 11px; font-family: var(--font-mono); color: var(--gray-400);">${llmResult.model}</span>
        </div>
      </div>
    </div>

    <!-- Overall Risk Score -->
    <div class="glass-card glass-card--elevated full-width" style="display: flex; align-items: center; gap: 32px; justify-content: center;">
      <div>
        ${createGauge(riskResult.riskScore, 100, riskGaugeColor, 'RISK')}
      </div>
      <div style="flex: 1; max-width: 400px;">
        <div style="font-size: 12px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Overall Risk Score</div>
        <div style="font-size: 36px; font-weight: 800; font-family: var(--font-heading); color: var(--white); margin-bottom: 4px;">
          ${riskResult.riskScore}<span style="font-size: 16px; color: var(--gray-500);"> / 100</span>
        </div>
        <div style="font-size: 13px; color: var(--gray-400); margin-bottom: 16px;">
          ${riskResult.riskScore <= 30 ? 'Low risk profile — eligible for premium offers' : 
            riskResult.riskScore <= 60 ? 'Moderate risk — standard offers applicable' : 
            'Elevated risk — conditional approval with restrictions'}
        </div>
        ${llmResult.recommendations.map(r => `
          <div style="font-size: 12px; color: var(--gray-400); padding: 4px 0; display: flex; gap: 6px; align-items: flex-start;">
            <span style="color: var(--pf-cyan);">→</span> ${r}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Decision Banner -->
    <div class="full-width">
      <div class="decision-banner ${riskResult.decision}" id="decision-banner">
        <i data-lucide="${riskResult.decision === 'approved' ? 'check-circle' : riskResult.decision === 'conditionally-approved' ? 'alert-circle' : 'x-circle'}" 
           style="width:28px;height:28px"></i>
        <span>
          ${riskResult.decision === 'approved' ? 'APPLICATION APPROVED' : 
            riskResult.decision === 'conditionally-approved' ? 'CONDITIONALLY APPROVED' : 'APPLICATION DECLINED'}
        </span>
      </div>

      <div class="risk-actions">
        ${riskResult.decision !== 'declined' ? `
          <button class="btn btn-primary btn-lg" id="btn-view-offers">
            <i data-lucide="gift"></i>
            View Loan Offers
          </button>
        ` : `
          <button class="btn btn-secondary" id="btn-restart-journey">
            <i data-lucide="refresh-cw"></i>
            Start Over
          </button>
        `}
        <button class="btn btn-ghost" id="btn-view-audit">
          <i data-lucide="file-text"></i>
          View Audit Log
        </button>
      </div>
    </div>
  `;

  // Initialize icons & animations
  if (window.lucide) window.lucide.createIcons();
  setTimeout(() => animateGauges(), 200);

  // Attach handlers
  const offersBtn = document.getElementById('btn-view-offers');
  const restartBtn = document.getElementById('btn-restart-journey');
  const auditBtn = document.getElementById('btn-view-audit');

  if (offersBtn) offersBtn.addEventListener('click', () => router.navigate('offer'));
  if (restartBtn) restartBtn.addEventListener('click', () => router.navigate('landing'));
  if (auditBtn) auditBtn.addEventListener('click', () => router.navigate('audit'));

  showToast(
    riskResult.decision === 'approved' ? 'Congratulations! You are approved!' :
    riskResult.decision === 'conditionally-approved' ? 'Conditionally approved. View your offers.' :
    'Application declined based on risk assessment.',
    riskResult.decision === 'approved' ? 'success' : riskResult.decision === 'conditionally-approved' ? 'warning' : 'danger'
  );
}
