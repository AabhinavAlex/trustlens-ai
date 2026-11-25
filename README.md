# TrustLens AI

All-in-one, **age-adaptive** AI digital trust and threat detection platform — **100% client-side** in-browser privacy-first processing with **zero backend required**.

---

## Features
- **Top Quick-Access Feature Bar**: Every core tool (**Smart Auto-Router**, **Scam & UPI Guard**, **Deepfake Check**, **Prompt Injection**, **EXIF & Doc Check**, **Scam Simulator**, and **Family Guardian**) is pinned at the top for instant access.
- **Sentinel & Cyber AI Inspired Interface**:
  - **Cyber Pro (Young Adult) Mode**: Midnight-navy dot-grid cyber dashboard, glowing gradient hero, 6 KPI tiles, sweeping Security Coverage Radar, Risk Telemetry bars, and Signal Anomaly Waveform.
  - **Child Mode**: Bright, friendly colors, simple icons, and short safety tips.
  - **Elderly Mode**: Extra-large high-contrast text, simplified big buttons, **English & Malayalam (`ml-IN`) voice readout** via Web Speech API, and a prominent **"Call / Alert Family Guardian"** button.
- **100% In-Browser Detection Engines** (`src/utils/clientAnalyzers.js`):
  - **Scam & UPI Guard**: UPI QR (`upi://`) social engineering, phishing URLs, and urgency heuristics.
  - **Deepfake Check**: In-browser HTML5 Canvas Laplacian sharpness & audio byte-variance heuristics.
  - **Prompt Injection Scanner**: Adversarial instruction-override, jailbreak, zero-width Unicode, and Base64 detection.
  - **EXIF & Origin Authenticity**: Camera EXIF & AI/editing software signature inspection.
  - **Document Integrity**: Magic-byte validation, PDF `/JavaScript` / `/OpenAction` scan, and Web Crypto SHA-256 hashing.
- **Standout Features**:
  - **Pause-and-Verify Modal** when `Trust Score < 40`
  - **Trust Passport** download (SHA-256 hashed JSON + printable summary)
  - **Family Guardian Mode** simulated alert toast & incident log
  - **Scam Immunity Simulator** with 3 interactive fake-vs-real scenarios

---

## Run Locally (Frontend Only)

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Open **http://localhost:5173** in your browser.
