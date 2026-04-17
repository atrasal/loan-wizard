/**
 * Recorder — MediaRecorder API wrapper for video+audio recording
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';

class Recorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.blob = null;
    this.blobUrl = null;
    this.startTime = null;
  }

  start(stream) {
    if (this.isRecording) return false;

    this.recordedChunks = [];

    // Choose best supported mime type
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];

    let mimeType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: 1500000, // 1.5 Mbps
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.blob = new Blob(this.recordedChunks, { type: mimeType || 'video/webm' });
        this.blobUrl = URL.createObjectURL(this.blob);
        logger.log(LOG_CATEGORIES.RECORDING, 'Recording saved', {
          size: `${(this.blob.size / 1024 / 1024).toFixed(2)} MB`,
          chunks: this.recordedChunks.length,
          duration: this._getElapsed(),
        });
      };

      this.mediaRecorder.start(1000); // Capture every 1s
      this.isRecording = true;
      this.startTime = Date.now();

      logger.log(LOG_CATEGORIES.RECORDING, 'Recording started', { mimeType });
      return true;
    } catch (error) {
      logger.log(LOG_CATEGORIES.RECORDING, `Recording error: ${error.message}`);
      return false;
    }
  }

  stop() {
    if (!this.isRecording || !this.mediaRecorder) return;

    this.mediaRecorder.stop();
    this.isRecording = false;
    logger.log(LOG_CATEGORIES.RECORDING, 'Recording stopped');
  }

  _getElapsed() {
    if (!this.startTime) return '00:00';
    const diff = Date.now() - this.startTime;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getBlob() {
    return this.blob;
  }

  getBlobUrl() {
    return this.blobUrl;
  }

  getDuration() {
    return this._getElapsed();
  }

  download(filename = 'video-kyc-recording.webm') {
    if (!this.blobUrl) return;
    const a = document.createElement('a');
    a.href = this.blobUrl;
    a.download = filename;
    a.click();
  }
}

export const recorder = new Recorder();
