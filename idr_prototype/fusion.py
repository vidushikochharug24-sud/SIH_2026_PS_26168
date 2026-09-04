import numpy as np

class GNSSINSFusionEngine:
    """
    Handles trajectory smoothing and position correction when GNSS is restored.
    Applies a smooth complementary/sigmoidal blend back toward true GNSS coordinates.
    """
    def __init__(self, blend_duration_ticks=25):
        self.blend_duration = blend_duration_ticks
        self.blend_active = False
        self.current_step = 0
        self.start_ai_pos = (0.0, 0.0)

    def start_restoration(self, current_ai_pos):
        """Initiates the position blending process on Restore GNSS."""
        self.blend_active = True
        self.current_step = 0
        self.start_ai_pos = current_ai_pos

    def apply_fusion_step(self, ai_pos, gt_pos):
        """
        Calculates blended position for current tick during restoration window.
        Returns:
            (x_fused, y_fused), is_blend_complete
        """
        if not self.blend_active:
            return gt_pos, True

        self.current_step += 1
        progress = float(self.current_step) / self.blend_duration

        if progress >= 1.0:
            self.blend_active = False
            return gt_pos, True

        # Sigmoidal blending curve for ultra-smooth transition without jarring visual snaps
        weight = 1.0 / (1.0 + np.exp(-6.0 * (progress - 0.5)))
        
        x_fused = (1.0 - weight) * ai_pos[0] + weight * gt_pos[0]
        y_fused = (1.0 - weight) * ai_pos[1] + weight * gt_pos[1]
        
        return (x_fused, y_fused), False
