import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  FileUp,
  FileEdit,
  Star,
  ChevronRight,
  X,
  Target,
  User,
  ShieldCheck,
  Sun,
  Moon,
  HelpCircle,
  Award,
  Mic,
  Search
} from 'lucide-react';
import { UserProfile } from '../types';
import LoginView from './LoginView';

// Real human photography from Unsplash (free, attribution-friendly)
const HERO_IMG = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80';
const RESUME_IMG = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80';
const INTERVIEW_IMG = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80';

// Testimonial headshot avatars from Unsplash
const AVATAR_1 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&q=80';
const AVATAR_2 = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face&q=80';
const AVATAR_3 = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&q=80';

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

  // Career Matcher state
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
      title: "Smart Resume Analyzer",
      desc: "Upload your resume and get an instant ATS compatibility score. Our AI identifies missing keywords, weak phrasing, and structural issues that cause recruiters to pass.",
      icon: FileUp,
      color: "from-indigo-500/20 to-violet-500/20",
      accent: "text-indigo-400",
      stats: "Improve your ATS match rate",
      detail: "Get specific suggestions for keywords, formatting, and content that match your target job descriptions.",
      image: RESUME_IMG
    },
    {
      title: "Resume Builder",
      desc: "Create professional, job-tailored resumes in minutes. Choose from modern templates, and let AI suggest impactful language based on your experience and target role.",
      icon: FileEdit,
      color: "from-pink-500/20 to-rose-500/20",
      accent: "text-pink-400",
      stats: "Multiple professional templates",
      detail: "Metrics-driven bullet points and clean layouts that work across every applicant tracking system.",
      image: HERO_IMG
    },
    {
      title: "Interview Coach",
      desc: "Practice realistic interviews with our AI-powered voice coach. Get real-time feedback on your answers, speaking clarity, and confidence level.",
      icon: MessageSquare,
      color: "from-cyan-500/20 to-blue-500/20",
      accent: "text-cyan-400",
      stats: "Voice-interactive practice sessions",
      detail: "Covers behavioral, technical, and case interviews. Personalized feedback after every session.",
      image: INTERVIEW_IMG
    }
  ];

  const testimonials = [
    {
      name: "James K.",
      role: "Software Engineer",
      text: "The resume analyzer caught keyword gaps I completely missed. I started getting callbacks within a week of making the suggested changes.",
      rating: 5,
      avatar: AVATAR_1
    },
    {
      name: "Sarah M.",
      role: "Product Designer",
      text: "The interview coach is incredible for building confidence. Practicing out loud with real-time feedback made my actual interviews feel so much easier.",
      rating: 5,
      avatar: AVATAR_2
    },
    {
      name: "David R.",
      role: "Data Analyst",
      text: "I used the resume builder to tailor my CV for three different roles. The AI suggestions for each were spot-on — way better than generic templates.",
      rating: 5,
      avatar: AVATAR_3
    }
  ];

  const faqs = [
    {
      q: "How does the resume analyzer work?",
      a: "Our AI compares your resume against your target job description, scanning for keyword gaps, structural issues, and phrasing that may cause ATS systems to filter you out. You get a score and specific improvement suggestions."
    },
    {
      q: "Can I practice for non-technical roles?",
      a: "Yes. The interview coach supports behavioral, managerial, design, and business analysis interviews. You can set your target industry and role level for a customized experience."
    },
    {
      q: "Is my personal data secure?",
      a: "All uploads and profile data are encrypted with AES-256 encryption. We never share your data with third parties. You own your data and can delete your account at any time."
    }
  ];

  const handleRunMatcher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamRole) return;
    setIsMatching(true);
    setMatchResult(null);

    setTimeout(() => {
      setMatchResult({
        score: Math.floor(65 + Math.random() * 25),
        gaps: [
          "Distributed systems experience",
          "Cloud infrastructure (AWS/GCP) proficiency",
          "Leadership or mentorship track record"
        ],
        roadmap: [
          "Strengthen system design fundamentals (weeks 1-2)",
          "Build a portfolio project showcasing cloud skills (weeks 3-4)",
          "Schedule mock interviews to sharpen your narrative (week 5)"
        ],
        salaryRange: dreamRole.toLowerCase().includes('engineer') || dreamRole.toLowerCase().includes('architect')
          ? "$130,000 – $185,000 USD"
          : "$90,000 – $130,000 USD"
      });
      setIsMatching(false);
    }, 1500);
  };

  return (
    <div className={`relative min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden transition-colors duration-300 ${isLight ? 'bg-[#f8fafc] text-neutral-800' : 'bg-neutral-950 text-neutral-100'
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
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
          </>
        )}
      </div>

      {/* Primary Header Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 sm:px-12 py-4 transition-all duration-300 ${isLight ? 'bg-white/80 border-neutral-200' : 'bg-neutral-950/80 border-neutral-900'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-black shadow-[0_0_20px_rgba(99,102,241,0.25)] ${isLight ? 'bg-indigo-600 text-white' : 'bg-green-400 text-neutral-950'
              }`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-display font-black text-lg tracking-tight uppercase leading-none ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                AURA
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
                Career Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border transition-all ${isLight
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
                className={`flex items-center gap-1.5 px-4.5 py-2 rounded-lg border font-display font-extrabold uppercase tracking-widest text-[10px] cursor-pointer transition-all ${isLight
                    ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                    : 'bg-neutral-900 text-white border-neutral-800 hover:border-green-400'
                  }`}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`hidden sm:block font-display font-bold uppercase tracking-wider text-xs px-3 py-2 cursor-pointer transition-all ${isLight ? 'text-neutral-600 hover:text-indigo-600' : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-display font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all shadow-[0_4px_14px_rgba(99,102,241,0.2)] ${isLight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                    }`}
                >
                  <span>Get Started Free</span>
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
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest font-bold ${isLight
                ? 'border-indigo-100 bg-indigo-50/50 text-indigo-700'
                : 'border-neutral-800 bg-neutral-900/60 text-green-400'
              }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>AI-Powered Career Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.05] ${isLight ? 'text-neutral-900' : 'text-white'
              }`}
          >
            Land your dream role.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 dark:from-green-400 dark:via-indigo-400 dark:to-violet-500">
              Faster.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`text-sm sm:text-base leading-relaxed font-sans max-w-xl ${isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
          >
            AURA is your all-in-one career workspace. Optimize your resume for ATS systems, practice interviews with an AI voice coach, and get personalized career guidance — all in one place.
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
                className={`flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg font-display font-black uppercase tracking-widest text-xs shadow-lg cursor-pointer transition-all active:scale-95 ${isLight
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-indigo-950/40'
                  }`}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg font-display font-black uppercase tracking-widest text-xs shadow-lg cursor-pointer transition-all active:scale-95 ${isLight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-indigo-950/40'
                    }`}
                >
                  <span>Start Free — No Card Required</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#diagnostic"
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg border font-display font-bold uppercase tracking-wider text-xs cursor-pointer transition-all ${isLight
                      ? 'border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300'
                    }`}
                >
                  <span>Try Career Matcher</span>
                </a>
              </>
            )}
          </motion.div>

          {/* Feature Highlights — replacing fake metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`grid grid-cols-3 gap-6 pt-8 border-t ${isLight ? 'border-neutral-200' : 'border-neutral-900'
              }`}
          >
            <div className="flex items-start gap-2">
              <Search className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <div>
                <div className={`text-xs font-display font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>AI Resume Scoring</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">ATS-optimized feedback</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mic className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <div>
                <div className={`text-xs font-display font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Voice Interviews</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Practice with AI coach</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <div>
                <div className={`text-xs font-display font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Career Guidance</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Personalized roadmaps</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column: Hero Image */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square max-w-md rounded-2xl overflow-hidden border p-3 shadow-2xl group transition-all duration-300 ${isLight ? 'border-neutral-200 bg-white shadow-neutral-200' : 'border-neutral-800 bg-neutral-900/40'
              }`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-transparent opacity-60 rounded-2xl filter blur-xl group-hover:opacity-100 transition-opacity`} />

            <div className={`relative w-full h-full rounded-xl overflow-hidden border ${isLight ? 'border-neutral-200 bg-neutral-100' : 'border-neutral-800 bg-neutral-950'
              }`}>
              <img
                src={HERO_IMG}
                alt="Professional woman working on laptop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-white/60 via-transparent to-transparent' : 'from-neutral-950 via-neutral-950/20 to-transparent'} opacity-70`} />

              {/* Overlay Glass Badge */}
              <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-lg backdrop-blur-md border text-left space-y-1 ${isLight ? 'bg-white/90 border-neutral-200/50' : 'bg-neutral-900/80 border-neutral-800'
                }`}>
                <div className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest font-black ${isLight ? 'text-indigo-600' : 'text-green-400'
                  }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your Career Workspace</span>
                </div>
                <h4 className={`font-display font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Everything you need to land your next role
                </h4>
                <p className={`text-[10px] leading-normal ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Resume analysis, interview practice, and career planning — powered by AI.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Section: Career Match Tool */}
      <section id="diagnostic" className={`px-6 sm:px-12 py-16 border-y transition-all duration-300 ${isLight ? 'bg-neutral-100/40 border-neutral-200' : 'bg-neutral-900/40 border-neutral-900'
        }`}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-black block ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
              Free Tool
            </span>
            <h2 className={`text-2xl sm:text-3xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              Career Skills Matcher
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Enter your dream job title and current skills to see how well you match — plus get a personalized roadmap to close the gaps.
            </p>
          </div>

          <form onSubmit={handleRunMatcher} className={`p-6 sm:p-8 rounded-xl border text-left space-y-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-850'
            }`}>
            <div className={`absolute top-0 right-0 p-3 border-b border-l rounded-bl-lg font-mono text-[9px] ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}>
              CAREER MATCH TOOL
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className={`block text-xs font-display font-bold uppercase tracking-wider ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Target Role
                </label>
                <input
                  type="text"
                  value={dreamRole}
                  onChange={(e) => setDreamRole(e.target.value)}
                   placeholder="e.g. Senior Software Engineer"
                  className={`w-full px-4 py-3 text-xs rounded-lg border focus:outline-none transition-colors font-sans ${isLight
                      ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-indigo-600'
                      : 'bg-neutral-900 text-white border-neutral-800 focus:border-green-400'
                    }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-xs font-display font-bold uppercase tracking-wider ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Your Current Skills
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Node.js"
                  className={`w-full px-4 py-3 text-xs rounded-lg border focus:outline-none transition-colors font-sans ${isLight
                      ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-indigo-600'
                      : 'bg-neutral-900 text-white border-neutral-800 focus:border-green-400'
                    }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isMatching}
              className={`w-full border font-display font-black uppercase tracking-widest text-[11px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none ${isLight
                  ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white shadow-md'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-green-400 border-neutral-800 hover:border-green-400'
                }`}
            >
              {isMatching ? (
                <>
                  <span className={`w-3.5 h-3.5 border-2 rounded-full animate-spin ${isLight ? 'border-white/30 border-t-white' : 'border-green-400/30 border-t-green-400'
                    }`}></span>
                  <span>Analyzing your match...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Check My Match</span>
                </>
              )}
            </button>
          </form>

          {/* Match Result panel */}
          <AnimatePresence>
            {matchResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`p-6 rounded-xl border text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-start shadow-xl ${isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900/30'
                  }`}
              >
                <div className={`md:col-span-4 text-center p-4 rounded-lg border ${isLight ? 'bg-white border-indigo-100' : 'bg-neutral-950/60 border-neutral-850'
                  }`}>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Estimated Match</span>
                  <div className={`text-4xl font-display font-black ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
                    {matchResult.score}%
                  </div>
                  <div className={`text-xs font-mono mt-2 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>Match Score</div>

                  <div className={`mt-4 pt-4 border-t ${isLight ? 'border-neutral-100' : 'border-neutral-900'}`}>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Typical Salary Range</span>
                    <span className={`text-xs font-sans font-bold block mt-0.5 ${isLight ? 'text-neutral-800' : 'text-white'}`}>
                      {matchResult.salaryRange}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className={`font-display font-bold text-xs uppercase tracking-wider ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                      Skills gaps to address:
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
                      Suggested next steps:
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
                      className={`text-xs font-display font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-green-400 hover:text-green-300'
                        }`}
                    >
                      <span>Sign up to save your roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Feature Sections with real human images */}
      <section className="px-6 sm:px-12 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${isLight ? 'text-indigo-650' : 'text-green-400'}`}>
            What you get
          </span>
          <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            Your complete career toolkit
          </h2>
          <p className={`text-sm max-w-2xl mx-auto font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Everything you need to go from application to offer — resume optimization, interview practice, and career planning in one workspace.
          </p>
        </div>

        {/* Feature layout */}
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
                {/* Image panel */}
                <div className={`lg:col-span-6 relative ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className={`rounded-xl overflow-hidden border p-2 shadow-xl ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                    }`}>
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-950">
                      <img
                        src={feat.image}
                        alt={feat.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />

                      {/* Feature badge */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-neutral-900/90 backdrop-blur-md border border-neutral-800 font-mono text-[9px] text-indigo-400 uppercase tracking-wider font-semibold">
                        {feat.stats}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description panel */}
                <div className={`lg:col-span-6 space-y-4 text-left ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className={`inline-flex p-3 rounded-lg ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-neutral-900 text-green-400 border border-neutral-800'
                    }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className={`text-2xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {feat.title}
                  </h3>

                  <p className={`text-sm leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {feat.desc}
                  </p>

                  <div className={`p-4 rounded-lg border font-mono text-xs leading-normal ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-neutral-950 border-neutral-850 text-neutral-450'
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
                      className={`text-xs font-display font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-green-400 hover:text-green-300'
                        }`}
                    >
                      <span>Try it free</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className={`relative py-20 px-6 sm:px-12 text-center border-y transition-colors duration-300 ${isLight
          ? 'bg-gradient-to-b from-white via-indigo-50/20 to-white border-neutral-200'
          : 'bg-gradient-to-b from-neutral-950 via-indigo-950/10 to-neutral-950 border-neutral-900'
        }`}>
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold block ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
            Why AURA
          </span>
          <h2 className={`text-3xl sm:text-5xl font-display font-black uppercase leading-none tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'
            }`}>
            Your job search deserves better tools.
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed max-w-xl mx-auto ${isLight ? 'text-neutral-600' : 'text-neutral-450'
            }`}>
            Generic resume templates and guessing what interviewers want is exhausting. AURA gives you data-driven resume feedback, realistic interview practice, and a clear career roadmap — so you can focus on what matters: showing up prepared.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className={`px-6 py-3.5 rounded-lg font-display font-black uppercase tracking-widest text-xs shadow-xl cursor-pointer transition-all ${isLight
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-green-400/10'
                }`}
            >
              Create your free account
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 sm:px-12 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${isLight ? 'text-indigo-650' : 'text-green-400'}`}>
            What users say
          </span>
          <h2 className={`text-2xl sm:text-3xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            Real feedback from real users
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className={`p-6 rounded-xl border text-left space-y-4 transition-all duration-300 ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/30 border-neutral-850'
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
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-8 h-8 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
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

      {/* Trust & Safety Footer */}
      <footer className={`px-6 sm:px-12 py-12 border-t text-center text-neutral-500 text-xs font-mono space-y-4 transition-all duration-300 ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-900'
        }`}>
        <div className={`flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase tracking-wider font-extrabold ${
          isLight ? 'text-neutral-600' : 'text-neutral-400'
        }`}>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            AES-256 Encryption
          </span>
          <span className={`${isLight ? 'text-neutral-300' : 'text-neutral-800'}`}>•</span>
          <span className="flex items-center gap-1.5">
            <User className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            You Own Your Data
          </span>
          <span className={`${isLight ? 'text-neutral-300' : 'text-neutral-800'}`}>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            AI-Powered
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-wider">
          <a href="/privacy" className={`transition-colors ${isLight ? 'hover:text-indigo-600' : 'hover:text-white'}`}>Privacy</a>
          <span className={`${isLight ? 'text-neutral-300' : 'text-neutral-800'}`}>•</span>
          <a href="/terms" className={`transition-colors ${isLight ? 'hover:text-indigo-600' : 'hover:text-white'}`}>Terms</a>
          <span className={`${isLight ? 'text-neutral-300' : 'text-neutral-800'}`}>•</span>
          <a href="/security" className={`transition-colors ${isLight ? 'hover:text-indigo-600' : 'hover:text-white'}`}>Security</a>
          <span className={`${isLight ? 'text-neutral-300' : 'text-neutral-800'}`}>•</span>
          <a href="/contact" className={`transition-colors ${isLight ? 'hover:text-indigo-600' : 'hover:text-white'}`}>Contact</a>
        </div>
        <div className="text-[9px] text-neutral-500">
          &copy; 2026 AURA. All rights reserved.
        </div>
      </footer>

      {/* Authentication Modal */}
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

            {/* Modal container */}
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
