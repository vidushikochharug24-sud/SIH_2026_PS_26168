import numpy as np

class GNSSINSFusionEngine:
    def __init__(self, blend_duration_ticks=25):
        self.blend_duration = blend_duration_ticks
        self.blend_active = False
        self.current_step = 0

    def start_restoration(self, current_ai_pos):
        self.blend_active = True
        self.current_step = 0

    def apply_fusion_step(self, ai_pos, gt_pos):
        if not self.blend_active:
            return gt_pos, True

        self.current_step += 1
        progress = float(self.current_step) / self.blend_duration

        if progress >= 1.0:
            self.blend_active = False
            return gt_pos, True

        weight = 1.0 / (1.0 + np.exp(-6.0 * (progress - 0.5)))
        
        x_fused = float((1.0 - weight) * ai_pos[0] + weight * gt_pos[0])
        y_fused = float((1.0 - weight) * ai_pos[1] + weight * gt_pos[1])
        
        return (x_fused, y_fused), False
