"""
app.py  ─  streamlit run app.py
───────────────────────────────
Dynamic AI Chatbot  •  Main Streamlit Application

Layout
  ╔══════════════════════════════════════════════════╗
  ║  Header  (logo + tab switcher: Chat | Dashboard) ║
  ╠══════════════════════════════════════════════════╣
  ║  Sidebar          ║  Main Area                   ║
  ║  • Settings       ║  Chat tab  → message thread  ║
  ║  • NLP Details    ║  Dash tab  → plotly charts   ║
  ║  • Entities       ║                              ║
  ║  • Sentiment      ║                              ║
  ╚═══════════════════╩══════════════════════════════╝
"""

from __future__ import annotations

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import time

# ── project modules ───────────────────────────────────────
from chatbot_core import ChatbotCore, ChatResponse

# ══════════════════════════════════════════════════════════════
# STREAMLIT PAGE CONFIG  (must be first st call)
# ══════════════════════════════════════════════════════════════
st.set_page_config(
    page_title="DynamiChat – AI Chatbot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ══════════════════════════════════════════════════════════════
# CUSTOM CSS  (dark futuristic theme)
# ══════════════════════════════════════════════════════════════
CUSTOM_CSS = """
<style>
/* ── global ─────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

html, body, .stApp {
    background: #0a0e17 !important;
    color: #e2e8f0 !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

/* ── sidebar ────────────────────────────────────────── */
[data-testid="stSidebar"] {
    background: #0f1420 !important;
    border-right: 1px solid #1e293b;
}
[data-testid="stSidebar"] .stMarkdown h3 {
    color: #60a5fa;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #2d3748;
    font-weight: 600;
}

/* ── chat messages ──────────────────────────────────── */
.chat-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.msg {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
}
.msg-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; 
    align-items: center; 
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}
.msg-avatar.user { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
.msg-avatar.bot  { background: linear-gradient(135deg, #14b8a6, #06b6d4); }

.msg-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
}
.msg-bubble.user {
    background: linear-gradient(135deg, #1e40af, #6366f1);
    border-top-right-radius: 4px;
    color: #f0f9ff;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.msg-bubble.bot {
    background: #1a1f2e;
    border: 1px solid #2d3748;
    border-top-left-radius: 4px;
    color: #e2e8f0;
}
.msg.user { flex-direction: row-reverse; }
.msg.user .msg-bubble { text-align: right; }

/* source badge */
.source-badge {
    display: inline-block;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 12px;
    margin-top: 6px;
    font-weight: 600;
    letter-spacing: 0.3px;
}
.source-badge.faq     { background: #065f46; color: #6ee7b7; }
.source-badge.gemini  { background: #312e81; color: #c7d2fe; }
.source-badge.fallback{ background: #78350f; color: #fcd34d; }

/* ── input area ─────────────────────────────────────── */
.input-area {
    position: sticky;
    bottom: 0;
    background: linear-gradient(to top, #0a0e17 70%, transparent);
    padding: 20px 16px 12px;
}

/* ── sidebar cards ──────────────────────────────────── */
.sidebar-card {
    background: #141c2b;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
}
.sidebar-card .label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
    font-weight: 500;
}
.sidebar-card .value {
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
}

/* ── entity tag ─────────────────────────────────────── */
.entity-tag {
    display: inline-block;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 4px 10px;
    margin: 3px;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    color: #7dd3fc;
}
.entity-tag .etype { color: #c084fc; font-weight: 700; font-size: 10px; }

/* ── KPI row ────────────────────────────────────────── */
.kpi-row { 
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px; 
    padding: 16px 8px; 
}
.kpi-card {
    background: linear-gradient(135deg, #1e293b, #111827);
    border: 1px solid #2d3748;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
}
.kpi-card .kpi-num { 
    font-size: 32px; 
    font-weight: 700; 
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
}
.kpi-card .kpi-label { 
    font-size: 11px; 
    color: #9ca3af; 
    text-transform: uppercase; 
    letter-spacing: 1px;
    font-weight: 500;
}

/* ── streamlit overrides ────────────────────────────── */
.stButton > button {
    font-family: 'Inter', sans-serif !important;
    border-radius: 10px !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
}
.stButton > button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
div[data-testid="stTextInput"] input {
    background: #1a1f2e !important;
    border: 1px solid #2d3748 !important;
    border-radius: 12px !important;
    color: #e2e8f0 !important;
    padding: 12px 16px !important;
    font-size: 15px !important;
}
div[data-testid="stTextInput"] input:focus {
    border-color: #60a5fa !important;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
}
.stSpinner { color: #60a5fa !important; }

/* ── scrollbar ──────────────────────────────────────── */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #0a0e17; }
::-webkit-scrollbar-thumb { 
    background: linear-gradient(180deg, #2d3748, #1e293b); 
    border-radius: 4px; 
}
::-webkit-scrollbar-thumb:hover { background: #475569; }

/* ── performance optimizations ───────────────────────── */
* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.msg, .sidebar-card, .kpi-card {
    will-change: transform;
}
</style>
"""


# ══════════════════════════════════════════════════════════════
# SESSION STATE BOOTSTRAP
# ══════════════════════════════════════════════════════════════
def _init_session() -> None:
    if "core" not in st.session_state:
        st.session_state["core"] = ChatbotCore()
    if "messages" not in st.session_state:
        st.session_state["messages"] = []  # list of ChatResponse + user dicts
    if "last_response" not in st.session_state:
        st.session_state["last_response"] = None
    if "active_tab" not in st.session_state:
        st.session_state["active_tab"] = "chat"
    if "feedback_given" not in st.session_state:
        st.session_state["feedback_given"] = set()  # set of msg indices already rated


# ══════════════════════════════════════════════════════════════
# HEADER
# ══════════════════════════════════════════════════════════════
def render_header():
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

    # Tab switcher - clean and functional
    col1, col2 = st.columns(2)
    with col1:
        if st.button("💬 Chat", key="tab_chat_btn", use_container_width=True,
                     type="primary" if st.session_state["active_tab"] == "chat" else "secondary"):
            st.session_state["active_tab"] = "chat"
            st.rerun()
    with col2:
        if st.button("📊 Analytics", key="tab_dash_btn", use_container_width=True,
                     type="primary" if st.session_state["active_tab"] == "dashboard" else "secondary"):
            st.session_state["active_tab"] = "dashboard"
            st.rerun()


# ══════════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════════
def render_sidebar():
    core: ChatbotCore = st.session_state["core"]
    last: ChatResponse | None = st.session_state.get("last_response")

    with st.sidebar:
        # ── controls ────────────────────────────────────
        st.markdown("### ⚙️ Controls")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("🗑️ Clear", use_container_width=True, type="secondary"):
                core.clear_conversation()
                st.session_state["messages"] = []
                st.session_state["last_response"] = None
                st.session_state["feedback_given"] = set()
                st.success("Chat cleared!", icon="✅")
                time.sleep(0.5)
                st.rerun()
        with col2:
            if st.button("📧 Export", use_container_width=True, type="secondary"):
                _export_chat()

        st.divider()

        # ── NLP Analysis (only if there's a last response) ─
        if last:
            st.markdown("### 🧠 Analysis")

            # Intent
            st.markdown(f"""
            <div class="sidebar-card">
                <div class="label">Intent</div>
                <div class="value">{last.intent}</div>
                <div style="font-size:11px;color:#6b7280;margin-top:2px;">Confidence: {int(last.intent_conf * 100)}%</div>
            </div>
            """, unsafe_allow_html=True)

            # Entities (compact)
            if last.entities:
                st.markdown("### 🏷️ Entities")
                for etype, vals in last.entities.items():
                    for v in vals:
                        st.markdown(f'<span class="entity-tag"><span class="etype">{etype}</span> {v}</span>',
                                    unsafe_allow_html=True)

            # Sentiment
            st.markdown("### 😊 Sentiment")
            pol = last.sentiment.get("polarity", "neutral")
            pol_c = last.sentiment.get("polarity_conf", 0)
            emo = last.sentiment.get("emotion", "neutral")
            emoji = last.sentiment.get("emoji", "😐")

            pol_colors = {"positive": "#22c55e", "negative": "#ef4444", "neutral": "#f59e0b"}

            st.markdown(f"""
            <div class="sidebar-card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:18px;font-weight:600;color:{pol_colors.get(pol, '#fff')};">{pol.capitalize()}</div>
                        <div style="font-size:24px;margin-top:4px;">{emoji} {emo.capitalize()}</div>
                    </div>
                    <div style="font-size:11px;color:#6b7280;">{int(pol_c * 100)}%</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Response info (compact)
            st.markdown(f"""
            <div class="sidebar-card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div class="label">Source</div>
                    <span class="source-badge {last.source}">{last.source.upper()}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                    <div class="label">Response Time</div>
                    <div style="font-size:14px;font-weight:600;color:#60a5fa;">{last.response_time_ms} ms</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.info("💬 Start chatting to see analysis", icon="💡")


# ══════════════════════════════════════════════════════════════
# CHAT TAB
# ══════════════════════════════════════════════════════════════
def render_chat():
    core: ChatbotCore = st.session_state["core"]
    messages = st.session_state["messages"]

    # ── message thread ──────────────────────────────────
    chat_placeholder = st.empty()
    with chat_placeholder.container():
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)

        for idx, msg in enumerate(messages):
            if msg["role"] == "user":
                st.markdown(f"""
                <div class="msg user">
                    <div class="msg-avatar user">👤</div>
                    <div class="msg-bubble user">{_escape(msg['text'])}</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                resp: ChatResponse = msg["response"]
                st.markdown(f"""
                <div class="msg bot">
                    <div class="msg-avatar bot">🤖</div>
                    <div>
                        <div class="msg-bubble bot">{_escape(resp.text)}</div>
                        <span class="source-badge {resp.source}">{resp.source.upper()}</span>
                        <span style="font-size:11px;color:#4b5563;margin-left:6px;">⚡ {resp.response_time_ms}ms</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                # feedback buttons (only once per message)
                fb_key = f"fb_{idx}"
                if fb_key not in st.session_state.get("feedback_given", set()):
                    fcol1, fcol2, _ = st.columns([1, 1, 8])
                    with fcol1:
                        if st.button("👍", key=f"fb_pos_{idx}", help="Helpful"):
                            core.handle_feedback(messages[idx - 1]["text"], positive=True)
                            st.session_state.setdefault("feedback_given", set()).add(fb_key)
                            st.toast("Thanks for the feedback! 🎉", icon="👍")
                            st.rerun()
                    with fcol2:
                        if st.button("👎", key=f"fb_neg_{idx}", help="Not helpful"):
                            core.handle_feedback(messages[idx - 1]["text"], positive=False)
                            st.session_state.setdefault("feedback_given", set()).add(fb_key)
                            st.toast("Got it – I'll learn from this.", icon="👎")
                            st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)

    # ── input area ──────────────────────────────────────
    st.markdown('<div class="input-area">', unsafe_allow_html=True)

    # Use a form for proper input handling
    with st.form(key="chat_form", clear_on_submit=True):
        col1, col2 = st.columns([9, 1])
        with col1:
            user_input = st.text_input(
                "Message",
                placeholder="Type your message and press Enter...",
                label_visibility="collapsed",
                key="user_input_form",
            )
        with col2:
            submit = st.form_submit_button("▶", use_container_width=True, type="primary")

        if submit and user_input.strip():
            _process_input(user_input.strip())
            st.rerun()

    st.markdown('</div>', unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════
# DASHBOARD TAB
# ══════════════════════════════════════════════════════════════
def render_dashboard():
    core: ChatbotCore = st.session_state["core"]
    analytics = core.analytics
    df = analytics.as_dataframe()

    # ── KPIs ────────────────────────────────────────────
    total = analytics.total_interactions()
    avg_rt = analytics.avg_response_time()
    ent_sum = analytics.entity_summary()
    top_emo = analytics.emotion_counts()

    st.markdown(f"""
    <div class="kpi-row">
        <div class="kpi-card">
            <div class="kpi-num">{total}</div>
            <div class="kpi-label">Total Messages</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-num" style="color:#a78bfa;">{avg_rt:.0f}</div>
            <div class="kpi-label">Avg Response (ms)</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-num" style="color:#34d399;">{len(ent_sum)}</div>
            <div class="kpi-label">Entity Types</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-num" style="color:#fb923c;">{top_emo.index[0].capitalize() if not top_emo.empty else '—'}</div>
            <div class="kpi-label">Top Emotion</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    if df.empty:
        st.info("No data yet – send some messages in the Chat tab to populate the dashboard!", icon="📊")
        return

    # ── row 1: intent pie + sentiment pie ───────────────
    col1, col2 = st.columns(2)
    with col1:
        intent_counts = analytics.intent_counts()
        fig = go.Figure(data=[go.Pie(
            labels=intent_counts.index.tolist(),
            values=intent_counts.values.tolist(),
            hole=0.5,
            marker=dict(colors=["#60a5fa", "#a78bfa", "#f472b6", "#34d399", "#fb923c",
                                "#fbbf24", "#67e8f9", "#c4b5fd", "#86efac", "#fca5a5"]),
            textinfo="label+percent",
            textfont=dict(color="#e2e8f0", size=11),
        )])
        fig.update_layout(
            title=dict(text="🎯 Intent Distribution", font=dict(color="#60a5fa", size=15)),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            legend=dict(font=dict(color="#94a3b8", size=11)),
            margin=dict(t=40, b=20, l=10, r=10),
            height=300,
        )
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        sent_counts = analytics.sentiment_counts()
        colors_map = {"positive": "#22c55e", "negative": "#ef4444", "neutral": "#f59e0b"}
        fig2 = go.Figure(data=[go.Pie(
            labels=sent_counts.index.tolist(),
            values=sent_counts.values.tolist(),
            hole=0.5,
            marker=dict(colors=[colors_map.get(l, "#94a3b8") for l in sent_counts.index]),
            textinfo="label+percent",
            textfont=dict(color="#e2e8f0", size=11),
        )])
        fig2.update_layout(
            title=dict(text="😊 Sentiment Distribution", font=dict(color="#a78bfa", size=15)),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            legend=dict(font=dict(color="#94a3b8", size=11)),
            margin=dict(t=40, b=20, l=10, r=10),
            height=300,
        )
        st.plotly_chart(fig2, use_container_width=True)

    # ── row 2: emotion bar + response-time line ─────────
    col3, col4 = st.columns(2)
    with col3:
        emo_counts = analytics.emotion_counts()
        emo_colors = {"joy": "#22c55e", "anger": "#ef4444", "sadness": "#3b82f6",
                      "fear": "#8b5cf6", "surprise": "#f59e0b", "neutral": "#6b7280"}
        fig3 = go.Figure(data=[go.Bar(
            x=emo_counts.index.tolist(),
            y=emo_counts.values.tolist(),
            marker=dict(color=[emo_colors.get(e, "#94a3b8") for e in emo_counts.index]),
            text=emo_counts.values.tolist(),
            textposition="outside",
            textfont=dict(color="#e2e8f0"),
        )])
        fig3.update_layout(
            title=dict(text="🎭 Emotion Breakdown", font=dict(color="#34d399", size=15)),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="#0f1420",
            xaxis=dict(tickfont=dict(color="#94a3b8")),
            yaxis=dict(tickfont=dict(color="#94a3b8"), gridcolor="#1e293b"),
            margin=dict(t=40, b=30, l=30, r=10),
            height=300,
        )
        st.plotly_chart(fig3, use_container_width=True)

    with col4:
        fig4 = go.Figure()
        fig4.add_trace(go.Scatter(
            x=df["timestamp"].tolist(),
            y=df["response_time_ms"].tolist(),
            mode="lines+markers",
            line=dict(color="#60a5fa", width=2),
            marker=dict(size=5, color="#a78bfa"),
            name="Response Time",
        ))
        fig4.add_trace(go.Scatter(
            x=df["timestamp"].tolist(),
            y=[avg_rt] * len(df),
            mode="lines",
            line=dict(color="#ef4444", width=1, dash="dash"),
            name=f"Avg ({avg_rt:.0f} ms)",
        ))
        fig4.update_layout(
            title=dict(text="⚡ Response Time (ms)", font=dict(color="#fb923c", size=15)),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="#0f1420",
            xaxis=dict(tickfont=dict(color="#94a3b8"), showgrid=False),
            yaxis=dict(tickfont=dict(color="#94a3b8"), gridcolor="#1e293b"),
            legend=dict(font=dict(color="#94a3b8")),
            margin=dict(t=40, b=30, l=40, r=10),
            height=300,
        )
        st.plotly_chart(fig4, use_container_width=True)

    # ── row 3: entity summary + raw log ─────────────────
    col5, col6 = st.columns([1, 2])
    with col5:
        st.markdown("#### 🏷️ Entity Types Detected")
        if ent_sum:
            for etype, cnt in sorted(ent_sum.items(), key=lambda x: -x[1]):
                st.markdown(f"""
                <div style="display:flex;justify-content:space-between;padding:6px 0;
                     border-bottom:1px solid #1e293b;">
                    <span style="color:#7dd3fc;font-size:13px;">{etype}</span>
                    <span style="color:#94a3b8;font-weight:600;">{cnt}</span>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.caption("No entities detected yet.")

    with col6:
        st.markdown("#### 📝 Interaction Log")
        log_df = df[["timestamp", "user_text", "intent", "sentiment_polarity", "emotion",
                     "response_time_ms"]].copy()
        log_df["timestamp"] = log_df["timestamp"].dt.strftime("%H:%M:%S")
        log_df.columns = ["Time", "Message", "Intent", "Sentiment", "Emotion", "RT(ms)"]
        st.dataframe(log_df.iloc[::-1].reset_index(drop=True), use_container_width=True, height=260)

    # ── clear analytics button ──────────────────────────
    st.divider()
    if st.button("🗑️ Clear Analytics", type="secondary"):
        core.clear_analytics()
        st.success("Analytics cleared.")
        st.rerun()


# ══════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════
def _process_input(text: str):
    core: ChatbotCore = st.session_state["core"]

    # Validate input
    if not text or not text.strip():
        return

    # Add user message
    st.session_state["messages"].append({"role": "user", "text": text})

    # Process with spinner
    with st.spinner("Thinking..."):
        response: ChatResponse = core.process_message(text)

    # Add bot response
    st.session_state["messages"].append({
        "role": "bot",
        "text": response.text,
        "response": response
    })
    st.session_state["last_response"] = response


def _export_chat():
    """Download chat as plain text."""
    messages = st.session_state.get("messages", [])
    if not messages:
        st.warning("Nothing to export yet.")
        return
    lines = []
    for m in messages:
        role = "You" if m["role"] == "user" else "DynamiChat"
        lines.append(f"[{role}]\n{m['text']}\n")
    st.download_button(
        label="📥 Download .txt",
        data="\n".join(lines),
        file_name="dynamichat_export.txt",
        mime="text/plain",
        key="export_dl",
    )


def _escape(text: str) -> str:
    """Basic HTML escape to prevent XSS in chat bubbles."""
    return (text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\n", "<br>"))


# ══════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════
def main():
    _init_session()
    render_header()

    # sidebar always visible
    render_sidebar()

    # main content switches on tab
    if st.session_state["active_tab"] == "chat":
        render_chat()
    else:
        render_dashboard()


if __name__ == "__main__":
    main()
