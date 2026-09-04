import streamlit as st
from simulator import STATE_OUTAGE, STATE_RESTORED, STATE_REPLAYING, STATE_IDLE

def render_status_badge(state):
    """
    Renders an animated glowing status pill badge based on simulator state.
    """
    if state == STATE_OUTAGE:
        html = """
        <div class="badge-outage">
            <span class="status-dot dot-red"></span>
            GNSS OUTAGE (INS ACTIVE)
        </div>
        """
    elif state == STATE_RESTORED:
        html = """
        <div class="badge-restored">
            <span class="status-dot dot-blue"></span>
            GNSS RESTORED (FUSION ACTIVE)
        </div>
        """
    else:  # REPLAYING or IDLE
        html = """
        <div class="badge-available">
            <span class="status-dot dot-green"></span>
            GNSS AVAILABLE
        </div>
        """
    st.markdown(html, unsafe_allow_html=True)
