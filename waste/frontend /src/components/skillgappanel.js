
Action: file_editor create /app/frontend/src/components/SkillGapPanel.js --file-text "import React from \"react\";
import { motion } from \"framer-motion\";
import { TrendingUp, AlertTriangle, CheckCircle, BookOpen, Clock, ArrowUpRight } from \"lucide-react\";

export default function SkillGapPanel({ result }) {
  if (!result) {
    return (
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6 text-center\" data-testid=\"skill-gap-empty\">
        <p className=\"text-slate-500 font-mono text-sm\">Skill gap analysis will appear after scanning</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"skill-gap-error\">
        <p className=\"text-[#FF3B30] text-sm\">{result.error}</p>
      </div>
    );
  }

  const tech = result.technical_skills || {};
  const soft = result.soft_skills || {};
  const exp = result.experience_alignment || {};
  const certs = result.certifications || {};
  const plan = result.action_plan || [];

  return (
    <div className=\"space-y-6\" data-testid=\"skill-gap-panel\">
      {/* Score Overview */}
      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
        <MatchCard
          title=\"Technical Skills\"
          percentage={tech.match_percentage}
          present={tech.present || []}
          missing={tech.missing || []}
          color=\"#00FFFF\"
          testId=\"tech-skills-card\"
        />
        <MatchCard
          title=\"Soft Skills\"
          percentage={soft.match_percentage}
          present={soft.present || []}
          missing={soft.missing || []}
          color=\"#00FF66\"
          testId=\"soft-skills-card\"
        />
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"experience-card\">
          <p className=\"text-xs font-mono uppercase tracking-[0.15em] text-slate-400 mb-2\">Experience Alignment</p>
          <div className=\"flex items-end gap-1 mb-3\">
            <span className=\"font-mono text-3xl font-bold text-[#FFD700]\">{exp.score || 0}</span>
            <span className=\"font-mono text-sm text-slate-600 mb-1\">%</span>
          </div>
          {exp.strengths?.length > 0 && (
            <div className=\"mb-2\">
              <p className=\"text-xs text-slate-500 mb-1\">Strengths:</p>
              {exp.strengths.map((s, i) => (
                <p key={i} className=\"text-xs text-[#00FF66] flex items-start gap-1\">
                  <CheckCircle className=\"w-3 h-3 mt-0.5 flex-shrink-0\" /> {s}
                </p>
              ))}
            </div>
          )}
          {exp.gaps?.length > 0 && (
            <div>
              <p className=\"text-xs text-slate-500 mb-1\">Gaps:</p>
              {exp.gaps.map((g, i) => (
                <p key={i} className=\"text-xs text-[#FF3B30] flex items-start gap-1\">
                  <AlertTriangle className=\"w-3 h-3 mt-0.5 flex-shrink-0\" /> {g}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certifications */}
      {certs.recommended?.length > 0 && (
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"certifications-panel\">
          <div className=\"flex items-center gap-2 mb-3\">
            <BookOpen className=\"w-5 h-5 text-[#FFD700]\" />
            <h4 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white\">
              Recommended Certifications
            </h4>
          </div>
          <div className=\"flex flex-wrap gap-2\">
            {certs.recommended.map((c, i) => (
              <span key={i} className=\"px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-sm text-xs font-mono text-[#FFD700]\">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      {plan.length > 0 && (
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"action-plan-panel\">
          <div className=\"flex items-center gap-2 mb-4\">
            <TrendingUp className=\"w-5 h-5 text-[#00FF66]\" />
            <h4 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white\">
              Action Plan
            </h4>
          </div>
          <div className=\"space-y-3\">
            {plan.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className=\"flex gap-4 p-4 bg-[#050505] border border-[#27272a] rounded-sm\"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  item.priority === 'high' ? 'bg-[#FF3B30]' : item.priority === 'medium' ? 'bg-[#FFD700]' : 'bg-[#00FF66]'
                }`} />
                <div className=\"flex-1\">
                  <p className=\"text-sm text-white mb-1\">{item.action}</p>
                  <div className=\"flex gap-4 text-xs text-slate-500\">
                    {item.timeline && (
                      <span className=\"flex items-center gap-1\">
                        <Clock className=\"w-3 h-3\" /> {item.timeline}
                      </span>
                    )}
                    {item.resources && (
                      <span className=\"flex items-center gap-1\">
                        <ArrowUpRight className=\"w-3 h-3\" /> {item.resources}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-mono uppercase px-2 py-0.5 h-fit rounded-sm ${
                  item.priority === 'high'
                    ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                    : item.priority === 'medium'
                    ? 'bg-[#FFD700]/10 text-[#FFD700]'
                    : 'bg-[#00FF66]/10 text-[#00FF66]'
                }`}>
                  {item.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Raw analysis fallback */}
      {result.raw_analysis && !tech.present && (
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
          <h4 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white mb-3\">AI Analysis</h4>
          <p className=\"text-sm text-slate-300 whitespace-pre-wrap\">{result.raw_analysis}</p>
        </div>
      )}
    </div>
  );
}

function MatchCard({ title, percentage, present, missing, color, testId }) {
  return (
    <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid={testId}>
      <p className=\"text-xs font-mono uppercase tracking-[0.15em] text-slate-400 mb-2\">{title}</p>
      <div className=\"flex items-end gap-1 mb-3\">
        <span className=\"font-mono text-3xl font-bold\" style={{ color }}>{percentage || 0}</span>
        <span className=\"font-mono text-sm text-slate-600 mb-1\">% match</span>
      </div>
      <div className=\"bg-[#1a1a1a] rounded-sm h-2 mb-4 overflow-hidden\">
        <motion.div
          className=\"h-full\"
          initial={{ width: 0 }}
          animate={{ width: `${percentage || 0}%` }}
          transition={{ duration: 0.8 }}
          style={{ background: color }}
        />
      </div>
      {present.length > 0 && (
        <div className=\"mb-2\">
          <p className=\"text-xs text-slate-500 mb-1\">Present ({present.length}):</p>
          <div className=\"flex flex-wrap gap-1\">
            {present.slice(0, 6).map((s, i) => (
              <span key={i} className=\"px-1.5 py-0.5 text-[10px] font-mono rounded-sm\" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                {s}
              </span>
            ))}
            {present.length > 6 && <span className=\"text-[10px] text-slate-500 font-mono\">+{present.length - 6} more</span>}
          </div>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <p className=\"text-xs text-slate-500 mb-1\">Missing ({missing.length}):</p>
          <div className=\"flex flex-wrap gap-1\">
            {missing.slice(0, 6).map((s, i) => (
              <span key={i} className=\"px-1.5 py-0.5 text-[10px] font-mono bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30 rounded-sm\">
                {s}
              </span>
            ))}
            {missing.length > 6 && <span className=\"text-[10px] text-slate-500 font-mono\">+{missing.length - 6} more</span>}
          </div>
        </div>
      )}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/SkillGapPanel.js