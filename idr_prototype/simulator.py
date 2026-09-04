import time
import numpy as np
from datetime import datetime
from preprocessing import load_data

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

    def reset(self):
        self.state = STATE_IDLE
        self.step_idx = 0
        self.outage_elapsed_ticks = 0
        self.outage_start_step = None
        
        # Trajectory Buffers [(x, y)]
        self.gt_history = []
        self.ai_history = []  # Blue: AI-Assisted DR
        self.dr_history = []  # Red: Ordinary DR
        
        # Sensor Sparkline Rolling History (last 60 points)
        self.accel_history = []
        self.gyro_history = []
        self.vel_history = []
        self.disp_history = []
        
        # Restoration state
        self.restore_start_pos = None
        self.restore_target_pos = None
        self.restore_ticks = 0
        self.restore_max_ticks = 25
        
        # Event Logs
        self.event_logs = []
        self.add_log(f"System initialized with {self.current_trip} dataset. Telemetry stream ready.", "init")

    def add_log(self, message, log_type="info"):
        timestamp = datetime.now().strftime("%H:%M:%S")
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

    def get_trip_bounds(self):
        gt_x = self.telemetry_df['gt_x'].values
        gt_y = self.telemetry_df['gt_y'].values
        red_x = self.telemetry_df['red_x'].values
        red_y = self.telemetry_df['red_y'].values
        
        all_x = np.concatenate([gt_x, red_x])
        all_y = np.concatenate([gt_y, red_y])
        
        return {
            'min_x': float(all_x.min()),
            'max_x': float(all_x.max()),
            'min_y': float(all_y.min()),
            'max_y': float(all_y.max())
        }

    def get_current_metrics(self):
        """Returns exact summary metrics as required by prompt."""
        if self.step_idx == 0:
            return {
                'total_distance': 0.0,
                'red_error': 0.0,
                'blue_error': 0.0,
                'red_drift_pct': 0.0,
                'blue_drift_pct': 0.0,
                'improvement_pct': 0.0
            }
            
        cur_idx = min(self.step_idx, self.total_steps - 1)
        row = self.telemetry_df.iloc[cur_idx]
        gt_x, gt_y = row['gt_x'], row['gt_y']
        
        # Calculate total distance travelled along GT path
        gt_xs = self.telemetry_df['gt_x'].iloc[:cur_idx+1].values
        gt_ys = self.telemetry_df['gt_y'].iloc[:cur_idx+1].values
        dxs = np.diff(gt_xs, prepend=gt_xs[0])
        dys = np.diff(gt_ys, prepend=gt_ys[0])
        total_dist = float(np.sum(np.sqrt(dxs**2 + dys**2)))
        if total_dist < 1e-3:
            total_dist = 0.001
            
        cur_gt = (gt_x, gt_y)
        cur_blue = self.ai_history[-1] if self.ai_history else cur_gt
        cur_red = self.dr_history[-1] if self.dr_history else cur_gt
        
        blue_err = float(np.sqrt((cur_blue[0] - cur_gt[0])**2 + (cur_blue[1] - cur_gt[1])**2))
        red_err = float(np.sqrt((cur_red[0] - cur_gt[0])**2 + (cur_red[1] - cur_gt[1])**2))
        
        red_drift_pct = (red_err / total_dist) * 100.0 if total_dist > 0 else 0.0
        blue_drift_pct = (blue_err / total_dist) * 100.0 if total_dist > 0 else 0.0
        
        improvement_pct = max(0.0, ((red_err - blue_err) / max(1e-3, red_err)) * 100.0)
        
        return {
            'total_distance': total_dist,
            'red_error': red_err,
            'blue_error': blue_err,
            'red_drift_pct': red_drift_pct,
            'blue_drift_pct': blue_drift_pct,
            'improvement_pct': improvement_pct
        }

    def tick(self):
        """Advances the simulation by 1 step (0.1s tick)."""
        if self.state == STATE_IDLE or self.step_idx >= self.total_steps - 1:
            return False

        row = self.telemetry_df.iloc[self.step_idx]
        gt_x, gt_y = row['gt_x'], row['gt_y']
        red_x, red_y = row['red_x'], row['red_y']
        blue_x, blue_y = row['blue_x'], row['blue_y']
        
        ax, ay, az = row['ax'], row['ay'], row['az']
        gx, gy, gz = row['gx'], row['gy'], row['gz']

        acc_mag = float(np.sqrt(ax**2 + ay**2 + az**2))
        gyro_mag = float(np.sqrt(gx**2 + gy**2 + gz**2))

        self.gt_history.append((gt_x, gt_y))

        # State dependent trajectory propagation
        if self.state == STATE_REPLAYING:
            ai_pos = (blue_x, blue_y)
            dr_pos = (red_x, red_y)
            pred_vel = row['gt_speed']
            pred_disp = float(np.sqrt((blue_x - gt_x)**2 + (blue_y - gt_y)**2))

        elif self.state == STATE_OUTAGE:
            self.outage_elapsed_ticks += 1
            ai_pos = (blue_x, blue_y)
            dr_pos = (red_x, red_y)
            
            pred_vel = row['gt_speed']
            outage_start_pt = self.gt_history[min(self.outage_start_step, len(self.gt_history)-1)]
            pred_disp = float(np.sqrt((blue_x - outage_start_pt[0])**2 + (blue_y - outage_start_pt[1])**2))

            # Auto-restore if configured outage time elapses
            if self.outage_elapsed_ticks >= self.outage_duration_sec * 10:
                self.restore_gnss()

        elif self.state == STATE_RESTORED:
            self.restore_ticks += 1
            alpha = min(1.0, self.restore_ticks / self.restore_max_ticks)
            # Smooth S-curve transition
            smooth_a = alpha * alpha * (3 - 2 * alpha)
            
            ai_x_fused = (1 - smooth_a) * blue_x + smooth_a * gt_x
            ai_y_fused = (1 - smooth_a) * blue_y + smooth_a * gt_y
            
            ai_pos = (ai_x_fused, ai_y_fused)
            dr_pos = (red_x, red_y)
            pred_vel = row['gt_speed']
            pred_disp = 0.0

            if alpha >= 1.0:
                self.state = STATE_REPLAYING
                self.add_log("Fusion restoration completed. Back to GNSS AVAILABLE.", "init")

        self.ai_history.append(ai_pos)
        self.dr_history.append(dr_pos)

        # Update Sparkline rolling histories (keep last 60 ticks)
        self.accel_history.append(acc_mag)
        self.gyro_history.append(gyro_mag)
        self.vel_history.append(pred_vel)
        self.disp_history.append(pred_disp)

        if len(self.accel_history) > 60:
            self.accel_history.pop(0)
            self.gyro_history.pop(0)
            self.vel_history.pop(0)
            self.disp_history.pop(0)

        self.step_idx += 1
        return True
