import sys
import os
import time
import streamlit as st

# Ensure local imports work cleanly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from theme import inject_theme
from simulator import IDRSimulator, STATE_IDLE, STATE_REPLAYING, STATE_OUTAGE, STATE_RESTORED
from components.status_badge import render_status_badge
from components.trajectory_plot import build_trajectory_figure
from components.sensor_sparklines import render_sensor_sparklines
from components.event_log import render_event_log

st.set_page_config(
    page_title="Intelligent Dead Reckoning (IDR) Simulator — SIH",
    page_icon="🛰️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 1. Inject Custom Aesthetic Theme & CSS Tokens
inject_theme()

# 2. Initialize Simulator in Session State
if 'sim' not in st.session_state:
    st.session_state.sim = IDRSimulator("VTB01")

sim = st.session_state.sim

# 3. Header Row & Problem Statement Context
col_head1, col_head2 = st.columns([3.2, 1])

with col_head1:
    st.markdown("""
        <div style="display: flex; align-items: center; gap: 0.8rem;">
            <h1 style="margin: 0; font-size: 2.1rem; font-weight: 700; background: linear-gradient(90deg, #E8E6F5 0%, #3B82F6 50%, #2EE6A6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                AI-ML based Intelligent Dead Reckoning
            </h1>
        </div>
        <p style="margin: 0.2rem 0 0 0; color: #8B87A8; font-size: 0.9rem;">
            SIH Problem Statement · Synchronized IO-VNBD Vehicle Replay Engine (10 Hz Clock)
        </p>
    """, unsafe_allow_html=True)

with col_head2:
    st.write("")
    render_status_badge(sim.state)

st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

# 4. Mandatory Prototype Notice Banner
st.markdown("""
    <div class="idr-notice-box">
        <div class="idr-notice-title">ℹ️ Prototype Simulation Notice</div>
        Red and blue trajectories are deterministic illustrative simulations for the prototype interface. The final system will replace them with phone-IMU model inference.
    </div>
""", unsafe_allow_html=True)

# 5. Control Panel Card (Trip Selector + Action Buttons + Slider)
ctrl_card = st.container()
with ctrl_card:
    col_c0, col_c1, col_c2, col_c3, col_c4, col_c5, col_c6 = st.columns([1.3, 0.9, 0.9, 0.9, 1.6, 1.4, 2.0])

    with col_c0:
        selected_trip = st.selectbox(
            "Trip Dataset",
            options=["VTB01", "VTB02"],
            index=0 if sim.current_trip == "VTB01" else 1,
            key="trip_selector_key"
        )
        if selected_trip != sim.current_trip:
            sim.set_trip(selected_trip)
            st.rerun()

    with col_c1:
        start_disabled = sim.state in [STATE_REPLAYING, STATE_OUTAGE, STATE_RESTORED]
        if st.button("▶ Start", disabled=start_disabled, use_container_width=True):
            sim.start_replay()
            st.rerun()

    with col_c2:
        pause_disabled = (sim.state == STATE_IDLE)
        if st.button("⏸ Pause", disabled=pause_disabled, use_container_width=True):
            sim.pause_replay()
            st.rerun()

    with col_c3:
        if st.button("↺ Reset", use_container_width=True):
            sim.reset()
            st.rerun()

    with col_c4:
        outage_disabled = (sim.state != STATE_REPLAYING)
        if st.button("⚡ Simulate Outage", disabled=outage_disabled, use_container_width=True):
            dur = st.session_state.get('outage_slider', 30)
            sim.trigger_outage(dur)
            st.rerun()

    with col_c5:
        restore_disabled = (sim.state != STATE_OUTAGE)
        if st.button("🛰️ Restore GNSS", disabled=restore_disabled, use_container_width=True):
            sim.restore_gnss()
            st.rerun()

    with col_c6:
        st.slider(
            "Outage Duration (s)",
            min_value=10,
            max_value=60,
            value=30,
            step=5,
            key='outage_slider',
            help="Configures the simulated GNSS blackout duration in seconds."
        )

st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

# 6. Main Dashboard Body (Left: Trajectory Plot, Right: Real-time Metrics & Log)
col_left, col_right = st.columns([7, 5])

# Fetch live metrics summary
metrics = sim.get_current_metrics()

with col_left:
    # 2D Navigation Trajectory Plotly Chart
    fig_traj = build_trajectory_figure(sim.gt_history, sim.ai_history, sim.dr_history, sim.state)
    st.plotly_chart(fig_traj, use_container_width=True, config={'displayModeBar': False})

with col_right:
    # Real-Time Evaluated Metrics Panel
    st.markdown("""
        <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #8B87A8; margin-bottom: 0.6rem; font-weight: 600;">
            📊 ACCURACY & DRIFT METRICS SUMMARY
        </div>
    """, unsafe_allow_html=True)
    
    # Distance Metric
    dist_val = metrics['total_distance']
    dist_str = f"{dist_val / 1000.0:.2f} km" if dist_val >= 1000 else f"{dist_val:.1f} m"
    
    m_col1, m_col2 = st.columns(2)
    with m_col1:
        st.markdown(f"""
            <div class="idr-metric-card">
                <div class="idr-metric-title">TOTAL DISTANCE TRAVELLED</div>
                <div class="idr-metric-value" style="color: #2EE6A6;">{dist_str}</div>
                <div class="idr-metric-subtext">Active Route Length</div>
                <div class="idr-metric-underline-green"></div>
            </div>
        """, unsafe_allow_html=True)
        
    with m_col2:
        imp_val = metrics['improvement_pct']
        st.markdown(f"""
            <div class="idr-metric-card">
                <div class="idr-metric-title">AI DRIFT REDUCTION</div>
                <div class="idr-metric-value" style="color: #3B82F6;">{imp_val:.1f}%</div>
                <div class="idr-metric-subtext">Improvement over Ordinary DR</div>
                <div class="idr-metric-underline-blue"></div>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height: 8px;'></div>", unsafe_allow_html=True)

    # Red vs Blue Error Cards
    m_col3, m_col4 = st.columns(2)
    with m_col3:
        red_err = metrics['red_error']
        red_pct = metrics['red_drift_pct']
        st.markdown(f"""
            <div class="idr-metric-card">
                <div class="idr-metric-title">ORDINARY DR ERROR (RED)</div>
                <div class="idr-metric-value" style="color: #FF4D4D;">{red_err:.1f} m</div>
                <div class="idr-metric-subtext" style="color: #FF6B6B;">Drift: {red_pct:.2f}% of distance</div>
                <div class="idr-metric-underline-red"></div>
            </div>
        """, unsafe_allow_html=True)

    with m_col4:
        blue_err = metrics['blue_error']
        blue_pct = metrics['blue_drift_pct']
        st.markdown(f"""
            <div class="idr-metric-card">
                <div class="idr-metric-title">AI DR ERROR (BLUE)</div>
                <div class="idr-metric-value" style="color: #3B82F6;">{blue_err:.1f} m</div>
                <div class="idr-metric-subtext" style="color: #60A5FA;">Drift: {blue_pct:.2f}% of distance</div>
                <div class="idr-metric-underline-blue"></div>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

    # Terminal System Event Log
    render_event_log(sim.event_logs)

# 7. Live 10Hz Replay Engine Loop
if sim.state in [STATE_REPLAYING, STATE_OUTAGE, STATE_RESTORED]:
    has_more = sim.tick()
    time.sleep(0.04)
    st.rerun()
