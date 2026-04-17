/**
 * Face Engine — @vladmandic/face-api wrapper for face detection,
 * age estimation, and gender detection in the browser
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model';

class FaceEngine {
  constructor() {
    this.faceapi = null;
    this.isLoaded = false;
    this.isRunning = false;
    this.detectionInterval = null;
    this.ageHistory = [];
    this.genderHistory = [];
    this.maxHistory = 15;
    this.framesWithFace = 0;
    this.totalFrames = 0;
    this.currentDetection = null;
    this.onDetection = null;
  }

  async load() {
    try {
      logger.log(LOG_CATEGORIES.FACE, 'Loading face detection models...');

      // Dynamic import face-api
      const faceapi = await import('@vladmandic/face-api');
      this.faceapi = faceapi;

      // Load required models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]);

      this.isLoaded = true;
      logger.log(LOG_CATEGORIES.FACE, 'Face detection models loaded successfully');
      return true;
    } catch (error) {
      logger.log(LOG_CATEGORIES.FACE, `Failed to load models: ${error.message}`);
      console.error('Face engine load error:', error);
      return false;
    }
  }

  startDetection(videoElement, canvasElement) {
    if (!this.isLoaded || this.isRunning) return;

    this.isRunning = true;
    logger.log(LOG_CATEGORIES.FACE, 'Starting face detection loop');

    const detect = async () => {
      if (!this.isRunning || videoElement.paused || videoElement.ended) return;

      try {
        this.totalFrames++;

        const detections = await this.faceapi
          .detectAllFaces(videoElement, new this.faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          }))
          .withFaceLandmarks()
          .withAgeAndGender();

        // Clear canvas
        const ctx = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (detections.length > 0) {
          this.framesWithFace++;
          const detection = detections[0]; // Primary face

          // Smooth age estimation with moving average
          this.ageHistory.push(detection.age);
          if (this.ageHistory.length > this.maxHistory) this.ageHistory.shift();
          const smoothedAge = Math.round(
            this.ageHistory.reduce((a, b) => a + b, 0) / this.ageHistory.length
          );

          // Track gender
          this.genderHistory.push(detection.gender);
          if (this.genderHistory.length > this.maxHistory) this.genderHistory.shift();
          const genderCounts = this.genderHistory.reduce((acc, g) => {
            acc[g] = (acc[g] || 0) + 1;
            return acc;
          }, {});
          const dominantGender = Object.entries(genderCounts)
            .sort((a, b) => b[1] - a[1])[0][0];

          this.currentDetection = {
            age: smoothedAge,
            rawAge: Math.round(detection.age),
            gender: dominantGender,
            genderProbability: detection.genderProbability,
            confidence: detection.detection.score,
            box: detection.detection.box,
            livenessPercent: this._getLivenessPercent(),
          };

          // Draw bounding box
          this._drawDetection(ctx, detection, smoothedAge, dominantGender);

          if (this.onDetection) {
            this.onDetection(this.currentDetection);
          }
        } else {
          this.currentDetection = null;
          if (this.onDetection) {
            this.onDetection(null);
          }
        }
      } catch (error) {
        // Silently handle detection errors (common during video initialization)
      }
    };

    // Run detection every 500ms
    this.detectionInterval = setInterval(detect, 500);
    detect(); // Run immediately
  }

  _drawDetection(ctx, detection, age, gender) {
    const box = detection.detection.box;
    const score = detection.detection.score;

    // Draw bounding box
    ctx.strokeStyle = '#00C2FF';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);

    // Draw corners
    const cornerLen = 15;
    ctx.strokeStyle = '#00C2FF';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    // Top-left
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + cornerLen);
    ctx.lineTo(box.x, box.y);
    ctx.lineTo(box.x + cornerLen, box.y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(box.x + box.width - cornerLen, box.y);
    ctx.lineTo(box.x + box.width, box.y);
    ctx.lineTo(box.x + box.width, box.y + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + box.height - cornerLen);
    ctx.lineTo(box.x, box.y + box.height);
    ctx.lineTo(box.x + cornerLen, box.y + box.height);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height);
    ctx.lineTo(box.x + box.width, box.y + box.height);
    ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen);
    ctx.stroke();

    // Label background
    const label = `Age: ${age} | ${gender} | ${(score * 100).toFixed(0)}%`;
    ctx.font = '13px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(box.x, box.y - 28, textWidth + 16, 24, 6);
    ctx.fill();

    // Label text
    ctx.fillStyle = '#00C2FF';
    ctx.fillText(label, box.x + 8, box.y - 10);
  }

  _getLivenessPercent() {
    if (this.totalFrames === 0) return 0;
    return Math.round((this.framesWithFace / this.totalFrames) * 100);
  }

  stop() {
    this.isRunning = false;
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    logger.log(LOG_CATEGORIES.FACE, 'Face detection stopped', {
      totalFrames: this.totalFrames,
      framesWithFace: this.framesWithFace,
      livenessPercent: this._getLivenessPercent(),
      finalAge: this.currentDetection?.age,
      finalGender: this.currentDetection?.gender,
    });
  }

  getResults() {
    return {
      estimatedAge: this.currentDetection?.age || null,
      gender: this.currentDetection?.gender || null,
      livenessPercent: this._getLivenessPercent(),
      totalFrames: this.totalFrames,
      framesWithFace: this.framesWithFace,
      confidence: this.currentDetection?.confidence || 0,
    };
  }
}

export const faceEngine = new FaceEngine();
