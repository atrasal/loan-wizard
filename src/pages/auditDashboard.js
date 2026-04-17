/**
 * Audit Dashboard — Comprehensive session audit trail with
 * video playback, transcript, decision log, and export options
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { formatDateTime, formatCurrency, formatPercent, showToast } from '../utils/helpers.js';
import { recorder } from '../modules/recorder.js';

export function renderAuditDashboard() {
  logger.log(LOG_CATEGORIES.SYSTEM, 'Audit dashboard rendered');

  const data = window.__loanWizardData || {};
  const riskResult = window.__loanWizardRisk || {};
  const llmResult = window.__loanWizardLLM || {};
  const acceptedOffer = window.__loanWizardAcceptedOffer || null;
  const sessionInfo = logger.getSessionInfo();
  const allLogs = logger.getAll();
  const transcript = data.transcript || [];
  const recordingUrl = recorder.getBlobUrl();

  const page = document.createElement('div');
  page.className = 'audit-page page';
  page.innerHTML = `
    <div class="audit-header">
      <div>
        <h2 class="audit-title">Audit Dashboard</h2>
        <p style="color: var(--gray-400); font-size: 14px; margin-top: 4px;">
          Complete session record for compliance and regulatory audit
        </p>
      </div>
      <div class="audit-compliance">
        <i data-lucide="shield-check" style="width:16px;height:16px"></i>
        KYC Compliant Session
      </div>
    </div>

    <div class="audit-grid">
      <!-- Session Summary -->
      <div class="glass-card glass-card--elevated">
        <div class="card-title">
          <i data-lucide="info"></i>
          Session Summary
        </div>
        <div class="session-info">
          <div class="session-info-item">
            <span class="session-info-label">Session ID</span>
            <span class="session-info-value">${sessionInfo.sessionId}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Started At</span>
            <span class="session-info-value">${formatDateTime(sessionInfo.sessionStart)}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Duration</span>
            <span class="session-info-value">${data.callDuration || sessionInfo.duration}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Log Entries</span>
            <span class="session-info-value">${sessionInfo.totalLogs}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Device</span>
            <span class="session-info-value" style="font-size:11px;word-break:break-all;">${getDeviceName()}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Screen</span>
            <span class="session-info-value">${sessionInfo.screenSize}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Customer</span>
            <span class="session-info-value">${data.name || 'N/A'}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Decision</span>
            <span class="session-info-value" style="color: ${riskResult.decision === 'approved' ? 'var(--color-success)' : riskResult.decision === 'conditionally-approved' ? 'var(--color-warning)' : 'var(--color-danger)'}">
              ${(riskResult.decision || 'pending').toUpperCase().replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>

      <!-- Video Recording -->
      <div class="glass-card glass-card--elevated">
        <div class="card-title">
          <i data-lucide="video"></i>
          Session Recording
        </div>
        ${recordingUrl ? `
          <video class="audit-video" controls src="${recordingUrl}"></video>
          <div class="export-actions">
            <button class="btn btn-sm btn-secondary" id="btn-download-video">
              <i data-lucide="download" style="width:14px;height:14px"></i> Download Recording
            </button>
          </div>
        ` : `
          <div style="height:200px; display:flex; align-items:center; justify-content:center; background:var(--glass-bg); border-radius:var(--radius-md); color:var(--gray-500);">
            <div style="text-align:center;">
              <i data-lucide="video-off" style="width:32px;height:32px;margin-bottom:8px;display:block;margin:0 auto 8px;"></i>
              No recording available
            </div>
          </div>
        `}
      </div>

      <!-- Transcript -->
      <div class="glass-card glass-card--elevated">
        <div class="card-title">
          <i data-lucide="message-square"></i>
          Full Transcript (${transcript.length} entries)
        </div>
        <div class="audit-transcript">
          ${transcript.length > 0 ? transcript.map((t, i) => `
            <div class="audit-transcript-entry">
              <span class="audit-transcript-q">Q${i + 1}</span>
              <span style="color: var(--gray-300); flex: 1;">${t.text}</span>
              <span style="font-size:10px; color:var(--gray-600); font-family:var(--font-mono);">
                ${(t.confidence * 100).toFixed(0)}%
              </span>
            </div>
          `).join('') : `
            <div style="padding: 20px; text-align: center; color: var(--gray-500); font-size: 13px;">
              No transcript entries recorded
            </div>
          `}
        </div>
        <div class="export-actions">
          <button class="btn btn-sm btn-secondary" id="btn-export-transcript">
            <i data-lucide="download" style="width:14px;height:14px"></i> Export Transcript
          </button>
        </div>
      </div>

      <!-- Geolocation -->
      <div class="glass-card glass-card--elevated">
        <div class="card-title">
          <i data-lucide="map-pin"></i>
          Geolocation Data
        </div>
        <div class="map-container" id="map-container">
          <div style="text-align:center; color:var(--gray-500);">
            <i data-lucide="map" style="width:32px;height:32px;display:block;margin:0 auto 8px;"></i>
            <div>${data.geo?.city || 'Unknown'}, ${data.geo?.state || 'Unknown'}</div>
            <div style="font-size:11px;font-family:var(--font-mono);margin-top:4px;">
              ${data.geo ? `${data.geo.latitude.toFixed(4)}, ${data.geo.longitude.toFixed(4)}` : 'No coordinates'}
            </div>
            ${data.geo?.simulated ? '<div style="font-size:10px;color:var(--color-warning);margin-top:4px;">⚠ Simulated location (demo)</div>' : ''}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
          <div class="session-info-item">
            <span class="session-info-label">City</span>
            <span class="session-info-value" style="font-family:var(--font-body);">${data.geo?.city || 'N/A'}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">State</span>
            <span class="session-info-value" style="font-family:var(--font-body);">${data.geo?.state || 'N/A'}</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Accuracy</span>
            <span class="session-info-value">${data.geo?.accuracy || 'N/A'}m</span>
          </div>
          <div class="session-info-item">
            <span class="session-info-label">Pincode</span>
            <span class="session-info-value">${data.geo?.pincode || 'N/A'}</span>
          </div>
        </div>
      </div>

      <!-- Accepted Offer Summary -->
      ${acceptedOffer ? `
      <div class="glass-card glass-card--elevated">
        <div class="card-title">
          <i data-lucide="gift"></i>
          Accepted Offer
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="llm-row">
            <span class="llm-key">Offer Tier</span>
            <span class="llm-value">${acceptedOffer.name}</span>
          </div>
          <div class="llm-row">
            <span class="llm-key">Loan Amount</span>
            <span class="llm-value" style="color:var(--pf-cyan);">${formatCurrency(acceptedOffer.amount)}</span>
          </div>
          <div class="llm-row">
            <span class="llm-key">Interest Rate</span>
            <span class="llm-value">${formatPercent(acceptedOffer.rate)} p.a.</span>
          </div>
          <div class="llm-row">
            <span class="llm-key">Tenure</span>
            <span class="llm-value">${acceptedOffer.selectedTenure} months</span>
          </div>
          <div class="llm-row">
            <span class="llm-key">Monthly EMI</span>
            <span class="llm-value" style="color:var(--color-success);font-size:18px;">${formatCurrency(acceptedOffer.selectedEMI)}</span>
          </div>
          <div class="llm-row">
            <span class="llm-key">Processing Fee</span>
            <span class="llm-value">${formatCurrency(acceptedOffer.processingFeeAmount)}</span>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Decision Trail -->
      <div class="glass-card glass-card--elevated ${acceptedOffer ? '' : 'full-width'}">
        <div class="card-title">
          <i data-lucide="git-branch"></i>
          Decision Trail
        </div>
        <div class="decision-trail">
          ${buildDecisionTrail(data, riskResult, llmResult, acceptedOffer)}
        </div>
      </div>

      <!-- Raw Data (JSON) -->
      <div class="glass-card glass-card--elevated full-width">
        <div class="card-title">
          <i data-lucide="code"></i>
          Raw Audit Data
        </div>
        <div class="json-viewer" id="json-viewer">${syntaxHighlightJSON(buildAuditJSON(data, riskResult, llmResult, acceptedOffer))}</div>
        <div class="export-actions">
          <button class="btn btn-sm btn-secondary" id="btn-export-json">
            <i data-lucide="download" style="width:14px;height:14px"></i> Export JSON
          </button>
          <button class="btn btn-sm btn-secondary" id="btn-export-txt">
            <i data-lucide="file-text" style="width:14px;height:14px"></i> Export Full Log
          </button>
          <button class="btn btn-sm btn-primary" id="btn-new-session" style="margin-left:auto;">
            <i data-lucide="plus-circle" style="width:14px;height:14px"></i> Start New Session
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('btn-download-video')?.addEventListener('click', () => {
      recorder.download(`video-kyc-${sessionInfo.sessionId}.webm`);
      showToast('Recording download started', 'success');
    });

    document.getElementById('btn-export-transcript')?.addEventListener('click', () => {
      const text = transcript.map((t, i) => `[${i + 1}] ${t.text} (confidence: ${(t.confidence * 100).toFixed(0)}%)`).join('\n');
      downloadText(text, `transcript-${sessionInfo.sessionId}.txt`);
      showToast('Transcript exported', 'success');
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const json = JSON.stringify(buildAuditJSON(data, riskResult, llmResult, acceptedOffer), null, 2);
      downloadText(json, `audit-${sessionInfo.sessionId}.json`);
      showToast('Audit JSON exported', 'success');
    });

    document.getElementById('btn-export-txt')?.addEventListener('click', () => {
      downloadText(logger.exportText(), `full-log-${sessionInfo.sessionId}.txt`);
      showToast('Full log exported', 'success');
    });

    document.getElementById('btn-new-session')?.addEventListener('click', () => {
      window.location.hash = 'landing';
      window.location.reload();
    });
  }, 0);

  return page;
}

function buildDecisionTrail(data, risk, llm, offer) {
  const items = [
    { type: 'system', text: 'Video KYC session initiated', time: formatDateTime(data.callStartTime ? new Date(data.callStartTime) : new Date()) },
    { type: 'system', text: `Geolocation captured: ${data.geo?.city || 'Unknown'}, ${data.geo?.state || 'Unknown'}`, time: '' },
    { type: 'ai', text: `Face detected — Estimated age: ${data.faceAge || 'N/A'}, Liveness: ${data.livenessPercent || 0}%`, time: '' },
    { type: 'ai', text: `Speech-to-text: ${(data.transcript?.length || 0)} entries captured`, time: '' },
    { type: 'user', text: `Verbal consent: ${data.consent ? 'Captured ✓' : 'Not captured ✗'}`, time: '' },
    { type: 'ai', text: `Bureau score: ${risk.bureauScore?.score || 'N/A'} (${risk.bureauScore?.rating || 'N/A'})`, time: '' },
    { type: 'ai', text: `LLM classification: ${llm.classification?.persona || 'N/A'} — ${llm.riskBand?.band || 'N/A'}`, time: '' },
    { type: 'decision', text: `Risk score: ${risk.riskScore || 'N/A'}/100 — Decision: ${(risk.decision || 'pending').toUpperCase()}`, time: '' },
  ];

  if (offer) {
    items.push({ type: 'user', text: `Offer accepted: ${offer.name} — ${formatCurrency(offer.amount)} at ${formatPercent(offer.rate)} p.a.`, time: '' });
  }

  return items.map(item => `
    <div class="trail-item">
      <div class="trail-dot ${item.type}">
        <i data-lucide="${item.type === 'system' ? 'zap' : item.type === 'ai' ? 'sparkles' : item.type === 'user' ? 'user' : 'flag'}" 
           style="width:12px;height:12px"></i>
      </div>
      <div class="trail-content">
        <div class="trail-text">${item.text}</div>
        ${item.time ? `<div class="trail-time">${item.time}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function buildAuditJSON(data, risk, llm, offer) {
  return {
    session: logger.getSessionInfo(),
    customer: {
      name: data.name || null,
      employment: data.employment || null,
      income: data.income || null,
      purpose: data.purpose || null,
      estimatedAge: data.faceAge || null,
      gender: data.faceGender || null,
      consent: data.consent || false,
    },
    geolocation: data.geo || null,
    videoKYC: {
      duration: data.callDuration || null,
      livenessPercent: data.livenessPercent || 0,
      transcriptEntries: data.transcript?.length || 0,
      recordingAvailable: !!recorder.getBlobUrl(),
    },
    riskAssessment: risk || null,
    llmAnalysis: llm ? {
      persona: llm.classification?.persona,
      riskBand: llm.riskBand?.band,
      confidence: llm.confidence,
    } : null,
    acceptedOffer: offer ? {
      tier: offer.name,
      amount: offer.amount,
      rate: offer.rate,
      tenure: offer.selectedTenure,
      emi: offer.selectedEMI,
    } : null,
  };
}

function syntaxHighlightJSON(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span style="color:var(--pf-cyan)">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span style="color:var(--color-success)">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span style="color:var(--pf-gold)">$1</span>')
    .replace(/: (true|false)/g, ': <span style="color:var(--color-warning)">$1</span>')
    .replace(/: (null)/g, ': <span style="color:var(--gray-500)">$1</span>');
}

function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDeviceName() {
  const ua = navigator.userAgent;
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('Android')) return 'Android';
  return 'Unknown';
}


