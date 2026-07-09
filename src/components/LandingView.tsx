import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import LoginView from './LoginView';

const HERO_IMG = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=85';
const RESUME_IMG = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80';
const INTERVIEW_IMG = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80';

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
  onFooterNav?: (page: 'privacy' | 'terms' | 'security' | 'contact') => void;
}

export default function LandingView({ onLogin, isLoggedIn, onNavigateToApp, theme = 'dark', toggleTheme, onShowForgotPassword, onShowResetPassword, onFooterNav }: LandingViewProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dreamRole, setDreamRole] = useState('');
  const [skills, setSkills] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{ score: number; gaps: string[]; roadmap: string[]; salaryRange: string } | null>(null);

  const isLight = theme === 'light';
  const bg = isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-white';
  const border = isLight ? 'border-neutral-200' : 'border-neutral-800';
  const muted = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const subtle = isLight ? 'bg-neutral-50' : 'bg-neutral-900';
  const accent = isLight ? 'text-indigo-600' : 'text-indigo-400';
  const accentBg = isLight ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white';
  const accentBorder = isLight ? 'border-indigo-600' : 'border-indigo-500';

  const handleRunMatcher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamRole) return;
    setIsMatching(true);
    setMatchResult(null);
    setTimeout(() => {
      setMatchResult({
        score: Math.floor(65 + Math.random() * 25),
        gaps: ['Distributed systems experience', 'Cloud infrastructure (AWS/GCP)', 'Leadership track record'],
        roadmap: ['Strengthen system design fundamentals (weeks 1–2)', 'Build a cloud portfolio project (weeks 3–4)', 'Schedule mock interviews (week 5)'],
        salaryRange: dreamRole.toLowerCase().includes('engineer') || dreamRole.toLowerCase().includes('architect') ? '$130,000 – $185,000' : '$90,000 – $130,000',
      });
      setIsMatching(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${bg} overflow-x-hidden`}>

      {/* ── NAV ── */}
      <header className={`sticky top-0 z-40 border-b ${border} ${isLight ? 'bg-white/95' : 'bg-neutral-950/95'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style={{width:'100%',height:'100%'}}>
                <defs><linearGradient id="nbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
                <rect width="64" height="64" rx="14" fill="url(#nbg)"/>
                <rect x="12" y="26" width="40" height="26" rx="4" fill="white" opacity="0.95"/>
                <path d="M24 26v-4a8 8 0 0 1 16 0v4" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                <circle cx="32" cy="39" r="4" fill="url(#nbg)"/>
                <line x1="32" y1="33" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="32" y1="47" x2="32" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="26" y1="39" x2="24" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="40" y1="39" x2="38" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>Career Copilot</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`} className={`text-sm ${muted} hover:${isLight ? 'text-neutral-900' : 'text-white'} transition-colors`}>{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {toggleTheme && (
              <button onClick={toggleTheme} className={`p-2 rounded-lg border ${border} ${muted} hover:${isLight ? 'text-neutral-900' : 'text-white'} transition-colors cursor-pointer`}>
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            )}
            {isLoggedIn ? (
              <button onClick={onNavigateToApp} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium ${accentBg} transition-colors cursor-pointer`}>
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button onClick={() => setShowAuthModal(true)} className={`text-sm ${muted} hover:${isLight ? 'text-neutral-900' : 'text-white'} transition-colors cursor-pointer hidden sm:block`}>Sign in</button>
                <button onClick={() => setShowAuthModal(true)} className={`px-4 py-2 rounded-lg text-sm font-medium ${accentBg} transition-colors cursor-pointer`}>Get started</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <p className={`text-xs font-mono uppercase tracking-widest ${accent} mb-4`}>AI-Powered Career Platform</p>
              <h1 className={`font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Land your<br />
                <em className="not-italic text-indigo-500">dream role</em><br />
                faster.
              </h1>
            </div>
            <p className={`text-lg leading-relaxed max-w-md ${muted}`}>
              Optimize your resume, practice interviews with AI, and get a personalized career roadmap — all in one workspace.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {isLoggedIn ? (
                <button onClick={onNavigateToApp} className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-medium ${accentBg} cursor-pointer transition-colors`}>
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button onClick={() => setShowAuthModal(true)} className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-medium ${accentBg} cursor-pointer transition-colors`}>
                    Start free — no card required <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href="#how-it-works" className={`flex items-center justify-center px-6 py-3.5 rounded-lg font-medium border ${border} ${isLight ? 'text-neutral-700 hover:bg-neutral-50' : 'text-neutral-300 hover:bg-neutral-900'} cursor-pointer transition-colors`}>
                    See how it works
                  </a>
                </>
              )}
            </div>
            <div className={`flex items-center gap-6 pt-2 border-t ${border}`}>
              {[['CV Analysis', 'Instant AI feedback'], ['Interview Prep', 'AI voice coach'], ['Roadmaps', 'Personalised plans']].map(([title, sub]) => (
                <div key={title}>
                  <p className={`text-sm font-semibold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{title}</p>
                  <p className={`text-xs ${muted}`}>{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`relative rounded-2xl overflow-hidden border ${border} aspect-[4/5] lg:aspect-auto lg:h-[560px]`}>
            <img src={HERO_IMG} alt="Professional at work" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="eager" />
            <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-t from-white/30 to-transparent' : 'bg-gradient-to-t from-neutral-950/50 to-transparent'}`} />
            {/* Floating card */}
            <div className={`absolute bottom-6 left-6 right-6 p-4 rounded-xl border ${border} ${isLight ? 'bg-white/90' : 'bg-neutral-900/90'} backdrop-blur-md`}>
              <p className={`text-xs font-mono uppercase tracking-widest ${accent} mb-1`}>AI Analysis</p>
              <p className={`text-sm font-semibold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Resume score improved by 34%</p>
              <p className={`text-xs ${muted} mt-0.5`}>Keywords matched · ATS optimised · Ready to apply</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={`border-t ${border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
          <div className="mb-14">
            <p className={`text-xs font-mono uppercase tracking-widest ${accent} mb-3`}>What you get</p>
            <h2 className={`font-display text-4xl sm:text-5xl font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Your complete<br />career toolkit.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px border ${border}">
            {[
              { num: '01', title: 'CV Analyser', desc: 'Upload your CV and get instant AI feedback on ATS compatibility, keyword gaps, and structural issues.', img: RESUME_IMG },
              { num: '02', title: 'Interview Coach', desc: 'Practice with AI-generated questions across behavioral, technical, and case formats. Get scored feedback.', img: INTERVIEW_IMG },
              { num: '03', title: 'Career Mentor', desc: 'Chat with an AI mentor for personalised career guidance, skill gap analysis, and strategic advice.', img: HERO_IMG },
            ].map((feat) => (
              <div key={feat.num} className={`${subtle} p-8 space-y-5 border ${border}`}>
                <span className={`text-xs font-mono ${muted}`}>{feat.num}</span>
                <div className={`aspect-video rounded-lg overflow-hidden border ${border}`}>
                  <img src={feat.img} alt={feat.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </div>
                <div>
                  <h3 className={`font-display text-xl font-bold mb-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>{feat.title}</h3>
                  <p className={`text-sm leading-relaxed ${muted}`}>{feat.desc}</p>
                </div>
                <button onClick={() => setShowAuthModal(true)} className={`flex items-center gap-1 text-sm font-medium ${accent} cursor-pointer hover:gap-2 transition-all`}>
                  Try it free <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* More tools row */}
          <div className={`mt-px grid grid-cols-2 md:grid-cols-4 gap-px border ${border}`}>
            {[['Resume Lab', 'AI bullet point generator'], ['Job Tracker', 'Application pipeline'], ['Learning Roadmap', 'Skill-based plans'], ['Cover Letters', 'Tailored in seconds']].map(([title, sub]) => (
              <div key={title} className={`${subtle} p-6 border ${border}`}>
                <p className={`text-sm font-semibold mb-1 ${isLight ? 'text-neutral-900' : 'text-white'}`}>{title}</p>
                <p className={`text-xs ${muted}`}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={`border-t ${border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className={`text-xs font-mono uppercase tracking-widest ${accent} mb-3`}>How it works</p>
              <h2 className={`font-display text-4xl sm:text-5xl font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Three steps<br />to your next role.</h2>
            </div>
            <div className="space-y-0">
              {[
                { n: '1', title: 'Upload your CV', desc: 'Drop your existing resume. Our AI analyses it against your target role and gives you an instant score with specific improvements.' },
                { n: '2', title: 'Practice & prepare', desc: 'Run mock interviews, generate tailored cover letters, and build a learning roadmap to close your skill gaps.' },
                { n: '3', title: 'Apply with confidence', desc: 'Track your applications, follow up strategically, and use your AI mentor to navigate offers and negotiations.' },
              ].map((step, i, arr) => (
                <div key={step.n} className={`flex gap-6 py-8 ${i < arr.length - 1 ? `border-b ${border}` : ''}`}>
                  <span className={`text-3xl font-display font-bold ${isLight ? 'text-neutral-200' : 'text-neutral-700'} flex-shrink-0 w-8`}>{step.n}</span>
                  <div>
                    <h3 className={`font-semibold mb-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>{step.title}</h3>
                    <p className={`text-sm leading-relaxed ${muted}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CAREER MATCHER ── */}
      <section id="diagnostic" className={`border-t ${border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
          <div className="max-w-2xl">
            <p className={`text-xs font-mono uppercase tracking-widest ${accent} mb-3`}>Free tool</p>
            <h2 className={`font-display text-4xl sm:text-5xl font-bold mb-4 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Career Skills Matcher</h2>
            <p className={`text-base ${muted} mb-10`}>Enter your target role and current skills to see your match score and get a personalised roadmap.</p>

            <form onSubmit={handleRunMatcher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${muted}`}>Target role</label>
                  <input type="text" value={dreamRole} onChange={e => setDreamRole(e.target.value)} required placeholder="e.g. Senior Software Engineer"
                    className={`w-full px-4 py-3 text-sm rounded-lg border ${border} ${isLight ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'} focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${muted}`}>Your skills</label>
                  <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, TypeScript, Node.js"
                    className={`w-full px-4 py-3 text-sm rounded-lg border ${border} ${isLight ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'} focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors`} />
                </div>
              </div>
              <button type="submit" disabled={isMatching} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium ${accentBg} cursor-pointer transition-colors disabled:opacity-60`}>
                {isMatching ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {isMatching ? 'Analysing...' : 'Check my match'}
              </button>
            </form>

            <AnimatePresence>
              {matchResult && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-8 p-6 rounded-xl border ${border} ${subtle} space-y-5`}>
                  <div className="flex items-baseline gap-3">
                    <span className={`font-display text-5xl font-bold ${accent}`}>{matchResult.score}%</span>
                    <span className={`text-sm ${muted}`}>match score · {matchResult.salaryRange}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-xs font-mono uppercase tracking-widest ${muted} mb-2`}>Skill gaps</p>
                      <ul className="space-y-1.5">
                        {matchResult.gaps.map((g, i) => <li key={i} className={`text-sm flex items-start gap-2 ${muted}`}><span className="mt-1 w-1 h-1 rounded-full bg-current flex-shrink-0" />{g}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className={`text-xs font-mono uppercase tracking-widest ${muted} mb-2`}>Next steps</p>
                      <ul className="space-y-1.5">
                        {matchResult.roadmap.map((s, i) => <li key={i} className={`text-sm flex items-start gap-2 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}><CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${accent}`} />{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  <button onClick={() => setShowAuthModal(true)} className={`text-sm font-medium ${accent} flex items-center gap-1 cursor-pointer hover:gap-2 transition-all`}>
                    Save your roadmap <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className={`border-t ${border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
          <div className="mb-14">
            <p className={`text-xs font-mono uppercase tracking-widest ${accent} mb-3`}>Testimonials</p>
            <h2 className={`font-display text-4xl sm:text-5xl font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>What users say.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'James K.', role: 'Software Engineer', text: 'The resume analyser caught keyword gaps I completely missed. I started getting callbacks within a week.', avatar: AVATAR_1 },
              { name: 'Sarah M.', role: 'Product Designer', text: 'The interview coach is incredible for building confidence. Practising with real-time feedback made my actual interviews feel easy.', avatar: AVATAR_2 },
              { name: 'David R.', role: 'Data Analyst', text: 'I used the resume builder to tailor my CV for three different roles. The AI suggestions were spot-on every time.', avatar: AVATAR_3 },
            ].map((t) => (
              <div key={t.name} className={`p-6 rounded-xl border ${border} space-y-4`}>
                <p className={`text-sm leading-relaxed ${muted}`}>"{t.text}"</p>
                <div className={`flex items-center gap-3 pt-4 border-t ${border}`}>
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  <div>
                    <p className={`text-sm font-semibold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{t.name}</p>
                    <p className={`text-xs ${muted}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`border-t ${border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 text-center">
          <h2 className={`font-display text-5xl sm:text-6xl font-bold mb-6 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            Ready to accelerate<br />your career?
          </h2>
          <p className={`text-lg ${muted} mb-8 max-w-md mx-auto`}>Join thousands of professionals using AI to land better roles, faster.</p>
          <button onClick={() => setShowAuthModal(true)} className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium text-base ${accentBg} cursor-pointer transition-colors`}>
            Create your free account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t ${border} ${subtle}`}>
        <div className={`max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${muted}`}>
          <span>© 2026 Career Copilot. All rights reserved.</span>
          <div className="flex items-center gap-6">
            {(['Privacy', 'Terms', 'Security', 'Contact'] as const).map(l => (
              <button key={l} onClick={() => onFooterNav?.(l.toLowerCase() as any)}
                className={`hover:${isLight ? 'text-neutral-900' : 'text-white'} transition-colors cursor-pointer`}>{l}</button>
            ))}
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)} className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 12 }}
              className="relative w-full max-w-lg z-10 my-8">
              <button onClick={() => setShowAuthModal(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-lg border ${border} ${isLight ? 'bg-white text-neutral-500 hover:text-neutral-900' : 'bg-neutral-900 text-neutral-400 hover:text-white'} cursor-pointer z-20 transition-colors`}>
                <X className="w-4 h-4" />
              </button>
              <LoginView isModal={true} onLogin={(profile, token) => { onLogin(profile, token); setShowAuthModal(false); }}
                onForgotPassword={() => { setShowAuthModal(false); onShowForgotPassword?.(); }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
