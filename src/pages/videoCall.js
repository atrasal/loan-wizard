/**
 * Video Call Page — Core video KYC with real-time AI analysis
 * Includes: live webcam, face detection overlay, STT transcript,
 * guided questions, entity extraction, and consent capture
 */
import { router } from '../utils/router.js';
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { showToast, formatElapsed } from '../utils/helpers.js';
import { speechEngine } from '../modules/speechEngine.js';
import { faceEngine } from '../modules/faceEngine.js';
import { geoEngine } from '../modules/geoEngine.js';
import { recorder } from '../modules/recorder.js';

const QUESTIONS = [
  { id: 'name', text: 'Please state your full name.', hint: 'Say: "My name is [Your Name]"' },
  { id: 'employment', text: 'What is your employment type?', hint: 'Say: "I am salaried" or "I am self-employed"' },
  { id: 'income', text: 'What is your monthly income?', hint: 'Say: "My income is [amount] per month"' },
  { id: 'purpose', text: 'What is the purpose of this loan?', hint: 'Example: Home renovation, medical, education, business, travel' },
  { id: 'consent', text: 'Do you consent to this video KYC process for your loan application?', hint: 'Say: "I consent" or "I agree"' },
];

let callStartTime = null;
let timerInterval = null;
let currentQuestionIndex = 0;
let isMuted = false;
let isCameraOff = false;

export function renderVideoCall() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Video call page rendered');

  currentQuestionIndex = 0;
  callStartTime = Date.now();

  const page = document.createElement('div');
  page.className = 'video-call page';
  page.innerHTML = `
    <!-- Video Panel -->
    <div class="video-panel glass-card" style="padding: 0; overflow: hidden;">
      <video id="video-feed" class="video-feed" autoplay muted playsinline></video>
      <div class="video-overlay" id="video-overlay">
        <canvas id="face-canvas"></canvas>
      </div>

      <!-- HUD -->
      <div class="video-hud">
        <div class="video-hud-item">
          <span class="recording-dot"></span>
          <span>REC</span>
          <span id="call-timer">00:00</span>
        </div>
        <div class="video-hud-item" id="hud-face" style="display: none;">
          <i data-lucide="scan-face" style="width:14px;height:14px"></i>
          <span id="face-status">Detecting...</span>
        </div>
        <div class="video-hud-item" id="hud-liveness" style="display: none;">
          <i data-lucide="activity" style="width:14px;height:14px"></i>
          <span>Liveness: <span id="liveness-percent">0</span>%</span>
        </div>
      </div>

      <!-- Age Badge -->
      <div class="age-badge" id="age-badge" style="display: none;">
        <i data-lucide="user" style="width:14px;height:14px;display:inline"></i>
        Est. Age: <span id="estimated-age">--</span>
      </div>
    </div>

    <!-- Analysis Panel -->
    <div class="analysis-panel">
      <!-- Current Question -->
      <div class="glass-card question-card" id="question-card">
        <div class="question-label">
          Question <span id="q-number">1</span> of ${QUESTIONS.length}
        </div>
        <div class="question-text" id="q-text">${QUESTIONS[0].text}</div>
        <div class="question-hint" id="q-hint">${QUESTIONS[0].hint}</div>
      </div>

      <!-- Listening Indicator -->
      <div class="listening-indicator" id="listening-indicator" style="display:none; align-self: flex-start;">
        <div class="listening-bars">
          <div class="listening-bar"></div>
          <div class="listening-bar"></div>
          <div class="listening-bar"></div>
          <div class="listening-bar"></div>
        </div>
        <span>Listening...</span>
      </div>

      <!-- Transcript -->
      <div class="glass-card transcript-panel">
        <div class="transcript-header">
          <span class="transcript-title">
            <i data-lucide="message-square" style="width:16px;height:16px"></i>
            Live Transcript
          </span>
          <span class="badge badge-info" id="transcript-count">0 entries</span>
        </div>
        <div class="transcript-body" id="transcript-body">
          <div style="text-align:center; padding: 20px; color: var(--gray-600); font-size: 13px;">
            Start speaking to see your responses here...
          </div>
        </div>
        <div class="entities-panel" id="entities-panel">
          <span style="font-size: 11px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
            Extracted Information
          </span>
          <div class="entities-grid" id="entities-grid"></div>
        </div>
      </div>

      <!-- Consent Status -->
      <div class="consent-status pending" id="consent-status">
        <i data-lucide="shield" style="width:16px;height:16px"></i>
        <span id="consent-text">Consent: Pending</span>
      </div>
    </div>

    <!-- Video Controls -->
    <div class="video-controls">
      <button class="control-btn" id="btn-mute" title="Toggle Microphone">
        <i data-lucide="mic"></i>
      </button>
      <button class="control-btn" id="btn-camera-toggle" title="Toggle Camera">
        <i data-lucide="video"></i>
      </button>
      <button class="control-btn control-btn--end" id="btn-end-call" title="End Call & Continue">
        <i data-lucide="phone-off"></i>
      </button>
    </div>
  `;

  setTimeout(() => initVideoCall(), 100);

  return page;
}

async function initVideoCall() {
  // Start timer
  timerInterval = setInterval(updateTimer, 1000);

  // Get stream (from permissions page or request new)
  let stream = window.__loanWizardStream;
  if (!stream) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (error) {
      showToast('Camera access required. Please grant permissions.', 'danger');
      logger.log(LOG_CATEGORIES.SYSTEM, `getUserMedia failed: ${error.message}`);
      return;
    }
  }

  // Set video source
  const video = document.getElementById('video-feed');
  if (video) {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      // Size canvas to match video
      const canvas = document.getElementById('face-canvas');
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };
  }

  // Start recording
  recorder.start(stream);

  // Start geolocation capture (async, non-blocking)
  geoEngine.capture();

  // Load face detection models and start
  loadFaceDetection(video);

  // Start speech recognition
  startSpeechRecognition();

  // Attach control handlers
  attachControlHandlers(stream);

  logger.log(LOG_CATEGORIES.SYSTEM, 'Video call session initialized');
  showToast('Video call started. Please answer the questions.', 'info');
}

async function loadFaceDetection(video) {
  const hudFace = document.getElementById('hud-face');
  const hudLiveness = document.getElementById('hud-liveness');

  const loaded = await faceEngine.load();
  if (loaded && video) {
    const canvas = document.getElementById('face-canvas');
    if (hudFace) hudFace.style.display = 'flex';
    if (hudLiveness) hudLiveness.style.display = 'flex';

    faceEngine.onDetection = (detection) => {
      const faceStatus = document.getElementById('face-status');
      const ageBadge = document.getElementById('age-badge');
      const estimatedAge = document.getElementById('estimated-age');
      const livenessEl = document.getElementById('liveness-percent');

      if (detection) {
        if (faceStatus) faceStatus.textContent = `Detected (${(detection.confidence * 100).toFixed(0)}%)`;
        if (ageBadge) ageBadge.style.display = 'block';
        if (estimatedAge) estimatedAge.textContent = detection.age;
        if (livenessEl) livenessEl.textContent = detection.livenessPercent;
      } else {
        if (faceStatus) faceStatus.textContent = 'No face detected';
        if (ageBadge) ageBadge.style.display = 'none';
      }
    };

    faceEngine.startDetection(video, canvas);
  } else {
    showToast('Face detection models could not be loaded. Continuing without.', 'warning');
  }
}

function startSpeechRecognition() {
  if (!speechEngine.isSupported()) {
    showToast('Speech recognition not available in this browser. Please use Chrome.', 'warning');
    return;
  }

  speechEngine.onListeningChange = (isListening) => {
    const indicator = document.getElementById('listening-indicator');
    if (indicator) indicator.style.display = isListening ? 'flex' : 'none';
  };

  speechEngine.onTranscript = ({ final, interim }) => {
    const body = document.getElementById('transcript-body');
    const countEl = document.getElementById('transcript-count');

    if (final && body) {
      // Clear placeholder
      if (body.querySelector('div[style]')) body.innerHTML = '';

      const entry = document.createElement('div');
      entry.className = 'transcript-entry';
      entry.innerHTML = `
        <span class="transcript-time">${formatElapsed(callStartTime)}</span>
        <span class="transcript-text">${final}</span>
      `;
      body.appendChild(entry);
      body.scrollTop = body.scrollHeight;

      if (countEl) {
        const count = body.querySelectorAll('.transcript-entry').length;
        countEl.textContent = `${count} entries`;
      }

      // Auto-advance questions based on entities
      checkQuestionProgress();
    }

    // Show interim results
    if (interim && body) {
      let interimEl = body.querySelector('.transcript-entry--interim-wrapper');
      if (!interimEl) {
        interimEl = document.createElement('div');
        interimEl.className = 'transcript-entry transcript-entry--interim-wrapper';
        body.appendChild(interimEl);
      }
      interimEl.innerHTML = `
        <span class="transcript-time">${formatElapsed(callStartTime)}</span>
        <span class="transcript-text transcript-text--interim">${interim}</span>
      `;
      body.scrollTop = body.scrollHeight;
    }
  };

  speechEngine.onEntity = (type, value) => {
    const grid = document.getElementById('entities-grid');
    if (!grid) return;

    // Remove existing chip of same type
    const existing = grid.querySelector(`.entity-chip--${type}`);
    if (existing) existing.remove();

    const displayValue = type === 'income' ? `₹${Number(value).toLocaleString('en-IN')}/mo` :
                         type === 'consent' ? '✓ Verified' : value;

    const chip = document.createElement('span');
    chip.className = `entity-chip entity-chip--${type}`;
    chip.innerHTML = `
      <strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${displayValue}
    `;
    grid.appendChild(chip);

    // Update consent status
    if (type === 'consent') {
      const consentStatus = document.getElementById('consent-status');
      const consentText = document.getElementById('consent-text');
      if (consentStatus) {
        consentStatus.classList.remove('pending');
        consentStatus.classList.add('captured');
      }
      if (consentText) consentText.textContent = 'Consent: Captured ✓';
    }

    checkQuestionProgress();
  };

  speechEngine.start();
}

function checkQuestionProgress() {
  const entities = speechEngine.getEntities();
  const questionMap = ['name', 'employment', 'income', 'purpose', 'consent'];

  // Find the first unanswered question
  let nextIndex = currentQuestionIndex;
  for (let i = 0; i < questionMap.length; i++) {
    const key = questionMap[i];
    if (entities[key] === null || entities[key] === false) {
      nextIndex = i;
      break;
    }
    nextIndex = i + 1;
  }

  if (nextIndex !== currentQuestionIndex && nextIndex < QUESTIONS.length) {
    currentQuestionIndex = nextIndex;
    updateQuestion(nextIndex);
  }
}

function updateQuestion(index) {
  const qNumber = document.getElementById('q-number');
  const qText = document.getElementById('q-text');
  const qHint = document.getElementById('q-hint');
  const card = document.getElementById('question-card');

  if (index < QUESTIONS.length) {
    if (qNumber) qNumber.textContent = index + 1;
    if (qText) qText.textContent = QUESTIONS[index].text;
    if (qHint) qHint.textContent = QUESTIONS[index].hint;
    if (card) {
      card.style.animation = 'none';
      card.offsetHeight; // Trigger reflow
      card.style.animation = 'fadeInUp 300ms ease forwards';
    }
  }
}

function updateTimer() {
  const timerEl = document.getElementById('call-timer');
  if (timerEl && callStartTime) {
    timerEl.textContent = formatElapsed(callStartTime);
  }
}

function attachControlHandlers(stream) {
  const muteBtn = document.getElementById('btn-mute');
  const cameraBtn = document.getElementById('btn-camera-toggle');
  const endBtn = document.getElementById('btn-end-call');

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      stream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      muteBtn.classList.toggle('active', isMuted);
      muteBtn.innerHTML = isMuted ? '<i data-lucide="mic-off"></i>' : '<i data-lucide="mic"></i>';
      if (window.lucide) window.lucide.createIcons({ nodes: [muteBtn] });
      logger.log(LOG_CATEGORIES.USER, isMuted ? 'Microphone muted' : 'Microphone unmuted');
    });
  }

  if (cameraBtn) {
    cameraBtn.addEventListener('click', () => {
      isCameraOff = !isCameraOff;
      stream.getVideoTracks().forEach(t => t.enabled = !isCameraOff);
      cameraBtn.classList.toggle('active', isCameraOff);
      cameraBtn.innerHTML = isCameraOff ? '<i data-lucide="video-off"></i>' : '<i data-lucide="video"></i>';
      if (window.lucide) window.lucide.createIcons({ nodes: [cameraBtn] });
      logger.log(LOG_CATEGORIES.USER, isCameraOff ? 'Camera turned off' : 'Camera turned on');
    });
  }

  if (endBtn) {
    endBtn.addEventListener('click', () => endCall(stream));
  }
}

function endCall(stream) {
  logger.log(LOG_CATEGORIES.USER, 'User ended video call');

  // Stop all engines
  clearInterval(timerInterval);
  speechEngine.stop();
  faceEngine.stop();
  recorder.stop();

  // Store collected data globally for next pages
  const faceResults = faceEngine.getResults();
  const geoData = geoEngine.getLocation();
  const entities = speechEngine.getEntities();
  const transcript = speechEngine.getTranscript();

  window.__loanWizardData = {
    entities,
    transcript,
    transcriptText: speechEngine.getFullText(),
    faceAge: faceResults.estimatedAge,
    faceGender: faceResults.gender,
    livenessPercent: faceResults.livenessPercent,
    faceConfidence: faceResults.confidence,
    geo: geoData,
    consent: entities.consent,
    income: entities.income,
    employment: entities.employment,
    purpose: entities.purpose,
    name: entities.name,
    callDuration: formatElapsed(callStartTime),
    callStartTime: callStartTime,
    declaredAge: faceResults.estimatedAge || 30,
    recordingUrl: recorder.getBlobUrl(),
  };

  logger.log(LOG_CATEGORIES.SYSTEM, 'Session data compiled', {
    entitiesFound: Object.entries(entities).filter(([k, v]) => v !== null && v !== false).length,
    transcriptEntries: transcript.length,
    faceAge: faceResults.estimatedAge,
    liveness: faceResults.livenessPercent,
  });

  // Don't stop the camera stream tracks — keep them for potential re-use
  // Navigate to application form
  showToast('Video call completed. Reviewing your application...', 'success');
  setTimeout(() => router.navigate('application'), 800);
}
