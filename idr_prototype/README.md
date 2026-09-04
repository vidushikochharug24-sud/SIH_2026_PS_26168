# Intelligent Dead Reckoning (IDR) Simulator — React + FastAPI

A high-performance single-page web application demonstrating ML-powered phone IMU navigation taking over vehicle tracking during simulated GNSS/GPS blackouts.

---

## 🎨 Features & Architecture

### 1. Landing & Loading Animation
- Inspired by *"KEPT — Location Tracking 3D Animation"* (Abron Studio, Dribbble).
- 3D perspective floor grid, pulsing radar rings, 0% ➔ 100% progress counter loader, and animated glowing **ENTER IDR SIMULATOR** button.

### 2. Predictor Control Room Dashboard
- **FastAPI WebSocket Engine**: 10Hz live streaming WebSocket (`ws://localhost:8000/ws/replay`) broadcasting real-time tick telemetry payloads.
- **Canvas 2D Trajectory Bloom Plot**: Multi-layer neon glowing paths for Ground Truth reference (dotted electric blue), Ordinary DR route (muted violet), and AI IDR route (teal-green gradient glow), plus animated current vehicle radar blip.
- **Framer Motion Micro-Interactions**: Pulsing status pills (`GNSS AVAILABLE`, `GNSS OUTAGE`, `GNSS RESTORED`), count-up metric cards, ambient full-page glow tint shifts on status transitions.
- **Real-Time Oscilloscope Sparklines**: 4 Canvas sparklines for Accelerometer, Gyroscope, Predicted Speed, and Outage Displacement.
- **Terminal Event Log & Post-Restoration Summary**: Monospace scrolling event log and statistical summary panel.

---

## 🚀 How to Run

### 1️⃣ Start the FastAPI Backend
In your terminal, navigate to the `backend/` directory and run:

```bash
cd backend
python -m uvicorn main:app --port 8000 --reload
```

The FastAPI backend will start on **`http://localhost:8000`** (WebSocket endpoint at `ws://localhost:8000/ws/replay`).

---

### 2️⃣ Start the React Frontend
In a new terminal window, navigate to the `frontend/` directory and run:

```bash
cd frontend
npm install
npm run dev
```

Open your web browser at **`http://localhost:5173`**.
