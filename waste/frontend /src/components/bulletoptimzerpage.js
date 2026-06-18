
Action: file_editor create /app/frontend/src/components/BulletOptimizerPage.js --file-text "import React, { useState } from \"react\";
import axios from \"axios\";
import { toast } from \"sonner\";
import { Toaster } from \"@/components/ui/sonner\";
import { motion } from \"framer-motion\";
import { Sparkles, RefreshCw, Copy, Check, ArrowLeft, Shield } from \"lucide-react\";
import { Textarea } from \"@/components/ui/textarea\";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const HERO_BG = \"https://static.prod-images.emergentagent.com/jobs/bd36d370-144d-4a5b-a980-5c6707c23b02/images/c4797af5c1d34af2dca92c36ebeae314c2797a3ab6df234e6e141a1bed5a3e66.png\";

export default function BulletOptimizerPage() {
  const [bullet, setBullet] = useState(\"\");
  const [jobDesc, setJobDesc] = useState(\"\");
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
        job_description: jobDesc,
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
    toast.success(\"Copied!\");
  };

  return (
    <div
      className=\"min-h-screen relative\"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: \"cover\",
        backgroundPosition: \"center\",
        backgroundAttachment: \"fixed\",
      }}
    >
      <div className=\"fixed inset-0 bg-black/85 z-0\" />
      <div className=\"relative z-10\">
        {/* Header */}
        <header className=\"border-b border-[#27272a] bg-black/60 backdrop-blur-2xl sticky top-0 z-50\">
          <div className=\"max-w-4xl mx-auto px-6 py-4 flex items-center justify-between\">
            <div className=\"flex items-center gap-3\">
              <div className=\"w-8 h-8 bg-[#FFD700] rounded-sm flex items-center justify-center\">
                <Sparkles className=\"w-5 h-5 text-black\" />
              </div>
              <div>
                <h1 className=\"font-heading text-lg font-bold tracking-tight uppercase text-white\">
                  BULLET OPTIMIZER
                </h1>
                <p className=\"text-xs font-mono text-[#FFD700] tracking-[0.2em] uppercase\">
                  GOOGLE XYZ FORMULA
                </p>
              </div>
            </div>
            <a
              href=\"/\"
              data-testid=\"back-to-dashboard\"
              className=\"flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider text-slate-400 hover:text-[#00FF66] border border-[#27272a] rounded-sm hover:border-[#00FF66]/50 transition-all\"
            >
              <ArrowLeft className=\"w-4 h-4\" />
              Dashboard
            </a>
          </div>
        </header>

        <main className=\"max-w-4xl mx-auto px-6 py-10\">
          <div className=\"text-center mb-10\">
            <h2 className=\"font-heading text-4xl sm:text-5xl font-black tracking-tighter uppercase text-white mb-3\">
              TRANSFORM YOUR <span className=\"text-neon-gold\">BULLETS</span>
            </h2>
            <p className=\"text-base text-slate-300 max-w-xl mx-auto\">
              Turn weak resume bullet points into powerful, metrics-driven achievements
              using the Google XYZ formula.
            </p>
          </div>

          <div className=\"space-y-6\">
            {/* Input Section */}
            <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-8\">
              <label className=\"text-xs font-mono uppercase tracking-[0.15em] text-[#00FFFF] mb-2 block\">
                Your Bullet Point
              </label>
              <Textarea
                data-testid=\"page-bullet-input\"
                value={bullet}
                onChange={(e) => setBullet(e.target.value)}
                placeholder=\"e.g., Responsible for managing a team and completing projects on time...\"
                className=\"bg-[#050505] border-[#27272a] text-white rounded-sm focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] font-body min-h-[80px] text-sm placeholder:text-slate-600 mb-4\"
              />

              <label className=\"text-xs font-mono uppercase tracking-[0.15em] text-slate-500 mb-2 block\">
                Job Description (Optional Context)
              </label>
              <Textarea
                data-testid=\"page-jd-input\"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder=\"Paste relevant job description for better context...\"
                className=\"bg-[#050505] border-[#27272a] text-white rounded-sm focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] font-body min-h-[60px] text-sm placeholder:text-slate-600\"
              />

              <div className=\"flex justify-end mt-6\">
                <button
                  data-testid=\"page-optimize-button\"
                  onClick={handleOptimize}
                  disabled={loading || !bullet.trim()}
                  className=\"flex items-center gap-2 px-8 py-3 bg-[#FFD700] text-black font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#e6c200] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed\"
                >
                  {loading ? (
                    <>
                      <RefreshCw className=\"w-4 h-4 animate-spin\" />
                      ENHANCING...
                    </>
                  ) : (
                    <>
                      <Sparkles className=\"w-4 h-4\" />
                      ENHANCE BULLET
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {result?.enhanced_versions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className=\"space-y-4\"
                data-testid=\"page-bullet-results\"
              >
                {/* Original */}
                <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-4\">
                  <span className=\"text-xs font-mono text-slate-500 uppercase tracking-wider\">Original</span>
                  <p className=\"text-sm text-slate-400 mt-1\">{result.original}</p>
                </div>

                {/* Enhanced */}
                {result.enhanced_versions.map((version, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-5 hover:border-[#FFD700]/40 transition-all\"
                  >
                    <div className=\"flex items-start justify-between gap-4\">
                      <div className=\"flex items-start gap-3 flex-1\">
                        <span className=\"font-mono text-sm font-bold text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded-sm flex-shrink-0\">
                          {i + 1}
                        </span>
                        <p className=\"text-sm text-slate-200 leading-relaxed pt-0.5\">{version}</p>
                      </div>
                      <button
                        data-testid={`page-copy-bullet-${i}`}
                        onClick={() => handleCopy(version, i)}
                        className=\"p-2 text-slate-500 hover:text-[#00FFFF] transition-colors flex-shrink-0 border border-[#27272a] rounded-sm hover:border-[#00FFFF]/50\"
                      >
                        {copiedIdx === i ? <Check className=\"w-4 h-4 text-[#00FF66]\" /> : <Copy className=\"w-4 h-4\" />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>
      <Toaster
        position=\"top-right\"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            border: '1px solid #27272a',
            color: '#e4e4e7',
            fontFamily: 'Outfit, sans-serif',
          },
        }}
      />
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/BulletOptimizerPage.js