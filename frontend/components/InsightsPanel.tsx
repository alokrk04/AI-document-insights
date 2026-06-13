"use client";
import { useState } from "react";

function Section({ title, icon, accent, children, open = true }) {
  const [isOpen, setIsOpen] = useState(open);
  const accentMap = {
    blue: "border-blue-200 dark:border-blue-800",
    amber: "border-amber-200 dark:border-amber-800",
    red: "border-red-200 dark:border-red-800",
    purple: "border-purple-200 dark:border-purple-800",
    emerald: "border-emerald-200 dark:border-emerald-800",
  };
  const headerAccentMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
  };
  const accentColor = accent || "blue";
  return (
    <div className={"border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 " + accentMap[accentColor]}>
      <button onClick={() => setIsOpen(!isOpen)} className={"w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors " + headerAccentMap[accentColor]}>
        <span className="flex items-center gap-2.5"><span className="text-base">{icon}</span>{title}</span>
        <svg className={"w-4 h-4 transition-transform duration-200 " + (isOpen ? "rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && <div className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function InsightsPanel({ insights, isLoading, onGenerate }) {
  if (isLoading) return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
      <div className="p-5 space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Insights</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">Document Analysis</p>
          </div>
        </div>
        <button onClick={onGenerate} className="text-xs font-semibold bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm shadow-accent-500/20">
          {insights ? "Regenerate" : "Generate Insights"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!insights ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Generate AI-powered insights</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click the button above to analyze your document</p>
          </div>
        ) : (
          <>
            <Section title="Executive Summary" icon="📋" accent="blue" open={true}>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{insights.executive_summary}</p>
            </Section>
            <Section title="Key Findings" icon="🔍" accent="amber" open={true}>
              <ul className="space-y-1.5">
                {insights.key_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Action Items" icon="🎯" accent="emerald" open={false}>
              <ul className="space-y-1.5">
                {insights.action_items.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Risks" icon="⚠️" accent="red" open={false}>
              <ul className="space-y-1.5">
                {insights.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">!</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Highlighted Sections" icon="💡" accent="purple" open={false}>
              <div className="space-y-2.5">
                {insights.highlighted_sections.map((s, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 text-sm leading-none mt-0.5">"</span>
                      <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">{s.quote}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-500">{s.explanation}</p>
                      {s.source && <p className="text-xs text-accent-500 mt-1 font-medium">— {s.source}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
