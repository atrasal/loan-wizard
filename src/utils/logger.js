/**
 * Central Audit Logger — stores all events with timestamps
 * for compliance and traceability
 */

const LOG_CATEGORIES = {
  SYSTEM: 'SYSTEM',
  STT: 'STT',
  FACE: 'FACE',
  GEO: 'GEO',
  RISK: 'RISK',
  LLM: 'LLM',
  OFFER: 'OFFER',
  USER: 'USER',
  CONSENT: 'CONSENT',
  RECORDING: 'RECORDING',
};

class AuditLogger {
  constructor() {
    this.logs = [];
    this.sessionId = this._generateSessionId();
    this.sessionStart = new Date();
    this.listeners = [];
  }

  _generateSessionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PF-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  log(category, message, data = null) {
    const entry = {
      id: this.logs.length + 1,
      timestamp: new Date().toISOString(),
      elapsed: this._getElapsed(),
      category,
      message,
      data,
    };
    this.logs.push(entry);
    this._notify(entry);
    console.log(`[${category}] ${message}`, data || '');
    return entry;
  }

  _getElapsed() {
    const diff = Date.now() - this.sessionStart.getTime();
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  _notify(entry) {
    this.listeners.forEach(cb => cb(entry));
  }

  getAll() {
    return [...this.logs];
  }

  getByCategory(category) {
    return this.logs.filter(l => l.category === category);
  }

  exportJSON() {
    return JSON.stringify({
      sessionId: this.sessionId,
      sessionStart: this.sessionStart.toISOString(),
      totalEntries: this.logs.length,
      duration: this._getElapsed(),
      logs: this.logs,
    }, null, 2);
  }

  exportText() {
    let text = `=== AUDIT LOG ===\n`;
    text += `Session: ${this.sessionId}\n`;
    text += `Started: ${this.sessionStart.toISOString()}\n`;
    text += `Duration: ${this._getElapsed()}\n\n`;

    this.logs.forEach(entry => {
      text += `[${entry.elapsed}] [${entry.category}] ${entry.message}\n`;
      if (entry.data) {
        text += `  Data: ${JSON.stringify(entry.data)}\n`;
      }
    });

    return text;
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      sessionStart: this.sessionStart,
      duration: this._getElapsed(),
      totalLogs: this.logs.length,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    };
  }
}

export const logger = new AuditLogger();
export { LOG_CATEGORIES };
