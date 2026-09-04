# PS 26168 — SIH HACKATHON 2026

# NAVISYNC 🛰️

### AI-Enhanced Intelligent Dead Reckoning for Continuous Vehicle Navigation

> **When GNSS disappears, NAVISYNC keeps you moving.**

NAVISYNC is a software-based Intelligent Dead Reckoning (IDR) system that uses smartphone IMU sensors and AI/ML to maintain continuous vehicle positioning during GNSS outages. Developed for **Smart India Hackathon 2026 — ISRO | PS 26168**.

---

## 👥 Team Details

**Team Name:** RuntimeRebels  
**Team Leader:** [@vidushikochharug24-sud](https://github.com/vidushikochharug24-sud)

### Team Members
- **MEMBER_1** — 2024UIC3648 — [@aryanbansal2124](https://github.com/aryanbansal2124)
- **MEMBER_2** — 2024UEC2633 — [@vidushikochharug24-sud](https://github.com/vidushikochharug24-sud)
- **MEMBER_3** — 2024UEC2616 — [@palaksachdeva](https://github.com/palaksachdeva)
- **MEMBER_4** — —
- **MEMBER_5** — —
- **MEMBER_6** — —

---

## 🔗 Project Links
- **SIH Presentation:** Coming Soon
- **Video Demonstration:** Coming Soon
- **Live Dashboard:** Coming Soon

---

## 🚗 The Problem

GNSS signals can become unavailable in:
- Underground tunnels
- Multi-level parking structures
- Dense urban areas
- Forested roads
- Deep valleys
- GNSS-denied or interference environments

A smartphone can still measure motion using its **accelerometer, gyroscope and magnetometer**, but directly integrating noisy IMU measurements causes positional error to accumulate rapidly.

**NAVISYNC addresses this challenge using AI-enhanced inertial odometry, sensor fusion, drift correction and map constraints.**

---

## 💡 Our Approach

NAVISYNC follows a multi-stage navigation pipeline that transforms raw smartphone sensor data into a continuous, corrected vehicle trajectory.

```text
Smartphone IMU + GNSS
          │
          ▼
┌──────────────────┐
│  Preprocessing   │
│  & Calibration   │
└─────────┬────────┘
          ▼
┌──────────────────┐
│ Phone Alignment  │
│ Pitch/Roll/Yaw   │
└─────────┬────────┘
          ▼
┌──────────────────┐
│ AI Speed Filter  │
└─────────┬────────┘
          ▼
┌──────────────────┐
│ AI Odometry      │
└─────────┬────────┘
          ▼
┌──────────────────┐
│ Dead Reckoning   │
└─────────┬────────┘
          ▼
┌──────────────────┐
│ AI Drift Correct │
└─────────┬────────┘
          ▼
┌──────────────────┐
│ GNSS + INS Fusion│
└─────────┬────────┘
          ▼
┌──────────────────┐
│ Map Matching+NHC │
└─────────┬────────┘
          ▼
   Vehicle Position
```

### 1. Preprocessing & Calibration
Raw smartphone IMU measurements are cleaned and prepared through:
- Sensor synchronization and resampling
- Gravity removal
- Stationary-period bias calibration
- Sensor noise reduction
- Coordinate transformation
- Detection of abnormal motion and vibration

### 2. Phone Alignment
The system estimates the smartphone's pitch, roll and yaw relative to the vehicle's direction of travel and transforms the sensor measurements into a vehicle-relative coordinate frame.

### 3. AI Speed & Vibration Filtering
The system handles disturbances caused by:
- Engine vibrations
- Road bumps
- Potholes
- Sudden braking
- Phone movement
- Sensor noise

A lightweight AI model learns vehicle motion patterns from smartphone IMU data to estimate forward velocity while filtering unwanted motion.

### 4. AI Inertial Odometry
Instead of relying only on double integration of noisy acceleration, NAVISYNC uses a sequence-based ML model to predict short-term vehicle displacement.

```text
IMU Data Window ↓ AI Model ↓ Δx , Δy ↓ Trajectory Update
```

### 5. Dead Reckoning
When GNSS becomes unavailable, the system uses the last reliable position together with AI-estimated motion and vehicle heading to continuously propagate the vehicle's position.

```text
Last Known GNSS Position + AI Estimated Motion + Vehicle Heading ↓ Estimated Position
```

### 6. AI Drift Correction
Inertial navigation naturally accumulates errors. NAVISYNC estimates residual errors and applies learned corrections to reduce positional drift.

```text
Raw Dead Reckoning ↓ Drift Estimation ↓ AI Correction ↓ Improved Trajectory
```

### 7. GNSS + INS Fusion
When GNSS is available, NAVISYNC combines GNSS measurements with inertial and AI-based estimates.

During GNSS loss:
```text
GNSS unavailable ↓ IMU + AI ↓ Dead Reckoning
```
When GNSS returns, the system smoothly corrects the estimated trajectory rather than producing an abrupt position jump.

### 8. Map Matching & Non-Holonomic Constraints
The estimated trajectory is constrained using road-network information such as OpenStreetMap (OSM). Vehicle motion constraints are also applied to prevent physically unrealistic trajectories.

```text
AI Estimated Trajectory ↓ Road Network + NHC ↓ Map Matching ↓ Physically Consistent Path
```

---

## 🔄 Complete Navigation Pipeline

```text
Smartphone IMU + GNSS
          │
          ▼
Preprocessing & Calibration
          │
          ▼
Phone Alignment (Pitch / Roll / Yaw)
          │
          ▼
AI Speed & Vibration Filter
          │
          ▼
AI Inertial Odometry (Δx / Δy)
          │
          ▼
Dead Reckoning
          │
          ▼
AI Drift Correction
          │
          ▼
GNSS + INS Fusion
          │
          ▼
Map Matching + NHC
          │
          ▼
Continuous Position
```

---

## 🔄 Navigation Modes

### 🟢 GNSS + INS
Normal navigation when GNSS is available.
```text
GNSS + IMU + AI ↓ Fused Position
```

### 🟠 Dead Reckoning
Navigation continues using IMU and AI when GNSS is unavailable.
```text
IMU + AI ↓ Dead Reckoning ↓ Map Matching ↓ Estimated Position
```

### 🔵 GNSS Re-acquisition
When GNSS returns, the system smoothly re-fuses the measurements.
```text
GNSS + INS + AI ↓ Smooth Correction ↓ Stable Navigation
```

---

## 📊 Dataset

The initial models are trained and tested using:
**IO-VNBD** — Inertial and Odometry benchmark dataset for ground vehicle positioning  
Dataset link: [https://github.com/onyekpeu/IO-VNBD](https://github.com/onyekpeu/IO-VNBD)

The dataset is used for:
- IMU preprocessing
- Model training
- Validation
- Inertial odometry experiments
- Trajectory evaluation
- Drift analysis

---

## 🛠️ Technology Stack

### Machine Learning
- Python
- PyTorch
- NumPy
- Pandas
- Scikit-learn
- GRU / LSTM / BiLSTM

### Navigation & Signal Processing
- IMU signal processing
- Sensor calibration
- Coordinate transformations
- Inertial odometry
- Dead reckoning
- Kalman filtering
- GNSS + INS fusion
- Map matching
- Non-Holonomic Constraints

### Mobile Application
- Android
- Kotlin
- Android Sensor APIs
- GNSS / Location APIs
- On-device ML inference

### Web Dashboard
- React
- TypeScript
- Interactive map visualization
- Real-time telemetry
- Trajectory visualization

### Mapping
- OpenStreetMap
- Offline road-network data

---

## 🖥️ NAVISYNC Dashboard

The NAVISYNC web dashboard visualizes the navigation engine and model inference. It is designed to display:
- GNSS status
- IMU telemetry
- Vehicle velocity
- Vehicle heading
- Ground-truth trajectory
- AI-estimated trajectory
- Position error
- Drift
- Navigation mode
- GNSS blackout and recovery

---

## 📱 Mobile Application

The final system is designed around a smartphone-based navigation application capable of:
- Reading smartphone IMU sensors
- Reading GNSS when available
- Detecting GNSS outages
- Estimating vehicle motion
- Switching to dead reckoning
- Applying AI-based corrections
- Performing map matching
- Displaying continuous vehicle position
- Re-fusing GNSS when the signal returns

---

## 🏗️ System Architecture

```text
┌───────────────────┐
│ Smartphone / IMU  │
│ Accelerometer     │
│ Gyroscope         │
│ Magnetometer      │
│ GNSS              │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Preprocessing     │
│ Calibration       │
│ Coordinate Trans  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ AI Motion Estimator│
│ Velocity /Δx /Δy  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Dead Reckoning    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Drift Correction  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ GNSS + INS Fusion │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Map Matching+NHC  │
└─────────┬─────────┘
          │
          ▼
 Continuous Position
```

---

## 🔬 Development Pipeline

```text
IO-VNBD Dataset ↓ Data Exploration ↓ Preprocessing ↓ Baseline Dead Reckoning ↓ AI Model Training ↓ Velocity / Δx / Δy Prediction ↓ Drift Analysis ↓ GNSS + INS Fusion ↓ Map Matching ↓ Edge Optimization ↓ Mobile Deployment
```

---

## 📈 Evaluation

NAVISYNC is evaluated using:
- Position error
- Trajectory error
- Drift percentage
- Velocity estimation error
- GNSS outage performance
- Model inference latency

### Drift Metric
$$\text{Drift (\%)} = \frac{\text{Position Error}}{\text{Distance Travelled}} \times 100$$

The SIH problem statement specifies a target of keeping dead-reckoning positional drift below 10% of the total distance travelled during GNSS-denied operation.

---

## 🚀 Development Status

| Component | Status |
| :--- | :--- |
| Project architecture | 🟢 Completed |
| IO-VNBD dataset identification | 🟢 Completed |
| Web dashboard prototype | 🟢 Completed |
| Data preprocessing | 🟢 Completed |
| Baseline dead reckoning | 🟢 Completed |
| AI velocity estimation | 🟢 Completed |
| AI displacement estimation | 🟢 Completed |
| Drift correction | 🟢 Completed |
| GNSS + INS fusion | 🟢 Completed |
| Map matching | 🟡 In Progress |
| Android application | ⚪ Planned |
| Edge deployment | ⚪ Planned |

---

## 🎯 Smart India Hackathon 2026

- **Problem Statement:** AI-ML based Intelligent Dead Reckoning System for Seamless Navigation
- **Organization:** Indian Space Research Organisation (ISRO)
- **Category:** Software
- **Problem Statement ID:** PS 26168
- **Hackathon:** Smart India Hackathon 2026

---

## 🌐 Vision

NAVISYNC aims to make vehicle navigation resilient to GNSS outages by combining:
**AI + IMU + GNSS + Inertial Navigation + Map Intelligence**

Instead of treating GNSS loss as a navigation failure:
```text
GNSS disappears ↓ NAVISYNC takes over ↓ Vehicle keeps moving ↓ GNSS returns ↓ NAVISYNC smoothly re-fuses
```

**NAVISYNC — AI-Powered Navigation Beyond GNSS.**  
**👥 RuntimeRebels** — *Building navigation that doesn't stop when GNSS does.*
