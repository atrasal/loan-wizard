/**
 * Application Page — Auto-filled form with data extracted from video call
 */
import { router } from '../utils/router.js';
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { showToast, formatCurrency } from '../utils/helpers.js';

export function renderApplication() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Application page rendered');

  const data = window.__loanWizardData || {};
  const entities = data.entities || {};

  const page = document.createElement('div');
  page.className = 'application page';
  page.innerHTML = `
    <div class="application-header">
      <h2 class="application-title">Review Your Application</h2>
      <p class="application-desc">
        The following information was extracted from your video call. Please verify and complete any missing fields.
      </p>
    </div>

    <form class="application-form glass-card glass-card--elevated" id="application-form">
      <div class="form-group">
        <label class="form-label">
          Full Name
          ${entities.name ? '<span class="ai-badge"><i data-lucide="sparkles" style="width:10px;height:10px"></i> AI Extracted</span>' : ''}
        </label>
        <div class="form-input-wrapper">
          <input type="text" class="form-input ${entities.name ? 'form-input--ai' : ''}" id="field-name" 
                 value="${entities.name || ''}" placeholder="Enter your full name" required />
        </div>
        ${entities.name ? '<div class="confidence-bar"><div class="confidence-fill confidence-high" style="width: 92%"></div></div>' : ''}
      </div>

      <div class="form-group">
        <label class="form-label">
          Employment Type
          ${entities.employment ? '<span class="ai-badge"><i data-lucide="sparkles" style="width:10px;height:10px"></i> AI Extracted</span>' : ''}
        </label>
        <select class="form-input ${entities.employment ? 'form-input--ai' : ''}" id="field-employment" required>
          <option value="" disabled ${!entities.employment ? 'selected' : ''}>Select employment type</option>
          <option value="Salaried" ${entities.employment === 'Salaried' ? 'selected' : ''}>Salaried</option>
          <option value="Self-Employed" ${entities.employment === 'Self-Employed' ? 'selected' : ''}>Self-Employed</option>
        </select>
        ${entities.employment ? '<div class="confidence-bar"><div class="confidence-fill confidence-high" style="width: 95%"></div></div>' : ''}
      </div>

      <div class="form-group">
        <label class="form-label">
          Monthly Income (₹)
          ${entities.income ? '<span class="ai-badge"><i data-lucide="sparkles" style="width:10px;height:10px"></i> AI Extracted</span>' : ''}
        </label>
        <div class="form-input-wrapper">
          <input type="number" class="form-input ${entities.income ? 'form-input--ai' : ''}" id="field-income" 
                 value="${entities.income || ''}" placeholder="e.g. 50000" min="10000" required />
        </div>
        ${entities.income ? `<div class="confidence-bar"><div class="confidence-fill confidence-medium" style="width: 78%"></div></div>` : ''}
      </div>

      <div class="form-group">
        <label class="form-label">
          Loan Purpose
          ${entities.purpose ? '<span class="ai-badge"><i data-lucide="sparkles" style="width:10px;height:10px"></i> AI Extracted</span>' : ''}
        </label>
        <select class="form-input ${entities.purpose ? 'form-input--ai' : ''}" id="field-purpose" required>
          <option value="" disabled ${!entities.purpose ? 'selected' : ''}>Select loan purpose</option>
          <option value="Personal Expense" ${entities.purpose === 'Personal Expense' ? 'selected' : ''}>Personal Expense</option>
          <option value="Home Renovation" ${entities.purpose === 'Home Renovation' ? 'selected' : ''}>Home Renovation</option>
          <option value="Medical Emergency" ${entities.purpose === 'Medical Emergency' ? 'selected' : ''}>Medical Emergency</option>
          <option value="Education" ${entities.purpose === 'Education' ? 'selected' : ''}>Education</option>
          <option value="Wedding/Marriage" ${entities.purpose === 'Wedding/Marriage' ? 'selected' : ''}>Wedding / Marriage</option>
          <option value="Travel" ${entities.purpose === 'Travel' ? 'selected' : ''}>Travel</option>
          <option value="Vehicle Purchase" ${entities.purpose === 'Vehicle Purchase' ? 'selected' : ''}>Vehicle Purchase</option>
          <option value="Business Expansion" ${entities.purpose === 'Business Expansion' ? 'selected' : ''}>Business Expansion</option>
          <option value="Debt Consolidation" ${entities.purpose === 'Debt Consolidation' ? 'selected' : ''}>Debt Consolidation</option>
        </select>
        ${entities.purpose ? '<div class="confidence-bar"><div class="confidence-fill confidence-high" style="width: 88%"></div></div>' : ''}
      </div>

      <div class="form-group">
        <label class="form-label">
          Estimated Age
          ${data.faceAge ? '<span class="ai-badge"><i data-lucide="scan-face" style="width:10px;height:10px"></i> Face AI</span>' : ''}
        </label>
        <div class="form-input-wrapper">
          <input type="number" class="form-input ${data.faceAge ? 'form-input--ai' : ''}" id="field-age" 
                 value="${data.faceAge || ''}" placeholder="Your age" min="18" max="70" required />
        </div>
        ${data.faceAge ? '<div class="confidence-bar"><div class="confidence-fill confidence-medium" style="width: 74%"></div></div>' : ''}
      </div>

      <div class="form-group">
        <label class="form-label">
          Location
          ${data.geo ? '<span class="ai-badge"><i data-lucide="map-pin" style="width:10px;height:10px"></i> GPS</span>' : ''}
        </label>
        <div class="form-input-wrapper">
          <input type="text" class="form-input ${data.geo ? 'form-input--ai' : ''}" id="field-location" 
                 value="${data.geo ? `${data.geo.city}, ${data.geo.state}` : ''}" placeholder="City, State" required />
        </div>
        ${data.geo ? '<div class="confidence-bar"><div class="confidence-fill confidence-high" style="width: 96%"></div></div>' : ''}
      </div>

      <div class="form-group">
        <label class="form-label">PAN Number</label>
        <input type="text" class="form-input" id="field-pan" placeholder="ABCDE1234F" 
               pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" maxlength="10" style="text-transform: uppercase;" />
      </div>

      <div class="form-group">
        <label class="form-label">Mobile Number</label>
        <input type="tel" class="form-input" id="field-phone" placeholder="+91 9876543210" maxlength="13" />
      </div>

      <div class="form-group full-width">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" id="field-email" placeholder="you@example.com" />
      </div>

      <!-- Consent Summary -->
      <div class="form-group full-width">
        <div class="consent-status ${data.consent ? 'captured' : 'pending'}" style="width: 100%;">
          <i data-lucide="${data.consent ? 'shield-check' : 'shield'}" style="width:16px;height:16px"></i>
          <span>Video KYC Consent: ${data.consent ? 'Captured via verbal confirmation' : 'Not yet captured'}</span>
        </div>
      </div>

      <div class="application-actions">
        <button type="button" class="btn btn-ghost" id="btn-back-video">
          <i data-lucide="arrow-left"></i> Back to Video
        </button>
        <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-app">
          <i data-lucide="arrow-right"></i> Submit & Assess Risk
        </button>
      </div>
    </form>
  `;

  setTimeout(() => {
    const form = document.getElementById('application-form');
    const backBtn = document.getElementById('btn-back-video');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => router.navigate('video-call'));
    }
  }, 0);

  return page;
}

function handleSubmit() {
  // Collect form data and merge with video call data
  const formData = {
    name: document.getElementById('field-name')?.value || '',
    employment: document.getElementById('field-employment')?.value || '',
    income: parseInt(document.getElementById('field-income')?.value) || 30000,
    purpose: document.getElementById('field-purpose')?.value || '',
    declaredAge: parseInt(document.getElementById('field-age')?.value) || 30,
    location: document.getElementById('field-location')?.value || '',
    pan: document.getElementById('field-pan')?.value || '',
    phone: document.getElementById('field-phone')?.value || '',
    email: document.getElementById('field-email')?.value || '',
  };

  // Merge with existing data
  const existingData = window.__loanWizardData || {};
  window.__loanWizardData = {
    ...existingData,
    ...formData,
    faceAge: existingData.faceAge || formData.declaredAge,
  };

  logger.log(LOG_CATEGORIES.USER, 'Application form submitted', formData);
  showToast('Application submitted. Running risk assessment...', 'info');

  setTimeout(() => router.navigate('risk'), 500);
}
