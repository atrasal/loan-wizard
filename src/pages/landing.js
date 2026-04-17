/**
 * Landing Page — Campaign entry point with Poonawalla Fincorp branding
 */
import { router } from '../utils/router.js';
import { logger, LOG_CATEGORIES } from '../utils/logger.js';

export function renderLanding() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Landing page rendered');

  const page = document.createElement('div');
  page.className = 'landing page';
  page.innerHTML = `
    <div class="landing-hero">
      <div class="landing-badge">
        <span class="dot"></span>
        <span>AI-Powered Digital Lending Platform</span>
      </div>

      <h1 class="landing-title">Your Loan Journey Starts with a Video Call</h1>

      <p class="landing-subtitle">
        Experience seamless digital onboarding powered by AI. Complete your KYC, 
        get verified, and receive personalized loan offers — all in one video session.
      </p>

      <div class="landing-cta">
        <button class="btn btn-primary btn-lg" id="btn-start-journey">
          <i data-lucide="video"></i>
          Start Your Loan Journey
        </button>
        <span style="font-size: 12px; color: var(--gray-500);">
          Takes only 3-5 minutes • No documents needed upfront
        </span>
      </div>

      <div class="landing-features">
        <div class="landing-feature glass-card animate-fade-in-up delay-1">
          <div class="landing-feature-icon">
            <i data-lucide="scan-face"></i>
          </div>
          <span class="landing-feature-title">Video KYC</span>
          <span class="landing-feature-desc">AI-powered face verification & age estimation in real-time</span>
        </div>

        <div class="landing-feature glass-card animate-fade-in-up delay-2">
          <div class="landing-feature-icon">
            <i data-lucide="sparkles"></i>
          </div>
          <span class="landing-feature-title">Instant Offers</span>
          <span class="landing-feature-desc">Personalized loan offers generated in under 60 seconds</span>
        </div>

        <div class="landing-feature glass-card animate-fade-in-up delay-3">
          <div class="landing-feature-icon">
            <i data-lucide="file-check"></i>
          </div>
          <span class="landing-feature-title">100% Paperless</span>
          <span class="landing-feature-desc">Fully digital end-to-end process with zero paperwork</span>
        </div>
      </div>

      <div class="landing-trust">
        <div class="trust-item">
          <i data-lucide="shield-check"></i>
          <span>RBI Registered NBFC</span>
        </div>
        <div class="trust-item">
          <i data-lucide="lock"></i>
          <span>Bank-Grade Security</span>
        </div>
        <div class="trust-item">
          <i data-lucide="award"></i>
          <span>40+ Year Legacy</span>
        </div>
        <div class="trust-item">
          <i data-lucide="users"></i>
          <span>5M+ Customers</span>
        </div>
      </div>
    </div>
  `;

  // Attach event listener after render
  setTimeout(() => {
    const startBtn = document.getElementById('btn-start-journey');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        logger.log(LOG_CATEGORIES.USER, 'User clicked Start Journey');
        router.navigate('permissions');
      });
    }
  }, 0);

  return page;
}
