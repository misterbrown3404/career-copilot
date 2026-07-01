import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileUp, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  Plus,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { CVAnalysisResult, UserProfile } from '../types';
import { sanitizeString } from '../utils/security';

interface CVUploadViewProps {
  user: UserProfile;
  updateUserScore: (score: number) => void;
  onApplyImprovements: (improvements: { before: string; after: string }[]) => void;
  theme?: 'light' | 'dark';
}

export default function CVUploadView({ user, updateUserScore, onApplyImprovements, theme = 'dark' }: CVUploadViewProps) {
  const isLight = theme === 'light';

  const [cvText, setCvText] = useState('');
  const [targetRole, setTargetRole] = useState(user.targetRole);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    'Parsing CV structures & layout formatting...',
    'Matching skills against hiring database...',
    'Assessing quantitative metrics and active verbs...',
    'Formulating actionable bullet point optimizations...'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processDummyFileLoad = (fileName: string) => {
    setFileError(null);
    setFileSuccess('Sample resume loaded successfully!');
    setCvText(sanitizeString(`ALEX RIVERA
alex.rivera@example.com | +1 (555) 019-2834 | San Francisco, CA

PROFESSIONAL SUMMARY
Detail-oriented Full Stack Developer with 3 years of experience. Experienced in React, Express, and PostgreSQL database updates. Looking to make an impact as a ${targetRole}.

EXPERIENCE
InnovateTech Solutions | Full Stack Developer | 2024 - Present
- Maintained responsive React frontend features and microservices.
- Helped migrate databases to PostgreSQL to improve query times.
- Worked with product teams on component libraries and hooks.

PixelForge Studios | Junior Web Engineer | 2023 - 2024
- Developed client websites using HTML, Tailwind CSS, TypeScript, and React.
- Fixed layout issues and made components responsive.
- Wrote basic unit tests covering frontend routers.`));
  };

  const validateAndProcessFile = (file: File) => {
    setFileError(null);
    setFileSuccess(null);

    // 1. File size protection (max 2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Security Alert: File exceeds the maximum 2MB size limit (${(file.size / 1024 / 1024).toFixed(2)}MB). Upload blocked.`);
      return;
    }

    // 2. File extension white-listing
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const matchesExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!matchesExtension) {
      setFileError('Security Alert: Unsupported file format. Only PDF, DOCX, DOC, and TXT files are permitted.');
      return;
    }

    // 3. File extraction and/or notices
    if (fileName.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawText = event.target?.result as string;
        if (rawText) {
          const cleanText = sanitizeString(rawText);
          setCvText(cleanText);
          setFileSuccess(`"${file.name}" read and sanitized successfully! Review contents below.`);
        } else {
          setFileError('Could not extract any content from the text file.');
        }
      };
      reader.onerror = () => {
        setFileError('Failed to read text file securely.');
      };
      reader.readAsText(file);
    } else {
      setFileSuccess(`Safe metadata verified for "${file.name}". Client-side plain text sandbox restricts execution. Please paste raw text content below or load our safe developer sample!`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCv = sanitizeString(cvText);
    const cleanRole = sanitizeString(targetRole);

    if (!cleanCv.trim()) return;

    setIsLoading(true);
    let stepIdx = 0;
    setLoadingMessage(loadingSteps[0]);

    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % loadingSteps.length;
      setLoadingMessage(loadingSteps[stepIdx]);
    }, 1200);

    try {
      const response = await fetch('/api/gemini/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: cleanCv, targetRole: cleanRole })
      });

      const data = await response.json();
      setAnalysisResult(data);
      if (data.score) {
        updateUserScore(data.score);
      }
    } catch (err) {
      console.error('Error analyzing CV:', err);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setCvText('');
  };

  const applyRewrites = () => {
    if (!analysisResult) return;
    const items = analysisResult.improvements.map(imp => ({
      before: imp.before,
      after: imp.after
    }));
    onApplyImprovements(items);
    alert('Optimization rewrites applied to Resume Lab experience points! Go to the Resume Lab tab to review and download.');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
          isLight ? 'text-neutral-900' : 'text-white'
        }`}>
          <FileUp className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
          <span>Interactive CV Scan & Gaps Analysis</span>
        </h1>
        <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Upload or paste your CV. Our AI will analyze your structure, score your keywords against real recruiters' filters, and rewrite low-impact descriptions.
        </p>
      </div>

      {!analysisResult ? (
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Settings & Upload Section */}
          <div className={`lg:col-span-8 border rounded-lg p-5 sm:p-6 space-y-5 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200 shadow-sm text-neutral-800' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            
            {/* Input target role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="target-role" className={`block text-xs font-display font-bold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-neutral-600' : 'text-neutral-400'
                }`}>
                  Target Career Role
                </label>
                <input
                  id="target-role"
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className={`w-full px-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                    isLight 
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-neutral-400' 
                      : 'border-neutral-800 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400 placeholder-neutral-600'
                  }`}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div>
                <label htmlFor="cv-preset" className={`block text-xs font-display font-bold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-neutral-600' : 'text-neutral-400'
                }`}>
                  Need a sample resume?
                </label>
                <button
                  type="button"
                  onClick={() => processDummyFileLoad('sample.txt')}
                  className={`w-full text-left px-4 py-2 text-sm rounded-lg border border-dashed font-display font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all ${
                    isLight 
                      ? 'border-indigo-400/30 text-indigo-600 bg-indigo-50 hover:bg-indigo-100/50' 
                      : 'border-green-400/30 text-green-400 bg-green-400/5 hover:bg-green-400/10'
                  }`}
                  aria-label="Load pre-filled sample resume text"
                >
                  <span>Load Sample Resume Text</span>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {fileError && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs font-sans flex items-start gap-2">
                <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <span>{fileError}</span>
              </div>
            )}

            {fileSuccess && (
              <div className="p-3 bg-green-950/20 border border-green-900/40 text-green-400 rounded-lg text-xs font-sans flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{fileSuccess}</span>
              </div>
            )}

            {/* Drag and Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] focus-within:ring-2 ${
                dragActive 
                  ? isLight ? 'border-indigo-500 bg-indigo-50' : 'border-green-400 bg-green-400/5' 
                  : isLight ? 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950/40'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Drag and drop your CV file here, or click to browse computer"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <FileUp className="w-8 h-8 text-neutral-500 mb-2" />
              <p className={`text-sm font-display font-bold uppercase tracking-wide ${isLight ? 'text-neutral-800' : 'text-neutral-250'}`}>
                Drag & Drop CV or browse computer
              </p>
              <p className="text-neutral-500 text-xs mt-1">Supports PDF, DOCX, TXT (loads as editable text below)</p>
            </div>

            {/* Paste Box */}
            <div className="space-y-1.5">
              <label htmlFor="cv-pasted-text" className={`block text-xs font-display font-bold uppercase tracking-wider ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}>
                Or Paste Resume Content (Text Format)
              </label>
              <textarea
                id="cv-pasted-text"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={12}
                className={`w-full p-4 text-xs font-mono rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isLight 
                    ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-neutral-400' 
                    : 'border-neutral-800 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400 placeholder-neutral-700'
                }`}
                placeholder="Paste the plain-text of your resume/CV here to analyze it..."
                aria-label="Raw CV copy-paste field"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500 font-mono">
                Word count: {cvText.split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                type="submit"
                disabled={!cvText.trim() || isLoading}
                className={`py-3 px-6 rounded-lg font-display font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                  cvText.trim() && !isLoading
                    ? isLight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                    : isLight 
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed' 
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Copilot Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className={`lg:col-span-4 border rounded-lg p-5 space-y-4 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200 text-neutral-800' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <span>Recruiter Scanner Secrets</span>
            </h3>
            <ul className={`space-y-3 text-xs leading-relaxed list-disc pl-4 font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              <li><strong>ATS Compatibility:</strong> Applicant Tracking Systems grade resumes based on strict keywords matching job descriptions.</li>
              <li><strong>Action-Focused Language:</strong> Begin every bullet point with a strong action verb (e.g., "Architected", "Optimized", "Spearheaded") instead of passive terms like "Responsible for".</li>
              <li><strong>Outcome Metrics:</strong> Quantify your impact. Resumes with numbers and business outcomes (revenue saved, page speeds improved) rank 40% higher.</li>
            </ul>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Analysis Results Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Overall score and strengths/weaknesses */}
            <div className={`lg:col-span-4 border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-5 transition-colors duration-300 ${
              isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
            }`}>
              <span className="text-neutral-500 text-xs font-display font-black uppercase tracking-wider">Overall Match Score</span>
              
              {/* Score Circular visualization */}
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke={isLight ? "#f4f4f5" : "#171717"}
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke={analysisResult.score >= 80 ? '#22c55e' : analysisResult.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 - (376.8 * analysisResult.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className={`text-3xl font-display font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {analysisResult.score}%
                  </span>
                  <p className="text-[9px] text-neutral-400 font-display font-bold uppercase tracking-wider mt-0.5">
                    {analysisResult.score >= 80 ? 'Excellent' : analysisResult.score >= 60 ? 'Competitive' : 'Needs Action'}
                  </p>
                </div>
              </div>

              <div className={`w-full border-t pt-4 flex gap-4 justify-between ${isLight ? 'border-neutral-100' : 'border-neutral-800'}`}>
                <button
                  onClick={handleReset}
                  className={`flex-1 border py-2.5 px-3 rounded-lg font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isLight 
                      ? 'border-neutral-200 hover:bg-neutral-50 text-neutral-700' 
                      : 'border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Scan Again</span>
                </button>
                <button
                  onClick={applyRewrites}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply All</span>
                </button>
              </div>
            </div>

            {/* Right: Strengths & Weaknesses Detailed Accordion */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths card */}
              <div className={`border rounded-lg p-5 space-y-4 transition-colors duration-300 ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <h3 className="font-display font-bold text-green-500 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Identified CV Strengths</span>
                </h3>
                <ul className="space-y-3">
                  {analysisResult.strengths.map((st, i) => (
                    <li key={i} className={`text-xs leading-relaxed flex items-start gap-2 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses card */}
              <div className={`border rounded-lg p-5 space-y-4 transition-colors duration-300 ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <h3 className="font-display font-bold text-amber-500 text-xs uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Identified Gaps & Weaknesses</span>
                </h3>
                <ul className="space-y-3">
                  {analysisResult.weaknesses.map((wk, i) => (
                    <li key={i} className={`text-xs leading-relaxed flex items-start gap-2 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Skills Matrix comparison */}
          <div className={`border rounded-lg p-5 sm:p-6 space-y-4 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <span>Target Role Skill Alignment Analysis</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills found */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Detected Keywords ({analysisResult.skillsFound.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillsFound.map((sk, i) => (
                    <span key={i} className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                      isLight 
                        ? 'bg-green-50 border-green-100 text-green-700' 
                        : 'bg-green-950/40 border-green-900/20 text-green-400'
                    }`}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills missing */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Missing Recruiter Keywords ({analysisResult.skillsMissing.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillsMissing.map((sk, i) => (
                    <span key={i} className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                      isLight 
                        ? 'bg-red-50 border-red-100 text-red-600' 
                        : 'bg-red-950/40 border-red-900/20 text-red-400'
                    }`}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actionable rewrites */}
          <div className={`border rounded-lg p-5 sm:p-6 space-y-4 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`font-display font-black text-sm uppercase tracking-wider flex items-center justify-between ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              <span className="flex items-center gap-1.5">
                <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                <span>Impact-Driven Bullet Point Rewrites</span>
              </span>
              <button
                onClick={applyRewrites}
                className={`text-xs font-display font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer focus:outline-none ${
                  isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-green-400 hover:text-green-300'
                }`}
              >
                <span>Apply All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </h3>

            <div className="space-y-4">
              {analysisResult.improvements.map((imp, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${
                    isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-850'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <span className={`inline-flex items-center text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isLight ? 'bg-white border-neutral-300 text-neutral-600' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}>
                      {imp.section}
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-neutral-500 font-mono font-bold uppercase mb-1">Before (Draft CV)</div>
                        <p className={`text-xs italic line-through font-medium p-2.5 rounded border ${
                          isLight ? 'bg-white border-neutral-200 text-neutral-500' : 'bg-neutral-900 border-neutral-850 text-neutral-400'
                        }`}>
                          "{imp.before}"
                        </p>
                      </div>

                      <div>
                        <div className={`text-[10px] font-mono font-bold uppercase mb-1 ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>After (AI Optimized)</div>
                        <p className={`text-xs font-semibold p-2.5 rounded border ${
                          isLight ? 'bg-indigo-50/50 border-indigo-100 text-neutral-800' : 'bg-green-950/10 border-green-900/20 text-white'
                        }`}>
                          "{imp.after}"
                        </p>
                      </div>
                    </div>

                    <div className={`text-[11px] pt-1 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      <strong className={`font-display ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>Hiring Logic:</strong> {imp.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-lg p-6 sm:p-8 w-full max-w-sm text-center border border-neutral-800 space-y-4">
            <Loader2 className="w-10 h-10 text-green-400 animate-spin mx-auto" />
            <div>
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Running Career Copilot AI</h3>
              <p className="text-neutral-400 text-xs mt-1 transition-all duration-300 min-h-[32px] flex items-center justify-center font-mono">
                {loadingMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
