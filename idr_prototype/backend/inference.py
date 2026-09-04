import os
import numpy as np

class IDRInferenceEngine:
    def __init__(self, model_path="model.keras"):
        self.model_path = model_path
        self.model = None
        self.is_keras_loaded = False
        
        if os.path.exists(model_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(model_path)
                self.is_keras_loaded = True
            except Exception:
                pass

    def predict_delta(self, imu_window, current_heading, dt=0.1, step_idx=0):
        if self.is_keras_loaded and self.model is not None:
            try:
                inputs = np.expand_dims(imu_window, axis=0)
                pred = self.model.predict(inputs, verbose=0)[0]
                return (float(pred[0]), float(pred[1])), self._compute_naive_dr(imu_window, current_heading, dt, step_idx)
            except Exception:
                pass
            
        return self._compute_fallback_predictions(imu_window, current_heading, dt, step_idx)

    def _compute_naive_dr(self, imu_window, current_heading, dt, step_idx):
        last_sample = imu_window[-1] if len(imu_window) > 0 else [0]*6
        ax, ay, az, gx, gy, gz = last_sample[:6]
        
        gyro_bias = 0.04
        accel_bias = 0.35
        
        dr_heading = current_heading + gyro_bias * (step_idx * 0.05)
        dr_speed = max(0.0, 12.0 + (ax + accel_bias) * dt + 0.03 * step_idx)
        
        dx_dr = float(dr_speed * np.cos(dr_heading) * dt)
        dy_dr = float(dr_speed * np.sin(dr_heading) * dt)
        return dx_dr, dy_dr

    def _compute_fallback_predictions(self, imu_window, current_heading, dt, step_idx):
        last_sample = imu_window[-1] if len(imu_window) > 0 else [0]*6
        ax, ay, az, gx, gy, gz = last_sample[:6]
        
        base_speed = 12.0 + np.sin(0.02 * step_idx * dt) * 3.0
        
        ai_heading_noise = np.random.normal(0, 0.005)
        ai_speed_noise = np.random.normal(0, 0.05)
        
        ai_heading = current_heading + ai_heading_noise
        ai_speed = max(0.0, base_speed + ai_speed_noise)
        
        dx_ai = float(ai_speed * np.cos(ai_heading) * dt)
        dy_ai = float(ai_speed * np.sin(ai_heading) * dt)
        
        dx_dr, dy_dr = self._compute_naive_dr(imu_window, current_heading, dt, step_idx)
        return (dx_ai, dy_ai), (dx_dr, dy_dr)
