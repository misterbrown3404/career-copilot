import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  ShieldAlert,
  X,
  FileBadge
} from 'lucide-react';
import { CVAnalysisResult, UserProfile } from '../types';
import { sanitizeString } from '../utils/security';
import AIErrorDialog from './AIErrorDialog';

interface CVUploadViewProps {
  user: UserProfile;
  updateUserScore: (score: number) => void;
  onApplyImprovements: (improvements: { before: string; after: string }[]) => void;
  theme?: 'light' | 'dark';
}

type UploadState = 'idle' | 'selected' | 'parsing' | 'analyzing' | 'done' | 'error';

export default function CVUploadView({ user, updateUserScore, onApplyImprovements, theme = 'dark' }: CVUploadViewProps) {
  const isLight = theme === 'light';

  const [targetRole, setTargetRole] = useState(user.targetRole);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXTS = ['.pdf', '.doc', '.docx'];
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const MAX_SIZE = 10 * 1024 * 1024;

  const loadingSteps = [
    'Extracting text from your CV file...',
    'Parsing skills and experience sections...',
    'Matching keywords against recruiter filters...',
    'Generating actionable improvement suggestions...'
  ];

  const validateFile = (file: File): string | null => {
    const nameParts = file.name.split('.');
    const ext = '.' + (nameParts.pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) return 'Unsupported format. Please upload a PDF or DOCX file.';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Unsupported file type. Only PDF and DOCX files are accepted.';
    if (file.size > MAX_SIZE) return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`;
    return null;
  };

  const handleFileSelect = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setSelectedFile(null);
      setUploadState('error');
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
    setUploadState('selected');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setUploadState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadState('parsing');
    setErrorMessage(null);
    let stepIdx = 0;
    setLoadingMessage(loadingSteps[0]);

    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % loadingSteps.length;
      setLoadingMessage(loadingSteps[stepIdx]);
    }, 1800);

    try {
      const formData = new FormData();
      formData.append('cv', selectedFile);
      formData.append('targetRole', sanitizeString(targetRole));

      setUploadState('analyzing');

      const response = await fetch('/api/gemini/analyze-cv-file', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed. Please try again.');
      }
      setAnalysisResult(data);
      if (data.score) updateUserScore(data.score);
      setUploadState('done');
    } catch (err: any) {
      console.error('Error analyzing CV:', err);
      setAiError(err.message || 'An unexpected error occurred. Please try again.');
      setLastAction(() => () => handleAnalyze(e));
      setUploadState('error');
    } finally {
      clearInterval(interval);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSelectedFile(null);
    setUploadState('idle');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyRewrites = () => {
    if (!analysisResult) return;
    const items = analysisResult.improvements.map(imp => ({
      before: imp.before,
      after: imp.after
    }));
    onApplyImprovements(items);
    alert('Optimization rewrites applied to Resume Lab! Go to the Resume Lab tab to review and download.');
  };

  const isLoading = uploadState === 'parsing' || uploadState === 'analyzing';
  const fileExt = selectedFile ? (selectedFile.name.split('.').pop() || '').toUpperCase() : '';
  const showDropzone = uploadState === 'idle' || uploadState === 'error';

  return (
    <div className="space-y-6">
      <AIErrorDialog
        open={!!aiError}
        message={aiError || ''}
        onClose={() => setAiError(null)}
        onRetry={lastAction ?? undefined}
        theme={theme}
      />
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
          isLight ? 'text-neutral-900' : 'text-white'
        }`}>
          <FileUp className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
          <span>CV Scan &amp; Gaps Analysis</span>
        </h1>
        <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Upload your CV as a PDF or DOCX. We extract the text, score your keywords against real recruiter filters, and rewrite low-impact bullet points.
        </p>
      </div>

      {!analysisResult ? (
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main panel */}
          <div className={`lg:col-span-8 border rounded-lg p-5 sm:p-6 space-y-5 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200 shadow-sm text-neutral-800' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>

            {/* Target role */}
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
                className={`w-full px-4 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isLight
                    ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-neutral-400'
                    : 'border-neutral-800 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400 placeholder-neutral-600'
                }`}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>

            {/* Error message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  key="error-msg"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs font-sans flex items-start gap-2"
                >
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dropzone or file preview */}
            {showDropzone ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                aria-label="Drag and drop your CV file here, or click to browse"
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] focus-visible:ring-2 ${
                  dragActive
                    ? isLight ? 'border-indigo-500 bg-indigo-50' : 'border-green-400 bg-green-400/5'
                    : isLight
                      ? 'border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50/70'
                      : 'border-neutral-700 hover:border-green-500/60 hover:bg-neutral-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                />
                <motion.div animate={dragActive ? { scale: 1.15 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <FileUp className={`w-12 h-12 mb-3 ${isLight ? 'text-indigo-400' : 'text-green-500'}`} />
                </motion.div>
                <p className={`text-sm font-display font-bold uppercase tracking-wide ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                  {dragActive ? 'Drop your CV here' : 'Drag & Drop your CV'}
                </p>
                <p className={`text-xs mt-1.5 ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  or{' '}
                  <span className={`underline underline-offset-2 ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
                    click to browse files
                  </span>
                </p>
                <p className="text-neutral-500 text-[11px] mt-3 font-mono">PDF · DOCX · Max 10 MB</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  key="file-selected"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`border-2 rounded-xl p-6 flex items-center gap-4 ${
                    isLight ? 'border-indigo-200 bg-indigo-50/60' : 'border-green-500/30 bg-green-400/5'
                  }`}
                >
                  <div className={`p-3 rounded-xl flex-shrink-0 ${isLight ? 'bg-indigo-100' : 'bg-green-400/10'}`}>
                    <FileBadge className={`w-8 h-8 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-display font-bold truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      {selectedFile?.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {fileExt} · {((selectedFile?.size || 0) / 1024).toFixed(0)} KB · Ready to analyze
                    </p>
                  </div>
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-indigo-100 text-neutral-400 hover:text-neutral-700' : 'hover:bg-neutral-800 text-neutral-500 hover:text-white'
                      }`}
                      aria-label="Remove selected file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Submit row */}
            <div className="flex items-center justify-between pt-1">
              <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {selectedFile ? `${fileExt} file ready` : 'No file selected'}
              </span>
              <button
                type="submit"
                disabled={!selectedFile || isLoading}
                className={`py-3 px-6 rounded-lg font-display font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 transition-all active:scale-[0.98] ${
                  selectedFile && !isLoading
                    ? isLight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer'
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950 cursor-pointer'
                    : isLight
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadState === 'parsing' ? 'Parsing...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze CV</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar tips */}
          <div className={`lg:col-span-4 border rounded-lg p-5 space-y-4 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200 text-neutral-800' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <span>Recruiter Scanner Tips</span>
            </h3>
            <ul className={`space-y-3 text-xs leading-relaxed list-disc pl-4 font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              <li><strong>ATS Compatibility:</strong> Applicant Tracking Systems grade resumes based on strict keyword matching against job descriptions.</li>
              <li><strong>Action Language:</strong> Begin every bullet with a strong verb (e.g., "Architected", "Reduced") instead of passive phrases like "Responsible for".</li>
              <li><strong>Quantified Impact:</strong> Resumes with measurable outcomes rank significantly higher in recruiter reviews.</li>
              <li><strong>File Format:</strong> Use text-based PDFs or DOCX. Scanned image-only PDFs cannot be parsed.</li>
            </ul>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Score panel */}
            <div className={`lg:col-span-4 border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-5 transition-colors duration-300 ${
              isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
            }`}>
              <span className="text-neutral-500 text-xs font-display font-black uppercase tracking-wider">Overall Match Score</span>

              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke={isLight ? '#f4f4f5' : '#171717'} strokeWidth="12" fill="transparent" />
                  <circle
                    cx="72" cy="72" r="60"
                    stroke={analysisResult.score >= 80 ? '#22c55e' : analysisResult.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12" fill="transparent"
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

              <div className={`w-full border-t pt-4 flex gap-3 justify-between ${isLight ? 'border-neutral-100' : 'border-neutral-800'}`}>
                <button
                  onClick={handleReset}
                  className={`flex-1 border py-2.5 px-3 rounded-lg font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isLight ? 'border-neutral-200 hover:bg-neutral-50 text-neutral-700' : 'border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                  <span>New Scan</span>
                </button>
                <button
                  onClick={applyRewrites}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isLight ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply All</span>
                </button>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded-lg p-5 space-y-4 transition-colors duration-300 ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <h3 className="font-display font-bold text-green-500 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Identified Strengths</span>
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

              <div className={`border rounded-lg p-5 space-y-4 transition-colors duration-300 ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <h3 className="font-display font-bold text-amber-500 text-xs uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Gaps &amp; Weaknesses</span>
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

          {/* Skills Matrix */}
          <div className={`border rounded-lg p-5 sm:p-6 space-y-4 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <span>Skill Alignment Analysis</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Detected Keywords ({analysisResult.skillsFound.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillsFound.map((sk, i) => (
                    <span key={i} className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                      isLight ? 'bg-green-50 border-green-100 text-green-700' : 'bg-green-950/40 border-green-900/20 text-green-400'
                    }`}>{sk}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Missing Keywords ({analysisResult.skillsMissing.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillsMissing.map((sk, i) => (
                    <span key={i} className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                      isLight ? 'bg-red-50 border-red-100 text-red-600' : 'bg-red-950/40 border-red-900/20 text-red-400'
                    }`}>{sk}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bullet Rewrites */}
          <div className={`border rounded-lg p-5 sm:p-6 space-y-4 transition-colors duration-300 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`font-display font-black text-sm uppercase tracking-wider flex items-center justify-between ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              <span className="flex items-center gap-1.5">
                <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                <span>Impact-Driven Bullet Rewrites</span>
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
                    }`}>{imp.section}</span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-neutral-500 font-mono font-bold uppercase mb-1">Before</div>
                        <p className={`text-xs italic line-through font-medium p-2.5 rounded border ${
                          isLight ? 'bg-white border-neutral-200 text-neutral-500' : 'bg-neutral-900 border-neutral-850 text-neutral-400'
                        }`}>"{imp.before}"</p>
                      </div>
                      <div>
                        <div className={`text-[10px] font-mono font-bold uppercase mb-1 ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>After (Optimized)</div>
                        <p className={`text-xs font-semibold p-2.5 rounded border ${
                          isLight ? 'bg-indigo-50/50 border-indigo-100 text-neutral-800' : 'bg-green-950/10 border-green-900/20 text-white'
                        }`}>"{imp.after}"</p>
                      </div>
                    </div>

                    <div className={`text-[11px] pt-1 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      <strong className={`font-display ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>Why:</strong> {imp.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-xl p-6 sm:p-8 w-full max-w-sm text-center border border-neutral-800 space-y-4">
            <Loader2 className="w-10 h-10 text-green-400 animate-spin mx-auto" />
            <div>
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">
                {uploadState === 'parsing' ? 'Extracting CV Content' : 'Running AI Analysis'}
              </h3>
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
