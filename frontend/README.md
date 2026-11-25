# TrustLens AI Frontend Demo

This repository contains a **frontend‑only** React application that demonstrates the UI for the TrustLens AI prototype. All features are implemented client‑side with mock data; no backend server is required.

## Features
- **Age‑Adaptive Interface** – toggle between Child, Young Adult, and Elder modes.
- **Smart Auto‑Router** – a unified input box that pretends to analyse different content types and returns a random trust score.
- **Pause‑and‑Verify Modal** – appears when the trust score falls below the safe threshold.
- **Trust Passport** – download a mock JSON verification report.
- **Family Guardian Alert** – simulate sending an alert to a trusted contact.
- **Scam Immunity Simulator** – interactive fake‑scam scenarios that give you a score.

The layout mirrors the reference images you provided.

## Prerequisites
- **Node.js** (v18 or later) with npm (comes with Node).
- A modern browser (Chrome, Edge, Firefox, etc.).

## Getting Started
```bash
# Clone or copy the repository
cd "C:\Users\ABHINAV ALEX\Desktop\trust ai\frontend"

# Install dependencies (network required)
npm install

# Run the development server
npm run dev
```
The app will be available at `http://localhost:5173`.

## Build for Production
```bash
npm run build
# The static files are emitted to the `dist/` folder.
```
You can serve the `dist` folder with any static file server (e.g., `npx serve dist`).

## Project Structure
```
frontend/
├─ index.html               # Entry HTML file
├─ package.json             # npm scripts and dependencies
├─ vite.config.js           # Vite configuration
├─ tailwind.config.cjs      # Tailwind CSS configuration
├─ src/
│  ├─ index.css            # Tailwind base imports
│  ├─ main.jsx              # React entry point
│  ├─ App.jsx               # Top‑level component
│  └─ components/
│     ├─ AgeToggle.jsx
│     ├─ AutoRouter.jsx
│     ├─ PauseVerifyModal.jsx
│     ├─ TrustPassportButton.jsx
│     ├─ FamilyGuardianButton.jsx
│     └─ ScamSimulator.jsx
└─ README.md                # This file
```

## Customisation
- Adjust Tailwind colours or layout in `tailwind.config.cjs`.
- Replace the mock logic in `src/components` with real API calls when you add a backend.
- The voice read‑out button for Malayalam/English can be added using the Web Speech API (not included in this demo).

---
*Built with React, Vite, Tailwind CSS, and Lucide icons.*
