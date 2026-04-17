/**
 * Simple hash-based SPA Router for Loan Wizard
 */

const STEPS = [
  { id: 'landing', label: 'Start', index: 0 },
  { id: 'permissions', label: 'Permissions', index: 1 },
  { id: 'video-call', label: 'Video KYC', index: 2 },
  { id: 'application', label: 'Application', index: 3 },
  { id: 'risk', label: 'Risk', index: 4 },
  { id: 'offer', label: 'Offer', index: 5 },
  { id: 'audit', label: 'Audit', index: 6 },
];

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.container = null;
    this.onRouteChange = null;
    window.addEventListener('hashchange', () => this._handleRoute());
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    this._handleRoute();
  }

  register(path, renderFn) {
    this.routes[path] = renderFn;
  }

  navigate(path) {
    window.location.hash = path;
  }

  _handleRoute() {
    const hash = window.location.hash.slice(1) || 'landing';
    if (this.routes[hash]) {
      this.currentRoute = hash;
      this._transition(hash);
    }
  }

  async _transition(hash) {
    if (!this.container) return;

    // Exit animation
    const currentPage = this.container.querySelector('.page');
    if (currentPage) {
      currentPage.classList.add('page-exit');
      await new Promise(r => setTimeout(r, 250));
    }

    // Render new page
    this.container.innerHTML = '';
    const content = this.routes[hash]();
    if (typeof content === 'string') {
      this.container.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.container.appendChild(content);
    }

    // Update header & progress
    this._updateProgress(hash);

    // Trigger route change callback
    if (this.onRouteChange) {
      this.onRouteChange(hash);
    }

    // Initialize Lucide icons in the new content
    requestAnimationFrame(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  }

  _updateProgress(hash) {
    const header = document.getElementById('app-header');
    const stepFill = document.getElementById('step-fill');
    const stepIndex = STEPS.findIndex(s => s.id === hash);

    if (hash === 'landing') {
      header?.classList.add('hidden');
      header?.classList.remove('visible');
    } else {
      header?.classList.remove('hidden');
      header?.classList.add('visible');
    }

    if (stepFill && stepIndex >= 0) {
      const progress = (stepIndex / (STEPS.length - 1)) * 100;
      stepFill.style.width = `${progress}%`;
    }

    // Update step dots
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i < stepIndex) dot.classList.add('completed');
      else if (i === stepIndex) dot.classList.add('active');
    });
  }

  getCurrentStep() {
    return STEPS.find(s => s.id === this.currentRoute);
  }

  getSteps() {
    return STEPS;
  }
}

export const router = new Router();
export { STEPS };
