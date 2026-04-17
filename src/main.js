/**
 * Poonawalla Fincorp Loan Wizard — Main App Bootstrap
 * Initializes router, registers pages, and sets up step progress indicators
 */
import { router, STEPS } from './utils/router.js';
import { logger, LOG_CATEGORIES } from './utils/logger.js';

// Page renderers
import { renderLanding } from './pages/landing.js';
import { renderPermissions } from './pages/permissions.js';
import { renderVideoCall } from './pages/videoCall.js';
import { renderApplication } from './pages/application.js';
import { renderRiskAssessment } from './pages/riskAssessment.js';
import { renderLoanOffer } from './pages/loanOffer.js';
import { renderAuditDashboard } from './pages/auditDashboard.js';

// ── Initialize App ──
function initApp() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Loan Wizard application initialized', {
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timestamp: new Date().toISOString(),
  });

  // Build step progress indicators
  buildStepIndicators();

  // Set session ID in header
  const sessionBadge = document.getElementById('session-id-badge');
  if (sessionBadge) {
    sessionBadge.textContent = logger.sessionId;
  }

  // Register routes
  router.register('landing', renderLanding);
  router.register('permissions', renderPermissions);
  router.register('video-call', renderVideoCall);
  router.register('application', renderApplication);
  router.register('risk', renderRiskAssessment);
  router.register('offer', renderLoanOffer);
  router.register('audit', renderAuditDashboard);

  // Route change callback
  router.onRouteChange = (route) => {
    logger.log(LOG_CATEGORIES.SYSTEM, `Navigated to: ${route}`);
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialize router
  router.init('app');

  // If no hash, default to landing
  if (!window.location.hash) {
    router.navigate('landing');
  }
}

function buildStepIndicators() {
  const container = document.getElementById('step-indicators');
  if (!container) return;

  // Only show abbreviated step labels
  const displaySteps = STEPS.filter(s => s.id !== 'landing');
  container.innerHTML = displaySteps.map(step =>
    `<span class="step-dot" data-step="${step.id}">${step.label}</span>`
  ).join('');
}

// ── Wait for DOM & Lucide ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a tiny bit for Lucide to load from CDN
    setTimeout(initApp, 100);
  });
} else {
  setTimeout(initApp, 100);
}
