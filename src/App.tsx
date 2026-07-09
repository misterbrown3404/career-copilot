import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Briefcase, Sun, Moon } from 'lucide-react';
import { UserProfile, JobApplication, ResumeDetails } from './types';

// Components
import { ToastProvider } from './components/Toast';

// Views
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import ForgotPasswordView from './components/ForgotPasswordView';
import ResetPasswordView from './components/ResetPasswordView';
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
import PrivacyView from './components/PrivacyView';
import TermsView from './components/TermsView';
import SecurityView from './components/SecurityView';
import ContactView from './components/ContactView';

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
  const [authView, setAuthView] = useState<'login' | 'forgot-password' | 'reset-password'>('login');
  const [footerPage, setFooterPage] = useState<'privacy' | 'terms' | 'security' | 'contact' | null>(() => {
    const p = window.location.pathname.replace('/', '');
    return ['privacy','terms','security','contact'].includes(p) ? p as any : null;
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

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
    const token = localStorage.getItem('auth_token');
    const savedEmail = localStorage.getItem('user_email');
    if (!token && !savedEmail) return;

    const restoreSession = async () => {
      try {
        const headers: Record<string, string> = { ...getAuthHeaders() };
        const res = await fetch('/api/user/data', {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setUser(data.profile);
            setIsLoggedIn(true);
          }
        } else {
          localStorage.removeItem('user_email');
          localStorage.removeItem('auth_token');
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      }
    };
    restoreSession();
  }, []);

  // Load live data from server on login
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const fetchUserData = async () => {
        setIsLoadingData(true);
        try {
          const res = await fetch('/api/user/data', {
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            }
          });
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
        } finally {
          setIsLoadingData(false);
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
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
      const isAdmin = user.role === 'admin' || user.isAdmin === true;
      if (isAdmin) {
        if (activeTab !== 'admin' && activeTab !== 'settings') {
          setActiveTab('admin');
        }
      } else {
        if (activeTab === 'admin') {
          setActiveTab('dashboard');
        }
      }
    }
  }, [isLoggedIn, user?.email, user?.role, user?.isAdmin, activeTab]);

  const handleLogin = (profile: UserProfile, token?: string) => {
    localStorage.setItem('user_email', profile.email);
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    setUser(profile);
    setIsLoggedIn(true);
    const isAdmin = profile.role === 'admin' || profile.isAdmin === true;
    setActiveTab(isAdmin ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setUser(emptyUserProfile);
    setApplications([]);
    setResumeDetails(emptyResumeDetails);
    setActiveTab('dashboard');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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

  if (footerPage) {
    const props = { theme, onBack: () => { setFooterPage(null); window.history.pushState({}, '', '/'); } };
    if (footerPage === 'privacy') return <ToastProvider><PrivacyView {...props} /></ToastProvider>;
    if (footerPage === 'terms') return <ToastProvider><TermsView {...props} /></ToastProvider>;
    if (footerPage === 'security') return <ToastProvider><SecurityView {...props} /></ToastProvider>;
    if (footerPage === 'contact') return <ToastProvider><ContactView {...props} /></ToastProvider>;
  }

    if (!isLoggedIn) {
    if (authView === 'forgot-password') {
      return (
        <ToastProvider>
          <ForgotPasswordView onBack={() => setAuthView('login')} theme={theme} />
        </ToastProvider>
      );
    }
    if (authView === 'reset-password') {
      return (
        <ToastProvider>
          <ResetPasswordView onBack={() => setAuthView('login')} theme={theme} />
        </ToastProvider>
      );
    }
    return (
      <ToastProvider>
        <LandingView 
          onLogin={handleLogin} 
          isLoggedIn={false} 
          theme={theme}
          toggleTheme={toggleTheme}
          onShowForgotPassword={() => setAuthView('forgot-password')}
          onShowResetPassword={() => setAuthView('reset-password')}
          onFooterNav={(page) => { setFooterPage(page); window.history.pushState({}, '', '/' + page); }}
        />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
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
        
        {/* Workspace header */}
        <header className={`hidden lg:flex items-center justify-between h-14 px-6 border-b transition-colors duration-200 ${
          theme === 'light' ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-950'
        } sticky top-0 z-10`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${theme === 'light' ? 'text-neutral-400' : 'text-neutral-500'}`}>Workspace</span>
            <span className={`text-xs ${theme === 'light' ? 'text-neutral-300' : 'text-neutral-700'}`}>/</span>
            <span className={`text-xs font-medium capitalize ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
            </span>
          </div>
          <div className={`flex items-center gap-2 text-xs ${theme === 'light' ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400'}`} />
            <span>Live</span>
          </div>
        </header>

        {/* View stage wrapper */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8" role="main">
          <AnimatePresence mode="wait">
            {isLoadingData ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full max-w-7xl mx-auto space-y-6"
              >
                <div className={`h-8 w-48 rounded-lg animate-pulse ${theme === 'light' ? 'bg-neutral-200' : 'bg-neutral-800'}`} />
                <div className={`h-64 w-full rounded-2xl animate-pulse ${theme === 'light' ? 'bg-neutral-200' : 'bg-neutral-800'}`} />
                <div className={`h-64 w-full rounded-2xl animate-pulse ${theme === 'light' ? 'bg-neutral-200' : 'bg-neutral-800'}`} />
              </motion.div>
            ) : (
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
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}

