from pydantic import BaseModel
from typing import Optional, List, Dict

class Position(BaseModel):
    x: float
    y: float

class LiveMetrics(BaseModel):
    elapsed_outage: float
    distance: float
    dr_error: float
    ai_error: float
    drift_reduction: float

class FinalMetrics(BaseModel):
    mean_dr_err: float
    mean_ai_err: float
    max_dr_err: float
    max_ai_err: float
    overall_drift_reduction: float

class TickPayload(BaseModel):
    t: float
    step_idx: int
    total_steps: int
    gnss_status: str
    ai_pos: Position
    dr_pos: Position
    gt_pos: Position
    accel_mag: float
    gyro_mag: float
    pred_vel: float
    pred_disp: float
    metrics: LiveMetrics
    event: Optional[str] = None
    event_type: Optional[str] = None
    final_metrics: Optional[FinalMetrics] = None

class OutageDurationPayload(BaseModel):
    duration_sec: int

class TripBounds(BaseModel):
    min_x: float
    max_x: float
    min_y: float
    max_y: float
