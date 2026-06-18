
Action: file_editor create /app/frontend/src/components/ATSScoreCard.js --file-text "import React from \"react\";
import { motion } from \"framer-motion\";
import { TrendingUp, FileText, Zap, Target } from \"lucide-react\";

const ENERGY_BG = \"https://static.prod-images.emergentagent.com/jobs/bd36d370-144d-4a5b-a980-5c6707c23b02/images/f31c0bbecbbd1e730bb61f8052ccdf3a2ced7e1874852b03fb07aa847b3ecf36.png\";

export default function ATSScoreCard({ result }) {
  if (!result) {
    return (
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-8 text-center\" data-testid=\"ats-score-card-empty\">
        <p className=\"text-slate-500 font-mono text-sm\">No analysis results yet</p>
      </div>
    );
  }

  const score = result.ats_score || 0;
  const scoreColor = score >= 80 ? '#00FF66' : score >= 60 ? '#FFD700' : '#FF3B30';

  return (
    <div
      className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-8 relative overflow-hidden hover:border-[#00FF66]/50 transition-all\"
      data-testid=\"ats-score-card\"
    >
      {/* Energy accent background */}
      <div
        className=\"absolute inset-0 opacity-10 pointer-events-none\"
        style={{
          backgroundImage: `url(${ENERGY_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen',
        }}
      />

      <div className=\"relative z-10\">
        <div className=\"flex items-start justify-between mb-6\">
          <div>
            <p className=\"text-xs font-mono uppercase tracking-[0.2em] text-[#00FFFF] mb-1\">ATS COMPATIBILITY</p>
            <h3 className=\"font-heading text-2xl font-bold tracking-tight uppercase text-white\">
              SCORE ANALYSIS
            </h3>
          </div>
          <div
            className={`text-right ${score >= 80 ? 'neon-pulse' : ''}`}
            data-testid=\"ats-score-value\"
          >
            <span
              className=\"font-mono text-5xl font-bold\"
              style={{ color: scoreColor, textShadow: `0 0 20px ${scoreColor}40` }}
            >
              {score}
            </span>
            <span className=\"font-mono text-xl text-slate-500\">%</span>
          </div>
        </div>

        {/* Main progress bar */}
        <div className=\"bg-[#1a1a1a] rounded-sm overflow-hidden h-4 mb-6\" data-testid=\"ats-progress-bar\">
          <motion.div
            className=\"h-full rounded-sm\"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, ease: \"easeOut\" }}
            style={{
              background: `linear-gradient(90deg, #00FFFF, ${scoreColor})`,
              boxShadow: `0 0 10px ${scoreColor}80, 0 0 20px ${scoreColor}30`,
            }}
          />
        </div>

        {/* Sub-scores */}
        <div className=\"grid grid-cols-3 gap-4\">
          <ScoreMeter
            label=\"KEYWORDS\"
            value={result.keyword_score || 0}
            icon={<FileText className=\"w-4 h-4\" />}
            testId=\"keyword-score\"
          />
          <ScoreMeter
            label=\"FORMAT\"
            value={result.formatting_score || 0}
            icon={<Zap className=\"w-4 h-4\" />}
            testId=\"formatting-score\"
          />
          <ScoreMeter
            label=\"RELEVANCE\"
            value={result.relevance_score || 0}
            icon={<Target className=\"w-4 h-4\" />}
            testId=\"relevance-score\"
          />
        </div>
      </div>
    </div>
  );
}

function ScoreMeter({ label, value, icon, testId }) {
  const color = value >= 70 ? '#00FF66' : value >= 50 ? '#FFD700' : '#FF3B30';
  return (
    <div className=\"bg-[#050505] border border-[#27272a] rounded-sm p-4\" data-testid={testId}>
      <div className=\"flex items-center gap-2 mb-2\">
        <span style={{ color }}>{icon}</span>
        <span className=\"text-xs font-mono uppercase tracking-wider text-slate-400\">{label}</span>
      </div>
      <div className=\"flex items-end gap-1\">
        <span className=\"font-mono text-2xl font-bold\" style={{ color }}>{value}</span>
        <span className=\"font-mono text-xs text-slate-600 mb-1\">/ 100</span>
      </div>
      <div className=\"bg-[#1a1a1a] rounded-sm h-1.5 mt-2 overflow-hidden\">
        <motion.div
          className=\"h-full rounded-sm\"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: \"easeOut\", delay: 0.3 }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/ATSScoreCard.js