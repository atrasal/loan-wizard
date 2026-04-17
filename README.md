# 🏦 Poonawalla Fincorp Loan Wizard

### Video-Based Digital Loan Origination & Risk Assessment System

> **Team AiMatrix** — Agentic AI Video Call–Based Onboarding (Problem Statement 3)

[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![face-api.js](https://img.shields.io/badge/face--api.js-1.7.14-00C2FF)](https://github.com/vladmandic/face-api)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Application Flow](#-application-flow)
- [AI/ML Capabilities](#-aiml-capabilities)
- [Risk Assessment Engine](#-risk-assessment-engine)
- [Compliance & Audit](#-compliance--audit)
- [Demo vs Production](#-demo-vs-production)
- [Browser Compatibility](#-browser-compatibility)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)

---

## 🎯 Problem Statement

Traditional digital loan journeys face critical challenges:

| Challenge | Impact |
|-----------|--------|
| **High drop-off rates** | 60-70% of digital applications abandoned midway |
| **Fraud & misrepresentation** | No real-time identity verification |
| **Manual KYC overhead** | Physical document collection adds 3-5 days |
| **No contextual understanding** | Forms capture data but miss customer intent |
| **Compliance gaps** | Incomplete audit trails and consent records |

There is a need for a **secure, compliant, and intelligent** loan origination system that can digitally onboard customers in real time, capture consent and eligibility signals accurately, reduce fraud, and generate instant personalized loan offers with minimal human intervention.

---

## 💡 Our Solution

**Loan Wizard** is an AI-powered, end-to-end loan onboarding platform that uses a **live video call** as the primary interaction channel. A single 3-5 minute video session replaces the entire loan application process — from KYC verification to offer generation.

### How It Works

```
Campaign Link → Permissions → 🎥 Video KYC Call → Auto-Fill Form → Risk Assessment → Loan Offers → Audit Dashboard
```

### Key Innovation

> **All AI processing — speech-to-text, face detection, age estimation, risk scoring — runs entirely in the browser.** Zero backend dependency. Zero server latency. Infinite scalability. Complete data privacy.

---

## ✨ Key Features

### 🎥 Video KYC with Real-Time AI
- Live webcam feed with face detection overlay
- Real-time age & gender estimation using TinyFaceDetector
- Liveness detection (frame-by-frame face tracking)
- Session recording via MediaRecorder API

### 🎤 Speech-to-Text with Entity Extraction
- Web Speech API with continuous recognition (en-IN locale)
- NLP entity extraction: name, income, employment type, loan purpose
- Automatic verbal consent phrase detection
- Live transcript with confidence scores

### 📍 Geolocation Capture
- High-accuracy GPS coordinates via Browser Geolocation API
- Reverse geocoding to city/state/pincode (BigDataCloud API)
- Location serviceability verification
- Geo-mismatch fraud signal detection

### 🛡️ Multi-Layer Risk Assessment
- 5 fraud signal checks (location, age consistency, liveness, consent, session integrity)
- 5 policy rules (age eligibility, minimum income, employment, location, KYC completion)
- Simulated CIBIL bureau scoring (650-900 range)
- Composite risk score (0-100) with automated decision engine

### 🧠 LLM Intelligence Layer
- Customer persona classification (Premium Professional / Mid-Career / Emerging)
- Risk band assessment (Low / Medium / High)
- Lifetime value and cross-sell potential scoring
- Intent analysis and urgency detection from transcript

### 💰 Personalized Loan Offers
- 3 tiered offers: Basic, Recommended, Premium
- Income-based multipliers (8x-30x) adjusted by bureau score
- Bureau-adjusted interest rates (10.49% - 16.99%)
- Interactive EMI tenure slider (12-60 months)
- Reducing balance EMI calculation

### 📊 Compliance & Audit Dashboard
- Complete session audit trail with timestamps
- Video recording playback & download
- Full STT transcript with confidence scores
- Geolocation evidence with coordinates
- Decision trail timeline
- Raw JSON data export
- KYC Compliant Session certification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│     Vite + Vanilla JS SPA │ Glassmorphism UI │ Hash Router  │
├─────────────────────────────────────────────────────────────┤
│                       AI / ML LAYER                          │
│  Web Speech API │ @vladmandic/face-api │ Geolocation API    │
│  (STT + NLP)    │ (Age/Gender/Liveness) │ (GPS + Geocode)  │
├─────────────────────────────────────────────────────────────┤
│                    PROCESSING LAYER                          │
│  Risk Engine      │ LLM Engine          │ Offer Engine      │
│  (10 Rules)       │ (Classification)    │ (EMI Calculator)  │
├─────────────────────────────────────────────────────────────┤
│                    DATA & AUDIT LAYER                        │
│  MediaRecorder │ Central Logger │ JSON Export │ Consent Trail│
└─────────────────────────────────────────────────────────────┘
```

### Why Browser-First?

| Benefit | Description |
|---------|-------------|
| **Zero Latency** | No round-trips to server for AI processing |
| **Data Privacy** | Video/audio never leaves the user's device |
| **Instant Deploy** | Static files served via CDN — just a URL |
| **Infinite Scale** | Each user is their own compute node |
| **Offline Support** | Core features work after initial load |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Vite 6.3 | Build tool & dev server |
| **Language** | Vanilla JavaScript (ES Modules) | Zero-dependency frontend |
| **Speech-to-Text** | Web Speech API | Real-time voice recognition |
| **Face Detection** | @vladmandic/face-api (TensorFlow.js) | Age/gender/liveness |
| **Geolocation** | Browser Geolocation API + BigDataCloud | GPS + reverse geocoding |
| **Video Recording** | MediaRecorder API | Session capture (WebM/VP9) |
| **Icons** | Lucide Icons (CDN) | UI iconography |
| **Fonts** | Google Fonts (Outfit + Inter) | Premium typography |
| **Styling** | Vanilla CSS | Glassmorphism design system |

---

## 📁 Project Structure

```
loan-wizard/
├── index.html                      # SPA entry point
├── presentation.html               # Hackathon pitch deck (reveal.js)
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Vite configuration
│
├── src/
│   ├── main.js                     # App bootstrap & router setup
│   │
│   ├── styles/
│   │   └── main.css                # Complete design system (1000+ lines)
│   │
│   ├── utils/
│   │   ├── router.js               # Hash-based SPA router with transitions
│   │   ├── logger.js               # Central audit logger for compliance
│   │   └── helpers.js              # EMI calc, formatters, gauges, toasts
│   │
│   ├── modules/
│   │   ├── speechEngine.js         # Web Speech API + entity extraction
│   │   ├── faceEngine.js           # Face detection + age estimation
│   │   ├── geoEngine.js            # Geolocation + reverse geocoding
│   │   ├── riskEngine.js           # Fraud checks + policy rules
│   │   ├── llmEngine.js            # Customer classification engine
│   │   ├── offerEngine.js          # Loan offer generation
│   │   └── recorder.js             # MediaRecorder video capture
│   │
│   └── pages/
│       ├── landing.js              # Campaign entry page
│       ├── permissions.js          # Permission grant flow
│       ├── videoCall.js            # Core video KYC session
│       ├── application.js          # Auto-filled application form
│       ├── riskAssessment.js       # Risk evaluation dashboard
│       ├── loanOffer.js            # Personalized offer cards
│       └── auditDashboard.js       # Compliance audit trail
│
└── node_modules/                   # Dependencies
```

**Total: 22 source files | 0 backend files | 100% client-side**

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (with npm)
- **Google Chrome** or **Microsoft Edge** (required for Web Speech API)
- **Webcam + Microphone** (for full video KYC experience)

### Installation

```bash
# Clone the repository
git clone https://github.com/atrasal/loan-wizard.git
cd loan-wizard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Main Application |
| `http://localhost:5173/presentation.html` | Hackathon Pitch Deck |

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔄 Application Flow

### Step 1: Landing Page
Premium hero section with Poonawalla Fincorp branding, feature cards (Video KYC, Instant Offers, 100% Paperless), and trust indicators (RBI Registered, Bank-Grade Security, 40+ Year Legacy).

### Step 2: Permissions
Sequential permission grants for Camera, Microphone, and Location with animated status cards and real-time feedback.

### Step 3: Video Call (Core)
The heart of the application — a live video KYC session featuring:
- **Live webcam feed** with face detection bounding box overlay
- **5 guided questions** with auto-advance based on entity detection
- **Real-time transcript** with interim and final results
- **Entity extraction chips** showing detected name, income, employment, purpose
- **Consent capture** with verbal confirmation detection
- **Call controls** (mute mic, toggle camera, end call)
- **HUD indicators** showing recording status, face detection, liveness percentage

### Step 4: Application Form
Auto-filled form with AI-extracted data. Fields tagged with:
- ✨ **AI Extracted** — name, income, employment, purpose (from speech)
- 🤖 **Face AI** — estimated age (from face detection)
- 📍 **GPS** — city, state (from geolocation)
- Confidence bars showing extraction accuracy

### Step 5: Risk Assessment
Multi-panel dashboard showing:
- **Fraud Signal Analysis** — 5 checks with pass/flag indicators
- **Bureau Score (CIBIL)** — Animated gauge with score and rating
- **Policy Evaluation** — 5 eligibility rules with values
- **AI Intelligence Layer** — Customer persona, risk band, lifetime value
- **Overall Risk Score** — Composite gauge (0-100) with decision
- **Decision Banner** — APPROVED / CONDITIONALLY APPROVED / DECLINED

### Step 6: Loan Offers
Three personalized offer cards:
- **Basic** — Lower amount, higher rate
- **Recommended** — Optimal balance (highlighted with gold badge)
- **Premium** — Maximum amount, best rate
- Interactive tenure slider (12-60 months) for real-time EMI recalculation

### Step 7: Audit Dashboard
Complete compliance record:
- Session ID, duration, device info, customer name, decision
- Video recording playback (if captured)
- Full transcript with Q-numbers and confidence percentages
- Geolocation map with coordinates
- Accepted offer summary
- Decision trail timeline (System → AI → User → Decision events)
- Syntax-highlighted raw JSON audit data
- Export buttons: JSON, TXT log, video download

---

## 🤖 AI/ML Capabilities

### Speech Engine (`speechEngine.js`)
| Feature | Implementation |
|---------|---------------|
| **API** | Web Speech API (`webkitSpeechRecognition`) |
| **Language** | `en-IN` (Indian English) |
| **Mode** | Continuous with interim results |
| **Entity Extraction** | Regex + keyword matching for 5 entity types |
| **Name Detection** | "My name is X", "I am X", "This is X" patterns |
| **Income Detection** | Numeric patterns, "lakh/k" converters, per-month/annum normalization |
| **Employment Detection** | Keyword matching: salaried, self-employed, business |
| **Purpose Detection** | 16 keyword categories mapped to loan purposes |
| **Consent Detection** | 10 consent phrases: "I consent", "I agree", etc. |

### Face Engine (`faceEngine.js`)
| Feature | Implementation |
|---------|---------------|
| **Library** | @vladmandic/face-api (TensorFlow.js backend) |
| **Detector** | TinyFaceDetector (320px input, 0.5 threshold) |
| **Models** | tinyFaceDetector + faceLandmark68 + ageGender |
| **Age Estimation** | 15-frame moving average for smoothing |
| **Gender Detection** | Majority voting over 15 frames |
| **Liveness** | Percentage of frames with face detected |
| **Overlay** | Cyan bounding box with corner markers + HUD label |
| **Detection Rate** | Every 500ms for performance balance |

### LLM Engine (`llmEngine.js`)
| Feature | Implementation |
|---------|---------------|
| **Classification** | 4 customer personas based on income + employment |
| **Risk Banding** | Composite score from income, employment, consent, liveness |
| **Intent Analysis** | Purpose + urgency keyword detection from transcript |
| **Cross-Sell** | Income-based product recommendations |
| **Confidence** | 0.82-0.97 range based on data completeness |

---

## 🛡️ Risk Assessment Engine

### Fraud Signal Checks (5)
1. **Location Verification** — GPS coordinates validated against serviceable areas
2. **Age Consistency** — Declared age vs Face AI estimation (threshold: ±8 years)
3. **Liveness Detection** — Face presence ≥60% of video frames
4. **Verbal Consent** — Explicit consent phrase captured via STT
5. **Session Integrity** — Single continuous video session without interruptions

### Policy Rules (5)
1. **Age Eligibility** — 21-60 years
2. **Minimum Income** — ₹15,000/month
3. **Employment Type** — Salaried or Self-Employed
4. **Location Serviceable** — All Indian locations (configurable)
5. **Video KYC Completed** — Full session required

### Bureau Score Simulation
- Income-based scoring: ₹25K→680, ₹50K→720, ₹75K→750, ₹100K+→780
- Employment bonus: Salaried +20 points
- Random variance: ±20 points for realism
- Rating bands: Excellent (750+), Good (700+), Fair (650+), Poor (<650)

### Decision Logic
```
IF any critical fraud check fails → DECLINED
ELSE IF any policy fails OR risk score > 70 → CONDITIONALLY APPROVED
ELSE → APPROVED
```

---

## 📊 Compliance & Audit

Every session generates an immutable audit trail satisfying RBI KYC norms:

- ✅ **Video Recording** — Full session in WebM format, downloadable
- ✅ **Timestamped Transcript** — Every verbal response with STT confidence
- ✅ **Verbal Consent Record** — Explicit phrase + timestamp + transcript context
- ✅ **Geolocation Evidence** — GPS coordinates, city, state, accuracy radius
- ✅ **Face Detection Log** — Estimated age, gender, liveness percentage
- ✅ **Decision Trail** — Step-by-step log of every automated decision
- ✅ **Raw Data Export** — Full JSON audit log for regulatory submission
- ✅ **Session Metadata** — Device, browser, screen size, network, duration

---

## 🌐 Browser Compatibility

| Browser | Speech API | Face Detection | Geolocation | Recording |
|---------|-----------|---------------|-------------|-----------|
| **Chrome 90+** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Edge 90+** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Safari 15+** | ⚠️ Limited | ✅ Full | ✅ Full | ✅ Full |
| **Firefox 100+** | ❌ No | ✅ Full | ✅ Full | ✅ Full |

> **Recommended:** Google Chrome for the best experience with all AI features.

---

## 🧪 Demo vs Production

This is a **hackathon prototype** demonstrating a production-ready architecture. Key distinctions:

| Component | Demo (Current) | Production-Ready |
|-----------|---------------|------------------|
| **Speech-to-Text** | ✅ Live — Web Speech API | Same (browser-native) |
| **Face Detection** | ✅ Live — @vladmandic/face-api | Same + deepfake detection |
| **Geolocation** | ✅ Live — Browser API + BigDataCloud | Same |
| **Video Recording** | ✅ Live — MediaRecorder API | Same |
| **LLM Classification** | 🔶 Simulated — deterministic rules | Groq/Llama 3.3 API |
| **Bureau Score (CIBIL)** | 🔶 Simulated — income-based formula | CIBIL/Experian API |
| **Aadhaar KYC** | 🔶 Not integrated | UIDAI DigiLocker API |

> **4 out of 7 AI modules run LIVE in the browser.** The simulated modules (LLM, CIBIL, Aadhaar) are architecturally designed for drop-in API replacement with zero frontend changes.

---

## 🔮 Future Roadmap

- 🔗 **Aadhaar e-KYC** — UIDAI DigiLocker API integration
- 🧠 **Live LLM Agent** — Conversational AI using Groq/Llama 3.3
- 🏦 **Real Bureau Integration** — CIBIL/Experian API for live credit scores
- 🔒 **Deepfake Detection** — Blink analysis, head movement, texture analysis
- 📱 **WhatsApp Integration** — Campaign links via WhatsApp Business API
- 📊 **Ops Dashboard** — Conversion funnels, drop-off analysis, session monitoring

---

## 📖 Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)** — Detailed slide-by-slide content for PPT/presentation generation
- **[presentation.html](presentation.html)** — Browser-based reveal.js pitch deck (13 slides)

---

## 👥 Team

**Team AiMatrix** — Poonawalla Fincorp Hackathon 2026

---

## 📄 License

This project is built for the Poonawalla Fincorp Hackathon 2026. All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ by Team AiMatrix</strong><br/>
  <sub>Poonawalla Fincorp Loan Wizard — Video-Based Digital Loan Origination & Risk Assessment System</sub>
</p>
