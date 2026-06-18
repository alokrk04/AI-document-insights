
Action: file_editor create /app/frontend/src/components/Dashboard.js --file-text "import React, { useState, useCallback } from \"react\";
import axios from \"axios\";
import { toast } from \"sonner\";
import { motion, AnimatePresence } from \"framer-motion\";
import {
  Upload, FileText, Zap, Target, Download, ArrowRight,
  CheckCircle, AlertTriangle, TrendingUp, Sparkles, ChevronDown,
  BarChart3, Shield, Lightbulb, RefreshCw, X
} from \"lucide-react\";
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { Badge } from \"@/components/ui/badge\";
import { Progress } from \"@/components/ui/progress\";
import { Textarea } from \"@/components/ui/textarea\";
import { ScrollArea } from \"@/components/ui/scroll-area\";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from \"@/components/ui/tooltip\";

import ResumeUpload from \"@/components/ResumeUpload\";
import ATSScoreCard from \"@/components/ATSScoreCard\";
import SkillGapPanel from \"@/components/SkillGapPanel\";
import BulletOptimizer from \"@/components/BulletOptimizer\";
import OptimizedResumeView from \"@/components/OptimizedResumeView\";
import MissingKeywords from \"@/components/MissingKeywords\";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_BG = \"https://static.prod-images.emergentagent.com/jobs/bd36d370-144d-4a5b-a980-5c6707c23b02/images/c4797af5c1d34af2dca92c36ebeae314c2797a3ab6df234e6e141a1bed5a3e66.png\";

export default function Dashboard() {
  const [resumeText, setResumeText] = useState(\"\");
  const [fileName, setFileName] = useState(\"\");
  const [jobDescription, setJobDescription] = useState(\"\");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [skillGapResult, setSkillGapResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState(\"analysis\");
  const [step, setStep] = useState(1); // 1: upload, 2: JD, 3: results

  const handleFileUpload = useCallback(async (file) => {
    const formData = new FormData();
    formData.append(\"file\", file);

    try {
      const res = await axios.post(`${API}/upload-resume`, formData, {
        headers: { \"Content-Type\": \"multipart/form-data\" },
      });
      if (res.data.error) {
        toast.error(res.data.error);
        return;
      }
      setResumeText(res.data.resume_text);
      setFileName(res.data.filename);
      setStep(2);
      toast.success(\"Resume parsed successfully\");
    } catch (e) {
      toast.error(\"Failed to upload resume\");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      toast.error(\"Please upload a resume and enter a job description\");
      return;
    }
    setIsAnalyzing(true);
    setStep(3);
    try {
      const [analysisRes, skillGapRes] = await Promise.all([
        axios.post(`${API}/analyze`, { resume_text: resumeText, job_description: jobDescription }),
        axios.post(`${API}/skill-gap`, { resume_text: resumeText, job_description: jobDescription }),
      ]);
      if (analysisRes.data.error) {
        toast.error(analysisRes.data.error);
      } else {
        setAnalysisResult(analysisRes.data);
      }
      if (!skillGapRes.data.error) {
        setSkillGapResult(skillGapRes.data);
      }
    } catch (e) {
      toast.error(\"Analysis failed. Please try again.\");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!resumeText || !jobDescription) return;
    setIsOptimizing(true);
    try {
      const res = await axios.post(`${API}/optimize`, {
        resume_text: resumeText,
        job_description: jobDescription,
      });
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        setOptimizationResult(res.data);
        setActiveTab(\"optimized\");
        toast.success(\"Resume optimized successfully!\");
      }
    } catch (e) {
      toast.error(\"Optimization failed. Please try again.\");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownload = async (format) => {
    if (!optimizationResult?.optimized_resume) {
      toast.error(\"Please optimize your resume first\");
      return;
    }
    setIsDownloading(true);
    try {
      const res = await axios.post(
        `${API}/download/${format}`,
        { optimized_content: optimizationResult.optimized_resume, format },
        { responseType: \"blob\" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement(\"a\");
      link.href = url;
      link.download = `optimized_resume.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setResumeText(\"\");
    setFileName(\"\");
    setJobDescription(\"\");
    setAnalysisResult(null);
    setOptimizationResult(null);
    setSkillGapResult(null);
    setStep(1);
    setActiveTab(\"analysis\");
  };

  return (
    <TooltipProvider>
      <div
        className=\"min-h-screen relative\"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: \"cover\",
          backgroundPosition: \"center\",
          backgroundAttachment: \"fixed\",
        }}
      >
        {/* Dark overlay */}
        <div className=\"fixed inset-0 bg-black/85 z-0\" />

        {/* Content */}
        <div className=\"relative z-10\">
          {/* Header */}
          <header className=\"border-b border-[#27272a] bg-black/60 backdrop-blur-2xl sticky top-0 z-50\">
            <div className=\"max-w-7xl mx-auto px-6 py-4 flex items-center justify-between\">
              <div className=\"flex items-center gap-3\">
                <div className=\"w-8 h-8 bg-[#00FF66] rounded-sm flex items-center justify-center\">
                  <Shield className=\"w-5 h-5 text-black\" />
                </div>
                <div>
                  <h1 className=\"font-heading text-lg font-bold tracking-tight uppercase text-white\" data-testid=\"app-title\">
                    ATS RESUME OPTIMIZER
                  </h1>
                  <p className=\"text-xs font-mono text-[#00FF66] tracking-[0.2em] uppercase\">
                    AI-POWERED
                  </p>
                </div>
              </div>
              <div className=\"flex items-center gap-4\">
                {step > 1 && (
                  <button
                    data-testid=\"reset-button\"
                    onClick={handleReset}
                    className=\"flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider text-slate-400 hover:text-[#00FFFF] border border-[#27272a] rounded-sm hover:border-[#00FFFF]/50 transition-all\"
                  >
                    <RefreshCw className=\"w-4 h-4\" />
                    Reset
                  </button>
                )}
                <a
                  href=\"/bullet-optimizer\"
                  data-testid=\"bullet-optimizer-nav\"
                  className=\"flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-[#00FFFF] text-[#00FFFF] font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#00FFFF]/10 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all text-sm\"
                >
                  <Sparkles className=\"w-4 h-4\" />
                  Bullet Tool
                </a>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className=\"max-w-7xl mx-auto px-6 py-8\">
            {/* Step Indicator */}
            <div className=\"flex items-center gap-4 mb-8\" data-testid=\"step-indicator\">
              {[
                { num: 1, label: \"UPLOAD\", icon: Upload },
                { num: 2, label: \"JOB DESC\", icon: FileText },
                { num: 3, label: \"RESULTS\", icon: BarChart3 },
              ].map((s, i) => (
                <React.Fragment key={s.num}>
                  {i > 0 && (
                    <div className={`flex-1 h-px ${step >= s.num ? 'bg-[#00FF66]' : 'bg-[#27272a]'} transition-colors duration-500`} />
                  )}
                  <div className=\"flex items-center gap-2\">
                    <div
                      className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 ${
                        step >= s.num
                          ? 'bg-[#00FF66] text-black'
                          : 'bg-[#1a1a1a] text-[#a1a1aa] border border-[#27272a]'
                      }`}
                    >
                      {step > s.num ? <CheckCircle className=\"w-4 h-4\" /> : s.num}
                    </div>
                    <span className={`text-xs font-mono uppercase tracking-[0.15em] hidden sm:inline ${
                      step >= s.num ? 'text-[#00FF66]' : 'text-[#a1a1aa]'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode=\"wait\">
              {/* Step 1: Upload */}
              {step === 1 && (
                <motion.div
                  key=\"step1\"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className=\"max-w-2xl mx-auto text-center mb-10\">
                    <h2 className=\"font-heading text-4xl sm:text-5xl font-black tracking-tighter uppercase text-white mb-4\">
                      BEAT THE <span className=\"text-neon-green\">ATS</span>
                    </h2>
                    <p className=\"text-base text-slate-300 leading-relaxed\">
                      Upload your resume and let our AI analyze, score, and optimize it
                      to pass Applicant Tracking Systems with ease.
                    </p>
                  </div>
                  <ResumeUpload onFileUpload={handleFileUpload} />
                </motion.div>
              )}

              {/* Step 2: Job Description */}
              {step === 2 && (
                <motion.div
                  key=\"step2\"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className=\"max-w-3xl mx-auto\">
                    <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6 mb-6\">
                      <div className=\"flex items-center gap-3 mb-1\">
                        <CheckCircle className=\"w-5 h-5 text-[#00FF66]\" />
                        <span className=\"text-sm font-mono text-[#00FF66] uppercase tracking-wider\">Resume Loaded</span>
                      </div>
                      <p className=\"text-slate-300 text-sm ml-8\">{fileName}</p>
                      <p className=\"text-xs text-slate-500 ml-8 mt-1 font-mono\">
                        {resumeText.split(/\s+/).length} words extracted
                      </p>
                    </div>

                    <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-8\">
                      <div className=\"flex items-center gap-3 mb-4\">
                        <Target className=\"w-5 h-5 text-[#00FFFF]\" />
                        <h3 className=\"font-heading text-xl font-bold tracking-tight uppercase text-white\">
                          TARGET JOB DESCRIPTION
                        </h3>
                      </div>
                      <p className=\"text-sm text-slate-400 mb-4\">
                        Paste the job description you want to optimize your resume for.
                      </p>
                      <Textarea
                        data-testid=\"job-description-input\"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder=\"Paste the full job description here...\"
                        className=\"bg-[#050505] border-[#27272a] text-white rounded-sm focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] font-body min-h-[200px] text-sm placeholder:text-slate-600 transition-all\"
                      />
                      <div className=\"flex justify-end mt-6\">
                        <button
                          data-testid=\"analyze-button\"
                          onClick={handleAnalyze}
                          disabled={!jobDescription.trim() || isAnalyzing}
                          className=\"flex items-center gap-2 px-8 py-3 bg-[#00FF66] text-black font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#00cc52] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed\"
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className=\"w-4 h-4 animate-spin\" />
                              ANALYZING...
                            </>
                          ) : (
                            <>
                              <Zap className=\"w-4 h-4\" />
                              ANALYZE & SCORE
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Results */}
              {step === 3 && (
                <motion.div
                  key=\"step3\"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isAnalyzing ? (
                    <div className=\"flex flex-col items-center justify-center py-20\">
                      <div className=\"w-16 h-16 border-2 border-[#00FF66] border-t-transparent rounded-sm animate-spin mb-6\" />
                      <p className=\"font-mono text-[#00FF66] uppercase tracking-wider text-sm\">
                        Scanning Resume...
                      </p>
                      <p className=\"text-slate-500 text-xs mt-2\">Running ATS analysis & AI skill gap detection</p>
                    </div>
                  ) : (
                    <>
                      {/* Score + Actions Row */}
                      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6\">
                        <div className=\"lg:col-span-2\">
                          <ATSScoreCard result={analysisResult} />
                        </div>
                        <div className=\"space-y-4\">
                          {/* Optimize Button */}
                          <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6 hover:border-[#00FF66]/50 transition-all\">
                            <h4 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white mb-2\">
                              AI OPTIMIZATION
                            </h4>
                            <p className=\"text-xs text-slate-400 mb-4\">
                              Rewrite bullets with Google XYZ formula, add missing keywords, restructure for ATS.
                            </p>
                            <button
                              data-testid=\"optimize-button\"
                              onClick={handleOptimize}
                              disabled={isOptimizing}
                              className=\"w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF66] text-black font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#00cc52] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all disabled:opacity-40\"
                            >
                              {isOptimizing ? (
                                <>
                                  <RefreshCw className=\"w-4 h-4 animate-spin\" />
                                  OPTIMIZING...
                                </>
                              ) : (
                                <>
                                  <Sparkles className=\"w-4 h-4\" />
                                  OPTIMIZE NOW
                                </>
                              )}
                            </button>
                          </div>
                          {/* Download Buttons */}
                          {optimizationResult && (
                            <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\">
                              <h4 className=\"font-heading text-sm font-bold uppercase tracking-wider text-white mb-3\">
                                DOWNLOAD OPTIMIZED
                              </h4>
                              <div className=\"space-y-2\">
                                <button
                                  data-testid=\"download-pdf-button\"
                                  onClick={() => handleDownload(\"pdf\")}
                                  disabled={isDownloading}
                                  className=\"w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border-2 border-[#00FFFF] text-[#00FFFF] font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#00FFFF]/10 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all text-sm disabled:opacity-40\"
                                >
                                  <Download className=\"w-4 h-4\" />
                                  DOWNLOAD PDF
                                </button>
                                <button
                                  data-testid=\"download-docx-button\"
                                  onClick={() => handleDownload(\"docx\")}
                                  disabled={isDownloading}
                                  className=\"w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border-2 border-[#FFD700] text-[#FFD700] font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-[#FFD700]/10 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all text-sm disabled:opacity-40\"
                                >
                                  <FileText className=\"w-4 h-4\" />
                                  DOWNLOAD DOCX
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tabs Section */}
                      <Tabs value={activeTab} onValueChange={setActiveTab} className=\"w-full\">
                        <TabsList className=\"w-full bg-[#0a0a0a] border border-[#27272a] rounded-sm p-1 h-auto flex-wrap\" data-testid=\"results-tabs\">
                          <TabsTrigger
                            value=\"analysis\"
                            data-testid=\"tab-analysis\"
                            className=\"font-mono text-xs uppercase tracking-wider rounded-sm data-[state=active]:bg-[#00FF66] data-[state=active]:text-black px-4 py-2\"
                          >
                            Analysis
                          </TabsTrigger>
                          <TabsTrigger
                            value=\"keywords\"
                            data-testid=\"tab-keywords\"
                            className=\"font-mono text-xs uppercase tracking-wider rounded-sm data-[state=active]:bg-[#00FF66] data-[state=active]:text-black px-4 py-2\"
                          >
                            Keywords
                          </TabsTrigger>
                          <TabsTrigger
                            value=\"skillgap\"
                            data-testid=\"tab-skillgap\"
                            className=\"font-mono text-xs uppercase tracking-wider rounded-sm data-[state=active]:bg-[#00FF66] data-[state=active]:text-black px-4 py-2\"
                          >
                            Skill Gap
                          </TabsTrigger>
                          <TabsTrigger
                            value=\"optimized\"
                            data-testid=\"tab-optimized\"
                            className=\"font-mono text-xs uppercase tracking-wider rounded-sm data-[state=active]:bg-[#00FF66] data-[state=active]:text-black px-4 py-2\"
                          >
                            Optimized
                          </TabsTrigger>
                          <TabsTrigger
                            value=\"bullets\"
                            data-testid=\"tab-bullets\"
                            className=\"font-mono text-xs uppercase tracking-wider rounded-sm data-[state=active]:bg-[#00FF66] data-[state=active]:text-black px-4 py-2\"
                          >
                            Bullet Tool
                          </TabsTrigger>
                        </TabsList>

                        <div className=\"mt-6\">
                          <TabsContent value=\"analysis\">
                            <div className=\"bg-[#0a0a0a] border border-[#27272a] rounded-sm p-6\" data-testid=\"analysis-content\">
                              <h3 className=\"font-heading text-xl font-bold tracking-tight uppercase text-white mb-4\">
                                Recommendations
                              </h3>
                              {analysisResult?.recommendations?.length > 0 ? (
                                <div className=\"space-y-3\">
                                  {analysisResult.recommendations.map((rec, i) => (
                                    <div key={i} className=\"flex gap-3 p-3 bg-[#050505] border border-[#27272a] rounded-sm\">
                                      <Lightbulb className=\"w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5\" />
                                      <p className=\"text-sm text-slate-300\">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className=\"text-slate-500 text-sm\">Run analysis to see recommendations.</p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value=\"keywords\">
                            <MissingKeywords result={analysisResult} />
                          </TabsContent>

                          <TabsContent value=\"skillgap\">
                            <SkillGapPanel result={skillGapResult} />
                          </TabsContent>

                          <TabsContent value=\"optimized\">
                            <OptimizedResumeView result={optimizationResult} />
                          </TabsContent>

                          <TabsContent value=\"bullets\">
                            <BulletOptimizer jobDescription={jobDescription} />
                          </TabsContent>
                        </div>
                      </Tabs>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
"
Observation: Create successful: /app/frontend/src/components/Dashboard.js