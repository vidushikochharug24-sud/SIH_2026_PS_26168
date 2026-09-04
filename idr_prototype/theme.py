import streamlit as st

# Color Palette Constants (Exact Prompt Specifications)
COLOR_BG_GRADIENT = "linear-gradient(160deg, #0B0A1F 0%, #150E2E 50%, #0D1626 100%)"
COLOR_GNSS_AVAILABLE = "#2EE6A6"  # Emerald Green (Actual GPS Reference)
COLOR_GNSS_OUTAGE = "#FF4D4D"     # Bright Red (Ordinary DR / Outage Alert)
COLOR_GNSS_RESTORED = "#3B82F6"   # Electric Blue (AI-Assisted DR / Restored)

COLOR_GT_REF = "#2EE6A6"          # Green: Actual GPS reference (dotted)
COLOR_DR_MUTED = "#FF4D4D"        # Red: Ordinary DR simulation (solid line with high drift)
COLOR_AI_HERO = "#3B82F6"         # Blue: AI-assisted DR simulation (solid line with low drift)

COLOR_TEXT_MAIN = "#E8E6F5"
COLOR_TEXT_MUTED = "#8B87A8"
COLOR_PANEL_BG = "rgba(255, 255, 255, 0.035)"
COLOR_PANEL_BORDER = "rgba(139, 111, 217, 0.2)"

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* Main App Shell Styling */
html, body, [data-testid="stAppViewContainer"] {
    background: linear-gradient(160deg, #0B0A1F 0%, #150E2E 50%, #0D1626 100%) !important;
    color: #E8E6F5 !important;
    font-family: 'Inter', sans-serif !important;
}

[data-testid="stHeader"] {
    background: transparent !important;
}

/* Ambient Backdrop Glow Orbs */
[data-testid="stAppViewContainer"]::before {
    content: "";
    position: fixed;
    top: -100px;
    left: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
    filter: blur(100px);
    z-index: 0;
    pointer-events: none;
}

[data-testid="stAppViewContainer"]::after {
    content: "";
    position: fixed;
    bottom: -100px;
    right: -100px;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(46, 230, 166, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
    filter: blur(120px);
    z-index: 0;
    pointer-events: none;
}

/* Notice Banner Note */
.idr-notice-box {
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-left: 4px solid #3B82F6;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: #CBD5E1;
    line-height: 1.4;
}

.idr-notice-title {
    font-weight: 700;
    color: #3B82F6;
    margin-bottom: 0.2rem;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}

/* Custom Glass Cards */
.idr-glass-card {
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(139, 111, 217, 0.2);
    border-radius: 16px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 1.2rem 1.4rem;
    margin-bottom: 1rem;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    transition: all 0.3s ease;
}

.idr-glass-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 8px 32px 0 rgba(59, 130, 246, 0.08);
}

/* Metric Display Components */
.idr-metric-card {
    background: rgba(18, 16, 42, 0.6);
    border: 1px solid rgba(139, 111, 217, 0.2);
    border-radius: 14px;
    padding: 1rem 1.2rem;
    position: relative;
    overflow: hidden;
}

.idr-metric-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8B87A8;
    margin-bottom: 0.3rem;
}

.idr-metric-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.8rem;
    font-weight: 700;
    color: #E8E6F5;
    line-height: 1.1;
}

.idr-metric-subtext {
    font-size: 0.8rem;
    color: #2EE6A6;
    margin-top: 0.3rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.idr-metric-underline-green {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    background: linear-gradient(90deg, #2EE6A6 0%, #1FBF9C 100%);
}

.idr-metric-underline-red {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    background: linear-gradient(90deg, #FF4D4D 0%, #EF4444 100%);
}

.idr-metric-underline-blue {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    background: linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%);
}

/* Animations for Status Pills */
@keyframes pulse-green {
    0% { box-shadow: 0 0 0 0 rgba(46, 230, 166, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(46, 230, 166, 0); }
    100% { box-shadow: 0 0 0 0 rgba(46, 230, 166, 0); }
}

@keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
    50% { box-shadow: 0 0 0 14px rgba(255, 77, 77, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
}

@keyframes pulse-blue {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.badge-available {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(46, 230, 166, 0.12);
    border: 1px solid rgba(46, 230, 166, 0.4);
    color: #2EE6A6;
    padding: 0.4rem 1.1rem;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    animation: pulse-green 2.5s infinite;
}

.badge-outage {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(255, 77, 77, 0.18);
    border: 1px solid rgba(255, 77, 77, 0.6);
    color: #FF6B6B;
    padding: 0.4rem 1.1rem;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    animation: pulse-red 1.2s infinite;
}

.badge-restored {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.5);
    color: #60A5FA;
    padding: 0.4rem 1.1rem;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    animation: pulse-blue 2s infinite;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}
.dot-green { background: #2EE6A6; box-shadow: 0 0 8px #2EE6A6; }
.dot-red { background: #FF4D4D; box-shadow: 0 0 10px #FF4D4D; }
.dot-blue { background: #3B82F6; box-shadow: 0 0 8px #3B82F6; }

/* Custom Streamlit Buttons Glow */
div.stButton > button {
    background: rgba(30, 24, 60, 0.7) !important;
    color: #E8E6F5 !important;
    border: 1px solid rgba(139, 111, 217, 0.3) !important;
    border-radius: 10px !important;
    font-weight: 500 !important;
    transition: all 0.25s ease !important;
}

div.stButton > button:hover {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.3) !important;
    color: #FFFFFF !important;
}

div.stButton > button:disabled {
    background: rgba(20, 18, 38, 0.4) !important;
    color: #585472 !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
    box-shadow: none !important;
}

/* Terminal Log Panel */
.terminal-log {
    background: rgba(10, 8, 24, 0.85);
    border: 1px solid rgba(139, 111, 217, 0.25);
    border-radius: 12px;
    padding: 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    height: 210px;
    overflow-y: auto;
    color: #C5C2E0;
}
.log-line {
    margin-bottom: 0.4rem;
    line-height: 1.4;
}
.log-time { color: #6D688D; margin-right: 0.5rem; }
.log-init { color: #2EE6A6; }
.log-outage { color: #FF4D4D; }
.log-restore { color: #3B82F6; }
.log-info { color: #A4A0C4; }

</style>
"""

def inject_theme():
    """Inject custom CSS tokens into Streamlit."""
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

def get_plotly_layout_defaults():
    """Returns a unified dark theme dictionary for Plotly charts."""
    return dict(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(11, 10, 31, 0.7)',
        font=dict(family='Inter, sans-serif', color='#E8E6F5', size=12),
        margin=dict(l=40, r=20, t=30, b=40),
        xaxis=dict(
            gridcolor='rgba(255, 255, 255, 0.05)',
            zerolinecolor='rgba(255, 255, 255, 0.1)',
            tickfont=dict(family='JetBrains Mono', size=10, color='#8B87A8')
        ),
        yaxis=dict(
            gridcolor='rgba(255, 255, 255, 0.05)',
            zerolinecolor='rgba(255, 255, 255, 0.1)',
            tickfont=dict(family='JetBrains Mono', size=10, color='#8B87A8')
        )
    )
