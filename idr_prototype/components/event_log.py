import streamlit as st

def render_event_log(event_logs):
    """
    Renders terminal-style scrolling log in a glass panel.
    """
    log_lines_html = ""
    for log in reversed(event_logs):
        ltype = log.get('type', 'info')
        time_str = log.get('time', '')
        text = log.get('text', '')
        
        class_name = f"log-{ltype}"
        log_lines_html += f"""
        <div class="log-line">
            <span class="log-time">[{time_str}]</span>
            <span class="{class_name}">{text}</span>
        </div>
        """
        
    html = f"""
    <div class="idr-glass-card" style="padding: 0.8rem 1rem;">
        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #8B87A8; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <span>SYSTEM EVENT TELEMETRY LOG</span>
            <span style="font-family: 'JetBrains Mono'; color: #2EE6A6; font-size: 0.7rem;">● LIVE</span>
        </div>
        <div class="terminal-log">
            {log_lines_html}
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)
