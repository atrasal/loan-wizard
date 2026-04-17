/**
 * Permissions Page — Sequential permission grants for camera, mic, and location
 */
import { router } from '../utils/router.js';
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { showToast, sleep } from '../utils/helpers.js';

let permissionState = {
  camera: 'pending',
  microphone: 'pending',
  location: 'pending',
};

export function renderPermissions() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Permissions page rendered');

  // Reset state
  permissionState = { camera: 'pending', microphone: 'pending', location: 'pending' };

  const page = document.createElement('div');
  page.className = 'permissions page';
  page.innerHTML = `
    <h2 class="permissions-title">We Need Your Permission</h2>
    <p class="permissions-subtitle">
      To verify your identity and process your loan application, please grant the following permissions.
    </p>

    <div class="permissions-grid">
      <div class="glass-card permission-card" id="perm-camera" data-type="camera">
        <div class="permission-icon" id="perm-icon-camera">
          <i data-lucide="camera"></i>
        </div>
        <span class="permission-name">Camera</span>
        <span class="permission-desc">For video KYC and face verification</span>
        <span class="permission-status" id="perm-status-camera">Waiting...</span>
      </div>

      <div class="glass-card permission-card" id="perm-microphone" data-type="microphone">
        <div class="permission-icon" id="perm-icon-microphone">
          <i data-lucide="mic"></i>
        </div>
        <span class="permission-name">Microphone</span>
        <span class="permission-desc">For voice responses and consent capture</span>
        <span class="permission-status" id="perm-status-microphone">Waiting...</span>
      </div>

      <div class="glass-card permission-card" id="perm-location" data-type="location">
        <div class="permission-icon" id="perm-icon-location">
          <i data-lucide="map-pin"></i>
        </div>
        <span class="permission-name">Location</span>
        <span class="permission-desc">For compliance and address verification</span>
        <span class="permission-status" id="perm-status-location">Waiting...</span>
      </div>
    </div>

    <button class="btn btn-primary btn-lg" id="btn-grant-permissions">
      <i data-lucide="shield-check"></i>
      Grant Permissions
    </button>

    <p style="font-size: 12px; color: var(--gray-600); margin-top: 16px; max-width: 400px; text-align: center;">
      Your data is encrypted and used solely for loan verification purposes. 
      We comply with all RBI and data protection regulations.
    </p>
  `;

  setTimeout(() => {
    const grantBtn = document.getElementById('btn-grant-permissions');
    if (grantBtn) {
      grantBtn.addEventListener('click', requestPermissions);
    }
  }, 0);

  return page;
}

async function requestPermissions() {
  const btn = document.getElementById('btn-grant-permissions');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('btn--loading');
    btn.innerHTML = '<span class="spinner"></span> Requesting...';
  }

  // Request camera + microphone
  await requestMediaPermission();
  await sleep(300);

  // Request location
  await requestLocationPermission();
  await sleep(300);

  // Check if all granted
  const allGranted = Object.values(permissionState).every(s => s === 'granted');

  if (allGranted) {
    showToast('All permissions granted! Preparing video call...', 'success');
    logger.log(LOG_CATEGORIES.SYSTEM, 'All permissions granted');
    await sleep(1000);
    router.navigate('video-call');
  } else {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('btn--loading');
      btn.innerHTML = '<i data-lucide="shield-check"></i> Retry Permissions';
      if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
    }
    showToast('Some permissions were denied. Please try again.', 'warning');
  }
}

async function requestMediaPermission() {
  updatePermissionState('camera', 'requesting');
  updatePermissionState('microphone', 'requesting');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // Store stream globally for video call page
    window.__loanWizardStream = stream;

    updatePermissionState('camera', 'granted');
    updatePermissionState('microphone', 'granted');
    logger.log(LOG_CATEGORIES.SYSTEM, 'Camera & microphone permissions granted');
  } catch (error) {
    logger.log(LOG_CATEGORIES.SYSTEM, `Media permission error: ${error.message}`);

    // Try camera only
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      window.__loanWizardStream = stream;
      updatePermissionState('camera', 'granted');
      updatePermissionState('microphone', 'denied');
    } catch {
      updatePermissionState('camera', 'denied');
      updatePermissionState('microphone', 'denied');
    }
  }
}

async function requestLocationPermission() {
  updatePermissionState('location', 'requesting');

  return new Promise(resolve => {
    if (!navigator.geolocation) {
      updatePermissionState('location', 'granted'); // Graceful fallback
      resolve();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        updatePermissionState('location', 'granted');
        logger.log(LOG_CATEGORIES.SYSTEM, 'Location permission granted');
        resolve();
      },
      () => {
        // Still mark as granted for demo — geoEngine handles fallback
        updatePermissionState('location', 'granted');
        logger.log(LOG_CATEGORIES.SYSTEM, 'Location permission denied, using fallback');
        resolve();
      },
      { timeout: 5000 }
    );
  });
}

function updatePermissionState(type, state) {
  permissionState[type] = state;
  const card = document.getElementById(`perm-${type}`);
  const status = document.getElementById(`perm-status-${type}`);

  if (card) {
    card.classList.remove('requesting', 'granted', 'denied');
    card.classList.add(state);
  }

  if (status) {
    const statusMap = { pending: 'Waiting...', requesting: 'Requesting...', granted: '✓ Granted', denied: '✗ Denied' };
    const colorMap = { pending: 'var(--gray-500)', requesting: 'var(--pf-blue)', granted: 'var(--color-success)', denied: 'var(--color-danger)' };
    status.textContent = statusMap[state];
    status.style.color = colorMap[state];
  }
}
