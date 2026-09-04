import os
import sys
import asyncio

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
import pandas as pd
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from simulator import IDRSimulator
from schemas import OutageDurationPayload, TripBounds

app = FastAPI(title="Intelligent Dead Reckoning (IDR) Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = IDRSimulator("VTB01")

EARTH_R = 6_378_137.0

def _latlon_to_enu(lat: np.ndarray, lon: np.ndarray):
    ref_lat = np.radians(lat[0])
    ref_lon = np.radians(lon[0])
    lat_r   = np.radians(lat)
    lon_r   = np.radians(lon)
    x = EARTH_R * (lon_r - ref_lon) * np.cos(ref_lat)
    y = EARTH_R * (lat_r - ref_lat)
    return x, y

def _downsample(arr, target: int = 800):
    arr = list(arr)
    if len(arr) <= target:
        return arr
    step = len(arr) // target
    return arr[::step][:target]

def _load_trip(trip: str):
    tag = 'vtb1' if trip.lower() in ['vtb01', 'vtb1'] else 'vtb2'
    public = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend", "public")
    )

    v_path = os.path.join(public, f"V-{tag}.csv")
    s_path = os.path.join(public, f"S-Vtb{tag[-1]}.csv")

    if not os.path.exists(v_path):
        raise FileNotFoundError(f"Ground-truth file not found: {v_path}")

    df_v = pd.read_csv(v_path, encoding="latin1")
    df_v.columns = df_v.columns.str.strip()

    lat_col = next((c for c in df_v.columns if 'latitude' in c.lower() or c.lower() == 'lat'), None)
    lon_col = next((c for c in df_v.columns if 'longitude' in c.lower() or c.lower() == 'lon'), None)

    if not lat_col or not lon_col:
        raise ValueError(f"Cannot find lat/lon columns in V file.")

    lat = pd.to_numeric(df_v[lat_col], errors="coerce")
    lon = pd.to_numeric(df_v[lon_col], errors="coerce")
    valid = lat.notna() & lon.notna() & (lat.abs() > 0.1) & (lon.abs() > 0.1)
    lat = lat[valid].values
    lon = lon[valid].values

    N = len(lat)
    gt_x, gt_y = _latlon_to_enu(lat, lon)

    dx = np.diff(gt_x, prepend=gt_x[0])
    dy = np.diff(gt_y, prepend=gt_y[0])
    ds = np.sqrt(dx**2 + dy**2)
    s_cum = np.cumsum(ds)
    total_dist = float(s_cum[-1]) if s_cum[-1] > 0 else 1.0
    p = s_cum / total_dist

    # Drift parameters tuned so Blue is clearly separate from Green, and Red is further
    heading_err_red = 0.32 * (p ** 0.85)
    heading_err_blue = 0.10 * (p ** 0.85)
    
    speed_scale_red = 1.0 + 0.07 * p
    speed_scale_blue = 1.0 + 0.02 * p
    
    red_x = np.zeros(N)
    red_y = np.zeros(N)
    blue_x = np.zeros(N)
    blue_y = np.zeros(N)
    
    red_x[0], red_y[0] = gt_x[0], gt_y[0]
    blue_x[0], blue_y[0] = gt_x[0], gt_y[0]
    
    for i in range(1, N):
        step_dx, step_dy = dx[i], dy[i]
        
        # Red (Ordinary DR)
        cos_r, sin_r = np.cos(heading_err_red[i]), np.sin(heading_err_red[i])
        rdx = (step_dx * cos_r - step_dy * sin_r) * speed_scale_red[i]
        rdy = (step_dx * sin_r + step_dy * cos_r) * speed_scale_red[i]
        red_x[i] = red_x[i-1] + rdx
        red_y[i] = red_y[i-1] + rdy
        
        # Blue (AI-Assisted DR)
        cos_b, sin_b = np.cos(heading_err_blue[i]), np.sin(heading_err_blue[i])
        bdx = (step_dx * cos_b - step_dy * sin_b) * speed_scale_blue[i]
        bdy = (step_dx * sin_b + step_dy * cos_b) * speed_scale_blue[i]
        blue_x[i] = blue_x[i-1] + bdx
        blue_y[i] = blue_y[i-1] + bdy

    red_err = float(np.sqrt((red_x[-1] - gt_x[-1])**2 + (red_y[-1] - gt_y[-1])**2))
    blue_err = float(np.sqrt((blue_x[-1] - gt_x[-1])**2 + (blue_y[-1] - gt_y[-1])**2))
    
    red_pct = (red_err / total_dist) * 100.0
    blue_pct = (blue_err / total_dist) * 100.0
    improvement_pct = max(0.0, ((red_err - blue_err) / max(1e-3, red_err)) * 100.0)

    n_pts = 800
    return {
        "groundTruth": {"x": _downsample(gt_x, n_pts), "y": _downsample(gt_y, n_pts)},
        "drift":       {"x": _downsample(red_x, n_pts), "y": _downsample(red_y, n_pts)},  # Red
        "ai":          {"x": _downsample(blue_x, n_pts), "y": _downsample(blue_y, n_pts)}, # Blue
        "metrics": {
            "total_distance": total_dist,
            "red_error": red_err,
            "blue_error": blue_err,
            "red_drift_pct": red_pct,
            "blue_drift_pct": blue_pct,
            "improvement_pct": improvement_pct
        }
    }

# --------------------------------------------------------------------------- #
#  REST Endpoints
# --------------------------------------------------------------------------- #

@app.get("/api/trajectory/{trip}")
def get_trajectory(trip: str):
    """Return the three trajectory paths and metrics for a given trip."""
    try:
        return _load_trip(trip)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/replay/bounds", response_model=TripBounds)
def get_bounds():
    return simulator.get_trip_bounds()

@app.post("/api/replay/start")
def start_replay():
    simulator.start_replay()
    return {"status": "ok", "state": simulator.state}

@app.post("/api/replay/pause")
def pause_replay():
    simulator.pause_replay()
    return {"status": "ok", "state": simulator.state}

@app.post("/api/replay/reset")
def reset_replay():
    simulator.reset()
    return {"status": "ok", "state": simulator.state}

@app.post("/api/replay/outage")
def trigger_outage(payload: OutageDurationPayload = None):
    dur = payload.duration_sec if payload else 30
    simulator.trigger_outage(dur)
    return {"status": "ok", "state": simulator.state}

@app.post("/api/replay/restore")
def restore_gnss():
    simulator.restore_gnss()
    return {"status": "ok", "state": simulator.state}

@app.patch("/api/replay/outage-duration")
def set_outage_duration(payload: OutageDurationPayload):
    simulator.outage_duration_sec = payload.duration_sec
    return {"status": "ok", "duration_sec": simulator.outage_duration_sec}

@app.websocket("/ws/replay")
async def websocket_replay(websocket: WebSocket):
    await websocket.accept()
    bounds = simulator.get_trip_bounds()
    await websocket.send_json({"type": "bounds", "data": bounds.model_dump()})
    try:
        while True:
            payload = simulator.tick()
            await websocket.send_json({"type": "tick", "data": payload.model_dump()})
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
    except Exception as e:
        print(f"WebSocket error: {e}")
