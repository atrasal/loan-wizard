/**
 * Speech Engine — Web Speech API wrapper for real-time STT
 * with entity extraction from verbal responses
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';

class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.transcript = [];
    this.entities = {
      name: null,
      employment: null,
      income: null,
      purpose: null,
      consent: false,
    };
    this.onTranscript = null;
    this.onEntity = null;
    this.onListeningChange = null;
    this._supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isSupported() {
    return this._supported;
  }

  start() {
    if (!this._supported) {
      logger.log(LOG_CATEGORIES.STT, 'Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-IN';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onListeningChange) this.onListeningChange(true);
      logger.log(LOG_CATEGORIES.STT, 'Speech recognition started');
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        const entry = {
          text: finalTranscript.trim(),
          timestamp: new Date().toISOString(),
          confidence: event.results[event.results.length - 1][0].confidence,
        };
        this.transcript.push(entry);
        this._extractEntities(finalTranscript);
        logger.log(LOG_CATEGORIES.STT, `Final: ${finalTranscript.trim()}`, {
          confidence: entry.confidence,
        });
      }

      if (this.onTranscript) {
        this.onTranscript({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim(),
        });
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // Ignore no-speech errors
      logger.log(LOG_CATEGORIES.STT, `Error: ${event.error}`);
      if (event.error === 'aborted') return;
      // Auto-restart on network errors
      setTimeout(() => {
        if (this.isListening) this._restart();
      }, 1000);
    };

    this.recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        setTimeout(() => this._restart(), 300);
      }
    };

    this.recognition.start();
    return true;
  }

  _restart() {
    try {
      this.recognition.start();
    } catch (e) {
      // Already running
    }
  }

  stop() {
    this.isListening = false;
    if (this.onListeningChange) this.onListeningChange(false);
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    logger.log(LOG_CATEGORIES.STT, 'Speech recognition stopped');
  }

  _extractEntities(text) {
    const lower = text.toLowerCase().trim();

    // Extract name (patterns: "my name is X", "I am X", "this is X")
    const namePatterns = [
      /my name is ([a-zA-Z\s]+)/i,
      /name is ([a-zA-Z\s]+)/i,
      /this is ([a-zA-Z\s]+)/i,
      /myself ([a-zA-Z\s]+)/i,
      /i am ([a-zA-Z\s]+)/i, // Last priority — can match employment phrases
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        const name = match[1].trim().split(/\s+/).slice(0, 4).join(' ');
        // Filter out common false positives
        const skip = [
          'salaried', 'self', 'employed', 'looking', 'interested', 'yes', 'no',
          'working', 'earning', 'getting', 'making', 'doing', 'seeking',
          'a salaried', 'self employed', 'a business', 'an employee',
        ];
        const lowerName = name.toLowerCase();
        if (!skip.some(s => lowerName.startsWith(s))) {
          this.entities.name = this._titleCase(name);
          this._emitEntity('name', this.entities.name);
          break; // Stop after first valid match
        }
      }
    }

    // Extract employment type
    if (/\b(salaried|salary|salaried employee|salaried professional)\b/i.test(lower)) {
      this.entities.employment = 'Salaried';
      this._emitEntity('employment', 'Salaried');
    } else if (/\b(self[- ]?employed|business|businessman|freelancer|entrepreneur|own business)\b/i.test(lower)) {
      this.entities.employment = 'Self-Employed';
      this._emitEntity('employment', 'Self-Employed');
    }

    // Extract income (patterns: "50000", "50,000", "50k", "5 lakhs", "fifty thousand")
    const incomePatterns = [
      /(?:income|salary|earn|earning|make|making|get|getting)[^\d]*?(\d[\d,]*)\s*(?:per month|monthly|a month|pm)?/i,
      /(\d[\d,]*)\s*(?:per month|monthly|a month|pm|rupees|rs)/i,
      /(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs)\s*(?:per|a)?\s*(?:month|annum|year)?/i,
      /(\d+)\s*k\s*(?:per month|monthly|pm)?/i,
    ];

    for (const pattern of incomePatterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = match[1].replace(/,/g, '');
        if (/lakh|lac/i.test(text.substring(match.index, match.index + match[0].length + 10))) {
          amount = parseFloat(amount) * 100000;
        } else if (/k\b/i.test(text.substring(match.index, match.index + match[0].length + 5))) {
          amount = parseFloat(amount) * 1000;
        } else {
          amount = parseFloat(amount);
        }

        // Per annum → monthly
        if (/per annum|annual|year/i.test(text)) {
          amount = Math.round(amount / 12);
        }

        if (amount >= 10000 && amount <= 50000000) {
          this.entities.income = Math.round(amount);
          this._emitEntity('income', this.entities.income);
        }
      }
    }

    // Extract loan purpose
    const purposes = {
      'personal': 'Personal Expense',
      'home renovation': 'Home Renovation',
      'renovation': 'Home Renovation',
      'medical': 'Medical Emergency',
      'hospital': 'Medical Emergency',
      'education': 'Education',
      'study': 'Education',
      'wedding': 'Wedding/Marriage',
      'marriage': 'Wedding/Marriage',
      'travel': 'Travel',
      'vehicle': 'Vehicle Purchase',
      'car': 'Vehicle Purchase',
      'bike': 'Vehicle Purchase',
      'business': 'Business Expansion',
      'debt': 'Debt Consolidation',
      'consolidation': 'Debt Consolidation',
      'shopping': 'Shopping',
    };

    for (const [keyword, purposeLabel] of Object.entries(purposes)) {
      if (lower.includes(keyword)) {
        this.entities.purpose = purposeLabel;
        this._emitEntity('purpose', purposeLabel);
        break;
      }
    }

    // Extract consent
    const consentPhrases = [
      'i consent', 'i agree', 'yes i consent', 'i give my consent',
      'i hereby consent', 'yes i agree', 'i do consent',
      'i give consent', 'yes consent', 'i provide my consent',
    ];
    for (const phrase of consentPhrases) {
      if (lower.includes(phrase)) {
        this.entities.consent = true;
        this._emitEntity('consent', true);
        logger.log(LOG_CATEGORIES.CONSENT, 'Verbal consent captured', {
          phrase,
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }
  }

  _emitEntity(type, value) {
    logger.log(LOG_CATEGORIES.STT, `Entity extracted: ${type} = ${value}`);
    if (this.onEntity) this.onEntity(type, value);
  }

  _titleCase(str) {
    return str.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  getTranscript() {
    return [...this.transcript];
  }

  getEntities() {
    return { ...this.entities };
  }

  getFullText() {
    return this.transcript.map(t => t.text).join(' ');
  }
}

export const speechEngine = new SpeechEngine();
