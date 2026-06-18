
Action: file_editor create /app/frontend/src/components/BulletOptimizer.js --file-text "import React, { useState } from \"react\";
import axios from \"axios\";
import { toast } from \"sonner\";
import { motion } from \"framer-motion\";
import { Sparkles, RefreshCw, Copy, Check } from \"lucide-react\";
import { Textarea } from \"@/components/ui/textarea\";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BulletOptimizer({ jobDescription = \"\" }) {
  const [bullet, setBullet] = useState(\"\");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(-1);

  const handleOptimize = async () => {
    if (!bullet.trim()) {
      toast.error(\"Enter a bullet point to optimize\");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/optimize-bullet`, {
        bullet_point: bullet,
        job_description: jobDescription,
      });
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        setResult(res.data);
      }
    } catch (e) {
      toast.error(\"Failed to optimize bullet point\");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
    toast.success(\"Copied to clipboard\");
  };

  return (
    <div className=\"space-y-6\" data-testid=\"bullet-optimizer\">
      <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
        <div className=\"flex items-center gap-2 mb-4\">
          <Sparkles className=\"w-5 h-5 text-[#FFD700]\" />
          <h4 className=\"font-heading text-lg font-bold uppercase tracking-tight text-white\">
            Bullet Point Optimizer
          </h4>
        </div>
        <p className=\"text-sm text-slate-400 mb-4\">
          Enter a weak bullet point and get 3 AI-enhanced versions using the Google XYZ formula.
        </p>
        <Textarea
          data-testid=\"bullet-input\"
          value={bullet}
          onChange={(e) => setBullet(e.target.value)}
          placeholder=\"e.g., Managed a team and worked on projects...\"
          className=\"bg-[#050505] border-[#27272a] text-white rounded-sm focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] font-body min-h-[80px] text-sm placeholder:text-slate-600\"
        />
        <div className=\"flex justify-end mt-4\">
          <button
            data-testid=\"optimize-bullet-button\"
            onClick={handleOptimize}
            disabled={loading || !bullet.trim()}
            className=\"flex items-center gap-2 px-6 py-2.5 bg-[#FFD700] text-black font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#e6c200] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed\"
          >
            {loading ? (
              <>
                <RefreshCw className=\"w-4 h-4 animate-spin\" />
                ENHANCING...
              </>
            ) : (
              <>
                <Sparkles className=\"w-4 h-4\" />
                ENHANCE
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && result.enhanced_versions && (
        <div className=\"space-y-3\" data-testid=\"bullet-results\">
          <p className=\"text-xs font-mono uppercase tracking-wider text-slate-400\">Enhanced Versions</p>
          {result.enhanced_versions.map((version, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-4 hover:border-[#FFD700]/40 transition-all group\"
            >
              <div className=\"flex items-start justify-between gap-3\">
                <div className=\"flex items-start gap-3 flex-1\">
                  <span className=\"font-mono text-xs text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded-sm mt-0.5 flex-shrink-0\">
                    V{i + 1}
                  </span>
                  <p className=\"text-sm text-slate-200 leading-relaxed\">{version}</p>
                </div>
                <button
                  data-testid={`copy-bullet-${i}`}
                  onClick={() => handleCopy(version, i)}
                  className=\"p-1.5 text-slate-500 hover:text-[#00FFFF] transition-colors flex-shrink-0\"
                >
                  {copiedIdx === i ? <Check className=\"w-4 h-4 text-[#00FF66]\" /> : <Copy className=\"w-4 h-4\" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/BulletOptimizer.js