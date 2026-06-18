
Action: file_editor create /app/frontend/src/components/MissingKeywords.js --file-text "import React from \"react\";
import { Badge } from \"@/components/ui/badge\";
import { CheckCircle, XCircle, AlertTriangle } from \"lucide-react\";

export default function MissingKeywords({ result }) {
  if (!result) {
    return (
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"missing-keywords-empty\">
        <p className=\"text-slate-500 font-mono text-sm text-center\">Run analysis to see keyword matches</p>
      </div>
    );
  }

  const matched = result.keyword_matches || [];
  const missing = result.missing_keywords || [];
  const skillsFound = result.skills_found || [];
  const skillsMissing = result.skills_missing || [];

  return (
    <div className=\"space-y-6\" data-testid=\"keywords-panel\">
      {/* Matched Keywords */}
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
        <div className=\"flex items-center gap-2 mb-4\">
          <CheckCircle className=\"w-5 h-5 text-[#00FF66]\" />
          <h4 className=\"font-heading text-lg font-bold uppercase tracking-tight text-white\">
            Matched Keywords
          </h4>
          <span className=\"font-mono text-xs text-[#00FF66] ml-auto\">{matched.length} found</span>
        </div>
        <div className=\"flex flex-wrap gap-2\">
          {matched.length > 0 ? (
            matched.map((kw, i) => (
              <span
                key={i}
                className=\"px-2.5 py-1 bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-sm text-xs font-mono text-[#00FF66]\"
              >
                {kw}
              </span>
            ))
          ) : (
            <p className=\"text-slate-500 text-sm\">No keyword matches found</p>
          )}
        </div>
      </div>

      {/* Missing Keywords */}
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
        <div className=\"flex items-center gap-2 mb-4\">
          <XCircle className=\"w-5 h-5 text-[#FF3B30]\" />
          <h4 className=\"font-heading text-lg font-bold uppercase tracking-tight text-white\">
            Missing Keywords
          </h4>
          <span className=\"font-mono text-xs text-[#FF3B30] ml-auto\">{missing.length} missing</span>
        </div>
        <div className=\"flex flex-wrap gap-2\">
          {missing.length > 0 ? (
            missing.map((kw, i) => (
              <span
                key={i}
                className=\"px-2.5 py-1 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-sm text-xs font-mono text-[#FF3B30]\"
              >
                {kw}
              </span>
            ))
          ) : (
            <p className=\"text-[#00FF66] text-sm font-mono\">All keywords matched!</p>
          )}
        </div>
      </div>

      {/* Skills Comparison */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
          <div className=\"flex items-center gap-2 mb-3\">
            <CheckCircle className=\"w-4 h-4 text-[#00FFFF]\" />
            <h5 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white\">Skills Found</h5>
          </div>
          <div className=\"flex flex-wrap gap-1.5\">
            {skillsFound.map((s, i) => (
              <span key={i} className=\"px-2 py-0.5 bg-[#00FFFF]/10 border border-[#00FFFF]/20 rounded-sm text-xs font-mono text-[#00FFFF]\">
                {s}
              </span>
            ))}
            {skillsFound.length === 0 && <p className=\"text-slate-500 text-xs\">None detected</p>}
          </div>
        </div>
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
          <div className=\"flex items-center gap-2 mb-3\">
            <AlertTriangle className=\"w-4 h-4 text-[#FFD700]\" />
            <h5 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white\">Skills to Add</h5>
          </div>
          <div className=\"flex flex-wrap gap-1.5\">
            {skillsMissing.map((s, i) => (
              <span key={i} className=\"px-2 py-0.5 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-sm text-xs font-mono text-[#FFD700]\">
                {s}
              </span>
            ))}
            {skillsMissing.length === 0 && <p className=\"text-[#00FF66] text-xs font-mono\">All skills covered!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/MissingKeywords.js