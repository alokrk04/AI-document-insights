
Action: file_editor create /app/frontend/src/components/OptimizedResumeView.js --file-text "import React from \"react\";
import { motion } from \"framer-motion\";
import { ScrollArea } from \"@/components/ui/scroll-area\";
import { FileText, Briefcase, GraduationCap, Code, ArrowRight } from \"lucide-react\";

export default function OptimizedResumeView({ result }) {
  if (!result) {
    return (
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-8 text-center\" data-testid=\"optimized-empty\">
        <p className=\"text-slate-500 font-mono text-sm\">Click \"Optimize Now\" to generate an AI-optimized resume</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"optimized-error\">
        <p className=\"text-[#FF3B30] text-sm\">{result.error}</p>
      </div>
    );
  }

  const resume = result.optimized_resume || {};
  const suggestions = result.suggestions || [];
  const rewritten = result.rewritten_bullets || [];

  return (
    <div className=\"space-y-6\" data-testid=\"optimized-resume-panel\">
      {/* Optimized Resume Content */}
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
        <h3 className=\"font-heading text-xl font-bold tracking-tight uppercase text-white mb-6 flex items-center gap-2\">
          <FileText className=\"w-5 h-5 text-[#00FF66]\" />
          Optimized Resume
        </h3>

        {/* Summary */}
        {resume.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className=\"mb-6\"
          >
            <h4 className=\"text-xs font-mono uppercase tracking-[0.15em] text-[#00FFFF] mb-2\">Professional Summary</h4>
            <p className=\"text-sm text-slate-300 leading-relaxed bg-[#050505] border border-[#27272a] rounded-sm p-4\">
              {resume.summary}
            </p>
          </motion.div>
        )}

        {/* Skills */}
        {resume.skills?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className=\"mb-6\"
          >
            <h4 className=\"text-xs font-mono uppercase tracking-[0.15em] text-[#00FFFF] mb-2 flex items-center gap-2\">
              <Code className=\"w-4 h-4\" /> Skills
            </h4>
            <div className=\"flex flex-wrap gap-2\">
              {resume.skills.map((skill, i) => (
                <span key={i} className=\"px-2.5 py-1 bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-sm text-xs font-mono text-[#00FF66]\">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Experience */}
        {resume.experience?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className=\"mb-6\"
          >
            <h4 className=\"text-xs font-mono uppercase tracking-[0.15em] text-[#00FFFF] mb-3 flex items-center gap-2\">
              <Briefcase className=\"w-4 h-4\" /> Experience
            </h4>
            <div className=\"space-y-4\">
              {resume.experience.map((exp, i) => (
                <div key={i} className=\"bg-[#050505] border border-[#27272a] rounded-sm p-4\">
                  <div className=\"flex items-start justify-between mb-2\">
                    <div>
                      <p className=\"text-sm font-bold text-white\">{exp.title}</p>
                      {exp.company && <p className=\"text-xs text-slate-400\">{exp.company}</p>}
                    </div>
                    {exp.period && (
                      <span className=\"text-xs font-mono text-slate-500\">{exp.period}</span>
                    )}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className=\"space-y-1.5 mt-2\">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className=\"flex items-start gap-2 text-sm text-slate-300\">
                          <span className=\"text-[#00FF66] mt-1 flex-shrink-0\">-</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Education */}
        {resume.education?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className=\"text-xs font-mono uppercase tracking-[0.15em] text-[#00FFFF] mb-3 flex items-center gap-2\">
              <GraduationCap className=\"w-4 h-4\" /> Education
            </h4>
            <div className=\"space-y-2\">
              {resume.education.map((edu, i) => (
                <div key={i} className=\"bg-[#050505] border border-[#27272a] rounded-sm p-3 flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-bold text-white\">{edu.degree}</p>
                    {edu.institution && <p className=\"text-xs text-slate-400\">{edu.institution}</p>}
                  </div>
                  {edu.year && <span className=\"text-xs font-mono text-slate-500\">{edu.year}</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"optimization-suggestions\">
          <h4 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white mb-3\">
            AI Suggestions
          </h4>
          <div className=\"space-y-2\">
            {suggestions.map((s, i) => (
              <div key={i} className=\"flex items-start gap-2 text-sm text-slate-300\">
                <ArrowRight className=\"w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0\" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewritten Bullets Comparison */}
      {rewritten.length > 0 && (
        <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"rewritten-bullets\">
          <h4 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white mb-4\">
            Rewritten Bullet Points
          </h4>
          <div className=\"space-y-3\">
            {rewritten.map((item, i) => (
              <div key={i} className=\"bg-[#050505] border border-[#27272a] rounded-sm p-4\">
                <div className=\"flex items-start gap-2 mb-2\">
                  <span className=\"text-xs font-mono text-[#FF3B30] bg-[#FF3B30]/10 px-1.5 py-0.5 rounded-sm\">BEFORE</span>
                  <p className=\"text-sm text-slate-500 line-through\">{item.original}</p>
                </div>
                <div className=\"flex items-start gap-2\">
                  <span className=\"text-xs font-mono text-[#00FF66] bg-[#00FF66]/10 px-1.5 py-0.5 rounded-sm\">AFTER</span>
                  <p className=\"text-sm text-[#00FF66]\">{item.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/OptimizedResumeView.js