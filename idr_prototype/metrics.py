import numpy as np

def compute_euclidean_distance(p1, p2):
    """Euclidean distance between two 2D points (x, y) in metres."""
    return np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

class MetricsCalculator:
    def __init__(self):
        self.reset()

    def reset(self):
        self.dr_errors = []
        self.ai_errors = []
        self.distance_travelled = 0.0
        self.outage_ticks = 0

    def update_step(self, gt_pos, ai_pos, dr_pos, prev_gt_pos=None, is_outage=False):
        """
        Updates cumulative live metrics at each 10Hz tick.
        """
        if prev_gt_pos is not None:
            step_dist = compute_euclidean_distance(gt_pos, prev_gt_pos)
            self.distance_travelled += step_dist

        ai_err = compute_euclidean_distance(ai_pos, gt_pos)
        dr_err = compute_euclidean_distance(dr_pos, gt_pos)

        if is_outage:
            self.outage_ticks += 1
            self.ai_errors.append(ai_err)
            self.dr_errors.append(dr_err)

        drift_reduction = 0.0
        if dr_err > 0.001:
            drift_reduction = max(0.0, (1.0 - (ai_err / dr_err)) * 100.0)
        elif dr_err <= 0.001 and ai_err <= 0.001:
            drift_reduction = 100.0

        return {
            'ai_error': ai_err,
            'dr_error': dr_err,
            'drift_reduction_pct': drift_reduction,
            'distance_travelled': self.distance_travelled,
            'outage_duration_sec': self.outage_ticks * 0.1
        }

    def get_final_summary(self):
        """Returns statistical summary after GNSS restoration."""
        if not self.ai_errors or not self.dr_errors:
            return {
                'final_ai_err': 0.0,
                'final_dr_err': 0.0,
                'max_ai_err': 0.0,
                'max_dr_err': 0.0,
                'mean_ai_err': 0.0,
                'mean_dr_err': 0.0,
                'overall_drift_reduction': 0.0
            }

        final_ai = self.ai_errors[-1]
        final_dr = self.dr_errors[-1]
        max_ai = max(self.ai_errors)
        max_dr = max(self.dr_errors)
        mean_ai = float(np.mean(self.ai_errors))
        mean_dr = float(np.mean(self.dr_errors))
        
        drift_red = (1.0 - (mean_ai / max(0.001, mean_dr))) * 100.0 if mean_dr > 0 else 0.0

        return {
            'final_ai_err': final_ai,
            'final_dr_err': final_dr,
            'max_ai_err': max_ai,
            'max_dr_err': max_dr,
            'mean_ai_err': mean_ai,
            'mean_dr_err': mean_dr,
            'overall_drift_reduction': max(0.0, drift_red)
        }
