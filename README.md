# ServerPulse — Liquid Glass Infrastructure Monitor

> A real-time, responsive multi-server health and uptime monitoring dashboard built with **React 19**, **Tailwind CSS v4**, **TypeScript**, and **Vite**.

![Dashboard Preview](public/vite.svg)

---

## ✨ Features

- **Liquid Glass Aesthetic:** Deep frosted glassmorphism (`backdrop-blur-2xl`), floating ambient iridescent gradient mesh spheres, and specular rim highlights.
- **Auto-Detect Responsive Layouts:** Automatically transitions between:
  - **📱 Portrait Mobile View:** Dynamic island status bar simulation, single-column touch cards, and a floating liquid glass bottom dock.
  - **💻 Widescreen Landscape View:** Multi-column server card fleet, 4-column live metrics overview, and quick filter chips.
- **Pulsing Radar Beacons:** Multi-ring expanding radar ripples reflecting live node health (`healthy`, `degraded`, `offline`).
- **Real Sub-Millisecond Telemetry:** Authentic browser network reachability checks with real round-trip latency timers in milliseconds.
- **Zero Mock Data:** Starts with a clean slate ready for only your servers, websites, and APIs.
- **Smart URL Auto-Detection:** Automatically extracts protocol, hostname, port, and endpoint path when pasting any URL.
- **Offline-First Persistence:** Stored locally in your browser via `localStorage` with zero setup needed.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/ReeVNaR/Server_Monitor.git
cd Server_Monitor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 🌐 Deploy to GitHub Pages

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Push your code to the `main` branch on GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Your site will automatically build and deploy at `https://reevnar.github.io/Server_Monitor/`.
