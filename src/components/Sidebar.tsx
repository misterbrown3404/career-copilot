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
  Briefcase,
  Sparkles,
  Sun,
  Moon,
  Activity
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

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close drawer on mobile
  };

  const SidebarContent = () => (
    <div className={`flex flex-col h-full transition-colors duration-300 ${
      isLight ? 'bg-white text-neutral-950 border-r border-neutral-200' : 'bg-neutral-950 text-neutral-100 border-r border-neutral-800'
    }`}>
      {/* Header / Brand with Futuristic Logo */}
      <div className={`p-6 border-b flex items-center justify-between transition-colors duration-300 ${
        isLight ? 'border-neutral-200' : 'border-neutral-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden group shadow-lg ${
            isLight 
              ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-indigo-100' 
              : 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-neutral-950 shadow-green-500/20'
          }`}>
            <div className="absolute inset-0 border border-white/20 rounded-xl animate-[spin_8s_linear_infinite]" />
            <div className="absolute w-6 h-6 rounded-full border border-dashed border-white/30 animate-[spin_4s_linear_infinite]" />
            <Sparkles className="w-5 h-5 relative z-10" />
          </div>
          <div>
            <h2 className={`font-display font-black text-sm tracking-wider leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r ${
              isLight ? 'from-neutral-950 via-neutral-800 to-indigo-700' : 'from-white via-neutral-100 to-green-300'
            }`}>
              AURA CAREER
            </h2>
            <span className={`text-[9px] font-mono uppercase tracking-[0.2em] font-bold block mt-1 ${
              isLight ? 'text-indigo-600' : 'text-green-400'
            }`}>
              CAREER TOOLS
            </span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className={`lg:hidden p-1 rounded-lg focus:outline-none focus:ring-2 ${
            isLight ? 'text-neutral-500 hover:text-neutral-900 focus:ring-indigo-600' : 'text-neutral-400 hover:text-white focus:ring-green-400'
          }`}
          aria-label="Close menu drawer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Primary Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all group focus:outline-none focus:ring-2 cursor-pointer border ${
                isActive
                  ? isLight
                    ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-sm'
                    : 'bg-green-400 text-neutral-950 border-green-400 font-extrabold shadow-none'
                  : isLight
                    ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border-transparent'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border-transparent'
              } ${isLight ? 'focus:ring-indigo-600' : 'focus:ring-green-400'}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Go to ${item.label}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${
                isActive 
                  ? 'text-current' 
                  : isLight ? 'text-neutral-500 group-hover:text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-200'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle option inside Sidebar for Mobile/Tablet context */}
      {toggleTheme && (
        <div className={`p-4 mx-4 mb-2 rounded-lg border text-center flex items-center justify-between transition-colors ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <span className="text-[10px] font-display font-bold uppercase tracking-wider">Appearance</span>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-md border text-xs font-mono transition-all flex items-center gap-1.5 ${
              isLight 
                ? 'bg-white border-neutral-200 hover:bg-neutral-100 text-indigo-650' 
                : 'bg-neutral-950 border-neutral-850 hover:bg-neutral-900 text-yellow-400'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* User Info & Footer */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        isLight ? 'border-neutral-200 bg-neutral-50/50' : 'border-neutral-800 bg-neutral-900/40'
      }`}>
        <div className={`flex items-center gap-3 p-2 rounded-lg mb-3 ${
          isLight ? 'bg-white border border-neutral-200/50' : ''
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
            isLight 
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
              : 'bg-green-400/10 border border-green-500/20 text-green-400'
          }`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-display font-bold truncate uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user.name}</p>
            <p className={`text-[10px] font-mono truncate ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{user.targetRole}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border font-mono text-[10px] uppercase tracking-wider font-bold transition-all focus:outline-none cursor-pointer ${
            isLight
              ? 'border-neutral-200 hover:bg-red-50 hover:text-red-650 text-neutral-600 focus:ring-red-650'
              : 'border-neutral-800 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400 text-neutral-400 focus:ring-red-500'
          }`}
          aria-label="Log out of account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <header className={`lg:hidden h-16 border-b px-4 flex items-center justify-between sticky top-0 z-40 w-full transition-colors duration-300 ${
        isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
      }`} aria-label="Mobile top bar">
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${
            isLight ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-neutral-950'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className={`font-display font-black tracking-widest text-sm uppercase ${isLight ? 'text-neutral-900' : 'text-white'}`}>AURA CAREER</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className={`p-1.5 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
            isLight 
              ? 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100' 
              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900'
          }`}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Slide-out mobile drawer portal */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
          role="none"
        />
        {/* Drawer container */}
        <div className={`absolute top-0 bottom-0 left-0 w-72 max-w-[80vw] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </div>
      </div>

      {/* Persistent desktop sidebar container */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 flex-shrink-0 z-30" aria-label="Sidebar navigation">
        <SidebarContent />
      </aside>
    </>
  );
}

