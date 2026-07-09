import {
  LayoutDashboard,
  FileUp,
  FileEdit,
  ClipboardList,
  MessageSquareCode,
  Users,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile } from '../types';

export type ActiveTab = 'landing' | 'dashboard' | 'upload' | 'resume-lab' | 'tracker' | 'interview' | 'mentor' | 'roadmap' | 'settings' | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, isOpen, setIsOpen, onLogout, theme = 'dark', toggleTheme }: SidebarProps) {
  const isLight = theme === 'light';
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  const navItems: readonly { id: ActiveTab; label: string; icon: any }[] = isAdmin
    ? [
        { id: 'admin', label: 'Admin Dashboard', icon: Activity },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'upload', label: 'Upload CV', icon: FileUp },
        { id: 'resume-lab', label: 'Resume Lab', icon: FileEdit },
        { id: 'tracker', label: 'Job Search', icon: ClipboardList },
        { id: 'interview', label: 'Interview Coach', icon: MessageSquareCode },
        { id: 'mentor', label: 'Career Mentor', icon: Users },
        { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];

  const bg = isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-800';
  const muted = isLight ? 'text-neutral-400' : 'text-neutral-500';
  const activeClass = isLight
    ? 'bg-neutral-900 text-white'
    : 'bg-white text-neutral-900';
  const inactiveClass = isLight
    ? 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white';

  const SidebarContent = () => (
    <div className={`flex flex-col h-full border-r ${bg} transition-colors duration-200`}>

      {/* Brand */}
      <div className={`px-6 py-5 border-b ${isLight ? 'border-neutral-200' : 'border-neutral-800'} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style={{width:'100%',height:'100%'}}>
              <defs><linearGradient id="sbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
              <rect width="64" height="64" rx="14" fill="url(#sbg)"/>
              <rect x="12" y="26" width="40" height="26" rx="4" fill="white" opacity="0.95"/>
              <path d="M24 26v-4a8 8 0 0 1 16 0v4" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="32" cy="39" r="4" fill="url(#sbg)"/>
              <line x1="32" y1="33" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="47" x2="32" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="26" y1="39" x2="24" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="40" y1="39" x2="38" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={`font-sans font-semibold text-sm ${isLight ? 'text-neutral-900' : 'text-white'}`}>Career Copilot</span>
        </div>
        <button onClick={() => setIsOpen(false)} className={`lg:hidden p-1 rounded-md ${muted} hover:${isLight ? 'text-neutral-900' : 'text-white'} transition-colors`} aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Primary Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${isActive ? activeClass : inactiveClass}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t ${isLight ? 'border-neutral-200' : 'border-neutral-800'} space-y-1`}>
        {toggleTheme && (
          <button onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${inactiveClass}`}>
            {isLight ? <Moon className="w-4 h-4 flex-shrink-0" /> : <Sun className="w-4 h-4 flex-shrink-0" />}
            <span>{isLight ? 'Dark mode' : 'Light mode'}</span>
          </button>
        )}

        {/* User */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isLight ? 'bg-neutral-50' : 'bg-neutral-900'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-400'}`}>
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user.name}</p>
            <p className={`text-[11px] truncate ${muted}`}>{user.targetRole}</p>
          </div>
        </div>

        <button onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${isLight ? 'text-neutral-500 hover:bg-red-50 hover:text-red-600' : 'text-neutral-500 hover:bg-red-950/30 hover:text-red-400'}`}
          aria-label="Sign out">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className={`lg:hidden h-14 border-b px-4 flex items-center justify-between sticky top-0 z-40 w-full transition-colors ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-800'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style={{width:'100%',height:'100%'}}>
              <defs><linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
              <rect width="64" height="64" rx="14" fill="url(#mbg)"/>
              <rect x="12" y="26" width="40" height="26" rx="4" fill="white" opacity="0.95"/>
              <path d="M24 26v-4a8 8 0 0 1 16 0v4" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="32" cy="39" r="4" fill="url(#mbg)"/>
              <line x1="32" y1="33" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="47" x2="32" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="26" y1="39" x2="24" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="40" y1="39" x2="38" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={`font-sans font-semibold text-sm ${isLight ? 'text-neutral-900' : 'text-white'}`}>Career Copilot</span>
        </div>
        <button onClick={() => setIsOpen(true)}
          className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${isLight ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-50' : 'border-neutral-800 text-neutral-400 hover:bg-neutral-900'}`}
          aria-label="Open menu" aria-expanded={isOpen}>
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} role="none" />
        <div className={`absolute top-0 bottom-0 left-0 w-64 transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 h-screen sticky top-0 flex-shrink-0 z-30" aria-label="Sidebar navigation">
        <SidebarContent />
      </aside>
    </>
  );
}
