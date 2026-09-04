import numpy as np

def compute_euclidean_distance(p1, p2):
    return float(np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2))

class MetricsCalculator:
    def __init__(self):
        self.reset()

    def reset(self):
        self.dr_errors = []
        self.ai_errors = []
        self.distance_travelled = 0.0
        self.outage_ticks = 0

    def update_step(self, gt_pos, ai_pos, dr_pos, prev_gt_pos=None, is_outage=False):
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
            'ai_error': float(ai_err),
            'dr_error': float(dr_err),
            'drift_reduction': float(drift_reduction),
            'distance': float(self.distance_travelled),
            'elapsed_outage': float(self.outage_ticks * 0.1)
        }

    def get_final_summary(self):
        if not self.ai_errors or not self.dr_errors:
            return {
                'mean_dr_err': 0.0,
                'mean_ai_err': 0.0,
                'max_dr_err': 0.0,
                'max_ai_err': 0.0,
                'overall_drift_reduction': 0.0
            }

        mean_ai = float(np.mean(self.ai_errors))
        mean_dr = float(np.mean(self.dr_errors))
        max_ai = float(max(self.ai_errors))
        max_dr = float(max(self.dr_errors))
        
        drift_red = (1.0 - (mean_ai / max(0.001, mean_dr))) * 100.0 if mean_dr > 0 else 0.0

        return {
            'mean_dr_err': mean_dr,
            'mean_ai_err': mean_ai,
            'max_dr_err': max_dr,
            'max_ai_err': max_ai,
            'overall_drift_reduction': float(max(0.0, drift_red))
        }
