# NAVISYNC — AI-ML Based Intelligent Dead Reckoning System
## Live Deployed Website: https://sih-2026-ps-26168.vercel.app/
> **When GNSS disappears, NAVISYNC keeps you moving.**

---

## 1. Project Information

- **Project Title:** NAVISYNC — AI-ML Based Intelligent Dead Reckoning System for Seamless Navigation
- **PS ID:** SIH26168
- **PS Title:** AI-ML based Intelligent Dead Reckoning system for seamless navigation
- **Organization:** Indian Space Research Organisation (ISRO)
- **Category:** Software
- **Theme:** Miscellaneous
- **Team Name:** RuntimeRebels

### 👥 Team Details
- **Team Leader:** Vidushi Kochhar ([@vidushikochharug24-sud](https://github.com/vidushikochharug24-sud))
- **Team Members:**
  - Aryan Bansal ([@aryanbansal2124](https://github.com/aryanbansal2124))
  - Vidushi Kochhar ([@vidushikochharug24-sud](https://github.com/vidushikochharug24-sud))
  - Palak Sachdeva ([@palaksachdeva](https://github.com/palaksachdeva))
  - Utkarsh Kumar ([@Falsistic](https://github.com/Falsistic))
  - Rahul Gupta ([@rahul01gupta11](https://github.com/rahul01gupta11))
  - Chirayu Aggarwal ([@kayFj1](https://github.com/kayFj1))

---

## 2. Problem Statement

Conventional vehicle navigation systems rely heavily on GNSS/GPS for positioning. However, GNSS signals can become unavailable or unreliable in environments such as:

- Tunnels
- Underground parking structures
- Dense urban areas (urban canyons)
- Dense forests and deep valleys
- GNSS-denied or interference-prone environments

Although smartphones provide accelerometer, gyroscope, and magnetometer sensors, directly double-integrating noisy inertial measurements leads to rapidly accumulating positional drift. The challenge is to develop an intelligent dead reckoning system that maintains continuous and reliable vehicle positioning during GNSS outages using smartphone sensors and AI/ML techniques.

---

## 3. Proposed Solution

**NAVISYNC** is a smartphone-based Intelligent Dead Reckoning (IDR) system designed to provide continuous vehicle navigation during GNSS outages. The system combines:

- Smartphone IMU sensors (Accelerometer, Gyroscope, Magnetometer)
- AI-based velocity and inertial odometry
- Automatic phone-to-vehicle alignment
- GNSS + INS sensor fusion (Kalman Filtering)
- Map matching with Non-Holonomic Constraints (NHC)

Instead of relying on raw double-integration of acceleration, NAVISYNC uses a lightweight temporal AI model to estimate short-window vehicle motion and displacement, preventing exponential inertial error accumulation.

### Core Pipeline

```text
Smartphone IMU + GNSS
       │
       ▼
Preprocessing & Calibration
       │
       ▼
Phone-to-Vehicle Alignment
       │
       ▼
AI Velocity & Bias Estimation
       │
       ▼
AI Inertial Odometry (GRU/LSTM → Δx, Δy, Δz)
       │
       ▼
Position Integration
       │
       ▼
GNSS + INS Kalman Fusion
       │
       ▼
Map Matching + Non-Holonomic Constraints (NHC)
       │
       ▼
Continuous Vehicle Position
```

#### Operational Workflow

* **During GNSS Availability:** `GNSS + IMU → Sensor Fusion → Accurate Position`
* **During GNSS Outage:** `IMU → AI Inertial Odometry → Dead Reckoning → Map Constraints → Continuous Position`
* **When GNSS Returns:** `GNSS Re-acquired → Kalman Correction → Smooth Position Recovery → No Sudden Position Jump`

---

## 4. Key Features

- 📱 **Smartphone-based sensing:** Uses built-in accelerometer, gyroscope, and magnetometer.
- 🧠 **AI-based inertial odometry:** Short-window displacement prediction using temporal neural networks.
- 🚗 **Vehicle-specific motion learning:** Trained on vehicle benchmarks (IO-VNBD dataset).
- 🧭 **Automatic phone alignment:** Corrects varying mounting orientations in 3D space.
- ⚡ **AI velocity and bias estimation:** Continuously estimates IMU noise and zero-velocity states.
- 🛰️ **GNSS + INS sensor fusion:** Extended Kalman Filter (EKF) state estimation.
- 🔄 **Seamless GNSS outage handling:** Continuous 10Hz handoff and zero-jump re-convergence.
- 🗺️ **OSM-based map matching:** Snaps trajectory vectors to drivable road networks.
- 🚘 **Non-holonomic vehicle constraints:** Prevents lateral sideways vehicle drift.
- 📍 **Continuous position estimation:** Sub-meter positioning during satellite blackouts.
- 📊 **Real-time navigation visualization:** High-frequency dashboard & telemetry engine.
- 📱 **Edge-deployable smartphone inference:** Optimized low-latency mobile deployment.

---

## 5. How NAVISYNC Addresses the Problem

| PS Challenge | NAVISYNC Solution |
| :--- | :--- |
| **GNSS signal unavailable** | AI-based inertial dead reckoning engine |
| **No OBD-II / speedometer feed** | IMU-based AI velocity estimation |
| **Phone mounting orientation varies** | Automatic phone-to-vehicle 3D alignment |
| **Engine vibration / potholes / noise** | Pre-calibration + adaptive filtering + learned noise suppression |
| **Accumulating inertial drift** | Learned short-window displacement + EKF sensor fusion |
| **Position jump after GNSS recovery** | Smooth 10Hz Kalman-based probabilistic re-convergence |
| **Trajectory leaves the road** | OSM map matching + non-holonomic vehicle constraints |

---

## 6. Innovation & Uniqueness

### 01 — Learned Displacement Instead of Raw Double Integration
NAVISYNC predicts short-window displacement directly from inertial feature streams:
$$\text{IMU Window} \longrightarrow \text{GRU / LSTM} \longrightarrow (\Delta x, \Delta y, \Delta z) \longrightarrow \text{Running Trajectory}$$
This completely avoids exponential error growth caused by repeating double integration on noisy accelerometer data.

### 02 — Vehicle-Specific AI Training
The inertial odometry model is trained and evaluated on **IO-VNBD**, a specialized ground vehicle benchmark dataset, enabling the AI to learn true vehicle-scale kinematics rather than pedestrian gait dynamics.

### 03 — Seamless GNSS Re-acquisition (10Hz Handshake)
When GNSS signals return, NAVISYNC does not abruptly overwrite the vehicle position. Instead, it executes a smooth probabilistic Kalman correction:
$$\text{Dead Reckoning State} + \text{New GNSS Measurement} \longrightarrow \text{10Hz Kalman Fusion} \longrightarrow \text{Gradual Correction}$$

### 04 — Hardware-Independent Architecture
Designed entirely around standard smartphone sensor feeds without requiring OBD-II vehicle diagnostic port adapters or external CAN-bus integration.

---

## 7. Dataset

### IO-VNBD (Inertial and Odometry Benchmark Dataset)
NAVISYNC uses the **IO-VNBD** ground vehicle positioning benchmark specified by the ISRO problem statement.
- **Dataset Repository:** [https://github.com/onyekpeu/IO-VNBD](https://github.com/onyekpeu/IO-VNBD)

```text
IO-VNBD ──► Sensor Preprocessing ──► Synchronization ──► Window Generation ──► Model Training ──► Trajectory Evaluation
```

---

## 8. Technology Stack

- **Machine Learning:** Python, PyTorch / TensorFlow, NumPy, Pandas, SciPy, Scikit-learn, GRU / LSTM, ONNX / TFLite (Edge Inference)
- **Navigation & Sensor Processing:** IMU Preprocessing, Coordinate Transformation, Gravity Compensation, Extended Kalman Filter (EKF), Map Matching, Non-Holonomic Constraints (NHC)
- **Frontend (Web Prototype):** React 18, TypeScript, Tailwind CSS, Three.js / React Three Fiber, Lucide Icons
- **Backend:** Python 3.11, FastAPI, REST APIs, WebSockets
- **Mobile (Android):** Kotlin, Android Sensor APIs, Location Services
- **Mapping:** OpenStreetMap (OSM)
- **Deployment:** Vercel (Frontend), Render (Backend), Smartphone / Edge Device

---

## 9. System Architecture

```text
┌─────────────────────────┐
│       Smartphone        │
│  • Accelerometer        │
│  • Gyroscope            │
│  • Magnetometer         │
│  • GNSS Receiver        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Preprocessing & Filter  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Phone-Vehicle Alignment │
│  (Pitch / Roll / Yaw)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   AI Motion Estimator   │
│       (GRU/LSTM)        │
└────────────┬────────────┘
             │  (Δx, Δy, Δz)
             ▼
┌─────────────────────────┐
│     Dead Reckoning      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   GNSS + INS Fusion     │
│     (Kalman Filter)     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Map Matching       │
│       (OSM + NHC)       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Continuous Vehicle    │
│        Position         │
└─────────────────────────┘
```

---

## 10. Repository Structure

```text
NAVISYNC/
├── README.md
├── IDR_prototype/
│   ├── frontend/
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   ├── backend/
│   │   ├── app/
│   │   └── requirements.txt
├── ML_Models/
│   ├── README.md
│   ├── speed_model/
│   └── displacement_model/
├── Navigation_Engine/
│   ├── preprocessing/
│   ├── dead_reckoning/
│   ├── sensor_fusion/
│   └── map_matching/
├── Mobile/
├── docs/
│   ├── architecture.md
│   └── methodology.md
└── submission/
    ├── PRESENTATION.pdf
    └── DEMO.md
```

---

## 11. Development Workflow

```text
IO-VNBD Dataset ──► Data Preprocessing ──► Baseline DR ──► AI Model Training ──► Sensor Fusion ──► Map Matching ──► Integrated Prototype
```

---

## 12. Web Prototype & Navigation Cockpit

The NAVISYNC interactive web application provides real-time telemetry, 3D visualization, and interactive outage testing:

1. **Cinematic Hero Interface:** MP4 video introduction, real-time satellite availability HUD, and interactive 3D Half-Earth scene.
2. **3D Cyber Highway:** 3D urban tunnel environment depicting real-time 10Hz trajectory tracking.
3. **Interactive Navigation Cockpit:** Live simulator console to toggle between **GNSS Available** and **GNSS Outage Mode** while monitoring telemetry sparklines, heading, speed, and position drift.

---

## 13. ML Pipeline

```text
Raw IMU Data ──► Timestamp Sync ──► Resampling ──► Gravity Compensation ──► Sliding Window (10Hz) ──► GRU/LSTM ──► Velocity & Displacement Prediction ──► Trajectory Reconstruction
```

---

## 14. Performance Evaluation

NAVISYNC performance is benchmarked using standard navigation metrics:
- **Position RMSE** (Root Mean Square Error)
- **Velocity MAE** (Mean Absolute Error)
- **ATE** (Absolute Trajectory Error)
- **RTE** (Relative Trajectory Error)
- **Position Drift Percentage:**

$$\text{Drift (\%)} = \left( \frac{\text{Position Error}}{\text{Distance Travelled}} \right) \times 100$$

* **Target Criterion:** Maintain total positional drift **below 10%** of total distance traveled during complete GNSS outages.

---

## 15. Project Status

- [x] Problem statement analysis & architectural design
- [x] Web prototype & 3D Navigation Cockpit engine
- [x] IO-VNBD dataset preprocessing & feature pipeline
- [x] Baseline Dead Reckoning & AI Model training
- [x] Sensor Fusion layer & Extended Kalman Filter (EKF)
- [x] Map Matching & Non-Holonomic Constraints integration
- [x] Android sensor ingestion & edge optimization

---

## 16. Future Scope

- Full on-device Android native deployment with TFLite / ONNX Runtime.
- Support for external Bluetooth/USB IMU units and CAN-bus telemetry.
- Multi-lane road snapping and subterranean 3D parking lot building maps.
- Ultra-low latency edge processing optimized for ARM mobile chipsets.

---

## 17. Expected Outcome

```text
[ GNSS AVAILABLE ] ──► Accurate GNSS + INS Navigation
       │
       ▼
[ GNSS SIGNAL LOST ] ──► AI Dead Reckoning (Continuous 10Hz Tracking)
       │
       ▼
[ GNSS RETURNS ] ──► Smooth 10Hz Sensor Fusion (No Position Jumps)
```

---

## 18. Smart India Hackathon 2026

- **Hackathon:** Smart India Hackathon 2026
- **Organization:** Indian Space Research Organisation (ISRO)
- **Problem Statement ID:** SIH26168
- **Problem Statement:** AI-ML based Intelligent Dead Reckoning system for seamless navigation
- **Team:** RuntimeRebels

---

## 19. Project Vision

> **Navigation should not stop just because GNSS does.**
> 
> **NAVISYNC** combines smartphone sensing, AI-based inertial odometry, sensor fusion, and map intelligence to build a navigation system capable of continuing where conventional GNSS-dependent navigation systems fail.
>
> **NAVISYNC — When GNSS disappears, we keep moving.**
