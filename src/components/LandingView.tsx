import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Briefcase, 
  Zap, 
  CheckCircle2, 
  Terminal, 
  MessageSquare, 
  Map, 
  FileUp, 
  Users, 
  FileEdit, 
  Star, 
  ChevronRight, 
  X,
  Target,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Database,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';
import LoginView from './LoginView';
import resumeAnalysisImg from '../assets/images/resume_analysis_mockup_1782384475324.jpg';
import careerHeroImg from '../assets/images/career_hero_1782337380368.jpg';
import interviewCoachImg from '../assets/images/interview_coach_mockup_1782384458541.jpg';

interface LandingViewProps {
  onLogin: (profile: UserProfile, token?: string) => void;
  isLoggedIn: boolean;
  onNavigateToApp?: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  onShowForgotPassword?: () => void;
  onShowResetPassword?: () => void;
}

export default function LandingView({ onLogin, isLoggedIn, onNavigateToApp, theme = 'dark', toggleTheme, onShowForgotPassword, onShowResetPassword }: LandingViewProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  
  // Custom Interactive Micro-Tool: Career Ascension Matcher state
  const [dreamRole, setDreamRole] = useState('');
  const [skills, setSkills] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    score: number;
    gaps: string[];
    roadmap: string[];
    salaryRange: string;
  } | null>(null);

  const isLight = theme === 'light';

  const features = [
    {
      title: "AI CV Diagnostic & Parser",
      desc: "Instantly retrieve a deep analytical score aligned with current market demand, outlining exact keywords and structural tweaks to bypass corporate ATS systems.",
      icon: FileUp,
      color: "from-indigo-500/20 to-violet-500/20",
      accent: "text-indigo-400",
      stats: "Average score boost: +24%",
      detail: "Leverages deep semantic parses to optimize ATS compatibility and phrasing.",
      image: resumeAnalysisImg
    },
    {
      title: "The Resume Lab",
      desc: "Craft custom-tailored, job-specific resumes in minutes. Injects powerful metrics-driven language and professional print layouts.",
      icon: FileEdit,
      color: "from-pink-500/20 to-rose-500/20",
      accent: "text-pink-400",
      stats: "Resumes Built: 12,500+",
      detail: "Direct C-suite vocabulary injections and system print controls to secure your layout.",
      image: careerHeroImg
    },
    {
      title: "Audio-Interactive Coach",
      desc: "Rehearse realistic technical screens with an interactive, audio-guided mock session. Receive real-time assessment on clarity, confidence, and accuracy.",
      icon: MessageSquare,
      color: "from-cyan-500/20 to-blue-500/20",
      accent: "text-cyan-400",
      stats: "Confidence multiplier: 2.8x",
      detail: "Immediate feedback on posture, phrasing structure, and technical gaps.",
      image: interviewCoachImg
    }
  ];

  const testimonials = [
    {
      name: "Marcus Sterling",
      role: "Lead Cloud Architect at Vercel",
      text: "The Interview Coach helped me structure my system design answers flawlessly. It was almost surreal how much better prepared I felt.",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "Elena Rostova",
      role: "Senior Product Designer at Figma",
      text: "The CV optimization matches are brilliant. I secured 4 interviews within a single week after applying the AI alignment suggestions.",
      rating: 5,
      avatar: "ER"
    },
    {
      name: "Devon Carter",
      role: "Staff AI Engineer at Anthropic",
      text: "Having the mentor chat critique my technical growth objectives is like having an executive career sponsor on speed dial.",
      rating: 5,
      avatar: "DC"
    }
  ];

  const faqs = [
    {
      q: "How does the AI alignment scanner work?",
      a: "Our advanced algorithm maps your resume against thousands of high-paying tech openings, scanning for specific keyword gaps, core phrasing patterns, and technical articulation quality."
    },
    {
      q: "Can I practice for non-technical roles?",
      a: "Absolutely. The Interview Coach and Career Mentors are fully customized. You can set your target industry to anything from design, management, business analysis, to software architecture."
    },
    {
      q: "Is my personal data encrypted?",
      a: "Yes. All uploads, notes, and profile details are completely sandboxed and encrypted using industry-standard AES-256 protocols, with full data ownership guaranteed."
    }
  ];

  const handleRunMatcher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamRole) return;
    setIsMatching(true);
    setMatchResult(null);

    setTimeout(() => {
      // Simulate career match calculation
      setMatchResult({
        score: Math.floor(65 + Math.random() * 25),
        gaps: [
          "Distributed systems telemetry architecture",
          "Advanced edge cache strategies & CQRS design patterns",
          "High-throughput event logs (Kafka/Redpanda) synchronization"
        ],
        roadmap: [
          "Complete System Design Fundamentals (weeks 1-2)",
          "Deploy high-performance Golang backend with Redis layer (weeks 3-4)",
          "Initiate deep system profiling mock interviews (week 5)"
        ],
        salaryRange: dreamRole.toLowerCase().includes('engineer') || dreamRole.toLowerCase().includes('architect') 
          ? "$145,000 - $190,000 USD" 
          : "$95,000 - $135,000 USD"
      });
      setIsMatching(false);
    }, 1500);
  };

  return (
    <div className={`relative min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden transition-colors duration-300 ${
      isLight ? 'bg-[#f8fafc] text-neutral-800' : 'bg-neutral-950 text-neutral-100'
    }`}>
      
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isLight ? (
          <>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-65" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
          </>
        )}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${isLight ? 'bg-indigo-500/10' : 'bg-indigo-400/20'}`}
            style={{
              width: Math.random() * 3 + 2,
              height: Math.random() * 3 + 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Primary Header Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 sm:px-12 py-4 transition-all duration-300 ${
        isLight ? 'bg-white/80 border-neutral-200' : 'bg-neutral-950/80 border-neutral-900'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-black shadow-[0_0_20px_rgba(99,102,241,0.25)] ${
              isLight ? 'bg-indigo-600 text-white' : 'bg-green-400 text-neutral-950'
            }`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`font-display font-black text-lg tracking-tight uppercase leading-none ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                 AURA AI
              </h1>
              <span className={`text-[9px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
                The AURA AI Job Copilot
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border transition-all ${
                  isLight 
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700' 
                    : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-300'
                } cursor-pointer`}
                title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              </button>
            )}

            {isLoggedIn ? (
              <button
                onClick={onNavigateToApp}
                className={`flex items-center gap-1.5 px-4.5 py-2 rounded-lg border font-display font-extrabold uppercase tracking-widest text-[10px] cursor-pointer transition-all ${
                  isLight
                    ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                    : 'bg-neutral-900 text-white border-neutral-800 hover:border-green-400'
                }`}
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`hidden sm:block font-display font-bold uppercase tracking-wider text-xs px-3 py-2 cursor-pointer transition-all ${
                    isLight ? 'text-neutral-600 hover:text-indigo-600' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-display font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all shadow-[0_4px_14px_rgba(99,102,241,0.2)] ${
                    isLight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                  }`}
                >
                  <span>Get Started</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Content Section */}
      <section className="relative px-6 sm:px-12 py-16 lg:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column copywriting */}
        <div className="lg:col-span-7 space-y-6 z-10 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest font-bold ${
              isLight 
                ? 'border-indigo-100 bg-indigo-50/50 text-indigo-700' 
                : 'border-neutral-800 bg-neutral-900/60 text-green-400'
            }`}
          >
            <Terminal className="w-3 h-3 animate-pulse text-indigo-500" />
            <span>AI CORE PROTOCOL ONLINE V3.5</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.05] uppercase ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}
          >
            Escape the dry job search.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 dark:from-green-400 dark:via-indigo-400 dark:to-violet-500">
              Ascend your potential.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`text-sm sm:text-base leading-relaxed font-sans max-w-xl ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            AURA AI is a curated, full-stack predictive career sandbox. Redesign your CV, orchestrate interactive voice-coached mock interviews, track live aggregates, and chat directly with specialized career mentors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            {isLoggedIn ? (
              <button
                onClick={onNavigateToApp}
                className={`flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg font-display font-black uppercase tracking-widest text-xs shadow-lg cursor-pointer transition-all active:scale-95 ${
                  isLight
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-indigo-950/40'
                }`}
              >
                <span>Launch Career Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg font-display font-black uppercase tracking-widest text-xs shadow-lg cursor-pointer transition-all active:scale-95 ${
                    isLight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-indigo-950/40'
                  }`}
                >
                  <span>Build Free Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#diagnostic"
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg border font-display font-bold uppercase tracking-wider text-xs cursor-pointer transition-all ${
                    isLight
                      ? 'border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <span>Try Diagnostic Matcher</span>
                </a>
              </>
            )}
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`grid grid-cols-3 gap-6 pt-8 border-t ${
              isLight ? 'border-neutral-200' : 'border-neutral-900'
            }`}
          >
            <div>
              <div className={`text-xl sm:text-2xl font-display font-black ${isLight ? 'text-indigo-650' : 'text-white'}`}>93.4%</div>
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">Interview Match Score</div>
            </div>
            <div>
              <div className={`text-xl sm:text-2xl font-display font-black ${isLight ? 'text-indigo-650' : 'text-white'}`}>1.8M+</div>
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">AI Tokens Synced</div>
            </div>
            <div>
              <div className={`text-xl sm:text-2xl font-display font-black ${isLight ? 'text-indigo-650' : 'text-white'}`}>100%</div>
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">Secure Cloud Space</div>
            </div>
          </motion.div>
        </div>

        {/* Right column: Generated Hero Image Frame */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square max-w-md rounded-2xl overflow-hidden border p-3 shadow-2xl group transition-all duration-300 ${
              isLight ? 'border-neutral-200 bg-white shadow-neutral-200' : 'border-neutral-800 bg-neutral-900/40'
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-transparent opacity-60 rounded-2xl filter blur-xl group-hover:opacity-100 transition-opacity`} />

            <div className={`relative w-full h-full rounded-xl overflow-hidden border bg-neutral-950 ${
              isLight ? 'border-neutral-200' : 'border-neutral-800'
            }`}>
              <img 
                src={careerHeroImg} 
                alt="Futuristic Escapist Career Guidance" 
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90" />
              
              {/* Overlay Glass Badge */}
              <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-lg backdrop-blur-md border text-left space-y-1 ${
                isLight ? 'bg-white/90 border-neutral-200/50' : 'bg-neutral-900/80 border-neutral-800'
              }`}>
                <div className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest font-black ${
                  isLight ? 'text-indigo-600' : 'text-green-400'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Interactive System Preview</span>
                </div>
                <h4 className={`font-display font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Your Personal AURA AI
                </h4>
                <p className={`text-[10px] leading-normal ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Traces robust development routes across complex technical domain spheres automatically.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Section: Dynamic Career Alignment Matcher Mini-Tool */}
      <section id="diagnostic" className={`px-6 sm:px-12 py-16 border-y transition-all duration-300 ${
        isLight ? 'bg-neutral-100/40 border-neutral-200' : 'bg-neutral-900/40 border-neutral-900'
      }`}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-black block ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
              Check Alignment
            </span>
            <h2 className={`text-2xl sm:text-3xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              AI Skills Articulation Diagnostic
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Input your dream profession and current primary skills to preview our custom alignment logic and generate immediate developmental steps.
            </p>
          </div>

          <form onSubmit={handleRunMatcher} className={`p-6 sm:p-8 rounded-xl border text-left space-y-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-850'
          }`}>
            <div className={`absolute top-0 right-0 p-3 border-b border-l rounded-bl-lg font-mono text-[9px] ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}>
              DIAGNOSTIC-ALGO V4.5
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className={`block text-xs font-display font-bold uppercase tracking-wider ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Target Dream Position
                </label>
                <input 
                  type="text" 
                  value={dreamRole}
                  onChange={(e) => setDreamRole(e.target.value)}
                  placeholder="e.g. Staff AI Systems Engineer"
                  className={`w-full px-4 py-3 text-xs rounded-lg border focus:outline-none transition-colors font-sans ${
                    isLight 
                      ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-indigo-600' 
                      : 'bg-neutral-900 text-white border-neutral-800 focus:border-green-400'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-xs font-display font-bold uppercase tracking-wider ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Current Strongest Skill sets
                </label>
                <input 
                  type="text" 
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Typescript, basic Go routing"
                  className={`w-full px-4 py-3 text-xs rounded-lg border focus:outline-none transition-colors font-sans ${
                    isLight 
                      ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-indigo-600' 
                      : 'bg-neutral-900 text-white border-neutral-800 focus:border-green-400'
                  }`}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isMatching}
              className={`w-full border font-display font-black uppercase tracking-widest text-[11px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none ${
                isLight
                  ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white shadow-md'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-green-400 border-neutral-800 hover:border-green-400'
              }`}
            >
              {isMatching ? (
                <>
                  <span className={`w-3.5 h-3.5 border-2 rounded-full animate-spin ${
                    isLight ? 'border-white/30 border-t-white' : 'border-green-400/30 border-t-green-400'
                  }`}></span>
                  <span>Aligning Synaptic Pathways...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Execute Diagnostic Analysis</span>
                </>
              )}
            </button>
          </form>

          {/* Diagnostic Match Result panel */}
          <AnimatePresence>
            {matchResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`p-6 rounded-xl border text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-start shadow-xl ${
                  isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900/30'
                }`}
              >
                <div className={`md:col-span-4 text-center p-4 rounded-lg border ${
                  isLight ? 'bg-white border-indigo-100' : 'bg-neutral-950/60 border-neutral-850'
                }`}>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Estimated Competency</span>
                  <div className={`text-4xl font-display font-black ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
                    {matchResult.score}%
                  </div>
                  <div className={`text-xs font-mono mt-2 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>AI Alignment Match</div>
                  
                  <div className={`mt-4 pt-4 border-t ${isLight ? 'border-neutral-100' : 'border-neutral-900'}`}>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Est. Market Salary</span>
                    <span className={`text-xs font-sans font-bold block mt-0.5 ${isLight ? 'text-neutral-800' : 'text-white'}`}>
                      {matchResult.salaryRange}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className={`font-display font-bold text-xs uppercase tracking-wider ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                      Critical Articulation Gaps Identified:
                    </h4>
                    <ul className="space-y-1 text-xs font-mono">
                      {matchResult.gaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={isLight ? 'text-indigo-600' : 'text-rose-400'}>▵</span>
                          <span className={isLight ? 'text-neutral-700' : 'text-neutral-400'}>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-indigo-100' : 'border-neutral-900'}`}>
                    <h4 className={`font-display font-bold text-xs uppercase tracking-wider ${isLight ? 'text-emerald-700' : 'text-green-400'}`}>
                      Recommended Stage Roadmap:
                    </h4>
                    <ul className="space-y-1 text-xs">
                      {matchResult.roadmap.map((step, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                          <span className={isLight ? 'text-neutral-700' : 'text-neutral-300'}>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3">
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className={`text-xs font-display font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                        isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      <span>Unlock Full Suite & Save Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Feature Bento Grid with actual generated images */}
      <section className="px-6 sm:px-12 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${isLight ? 'text-indigo-650' : 'text-green-400'}`}>
            Comprehensive Core
          </span>
          <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            Modular Copilot Modules
          </h2>
          <p className={`text-sm max-w-2xl mx-auto font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Explore our custom structural modules, featuring high-fidelity integrations to navigate and conquer high-growth tech positions.
          </p>
        </div>

        {/* Modular Layout with detailed side-by-side structures */}
        <div className="space-y-16">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
              >
                {/* Visual mockup card panel */}
                <div className={`lg:col-span-6 relative ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className={`rounded-xl overflow-hidden border p-2 shadow-xl ${
                    isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                  }`}>
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-950">
                      <img 
                        src={feat.image} 
                        alt={feat.title} 
                        className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                      
                      {/* Interactive Float badge */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-neutral-900/90 backdrop-blur-md border border-neutral-800 font-mono text-[9px] text-indigo-400 uppercase tracking-wider font-semibold">
                        {feat.stats}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description copy panel */}
                <div className={`lg:col-span-6 space-y-4 text-left ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className={`inline-flex p-3 rounded-lg ${
                    isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-neutral-900 text-green-400 border border-neutral-800'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className={`text-2xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {feat.title}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {feat.desc}
                  </p>

                  <div className={`p-4 rounded-lg border font-mono text-xs leading-normal ${
                    isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-neutral-950 border-neutral-850 text-neutral-450'
                  }`}>
                    {feat.detail}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (isLoggedIn && onNavigateToApp) {
                          onNavigateToApp();
                        } else {
                          setShowAuthModal(true);
                        }
                      }}
                      className={`text-xs font-display font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${
                        isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      <span>Unlock Module</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Escapist Interactive Parallax Statement Section */}
      <section className={`relative py-20 px-6 sm:px-12 text-center border-y transition-colors duration-300 ${
        isLight 
          ? 'bg-gradient-to-b from-white via-indigo-50/20 to-white border-neutral-200' 
          : 'bg-gradient-to-b from-neutral-950 via-indigo-950/10 to-neutral-950 border-neutral-900'
      }`}>
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold block ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
            Our Core Philosophy
          </span>
          <h2 className={`text-3xl sm:text-5xl font-display font-black uppercase leading-none tracking-tight ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>
            Stop searching. Start aligning.
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed max-w-xl mx-auto ${
            isLight ? 'text-neutral-600' : 'text-neutral-450'
          }`}>
            The traditional resume submission funnel is broken. High-growth environments filter for advanced contextual clarity and dynamic engineering poise. AURA AI prepares you precisely for the high-end nexus of the market.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className={`px-6 py-3.5 rounded-lg font-display font-black uppercase tracking-widest text-xs shadow-xl cursor-pointer transition-all ${
                isLight
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-green-400/10'
              }`}
            >
              Initialize Profile Creation
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 sm:px-12 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${isLight ? 'text-indigo-650' : 'text-green-400'}`}>
            Social Verification
          </span>
          <h2 className={`text-2xl sm:text-3xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            Approved by Architects
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className={`p-6 rounded-xl border text-left space-y-4 transition-all duration-300 ${
              isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/30 border-neutral-850'
            }`}>
              <div className="flex items-center gap-1">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 fill-current ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                ))}
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                "{test.text}"
              </p>
              
              <div className={`flex items-center gap-3 pt-3 border-t ${isLight ? 'border-neutral-100' : 'border-neutral-900'}`}>
                <div className={`w-8 h-8 rounded-lg text-white font-display font-bold text-xs flex items-center justify-center ${
                  isLight ? 'bg-indigo-100 text-indigo-750' : 'bg-neutral-850'
                }`}>
                  {test.avatar}
                </div>
                <div>
                  <h4 className={`font-display font-extrabold text-xs uppercase tracking-wide leading-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {test.name}
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-500">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`px-6 sm:px-12 py-16 border-t ${isLight ? 'bg-neutral-100/35 border-neutral-200' : 'bg-neutral-900/10 border-neutral-900'}`}>
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${isLight ? 'text-indigo-650' : 'text-green-400'}`}>
              Help & Information
            </span>
            <h2 className={`text-2xl sm:text-3xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className={`font-display font-bold text-sm uppercase tracking-wide leading-snug ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  {faq.q}
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-450'}`}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Badges Footer */}
      <footer className={`px-6 sm:px-12 py-12 border-t text-center text-neutral-500 text-xs font-mono space-y-4 transition-all duration-300 ${
        isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-900'
      }`}>
        <div className={`flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase tracking-wider font-extrabold ${
          isLight ? 'text-neutral-600' : 'text-neutral-400'
        }`}>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} /> 
            AES-256 Encryption
          </span>
          <span className="text-neutral-400 dark:text-neutral-800">•</span>
          <span className="flex items-center gap-1.5">
            <User className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} /> 
            Sovereign Data Ownership
          </span>
          <span className="text-neutral-400 dark:text-neutral-800">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} /> 
            Server-Side AI
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-wider">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <span className="text-neutral-400 dark:text-neutral-800">•</span>
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          <span className="text-neutral-400 dark:text-neutral-800">•</span>
          <a href="/security" className="hover:text-white transition-colors">Security</a>
          <span className="text-neutral-400 dark:text-neutral-800">•</span>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="text-[9px] text-neutral-500">
          &copy; 2026 AURA AI. ALL DEVELOPMENT SYSTEM STAGE PROTOCOLS REGISTERED IN CONTAINER WORKSPACE PORT 3000.
        </div>
      </footer>

      {/* Authentication Slide-In modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
            />

            {/* Modal container content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg z-10 animate-fadeIn my-4"
            >
              {/* Dismiss button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-1 rounded-full border border-neutral-850 bg-neutral-950 text-neutral-400 hover:text-white cursor-pointer z-20 focus:outline-none transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Login/Register Panel */}
              <LoginView 
                isModal={true}
                onLogin={(profile, token) => {
                  onLogin(profile, token);
                  setShowAuthModal(false);
                }}
                onForgotPassword={() => {
                  setShowAuthModal(false);
                  onShowForgotPassword?.();
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
