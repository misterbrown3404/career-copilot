import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileCheck, 
  ClipboardList, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles,
  Award,
  ChevronRight,
  Map,
  DollarSign
} from 'lucide-react';
import { UserProfile, JobApplication } from '../types';
import { ActiveTab } from './Sidebar';
import DashboardSkeleton from './DashboardSkeleton';

interface DashboardViewProps {
  user: UserProfile;
  applications: JobApplication[];
  setActiveTab: (tab: ActiveTab) => void;
  theme?: 'light' | 'dark';
}

export default function DashboardView({ user, applications, setActiveTab, theme = 'dark' }: DashboardViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  const isLight = theme === 'light';

  useEffect(() => {
    // Highly smooth visual sequence to prevent layout flash and simulate syncing of database records
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Stats calculations
  const totalApps = applications.length;
  const interviewingCount = applications.filter(a => a.status === 'interviewing').length;
  const offeredCount = applications.filter(a => a.status === 'offered').length;
  const wishlistCount = applications.filter(a => a.status === 'wishlist').length;

  // Active list limit to 3 items
  const activeApps = applications
    .filter(a => a.status !== 'wishlist')
    .slice(0, 3);

  // Status Colors Mapping for both Dark and Light theme
  const statusConfig = {
    wishlist: { 
      bg: isLight ? 'bg-neutral-100 text-neutral-600 border-neutral-200' : 'bg-neutral-800 text-neutral-300 border-neutral-700', 
      label: 'Wishlist' 
    },
    applied: { 
      bg: isLight ? 'bg-blue-50 text-blue-700 border-blue-200/50' : 'bg-blue-950/30 text-blue-400 border-blue-900/30', 
      label: 'Applied' 
    },
    interviewing: { 
      bg: isLight ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-amber-950/30 text-amber-400 border-amber-900/30', 
      label: 'Interviewing' 
    },
    offered: { 
      bg: isLight ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-green-950/30 text-green-400 border-green-900/30', 
      label: 'Offer Received' 
    },
    rejected: { 
      bg: isLight ? 'bg-red-50 text-red-700 border-red-200/50' : 'bg-red-950/30 text-red-400 border-red-900/30', 
      label: 'Rejected' 
    },
  } as const;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden p-6 sm:p-8 rounded-lg border transition-colors duration-300 ${
        isLight ? 'bg-white text-neutral-800 border-neutral-200' : 'bg-neutral-900 text-white border-neutral-800'
      }`}>
        {/* Decorative Grid and Blur */}
        <div className={`absolute inset-0 [background-size:24px_24px] opacity-60 ${
          isLight ? 'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)]' : 'bg-[radial-gradient(#262626_1px,transparent_1px)]'
        }`}></div>
        <div className={`absolute right-0 top-0 w-64 h-64 rounded-full blur-3xl opacity-5 -mr-16 -mt-16 ${
          isLight ? 'bg-indigo-500' : 'bg-green-400'
        }`}></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest font-semibold border ${
              isLight 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                : 'bg-green-400/10 border-green-500/20 text-green-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Insights Active</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-display font-black tracking-tight uppercase ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              Welcome back, {user.name}!
            </h1>
            <p className={`text-sm max-w-xl font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Your career profile is set for <span className={`font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user.targetRole}</span> in <span className={`font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user.targetIndustry}</span> ({user.experienceLevel} Level).
            </p>
          </div>

          <div className={`flex flex-row items-center gap-4 p-4 rounded-lg border self-start md:self-auto min-w-[140px] justify-center transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
          }`}>
            <div className="text-center">
              <div className={`text-3xl font-display font-black ${isLight ? 'text-indigo-650' : 'text-green-400'}`}>
                {user.resumeScore}%
              </div>
              <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mt-0.5">Resume Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CV Optimize */}
        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-lg border transition-colors ${
            isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-[10px] font-display font-black uppercase tracking-wider">CV Strength</span>
            <div className={`p-2 rounded-md border ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-indigo-600' : 'bg-neutral-950 border-neutral-800 text-green-400'
            }`}>
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1 font-mono">
              <span className={`text-2xl font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user.resumeScore}</span>
              <span className="text-neutral-500 text-sm">/ 100</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden border ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-850'
            }`}>
              <div 
                className={`h-full rounded-full ${isLight ? 'bg-indigo-600' : 'bg-green-400'}`} 
                style={{ width: `${user.resumeScore}%` }}
              />
            </div>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer mt-1 focus:outline-none ${
                isLight ? 'text-indigo-650 hover:text-indigo-750' : 'text-green-400 hover:text-green-300'
              }`}
              aria-label="Upload a new CV to scan"
            >
              <span>Scan CV for Gaps</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Card 2: App Tracker Stats */}
        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-lg border transition-colors ${
            isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-[10px] font-display font-black uppercase tracking-wider">App Pipeline</span>
            <div className={`p-2 rounded-md border ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-indigo-600' : 'bg-neutral-950 border-neutral-800 text-green-400'
            }`}>
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-mono font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{totalApps}</div>
            <p className={`text-[11px] font-mono ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {interviewingCount} Interviews • {offeredCount} Offers
            </p>
            <button 
              onClick={() => setActiveTab('tracker')}
              className={`text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer pt-2 focus:outline-none ${
                isLight ? 'text-indigo-650 hover:text-indigo-750' : 'text-green-400 hover:text-green-300'
              }`}
              aria-label="View kanban board tracker"
            >
              <span>Open Pipeline Board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Card 3: Interview prep */}
        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-lg border transition-colors ${
            isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-[10px] font-display font-black uppercase tracking-wider">Interview Coach</span>
            <div className={`p-2 rounded-md border ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-indigo-600' : 'bg-neutral-950 border-neutral-800 text-green-400'
            }`}>
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-lg font-display font-bold uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>Level: {user.experienceLevel}</div>
            <p className={`text-[11px] font-mono ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              3 practices prepped • Ready
            </p>
            <button 
              onClick={() => setActiveTab('interview')}
              className={`text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer pt-2 focus:outline-none ${
                isLight ? 'text-indigo-650 hover:text-indigo-750' : 'text-green-400 hover:text-green-300'
              }`}
              aria-label="Launch interactive interview simulator"
            >
              <span>Launch Mock Interview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Card 4: Career Mentors */}
        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-lg border transition-colors ${
            isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-[10px] font-display font-black uppercase tracking-wider">Career Mentors</span>
            <div className={`p-2 rounded-md border ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-indigo-600' : 'bg-neutral-950 border-neutral-800 text-green-400'
            }`}>
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-mono font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>4 Specialists</div>
            <p className={`text-[11px] font-mono ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Chen, Vance, Rostova, Kaelen
            </p>
            <button 
              onClick={() => setActiveTab('mentor')}
              className={`text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer pt-2 focus:outline-none ${
                isLight ? 'text-indigo-650 hover:text-indigo-750' : 'text-green-400 hover:text-green-300'
              }`}
              aria-label="Consult career mentor chat"
            >
              <span>Consult Chat Mentors</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Layout Rows: Left Bento Actions, Right Applications Active List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Actions: Bento Grid */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className={`text-base font-display font-black uppercase tracking-wider flex items-center gap-2 ${
            isLight ? 'text-neutral-800' : 'text-white'
          }`}>
            <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            <span>AI Copilot Recommended Actions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1 */}
            <button 
              onClick={() => setActiveTab('upload')}
              className={`p-5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-40 focus:outline-none ${
                isLight 
                  ? 'bg-white border-neutral-200 hover:border-indigo-600 hover:shadow-sm' 
                  : 'bg-neutral-900 border-neutral-800 hover:border-green-400'
              }`}
              aria-label="AI Action: Fix 3 gaps identified in your latest CV scan"
            >
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-wider border ${
                  isLight 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : 'bg-neutral-950 text-green-400 border-neutral-800'
                }`}>CV Improvement</span>
                <h3 className={`font-display font-bold text-sm uppercase tracking-wide ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Review 3 CV structural gaps
                </h3>
                <p className={`text-xs line-clamp-2 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Our scanner detected missing DevOps keywords and non-metric bullet points.
                </p>
              </div>
              <div className={`flex items-center text-[10px] font-display font-bold uppercase tracking-widest ${
                isLight ? 'text-indigo-655' : 'text-green-400'
              }`}>
                <span>Optimize Resume</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </button>

            {/* Action 2 */}
            <button 
              onClick={() => setActiveTab('interview')}
              className={`p-5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-40 focus:outline-none ${
                isLight 
                  ? 'bg-white border-neutral-200 hover:border-indigo-600 hover:shadow-sm' 
                  : 'bg-neutral-900 border-neutral-800 hover:border-green-400'
              }`}
              aria-label="AI Action: Practice Stripe technical screen questions"
            >
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-wider border ${
                  isLight 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : 'bg-neutral-950 text-green-400 border-neutral-800'
                }`}>Interview Coach</span>
                <h3 className={`font-display font-bold text-sm uppercase tracking-wide ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Practice Stripe Mock Screen
                </h3>
                <p className={`text-xs line-clamp-2 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Run a dedicated Technical interview simulator customized for Stripe standards.
                </p>
              </div>
              <div className={`flex items-center text-[10px] font-display font-bold uppercase tracking-widest ${
                isLight ? 'text-indigo-655' : 'text-green-400'
              }`}>
                <span>Start Mock Session</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </button>

            {/* Action 3 */}
            <button 
              onClick={() => setActiveTab('mentor')}
              className={`p-5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-40 focus:outline-none ${
                isLight 
                  ? 'bg-white border-neutral-200 hover:border-indigo-600 hover:shadow-sm' 
                  : 'bg-neutral-900 border-neutral-800 hover:border-green-400'
              }`}
              aria-label="AI Action: Consult Elena on salary negotiations"
            >
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-wider border ${
                  isLight 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : 'bg-neutral-950 text-green-400 border-neutral-800'
                }`}>Negotiation Strategy</span>
                <h3 className={`font-display font-bold text-sm uppercase tracking-wide ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Draft Vercel counter-proposal
                </h3>
                <p className={`text-xs line-clamp-2 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Consult Elena Rostova to script your base salary negotiation argument.
                </p>
              </div>
              <div className={`flex items-center text-[10px] font-display font-bold uppercase tracking-widest ${
                isLight ? 'text-indigo-655' : 'text-green-400'
              }`}>
                <span>Consult Elena</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </button>

            {/* Action 4 */}
            <button 
              onClick={() => setActiveTab('roadmap')}
              className={`p-5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-40 focus:outline-none ${
                isLight 
                  ? 'bg-white border-neutral-200 hover:border-indigo-600 hover:shadow-sm' 
                  : 'bg-neutral-900 border-neutral-800 hover:border-green-400'
              }`}
              aria-label="AI Action: Continue Performance Roadmap Node"
            >
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-wider border ${
                  isLight 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : 'bg-neutral-950 text-green-400 border-neutral-800'
                }`}>Roadmap Node</span>
                <h3 className={`font-display font-bold text-sm uppercase tracking-wide ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Optimize React performance
                </h3>
                <p className={`text-xs line-clamp-2 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Complete your active development project to unlock DevOps phases.
                </p>
              </div>
              <div className={`flex items-center text-[10px] font-display font-bold uppercase tracking-widest ${
                isLight ? 'text-indigo-655' : 'text-green-400'
              }`}>
                <span>View Roadmap</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Active Applications list */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-display font-black uppercase tracking-wider ${isLight ? 'text-neutral-800' : 'text-white'}`}>
              Active Pipelines
            </h2>
            <button 
              onClick={() => setActiveTab('tracker')}
              className={`text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer focus:outline-none ${
                isLight ? 'text-indigo-650 hover:text-indigo-750' : 'text-green-400 hover:text-green-300'
              }`}
              aria-label="View all tracked job applications"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className={`rounded-lg border p-4 space-y-3 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            {activeApps.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs font-mono">
                No active applications in pipeline yet.
              </div>
            ) : (
              activeApps.map((app) => {
                const conf = statusConfig[app.status] || { 
                  bg: isLight ? 'bg-neutral-100 text-neutral-600 border-neutral-200' : 'bg-neutral-800 text-neutral-300 border-neutral-700', 
                  label: app.status 
                };
                return (
                  <div 
                    key={app.id}
                    className={`p-3.5 rounded-md border transition-all flex items-center justify-between gap-4 ${
                      isLight 
                        ? 'border-neutral-200/85 bg-neutral-50/50 hover:bg-neutral-100/40' 
                        : 'border-neutral-850 bg-neutral-950/40 hover:bg-neutral-950'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <h3 className={`font-display font-bold text-sm uppercase tracking-wide truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        {app.role}
                      </h3>
                      <p className={`text-xs truncate font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        {app.company} • {app.location}
                      </p>
                      
                      {app.salary && (
                        <span className={`inline-flex items-center text-[10px] font-mono gap-0.5 mt-1 px-1.5 py-0.5 rounded border transition-colors ${
                          isLight ? 'bg-neutral-100 border-neutral-200 text-neutral-700' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                        }`}>
                          <DollarSign className={`w-3 h-3 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                          <span>{app.salary}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider rounded border text-center whitespace-nowrap ${conf.bg}`}>
                        {conf.label}
                      </span>
                      {app.matchScore && (
                        <span className="text-[10px] font-mono text-neutral-500">
                          Match: <span className={`font-bold ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>{app.matchScore}%</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
