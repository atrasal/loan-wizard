/**
 * Loan Offer Page — Personalized tiered loan offers with EMI calculator
 */
import { router } from '../utils/router.js';
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { showToast, formatCurrency, formatPercent } from '../utils/helpers.js';
import { offerEngine } from '../modules/offerEngine.js';

let selectedTenure = 36;

export function renderLoanOffer() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Loan offer page rendered');

  const data = window.__loanWizardData || {};
  const riskResult = window.__loanWizardRisk || {};
  const llmResult = window.__loanWizardLLM || {};

  // Generate offers
  const offers = offerEngine.generate(riskResult, data, llmResult);
  window.__loanWizardOffers = offers;

  if (offers.length === 0) {
    return renderDeclined();
  }

  const page = document.createElement('div');
  page.className = 'offer-page page';

  const validUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const validStr = validUntil.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  page.innerHTML = `
    <div class="offer-header">
      <div class="landing-badge" style="margin-bottom: 16px;">
        <i data-lucide="sparkles" style="width:14px;height:14px;color:var(--pf-gold)"></i>
        <span style="color: var(--pf-gold);">Personalized Just for You</span>
      </div>
      <h2 class="offer-title">Your Loan Offers</h2>
      <p class="offer-subtitle">
        Based on your profile, creditworthiness, and AI analysis, here are your eligible offers.
      </p>
    </div>

    <!-- EMI Tenure Slider -->
    <div class="emi-slider-section glass-card glass-card--elevated">
      <h3>
        <i data-lucide="sliders-horizontal" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;"></i>
        Adjust Tenure
      </h3>
      <div class="slider-container">
        <span class="slider-label">12 months</span>
        <input type="range" id="tenure-slider" min="12" max="60" step="12" value="36" />
        <span class="slider-label">60 months</span>
      </div>
      <div style="text-align: center; margin-top: 8px;">
        <span class="slider-value" id="tenure-display">${selectedTenure} months</span>
      </div>
    </div>

    <!-- Offer Cards -->
    <div class="offer-grid" id="offer-grid">
      ${offers.map((offer, i) => renderOfferCard(offer, i)).join('')}
    </div>

    <!-- Footer -->
    <div class="offer-footer">
      <p class="offer-validity">
        Offers valid until <strong>${validStr}</strong>. Terms and conditions apply.
      </p>
      <div style="display: flex; justify-content: center; gap: 16px;">
        <button class="btn btn-ghost" id="btn-back-risk">
          <i data-lucide="arrow-left"></i> Back to Assessment
        </button>
        <button class="btn btn-secondary" id="btn-skip-audit">
          <i data-lucide="file-text"></i> View Audit Dashboard
        </button>
      </div>
      <p style="font-size: 11px; color: var(--gray-600); margin-top: 16px; max-width: 600px; margin-left:auto; margin-right:auto; line-height: 1.6;">
        * Interest rates are indicative and subject to final verification. EMI calculated using reducing balance method. 
        Processing fees are one-time and non-refundable. All offers are subject to final documentation and credit approval by Poonawalla Fincorp Ltd.
        RBI registered NBFC. CIN: L65910MH1982PLC028160
      </p>
    </div>
  `;

  setTimeout(() => {
    // Tenure slider
    const slider = document.getElementById('tenure-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        selectedTenure = parseInt(e.target.value);
        document.getElementById('tenure-display').textContent = `${selectedTenure} months`;
        updateOfferEMIs(offers);
      });
    }

    // Accept buttons
    document.querySelectorAll('.btn-accept-offer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('[data-offer-index]').dataset.offerIndex);
        acceptOffer(offers[index]);
      });
    });

    // Nav buttons
    document.getElementById('btn-back-risk')?.addEventListener('click', () => router.navigate('risk'));
    document.getElementById('btn-skip-audit')?.addEventListener('click', () => router.navigate('audit'));
  }, 0);

  return page;
}

function renderOfferCard(offer, index) {
  const emi = offer.emiBreakdown[selectedTenure] || offer.defaultEMI;

  return `
    <div class="glass-card glass-card--elevated offer-card ${offer.recommended ? 'recommended' : ''}" 
         data-offer-index="${index}" id="offer-card-${index}">
      <span class="offer-tier">${offer.name}</span>
      
      <div class="offer-amount">
        <span class="currency">₹</span>${(offer.amount).toLocaleString('en-IN')}
      </div>

      <div class="offer-details">
        <div class="offer-detail">
          <span class="offer-detail-label">Interest Rate</span>
          <span class="offer-detail-value">${formatPercent(offer.rate)} p.a.</span>
        </div>
        <div class="offer-detail">
          <span class="offer-detail-label">Tenure</span>
          <span class="offer-detail-value" id="offer-tenure-${index}">${selectedTenure} months</span>
        </div>
        <div class="offer-detail">
          <span class="offer-detail-label">Processing Fee</span>
          <span class="offer-detail-value">${formatPercent(offer.processingFee)} (${formatCurrency(offer.processingFeeAmount)})</span>
        </div>
      </div>

      <div class="offer-emi">
        <div class="offer-emi-label">Monthly EMI</div>
        <div class="offer-emi-value" id="offer-emi-${index}">${formatCurrency(emi)}</div>
      </div>

      ${offer.conditions.length > 0 ? `
        <div style="font-size: 11px; color: var(--color-warning); padding: 8px; background: var(--color-warning-bg); border-radius: var(--radius-sm);">
          ${offer.conditions.map(c => `<div>⚠ ${c}</div>`).join('')}
        </div>
      ` : ''}

      <button class="btn ${offer.recommended ? 'btn-primary' : 'btn-secondary'} offer-select-btn btn-accept-offer">
        ${offer.recommended ? '<i data-lucide="check-circle"></i>' : '<i data-lucide="arrow-right"></i>'}
        ${offer.recommended ? 'Accept Offer' : 'Select'}
      </button>
    </div>
  `;
}

function updateOfferEMIs(offers) {
  offers.forEach((offer, i) => {
    const emiEl = document.getElementById(`offer-emi-${i}`);
    const tenureEl = document.getElementById(`offer-tenure-${i}`);
    const emi = offer.emiBreakdown[selectedTenure] || offer.defaultEMI;
    if (emiEl) emiEl.textContent = formatCurrency(emi);
    if (tenureEl) tenureEl.textContent = `${selectedTenure} months`;
  });
}

function acceptOffer(offer) {
  logger.log(LOG_CATEGORIES.OFFER, `Offer accepted: ${offer.name}`, {
    amount: offer.amount,
    rate: offer.rate,
    tenure: selectedTenure,
    emi: offer.emiBreakdown[selectedTenure],
  });

  window.__loanWizardAcceptedOffer = {
    ...offer,
    selectedTenure,
    selectedEMI: offer.emiBreakdown[selectedTenure],
  };

  showToast(`${offer.name} offer accepted! ${formatCurrency(offer.amount)} at ${formatPercent(offer.rate)} p.a.`, 'success', 5000);

  setTimeout(() => router.navigate('audit'), 1200);
}

function renderDeclined() {
  const page = document.createElement('div');
  page.className = 'offer-page page';
  page.innerHTML = `
    <div class="offer-header" style="margin-top: 100px;">
      <h2 class="offer-title">No Offers Available</h2>
      <p class="offer-subtitle">
        Based on our assessment, we are unable to generate loan offers at this time.
        You can view the detailed audit log or try again.
      </p>
      <div style="display: flex; justify-content: center; gap: 16px; margin-top: 32px;">
        <button class="btn btn-primary" onclick="window.location.hash='landing'">
          <i data-lucide="refresh-cw"></i> Try Again
        </button>
        <button class="btn btn-secondary" onclick="window.location.hash='audit'">
          <i data-lucide="file-text"></i> View Audit Log
        </button>
      </div>
    </div>
  `;
  return page;
}
