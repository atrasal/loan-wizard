/**
 * Helper utilities — formatters, calculators, validators
 */

// ── Currency Formatter (INR) ──
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyShort(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

// ── EMI Calculator (Reducing Balance) ──
export function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
    / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

// ── Percentage Formatter ──
export function formatPercent(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`;
}

// ── Date/Time Formatters ──
export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date = new Date()) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// ── Elapsed Timer ──
export function formatElapsed(startTime) {
  const diff = Date.now() - startTime;
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ── UUID Generator ──
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ── Toast Notifications ──
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = {
    success: '<i data-lucide="check-circle"></i>',
    warning: '<i data-lucide="alert-triangle"></i>',
    danger: '<i data-lucide="x-circle"></i>',
    info: '<i data-lucide="info"></i>',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  if (window.lucide) window.lucide.createIcons({ nodes: [toast] });

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Debounce ──
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Sleep ──
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Smooth Number Animation ──
export function animateNumber(element, target, duration = 1500, prefix = '', suffix = '') {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    element.textContent = `${prefix}${current.toLocaleString('en-IN')}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ── Create SVG Gauge ──
export function createGauge(score, maxScore, color, label) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const percent = score / maxScore;
  const offset = circumference * (1 - percent);

  return `
    <div class="gauge-container">
      <svg class="gauge-svg" viewBox="0 0 120 120">
        <circle class="gauge-track" cx="60" cy="60" r="${radius}" />
        <circle class="gauge-fill" cx="60" cy="60" r="${radius}"
          stroke="${color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${circumference}"
          style="--target-offset: ${offset}"
        />
      </svg>
      <div class="gauge-label">
        <span class="gauge-number" data-target="${score}">0</span>
        <span class="gauge-text">${label}</span>
      </div>
    </div>
  `;
}

// ── Animate gauge on DOM insert ──
export function animateGauges() {
  document.querySelectorAll('.gauge-fill').forEach(circle => {
    const targetOffset = circle.style.getPropertyValue('--target-offset');
    setTimeout(() => {
      circle.style.strokeDashoffset = targetOffset;
    }, 300);
  });

  document.querySelectorAll('.gauge-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    if (!isNaN(target)) animateNumber(el, target, 1500);
  });
}
