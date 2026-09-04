import plotly.graph_objects as go
from theme import (
    COLOR_AI_HERO, COLOR_DR_MUTED, COLOR_GT_REF, get_plotly_layout_defaults
)

def build_trajectory_figure(gt_history, ai_history, dr_history, state):
    """
    Builds the Plotly trajectory visualization adhering strictly to requirements:
    - START: Only Green line (Actual GPS Route) appears.
    - SIMULATE OUTAGE: Red (Ordinary DR) and Blue (AI DR) lines appear at outage start.
    - RESTORE GNSS: Blue line smoothly returns and matches Green line.
    """
    fig = go.Figure()

    if not gt_history:
        fig.add_trace(go.Scatter(x=[0], y=[0], mode='markers', marker=dict(color=COLOR_GT_REF)))
        fig.update_layout(**get_plotly_layout_defaults())
        return fig

    gt_x = [p[0] for p in gt_history]
    gt_y = [p[1] for p in gt_history]
    
    ai_x = [p[0] for p in ai_history]
    ai_y = [p[1] for p in ai_history]
    
    dr_x = [p[0] for p in dr_history]
    dr_y = [p[1] for p in dr_history]

    is_outage_or_restored = state in ["OUTAGE", "RESTORED"]

    # 1. GREEN LINE (Actual GPS Reference) - ALWAYS VISIBLE
    gt_color = 'rgba(46, 230, 166, 0.45)' if state == "OUTAGE" else COLOR_GT_REF
    gt_name = 'Actual GPS Reference (Evaluation Ref)' if state == "OUTAGE" else 'Actual GPS Reference'

    fig.add_trace(go.Scatter(
        x=gt_x, y=gt_y,
        mode='lines',
        name=gt_name,
        line=dict(color=gt_color, width=2.5, dash='dot'),
        hoverinfo='x+y+name'
    ))

    # 2. RED & BLUE LINES - ONLY APPEAR WHEN GNSS OUTAGE OR RESTORATION IS ACTIVE
    if is_outage_or_restored and len(dr_x) > 1:
        # Red: Ordinary DR Simulation (High Drift)
        fig.add_trace(go.Scatter(
            x=dr_x, y=dr_y,
            mode='lines',
            showlegend=False,
            line=dict(color='rgba(255, 77, 77, 0.25)', width=8),
            hoverinfo='skip'
        ))
        fig.add_trace(go.Scatter(
            x=dr_x, y=dr_y,
            mode='lines',
            name='Ordinary DR Simulation (Outage)',
            line=dict(color=COLOR_DR_MUTED, width=2.5),
            hoverinfo='x+y+name'
        ))

        # Blue: AI-Assisted DR Simulation (Low Drift / Fusing back on Restore)
        fig.add_trace(go.Scatter(
            x=ai_x, y=ai_y,
            mode='lines',
            showlegend=False,
            line=dict(color='rgba(59, 130, 246, 0.25)', width=10),
            hoverinfo='skip'
        ))
        
        blue_name = 'AI DR (Restoring to GPS)' if state == "RESTORED" else 'AI-Assisted DR Simulation (Outage)'
        fig.add_trace(go.Scatter(
            x=ai_x, y=ai_y,
            mode='lines',
            name=blue_name,
            line=dict(color=COLOR_AI_HERO, width=3.0),
            hoverinfo='x+y+name'
        ))

    # 3. Moving Vehicle Radar Blip Marker
    curr_x = ai_x[-1] if (is_outage_or_restored and ai_x) else gt_x[-1]
    curr_y = ai_y[-1] if (is_outage_or_restored and ai_y) else gt_y[-1]
    blip_color = COLOR_AI_HERO if is_outage_or_restored else COLOR_GT_REF

    fig.add_trace(go.Scatter(
        x=[curr_x], y=[curr_y],
        mode='markers',
        showlegend=False,
        marker=dict(
            size=22,
            color='rgba(59, 130, 246, 0.25)' if is_outage_or_restored else 'rgba(46, 230, 166, 0.25)',
            line=dict(color=blip_color, width=1.5)
        ),
        hoverinfo='skip'
    ))
    
    fig.add_trace(go.Scatter(
        x=[curr_x], y=[curr_y],
        mode='markers',
        name='Current Position Marker',
        marker=dict(
            size=10,
            color='#FFFFFF',
            line=dict(color=blip_color, width=3)
        ),
        hoverinfo='x+y+name'
    ))

    # Equal Aspect Ratio layout styling
    layout_opts = get_plotly_layout_defaults()
    layout_opts.update(dict(
        title=dict(text="2D NAVIGATION TRAJECTORY (LOCAL EAST-NORTH METRES)", font=dict(size=12, color='#8B87A8')),
        xaxis=dict(
            title="East (m)",
            gridcolor='rgba(255, 255, 255, 0.05)',
            zerolinecolor='rgba(255, 255, 255, 0.15)',
            scaleanchor="y",
            scaleratio=1
        ),
        yaxis=dict(
            title="North (m)",
            gridcolor='rgba(255, 255, 255, 0.05)',
            zerolinecolor='rgba(255, 255, 255, 0.15)'
        ),
        legend=dict(
            orientation="h",
            yanchor="top",
            y=1.12,
            xanchor="left",
            x=0.01,
            font=dict(size=11, color='#E8E6F5'),
            bgcolor='rgba(15, 12, 35, 0.7)',
            bordercolor='rgba(139, 111, 217, 0.2)',
            borderwidth=1
        ),
        height=540,
        margin=dict(l=50, r=30, t=50, b=40)
    ))
    fig.update_layout(**layout_opts)
    return fig
