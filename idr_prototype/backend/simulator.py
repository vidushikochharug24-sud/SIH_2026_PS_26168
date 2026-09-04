import time
import numpy as np
from datetime import datetime
from preprocessing import load_data
from schemas import TickPayload, Position, LiveMetrics, FinalMetrics, TripBounds

STATE_IDLE = "IDLE"
STATE_REPLAYING = "REPLAYING"
STATE_OUTAGE = "OUTAGE"
STATE_RESTORED = "RESTORED"

class IDRSimulator:
    def __init__(self, trip_name="VTB01"):
        self.current_trip = trip_name
        self.outage_duration_sec = 30
        self.load_trip(trip_name)

    def load_trip(self, trip_name="VTB01"):
        self.current_trip = trip_name
        self.telemetry_df = load_data(trip_name)
        self.total_steps = len(self.telemetry_df)
        self.outage_start_step = None
        self.outage_elapsed_ticks = 0
        self.reset()

    def set_trip(self, trip_name):
        if trip_name != self.current_trip:
            self.load_trip(trip_name)

    def get_trip_bounds(self) -> TripBounds:
        gt_x = self.telemetry_df['gt_x'].values
        gt_y = self.telemetry_df['gt_y'].values
        red_x = self.telemetry_df['red_x'].values
        red_y = self.telemetry_df['red_y'].values
        
        all_x = np.concatenate([gt_x, red_x])
        all_y = np.concatenate([gt_y, red_y])
        
        return TripBounds(
            min_x=float(all_x.min()),
            max_x=float(all_x.max()),
            min_y=float(all_y.min()),
            max_y=float(all_y.max())
        )

    def reset(self):
        self.state = STATE_IDLE
        self.step_idx = 0
        self.outage_elapsed_ticks = 0
        self.outage_start_step = None
        
        self.gt_history = []
        self.ai_history = []
        self.dr_history = []
        
        self.accel_history = []
        self.gyro_history = []
        self.vel_history = []
        self.disp_history = []
        
        self.restore_start_pos = None
        self.restore_target_pos = None
        self.restore_ticks = 0
        self.restore_max_ticks = 25
        
        self.event_logs = []
        self.latest_event = f"System initialized with {self.current_trip} dataset. Stream ready."
        self.latest_event_type = "init"

    def add_log(self, message, log_type="info"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.latest_event = message
        self.latest_event_type = log_type
        self.event_logs.append({
            'time': timestamp,
            'text': message,
            'type': log_type
        })
        if len(self.event_logs) > 40:
            self.event_logs.pop(0)

    def start_replay(self):
        if self.state == STATE_IDLE:
            self.state = STATE_REPLAYING
            self.add_log(f"Replay started for {self.current_trip} at 10 Hz clock.", "init")

    def pause_replay(self):
        if self.state in [STATE_REPLAYING, STATE_OUTAGE, STATE_RESTORED]:
            prev = self.state
            self.state = STATE_IDLE
            self.add_log(f"Replay paused from {prev} state.", "info")

    def trigger_outage(self, duration_sec=30):
        if self.state == STATE_REPLAYING:
            self.state = STATE_OUTAGE
            self.outage_duration_sec = duration_sec
            self.outage_start_step = self.step_idx
            self.outage_elapsed_ticks = 0
            self.add_log(f"GNSS OUTAGE simulated! Outage window: {duration_sec}s", "outage")

    def restore_gnss(self):
        if self.state == STATE_OUTAGE:
            self.state = STATE_RESTORED
            self.restore_ticks = 0
            self.restore_start_pos = self.ai_history[-1] if self.ai_history else (0.0, 0.0)
            row = self.telemetry_df.iloc[min(self.step_idx, self.total_steps - 1)]
            self.restore_target_pos = (row['gt_x'], row['gt_y'])
            self.add_log("GNSS signal RESTORED. Smooth INS fusion active.", "restore")

    def tick(self) -> TickPayload:
        if self.state == STATE_IDLE or self.step_idx >= self.total_steps - 1:
            cur_idx = max(0, min(self.step_idx, self.total_steps - 1))
            row = self.telemetry_df.iloc[cur_idx]
            gt_pos = Position(x=float(row['gt_x']), y=float(row['gt_y']))
            ai_pos = Position(x=float(row['blue_x']), y=float(row['blue_y']))
            dr_pos = Position(x=float(row['red_x']), y=float(row['red_y']))
            return TickPayload(
                t=float(row['timestamp']),
                step_idx=self.step_idx,
                total_steps=self.total_steps,
                gnss_status=self.state,
                gt_pos=gt_pos,
                ai_pos=ai_pos,
                dr_pos=dr_pos,
                accel_mag=0.0,
                gyro_mag=0.0,
                pred_vel=float(row['gt_speed']),
                pred_disp=0.0,
                metrics=LiveMetrics(elapsed_outage=0.0, distance=0.0, dr_error=0.0, ai_error=0.0, drift_reduction=0.0),
                event=self.latest_event,
                event_type=self.latest_event_type
            )

        row = self.telemetry_df.iloc[self.step_idx]
        gt_x, gt_y = float(row['gt_x']), float(row['gt_y'])
        red_x, red_y = float(row['red_x']), float(row['red_y'])
        blue_x, blue_y = float(row['blue_x']), float(row['blue_y'])
        
        ax, ay, az = float(row['ax']), float(row['ay']), float(row['az'])
        gx, gy, gz = float(row['gx']), float(row['gy']), float(row['gz'])

        acc_mag = float(np.sqrt(ax**2 + ay**2 + az**2))
        gyro_mag = float(np.sqrt(gx**2 + gy**2 + gz**2))

        self.gt_history.append((gt_x, gt_y))

        if self.state == STATE_REPLAYING:
            ai_pos = (blue_x, blue_y)
            dr_pos = (red_x, red_y)
            pred_vel = float(row['gt_speed'])
            pred_disp = float(np.sqrt((blue_x - gt_x)**2 + (blue_y - gt_y)**2))

        elif self.state == STATE_OUTAGE:
            self.outage_elapsed_ticks += 1
            ai_pos = (blue_x, blue_y)
            dr_pos = (red_x, red_y)
            pred_vel = float(row['gt_speed'])
            outage_start_pt = self.gt_history[min(self.outage_start_step, len(self.gt_history)-1)]
            pred_disp = float(np.sqrt((blue_x - outage_start_pt[0])**2 + (blue_y - outage_start_pt[1])**2))

            if self.outage_elapsed_ticks >= self.outage_duration_sec * 10:
                self.restore_gnss()

        elif self.state == STATE_RESTORED:
            self.restore_ticks += 1
            alpha = min(1.0, self.restore_ticks / self.restore_max_ticks)
            smooth_a = alpha * alpha * (3 - 2 * alpha)
            
            ai_x_fused = (1 - smooth_a) * blue_x + smooth_a * gt_x
            ai_y_fused = (1 - smooth_a) * blue_y + smooth_a * gt_y
            
            ai_pos = (ai_x_fused, ai_y_fused)
            dr_pos = (red_x, red_y)
            pred_vel = float(row['gt_speed'])
            pred_disp = 0.0

            if alpha >= 1.0:
                self.state = STATE_REPLAYING
                self.add_log("Fusion restoration completed. Back to GNSS AVAILABLE.", "init")

        self.ai_history.append(ai_pos)
        self.dr_history.append(dr_pos)

        cur_dist = float(np.sum(np.sqrt(np.diff(self.telemetry_df['gt_x'].iloc[:self.step_idx+1])**2 + np.diff(self.telemetry_df['gt_y'].iloc[:self.step_idx+1])**2)))
        ai_err = float(np.sqrt((ai_pos[0] - gt_x)**2 + (ai_pos[1] - gt_y)**2))
        dr_err = float(np.sqrt((dr_pos[0] - gt_x)**2 + (dr_pos[1] - gt_y)**2))
        drift_red = max(0.0, ((dr_err - ai_err) / max(1e-3, dr_err)) * 100.0)

        self.step_idx += 1

        return TickPayload(
            t=float(row['timestamp']),
            step_idx=self.step_idx,
            total_steps=self.total_steps,
            gnss_status=self.state,
            gt_pos=Position(x=gt_x, y=gt_y),
            ai_pos=Position(x=ai_pos[0], y=ai_pos[1]),
            dr_pos=Position(x=dr_pos[0], y=dr_pos[1]),
            accel_mag=acc_mag,
            gyro_mag=gyro_mag,
            pred_vel=pred_vel,
            pred_disp=pred_disp,
            metrics=LiveMetrics(
                elapsed_outage=self.outage_elapsed_ticks * 0.1,
                distance=cur_dist,
                dr_error=dr_err,
                ai_error=ai_err,
                drift_reduction=drift_red
            ),
            event=self.latest_event,
            event_type=self.latest_event_type
        )
