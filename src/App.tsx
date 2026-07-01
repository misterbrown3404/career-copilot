import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Briefcase, Sun, Moon } from 'lucide-react';
import { UserProfile, JobApplication, ResumeDetails } from './types';

// Views
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import Sidebar, { ActiveTab } from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CVUploadView from './components/CVUploadView';
import ResumeLabView from './components/ResumeLabView';
import AppTrackerView from './components/AppTrackerView';
import InterviewCoachView from './components/InterviewCoachView';
import CareerMentorView from './components/CareerMentorView';
import LearningRoadmapView from './components/LearningRoadmapView';
import SettingsView from './components/SettingsView';
import AdminDashboardView from './components/AdminDashboardView';

const emptyUserProfile: UserProfile = {
  name: '',
  email: '',
  targetRole: '',
  targetIndustry: '',
  experienceLevel: 'Mid',
  resumeScore: 0,
};

const emptyResumeDetails: ResumeDetails = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    website: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: []
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core synchronized application state
  const [user, setUser] = useState<UserProfile>(emptyUserProfile);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumeDetails, setResumeDetails] = useState<ResumeDetails>(emptyResumeDetails);

  // Global Light/Dark Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Restore session
  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      const restoreSession = async () => {
        try {
          const res = await fetch(`/api/user/data?email=${encodeURIComponent(savedEmail)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              setUser(data.profile);
              setIsLoggedIn(true);
            }
          } else {
            localStorage.removeItem('user_email');
          }
        } catch (err) {
          console.error('Session restore failed:', err);
        }
      };
      restoreSession();
    }
  }, []);

  // Load live data from server on login
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const fetchUserData = async () => {
        try {
          const res = await fetch(`/api/user/data?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              setUser(data.profile);
            }
            if (data.applications) {
              setApplications(data.applications);
            }
            if (data.resume) {
              setResumeDetails(data.resume);
            } else {
              setResumeDetails({
                personal: {
                  fullName: data.profile.name || '',
                  email: data.profile.email || '',
                  phone: '',
                  website: '',
                  summary: '',
                },
                experience: [],
                education: [],
                skills: []
              });
            }
          }
        } catch (err) {
          console.error('Failed to load live data:', err);
        }
      };
      fetchUserData();
    }
  }, [isLoggedIn, user?.email]);

  // Synchronize applications live to server
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      fetch('/api/user/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'applications',
          data: applications
        })
      }).catch(err => console.error('Error saving applications:', err));
    }
  }, [applications, isLoggedIn, user?.email]);

  // Synchronize resume live to server
  useEffect(() => {
    if (isLoggedIn && user?.email && resumeDetails && (resumeDetails.personal.fullName || resumeDetails.experience.length > 0)) {
      fetch('/api/user/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'resume',
          data: resumeDetails
        })
      }).catch(err => console.error('Error saving resume:', err));
    }
  }, [resumeDetails, isLoggedIn, user?.email]);

  // Synchronize profile changes live to server
  useEffect(() => {
    if (isLoggedIn && user?.email && user.name) {
      fetch('/api/user/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'profile',
          data: {
            name: user.name,
            targetRole: user.targetRole,
            targetIndustry: user.targetIndustry,
            experienceLevel: user.experienceLevel,
            resumeScore: user.resumeScore
          }
        })
      }).catch(err => console.error('Error saving profile:', err));
    }
  }, [user?.name, user?.targetRole, user?.targetIndustry, user?.experienceLevel, user?.resumeScore, isLoggedIn, user?.email]);

  // Auto-route and protect tabs based on active session and role
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const isAdmin = user.email.toLowerCase().trim() === 'abdulsalamjibril5@gmail.com';
      if (isAdmin) {
        if (activeTab !== 'admin' && activeTab !== 'settings') {
          setActiveTab('admin');
        }
      } else {
        if (activeTab === 'landing' || activeTab === 'admin') {
          setActiveTab('dashboard');
        }
      }
    }
  }, [isLoggedIn, user?.email, activeTab]);

  const handleLogin = (profile: UserProfile) => {
    localStorage.setItem('user_email', profile.email);
    setUser(profile);
    setIsLoggedIn(true);
    const isAdmin = profile.email?.toLowerCase().trim() === 'abdulsalamjibril5@gmail.com';
    setActiveTab(isAdmin ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_email');
    setIsLoggedIn(false);
    setUser(emptyUserProfile);
    setApplications([]);
    setResumeDetails(emptyResumeDetails);
    setActiveTab('dashboard');
  };

  const handleUpdateScore = (score: number) => {
    setUser(prev => ({
      ...prev,
      resumeScore: score
    }));
  };

  const handleApplyImprovements = (improvements: { before: string; after: string }[]) => {
    setResumeDetails(prev => {
      const exp = prev.experience.map(item => {
        const updatedDesc = item.description.map(bullet => {
          const match = improvements.find(imp => bullet.trim() === imp.before.trim() || bullet.toLowerCase().includes(imp.before.toLowerCase().substring(0, 15)));
          return match ? match.after : bullet;
        });
        return { ...item, description: updatedDesc };
      });
      return { ...prev, experience: exp };
    });
  };

  if (!isLoggedIn) {
    return (
      <LandingView 
        onLogin={handleLogin} 
        isLoggedIn={false} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row h-screen w-full overflow-hidden font-sans antialiased transition-colors duration-300 ${
      theme === 'light' ? 'bg-neutral-50 text-neutral-800' : 'bg-neutral-950 text-neutral-200'
    }`}>
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Workspace responsive header */}
        <header className={`hidden lg:flex items-center justify-between h-16 px-8 border-b transition-colors duration-300 ${
          theme === 'light' ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-900'
        } sticky top-0 z-10`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-display font-bold uppercase tracking-wider ${theme === 'light' ? 'text-neutral-500' : 'text-neutral-500'}`}>Current Workspace</span>
            <span className="text-neutral-400">/</span>
            <span className={`text-xs font-display font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border transition-colors ${
              theme === 'light' 
                ? 'bg-neutral-50 border-neutral-200 text-indigo-600 font-black' 
                : 'bg-neutral-950 border-neutral-800 text-green-400'
            }`}>
              {activeTab === 'dashboard' ? 'Overview' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            {/* Header Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                theme === 'light' 
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-800' 
                  : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-200'
              } cursor-pointer`}
              title={theme === 'light' ? "Switch to Dark Theme" : "Switch to Light Theme"}
            >
              {theme === 'light' ? (
                <div className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wider">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dark Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wider">
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Light Mode</span>
                </div>
              )}
            </button>
            <span className="text-neutral-400">|</span>
            <span>Container Ingress: <strong className={theme === 'light' ? 'text-indigo-600' : 'text-green-400'}>0.0.0.0:3000</strong></span>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme === 'light' ? 'bg-indigo-600' : 'bg-green-400'}`}></span>
          </div>
        </header>

        {/* View stage wrapper */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8" role="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full max-w-7xl mx-auto"
            >
              {activeTab === 'landing' && (
                <LandingView 
                  onLogin={handleLogin} 
                  isLoggedIn={true} 
                  onNavigateToApp={() => setActiveTab('dashboard')}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              )}
              {activeTab === 'dashboard' && (
                <DashboardView 
                  user={user} 
                  applications={applications} 
                  setActiveTab={setActiveTab} 
                  theme={theme}
                />
              )}
              {activeTab === 'upload' && (
                <CVUploadView 
                  user={user} 
                  updateUserScore={handleUpdateScore}
                  onApplyImprovements={handleApplyImprovements}
                  theme={theme}
                />
              )}
              {activeTab === 'resume-lab' && (
                <ResumeLabView 
                  resumeDetails={resumeDetails} 
                  user={user}
                  setResumeDetails={setResumeDetails}
                  theme={theme}
                />
              )}
              {activeTab === 'tracker' && (
                <AppTrackerView 
                  applications={applications} 
                  setApplications={setApplications}
                  resumeDetails={resumeDetails}
                  theme={theme}
                />
              )}
              {activeTab === 'interview' && (
                <InterviewCoachView 
                  user={user} 
                  theme={theme}
                />
              )}
              {activeTab === 'mentor' && (
                <CareerMentorView 
                  user={user} 
                  theme={theme}
                />
              )}
              {activeTab === 'roadmap' && (
                <LearningRoadmapView 
                  user={user} 
                  theme={theme}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsView 
                  user={user} 
                  setUser={setUser} 
                  theme={theme}
                />
              )}
              {activeTab === 'admin' && (
                <AdminDashboardView 
                  user={user} 
                  theme={theme}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
