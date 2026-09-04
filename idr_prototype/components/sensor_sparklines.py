import plotly.graph_objects as go
from theme import get_plotly_layout_defaults, COLOR_AI_HERO, COLOR_DR_MUTED, COLOR_GT_REF

def build_sparkline_fig(y_data, title, color="#2EE6A6", unit=""):
    """
    Creates a compact oscilloscope-style live telemetry sparkline.
    """
    fig = go.Figure()
    
    x_data = list(range(len(y_data)))
    
    # Outer glow
    fig.add_trace(go.Scatter(
        x=x_data, y=y_data,
        mode='lines',
        line=dict(color=color, width=4),
        opacity=0.3,
        hoverinfo='skip'
    ))
    
    # Crisp core line
    fig.add_trace(go.Scatter(
        x=x_data, y=y_data,
        mode='lines',
        line=dict(color=color, width=1.8),
        hoverinfo='y'
    ))
    
    layout = get_plotly_layout_defaults()
    layout.update(dict(
        title=dict(text=f"{title} ({unit})", font=dict(size=11, color='#8B87A8')),
        height=140,
        margin=dict(l=30, r=15, t=30, b=20),
        showlegend=False,
        xaxis=dict(
            showticklabels=False,
            showgrid=True,
            gridcolor='rgba(255, 255, 255, 0.03)'
        ),
        yaxis=dict(
            gridcolor='rgba(255, 255, 255, 0.05)',
            tickfont=dict(size=9, color='#6D688D')
        )
    ))
    fig.update_layout(**layout)
    return fig

def render_sensor_sparklines(accel_data, gyro_data, vel_data, disp_data):
    """
    Returns 4 figure objects for Accelerometer, Gyroscope, Velocity, and Displacement.
    """
    fig_accel = build_sparkline_fig(accel_data, "Accel Mag", color="#2EE6A6", unit="m/s²")
    fig_gyro = build_sparkline_fig(gyro_data, "Gyro Mag", color="#B24BF3", unit="rad/s")
    fig_vel = build_sparkline_fig(vel_data, "Pred Speed", color="#4FA3FF", unit="m/s")
    fig_disp = build_sparkline_fig(disp_data, "Outage Disp", color="#E29BFF", unit="m")
    
    return fig_accel, fig_gyro, fig_vel, fig_disp
