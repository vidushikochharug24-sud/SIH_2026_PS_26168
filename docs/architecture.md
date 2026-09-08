# 🏗️ NaviSync System Architecture

NaviSync is an AI-powered Intelligent Dead Reckoning (IDR) and sensor fusion engine engineered to maintain sub-meter vehicle navigation during complete GNSS blackouts (e.g., tunnels, urban canyons, underground garages) using commodity smartphone sensors.


## 📐 High-Level Architectural Pipeline
```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    NAVISYNC HIGH-LEVEL ARCHITECTURAL PIPELINE                    │
└─────────────────────────────────────────────────────────────────────────────────┘

 [ STAGE 1: MULTI-MODAL DATA INGESTION ]
    ├── Smartphone MEMS Sensors (10Hz IMU: Accel, Gyro, Magnetometer)
    └── GNSS Receiver (1Hz: NavIC / GPS / GLONASS / Galileo)
                                    │
                                    ▼
 [ STAGE 2: PREPROCESSING & VIRTUAL FRAME ALIGNMENT ]
    ├── Auto 3D Tilt & Coordinate Frame Rotation (Phone -> Vehicle Body Axes)
    ├── Vibration Denoising & High-Pass Band Filtering
    └── Sensor Bias & Gravity Decoupling
                                    │
                                    ▼
 [ STAGE 3: AI MOTION ESTIMATION & SENSOR FUSION ]
    ├── Deep Neural Network Velocity Estimator (1D-CNN Motion Feature Extraction)
    ├── Extended Kalman Filter (EKF) State Vector & Gyro Drift Estimator
    └── 10Hz Continuous Position & Heading Predictor
                                    │
                                    ▼
 [ STAGE 4: GNSS OUTAGE MANAGEMENT & SEAMLESS HANDSHAKE ]
    ├── Real-Time GNSS Health & Signal Loss Detection (< 10ms trigger)
    ├── Zero-Latency Dead Reckoning Fallback Engine
    └── Smooth 10Hz Probabilistic Re-convergence (No position jumps on exit)
                                    │
                                    ▼
 [ STAGE 5: MAP MATCHING & GEOMETRIC CONSTRAINTS ]
    ├── OpenStreetMap (OSM) Vector Road Topology Snapping
    └── Hidden Markov Model (HMM) Drivable Lane Constraint Filter
                                    │
                                    ▼
 [ STAGE 6: TELEMETRY & 3D NAVIGATION COCKPIT ]
    ├── Real-Time FastAPI & WebSockets Telemetry Server
    └── React 18 + Three.js 3D Cyber Highway & Telemetry Engine
===================================================================================
 1. DATA INGESTION ──► 2. PREPROCESSING ──► 3. AI FUSION ──► 4. OUTAGE HANDSHAKE
  - 10Hz IMU Sensors    - 3D Tilt Align     - Neural Speed    - Zero-Drop Fallback
  - 1Hz GNSS Receivers  - IMU Denoising     - EKF Estimation  - 10Hz Re-convergence
                                                                       │
                                                                       ▼
  6. 3D COCKPIT VIEW ◄── 5. MAP MATCHING ENGINE ◄──────────────────────┘
  - Three.js Viewport    - OSM Road Snapping
  - FastAPI WebSockets   - Lane Constraint Filter


---

## 🛠️ Core Module Breakdown

### 1. Data Ingestion & Preprocessing Layer
* **IMU Sampling**: Streams 3-axis acceleration, angular velocity, and heading at 10Hz - 100Hz from standard smartphone MEMS sensors.
* **Auto-Frame Alignment**: Transforms sensor coordinates from arbitrary phone positions (e.g., dashboard, cup holder, pocket) into the vehicle’s true longitudinal, lateral, and vertical reference frame using principal component rotation.
* **Filtering & Denoising**: Removes vehicle engine vibration and accelerometer spikes via dynamic bandpass filtering.

### 2. AI Velocity & Deep Dead Reckoning Engine
* **Neural Speed Estimator**: Utilizes 1D-CNN / Temporal Convolutional Networks to predict real-time speed from complex IMU motion signatures, bypassing classic double-integration error accumulation.
* **Extended Kalman Filter (EKF)**: Fuses high-rate IMU predictions with periodic GNSS observations (when available) to dynamically estimate and compensate for gyro drift and bias.

### 3. Outage Management & Seamless 10Hz Handshake
* **GNSS Health Monitor**: Continuously tracks HDOP, satellite count, and signal-to-noise ratio (SNR). Triggers zero-latency fallback to Dead Reckoning Mode the instant signals dip below critical thresholds.
* **10Hz Probabilistic Re-convergence**: When exiting GNSS-denied zones (e.g., tunnels), NaviSync blends re-acquired satellite pseudo-ranges with current dead-reckoning state vectors at 10Hz, eliminating abrupt position jumps or screen lag.

### 4. Map Matching Engine
* **Vector Road Snapping**: Uses OpenStreetMap (OSM) road topologies and HMM probabilistic map matching to snap vehicle coordinates to legitimate drivable lane centerlines in urban canyons.

### 5. Telemetry & Navigation Cockpit
* **FastAPI Backend**: Serves telemetry streams via low-latency WebSockets and REST APIs (`/api/predict`, `/ws/telemetry`).
* **Three.js 3D Rendering**: Renders real-time 3D vehicle trajectory, street view environments, and interactive constellation background visuals.

---

## 🔄 Execution State Machine
[ GNSS ACTIVE ] ──(Signal Loss / Tunnel Entry)──► [ DR OUTAGE MODE ] ▲ │ │ │ (Smooth 10Hz Re-convergence) (AI Velocity + EKF Fusion) │ │ └───────────(GNSS Re-acquired / Exit)───────────────┘
