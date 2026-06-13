"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatPanel({ messages, onSend, selectedDocumentId }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (selectedDocumentId) inputRef.current?.focus(); }, [selectedDocumentId]);
  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };
  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const msgCount = messages.length;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Document Chat</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{msgCount > 0 ? msgCount + " messages" : "Ask questions"}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => window.location.reload()} className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ask questions about your document</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Type a message below to start a conversation</p>
          </div>
        ) : messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const showAvatar = idx === 0 || messages[idx - 1]?.role !== msg.role;
          return (
            <div key={msg.id} className={"flex items-end gap-2.5 animate-slide-up " + (isUser ? "flex-row-reverse" : "flex-row")} style={{ animationDelay: "0ms" }}>
              {showAvatar && (
                <div className={"w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm " + (isUser ? "bg-accent-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                  {isUser ? "U" : "AI"}
                </div>
              )}
              {!showAvatar && <div className="w-7 flex-shrink-0"></div>}
              <div className={"max-w-[80%] rounded-2xl px-4 py-3 " + (
                isUser
                  ? "bg-accent-500 text-white rounded-br-sm shadow-sm shadow-accent-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700"
              )}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className={"mt-2.5 pt-2.5 border-t " + (isUser ? "border-white/20" : "border-slate-200 dark:border-slate-700")}>
                    <p className={"text-[11px] font-semibold mb-1.5 uppercase tracking-wider " + (isUser ? "text-white/70" : "text-slate-500")}>Sources:</p>
                    {msg.sources.map((src, i) => (
                      <div key={i} className={"text-[11px] mt-1 flex items-start gap-1.5 " + (isUser ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
                        <span className="flex-shrink-0">📄</span>
                        <span>{src.filename || "Document"}{src.page_number ? " • p." + src.page_number : ""} <span className="opacity-70">({(src.score * 100).toFixed(0)}%)</span></span>
                      </div>
                    ))}
                  </div>
                )}
                <p className={"text-[11px] mt-1.5 " + (isUser ? "text-white/60" : "text-slate-400 dark:text-slate-500")}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={selectedDocumentId ? "Ask a question about the document..." : "Select a document first..."}
              disabled={!selectedDocumentId} rows={1}
              className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 dark:focus:border-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onFocus={e => { if (!e.target.value) e.target.style.height = 'auto'; }}
            />
          </div>
          <button onClick={handleSend} disabled={!input.trim() || !selectedDocumentId}
            className="rounded-xl bg-accent-500 hover:bg-accent-600 text-white px-5 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-accent-500/20 flex items-center gap-2">
            <span className="hidden sm:inline">Send</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
