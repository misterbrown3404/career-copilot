import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Users, 
  Zap, 
  AlertTriangle, 
  RefreshCw, 
  PlusCircle, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  Sliders, 
  Terminal, 
  Download, 
  CheckCircle2, 
  Cpu, 
  Server,
  Play,
  ArrowRight,
  Filter,
  Check,
  Mail,
  Send,
  Trash2,
  SlidersHorizontal,
  MailOpen,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { UserProfile } from '../types';

interface AdminDashboardViewProps {
  user: UserProfile;
  theme?: 'light' | 'dark';
}

interface LogEntry {
  id: string;
  timestamp: string;
  service: 'Auth' | 'Gemini AI' | 'JSearch Jobs' | 'Resume Lab' | 'System Router';
  level: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  latencyMs?: number;
}

export default function AdminDashboardView({ user, theme = 'dark' }: AdminDashboardViewProps) {
  const isLight = theme === 'light';

  // State to switch between "System Telemetry & Logs" and "Newsletter Campaigns & Users"
  const [activeSubTab, setActiveSubTab] = useState<'telemetry' | 'newsletter'>('telemetry');

  // --- Real-Time User Directory & Newsletter Campaign States ---
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [newsletterResult, setNewsletterResult] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  
  // Filtering & search for users
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'ALL' | 'admin' | 'user'>('ALL');

  // --- Telemetry state ---
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '6m'>('7d');

  // Telemetry charts mock data
  const [signupData7d, setSignupData7d] = useState([
    { day: 'Mon', organic: 12, premium: 3 },
    { day: 'Tue', organic: 19, premium: 5 },
    { day: 'Wed', organic: 15, premium: 4 },
    { day: 'Thu', organic: 22, premium: 7 },
    { day: 'Fri', organic: 26, premium: 9 },
    { day: 'Sat', organic: 34, premium: 12 },
    { day: 'Sun', organic: 29, premium: 11 },
  ]);

  const [signupData30d, setSignupData30d] = useState([
    { day: 'Wk 1', organic: 92, premium: 24 },
    { day: 'Wk 2', organic: 115, premium: 35 },
    { day: 'Wk 3', organic: 130, premium: 42 },
    { day: 'Wk 4', organic: 154, premium: 56 },
  ]);

  const [signupData6m, setSignupData6m] = useState([
    { day: 'Jan', organic: 340, premium: 95 },
    { day: 'Feb', organic: 410, premium: 120 },
    { day: 'Mar', organic: 520, premium: 165 },
    { day: 'Apr', organic: 600, premium: 210 },
    { day: 'May', organic: 720, premium: 255 },
    { day: 'Jun', organic: 880, premium: 310 },
  ]);

  const [apiRequests7d, setApiRequests7d] = useState([
    { day: 'Mon', gemini: 420, jsearch: 290, parser: 150 },
    { day: 'Tue', gemini: 510, jsearch: 330, parser: 180 },
    { day: 'Wed', gemini: 480, jsearch: 310, parser: 165 },
    { day: 'Thu', gemini: 650, jsearch: 440, parser: 210 },
    { day: 'Fri', gemini: 720, jsearch: 510, parser: 240 },
    { day: 'Sat', gemini: 550, jsearch: 380, parser: 190 },
    { day: 'Sun', gemini: 590, jsearch: 410, parser: 205 },
  ]);

  const [apiRequests30d, setApiRequests30d] = useState([
    { day: 'Wk 1', gemini: 3200, jsearch: 2100, parser: 1100 },
    { day: 'Wk 2', gemini: 3800, jsearch: 2500, parser: 1350 },
    { day: 'Wk 3', gemini: 4400, jsearch: 2900, parser: 1600 },
    { day: 'Wk 4', gemini: 5100, jsearch: 3300, parser: 1850 },
  ]);

  const [apiRequests6m, setApiRequests6m] = useState([
    { day: 'Jan', gemini: 14000, jsearch: 9200, parser: 4800 },
    { day: 'Feb', gemini: 16500, jsearch: 10800, parser: 5500 },
    { day: 'Mar', gemini: 19800, jsearch: 12900, parser: 6800 },
    { day: 'Apr', gemini: 22000, jsearch: 14500, parser: 7200 },
    { day: 'May', gemini: 26400, jsearch: 17200, parser: 8900 },
    { day: 'Jun', gemini: 31200, jsearch: 20400, parser: 10500 },
  ]);

  const [errorRate7d, setErrorRate7d] = useState([
    { day: 'Mon', rate: 1.4 },
    { day: 'Tue', rate: 0.9 },
    { day: 'Wed', rate: 1.1 },
    { day: 'Thu', rate: 2.3 },
    { day: 'Fri', rate: 1.2 },
    { day: 'Sat', rate: 0.8 },
    { day: 'Sun', rate: 1.5 },
  ]);

  const [errorRate30d, setErrorRate30d] = useState([
    { day: 'Wk 1', rate: 1.35 },
    { day: 'Wk 2', rate: 1.10 },
    { day: 'Wk 3', rate: 1.45 },
    { day: 'Wk 4', rate: 1.20 },
  ]);

  const [errorRate6m, setErrorRate6m] = useState([
    { day: 'Jan', rate: 1.62 },
    { day: 'Feb', rate: 1.40 },
    { day: 'Mar', rate: 1.25 },
    { day: 'Apr', rate: 1.50 },
    { day: 'May', rate: 1.12 },
    { day: 'Jun', rate: 1.30 },
  ]);

  // System Logs feed
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '11:12:45', service: 'Gemini AI', level: 'SUCCESS', message: 'CV critique compiled successfully using gemini-3.5-flash', latencyMs: 245 },
    { id: '2', timestamp: '11:13:02', service: 'JSearch Jobs', level: 'INFO', message: 'Aggregator queried for "Senior React Developer" in US. Received 14 results.', latencyMs: 612 },
    { id: '3', timestamp: '11:13:15', service: 'Resume Lab', level: 'SUCCESS', message: 'Resume structural improvement plan cached for session user.', latencyMs: 82 },
    { id: '4', timestamp: '11:14:10', service: 'System Router', level: 'WARNING', message: 'Nginx upstream connection overhead increased above 150ms limit.', latencyMs: 195 },
    { id: '5', timestamp: '11:14:22', service: 'Auth', level: 'SUCCESS', message: 'Secure JSON account payload sync succeeded with highly encrypted credentials.', latencyMs: 44 },
    { id: '6', timestamp: '11:15:00', service: 'Gemini AI', level: 'ERROR', message: 'Gemini model query timed out. Request retried on fallback channel.', latencyMs: 5000 },
    { id: '7', timestamp: '11:15:04', service: 'Gemini AI', level: 'SUCCESS', message: 'Stitch query resolved successfully on secondary pipeline.', latencyMs: 820 },
    { id: '8', timestamp: '11:15:33', service: 'JSearch Jobs', level: 'INFO', message: 'Aggregator cached results for company "Epic Games".', latencyMs: 145 },
  ]);

  const [logSearch, setLogSearch] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');
  const [logServiceFilter, setLogServiceFilter] = useState<'ALL' | 'Auth' | 'Gemini AI' | 'JSearch Jobs' | 'Resume Lab'>('ALL');

  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isSimulatingSpike, setIsSimulatingSpike] = useState(false);

  // --- Campaign Predefined Presets ---
  const templates = useMemo(() => {
    return {
      welcome: {
        name: '🚀 System Welcome & Launch Campaign',
        subject: '🚀 Welcome to Aura Copilot: Your Ultimate AI Career Flightdeck!',
        body: `Hello Aura Pioneer,\n\nWe are absolutely thrilled to welcome you to Aura Copilot, the futuristic AI Career Accelerator!\n\nHere is a list of the premium AI modules unlocked on your dashboard:\n1. 🌟 Welcome Portal - Explore personalized career telemetry and job market analytics.\n2. 📁 Resume Lab & Upload - Parse your CV instantly, see your match score, and rewrite bullets live.\n3. 🔍 Job Search Tracker - Hunt jobs with high fidelity filters, track applications, and compile cover letters.\n4. 💬 AI Interview Coach - Participate in fully realistic role-play feedback loops powered by Gemini.\n5. 🗺️ Learning Roadmaps - Generate structured career milestone roadmaps to achieve technical superiority.\n\nLog in now to launch your career: http://localhost:3000\n\nTo your continuous elevation,\nThe Aura Copilot Engineering Team`
      },
      premium: {
        name: '💎 VIP Premium 50% Liftoff Offer',
        subject: '💎 VIP Invitation: Secure 50% Off Lifetime Premium Access!',
        body: `Hello Outstanding Professional,\n\nAs part of our exclusive Aura Copilot launch cohort, we are inviting you to upgrade to the VIP Premium Flight Plan at a massive 50% discount!\n\nPremium Unlocks:\n- Unlimited Gemini-3.5-Pro CV critiques and personalized roadmap expansions.\n- Unrestricted mock interview role-play simulations with elite industrial categories.\n- Direct access to high-fidelity job search aggregator indexes.\n\nUse Code: AURAVIP50 on your setting tab to secure this exclusive discount today!\n\nElevate your career trajectory now: http://localhost:3000\n\nWarm regards,\nThe Aura Operations Board`
      },
      digest: {
        name: '🎯 Monthly Career Advancement Digest',
        subject: '🎯 Master Your Interview Loop with Generative AI Predictions',
        body: `Hello Future Leader,\n\nIn this month's Aura Tech Career Digest, our elite talent advisors share three secrets to securing senior engineering offers in 2026:\n\n1. Quantify Your Experience: Always write your achievements in Google's X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".\n2. AI Interview Sandbox: Use our mock coach to practice response structure. Aim for the STAR format (Situation, Task, Action, Result).\n3. High-Performance Roadmaps: Keep updating your skill tree using our personalized learning modules to stay ahead of market specifications.\n\nRead the full career analysis on your Welcome Portal now!\n\nKeep pushing boundaries,\nThe Aura Mentorship Circle`
      },
      blank: {
        name: '📝 Custom Broadcast (Blank Canvas)',
        subject: '',
        body: ''
      }
    };
  }, []);

  // --- Fetch users from the real database ---
  const fetchAdminUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const response = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        throw new Error('Access denied. Administrator privileges could not be verified.');
      }
      const data = await response.json();
      const usersList = data.users || [];
      setAdminUsers(usersList);
      
      // Auto-select all users by default for campaign dispatch
      setSelectedEmails(usersList.map((u: any) => u.email));
    } catch (err: any) {
      setUsersError(err.message || 'Fatal error loading user directories.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchAdminUsers();
  }, [user.email]);

  // Set preset templates when dropdown matches
  useEffect(() => {
    const activeTemplate = templates[selectedTemplate as keyof typeof templates];
    if (activeTemplate) {
      setCampaignSubject(activeTemplate.subject);
      setCampaignBody(activeTemplate.body);
    }
  }, [selectedTemplate, templates]);

  // --- Filter and Search Directory Users ---
  const filteredUsers = useMemo(() => {
    return adminUsers.filter(u => {
      const query = userSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) || 
        (u.targetRole && u.targetRole.toLowerCase().includes(query)) ||
        (u.targetIndustry && u.targetIndustry.toLowerCase().includes(query));

      const matchesRole = userFilterRole === 'ALL' || u.role === userFilterRole;
      return matchesSearch && matchesRole;
    });
  }, [adminUsers, userSearchQuery, userFilterRole]);

  // Toggle selection
  const toggleSelectEmail = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const toggleSelectAll = () => {
    const visibleEmails = filteredUsers.map(u => u.email);
    const allSelected = visibleEmails.every(e => selectedEmails.includes(e));

    if (allSelected) {
      // Unselect only the visible ones
      setSelectedEmails(prev => prev.filter(e => !visibleEmails.includes(e)));
    } else {
      // Select the visible ones
      setSelectedEmails(prev => Array.from(new Set([...prev, ...visibleEmails])));
    }
  };

  // --- Handle Campaign Delivery ---
  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject.trim()) {
      alert('Please specify an interesting campaign subject.');
      return;
    }
    if (!campaignBody.trim()) {
      alert('Please compose your message content.');
      return;
    }
    if (selectedEmails.length === 0) {
      alert('Please select at least one recipient email address from the left table.');
      return;
    }

    setIsSendingNewsletter(true);
    setNewsletterResult(null);

    try {
      const response = await fetch('/api/admin/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email,
          subject: campaignSubject,
          content: campaignBody,
          recipientEmails: selectedEmails
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to dispatch email newsletter.');
      }

      const res = await response.json();
      setNewsletterResult({
        success: true,
        message: res.message || 'Campaign successfully dispatched.',
        timestamp: res.timestamp || new Date().toLocaleTimeString()
      });

      // Add dispatch to live logs simulation for realistic system tracking
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [
        ...prev,
        {
          id: String(prev.length + 1),
          timestamp: timeNow,
          service: 'System Router',
          level: 'SUCCESS',
          message: `Newsletter Dispatched: "${campaignSubject}" dispatched successfully to ${selectedEmails.length} recipients.`,
          latencyMs: Math.floor(Math.random() * 250) + 150
        }
      ]);

      // If custom template, keep it; otherwise clear
      if (selectedTemplate === 'blank') {
        setCampaignSubject('');
        setCampaignBody('');
      }

    } catch (err: any) {
      setNewsletterResult({
        success: false,
        message: err.message || 'Network anomaly encountered during broadcast.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  // --- Computed stats for active view ---
  const currentSignups = useMemo(() => {
    const data = timeframe === '7d' ? signupData7d : timeframe === '30d' ? signupData30d : signupData6m;
    const totalOrg = data.reduce((acc, curr) => acc + (curr.organic || 0), 0);
    const totalPrem = data.reduce((acc, curr) => acc + (curr.premium || 0), 0);
    return { total: totalOrg + totalPrem, organic: totalOrg, premium: totalPrem };
  }, [timeframe, signupData7d, signupData30d, signupData6m]);

  const currentRequests = useMemo(() => {
    const data = timeframe === '7d' ? apiRequests7d : timeframe === '30d' ? apiRequests30d : apiRequests6m;
    const geminiTotal = data.reduce((acc, curr) => acc + (curr.gemini || 0), 0);
    const jsearchTotal = data.reduce((acc, curr) => acc + (curr.jsearch || 0), 0);
    const parserTotal = data.reduce((acc, curr) => acc + (curr.parser || 0), 0);
    return { total: geminiTotal + jsearchTotal + parserTotal, gemini: geminiTotal, jsearch: jsearchTotal, parser: parserTotal };
  }, [timeframe, apiRequests7d, apiRequests30d, apiRequests6m]);

  const currentErrorRate = useMemo(() => {
    const data = timeframe === '7d' ? errorRate7d : timeframe === '30d' ? errorRate30d : errorRate6m;
    const avg = data.reduce((acc, curr) => acc + curr.rate, 0) / data.length;
    return parseFloat(avg.toFixed(2));
  }, [timeframe, errorRate7d, errorRate30d, errorRate6m]);

  const trafficShareData = useMemo(() => {
    return [
      { name: 'Gemini AI Engine', value: currentRequests.gemini, color: '#a78bfa' },
      { name: 'JSearch Jobs API', value: currentRequests.jsearch, color: '#34d399' },
      { name: 'Resume Lab Parser', value: currentRequests.parser, color: '#60a5fa' },
    ];
  }, [currentRequests]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase()) || 
                            log.service.toLowerCase().includes(logSearch.toLowerCase());
      const matchesLevel = logLevelFilter === 'ALL' || log.level === logLevelFilter;
      const matchesService = logServiceFilter === 'ALL' || log.service === logServiceFilter;
      return matchesSearch && matchesLevel && matchesService;
    }).reverse();
  }, [logs, logSearch, logLevelFilter, logServiceFilter]);

  // Simulator actions
  const triggerSimulation = (type: 'signup' | 'request' | 'error' | 'clear') => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const randLatency = Math.floor(Math.random() * 450) + 50;

    if (type === 'signup') {
      setSignupData7d(prev => {
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        copy[lastIndex] = {
          ...copy[lastIndex],
          organic: copy[lastIndex].organic + 1,
          premium: Math.random() > 0.6 ? copy[lastIndex].premium + 1 : copy[lastIndex].premium
        };
        return copy;
      });

      setLogs(prev => [
        ...prev,
        {
          id: String(prev.length + 1),
          timestamp: timeNow,
          service: 'Auth',
          level: 'SUCCESS',
          message: `Simulated Sign-Up: New career seeker registered under SECURE SHA-256 cluster.`,
          latencyMs: randLatency
        }
      ]);
    }

    else if (type === 'request') {
      setApiRequests7d(prev => {
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        copy[lastIndex] = {
          ...copy[lastIndex],
          gemini: copy[lastIndex].gemini + 25,
          jsearch: copy[lastIndex].jsearch + 15,
          parser: copy[lastIndex].parser + 10
        };
        return copy;
      });

      const services: ('Gemini AI' | 'JSearch Jobs' | 'Resume Lab')[] = ['Gemini AI', 'JSearch Jobs', 'Resume Lab'];
      const chosenService = services[Math.floor(Math.random() * services.length)];
      setLogs(prev => [
        ...prev,
        {
          id: String(prev.length + 1),
          timestamp: timeNow,
          service: chosenService,
          level: 'SUCCESS',
          message: `Operations Event: Load balancer routed request to secure regional cluster server.`,
          latencyMs: randLatency
        }
      ]);
    }

    else if (type === 'error') {
      setErrorRate7d(prev => {
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        copy[lastIndex] = {
          ...copy[lastIndex],
          rate: parseFloat((copy[lastIndex].rate + 0.8).toFixed(1))
        };
        return copy;
      });

      const errServices: ('Gemini AI' | 'JSearch Jobs' | 'Resume Lab' | 'System Router')[] = ['Gemini AI', 'JSearch Jobs', 'Resume Lab', 'System Router'];
      const chosenErrService = errServices[Math.floor(Math.random() * errServices.length)];
      const errors = [
        'Rate limit exhausted on downstream integration API pipeline.',
        'Token parsing buffer overload. Memory optimization fallback triggered.',
        'Host connection threshold exceeded. Request routed to safe queue.',
        '502 Bad Gateway response caught on secondary proxy handler.'
      ];
      const errMsg = errors[Math.floor(Math.random() * errors.length)];

      setLogs(prev => [
        ...prev,
        {
          id: String(prev.length + 1),
          timestamp: timeNow,
          service: chosenErrService,
          level: 'ERROR',
          message: `SIMULATED ERROR: ${errMsg}`,
          latencyMs: Math.floor(Math.random() * 2000) + 1200
        }
      ]);
    }

    else if (type === 'clear') {
      setLogs([]);
    }
  };

  useEffect(() => {
    if (simulationSpeed === 0) return;
    const interval = setInterval(() => {
      const coin = Math.random();
      if (coin < 0.6) {
        triggerSimulation('request');
      } else if (coin < 0.85) {
        if (Math.random() > 0.85) {
          triggerSimulation('error');
        } else {
          triggerSimulation('request');
        }
      } else {
        triggerSimulation('signup');
      }
    }, 4000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [simulationSpeed]);

  const triggerTrafficSpike = () => {
    setIsSimulatingSpike(true);
    for (let i = 0; i < 8; i++) {
      triggerSimulation('request');
    }
    triggerSimulation('error');
    setTimeout(() => {
      setIsSimulatingSpike(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 transition-colors border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>
            <Activity className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            <span>Aura Control Center</span>
          </h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Superuser operations flightdeck. Manage user directories, broadcast highly stylized email campaigns, and view telemetry metrics.
          </p>
        </div>

        {/* Sub-Tab Selector Toggles */}
        <div className={`p-1 rounded-xl border flex gap-1 items-center self-start md:self-center ${
          isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'telemetry'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm font-extrabold'
                  : 'bg-green-400 text-neutral-950 font-extrabold'
                : isLight
                ? 'text-neutral-500 hover:text-neutral-800'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Telemetry & Logs</span>
          </button>
          <button
            onClick={() => setActiveSubTab('newsletter')}
            className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'newsletter'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm font-extrabold'
                  : 'bg-green-400 text-neutral-950 font-extrabold'
                : isLight
                ? 'text-neutral-500 hover:text-neutral-800'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Newsletter Campaign ({adminUsers.length})</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'telemetry' ? (
          <motion.div
            key="telemetry"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Timeframe selector */}
            <div className="flex items-center justify-between">
              <h2 className={`text-xs font-display font-bold uppercase tracking-widest ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                1. Performance & Signups Summary
              </h2>
              <div className={`p-0.5 rounded-lg border flex gap-0.5 items-center ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-850'
              }`}>
                {(['7d', '30d', '6m'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                      timeframe === t
                        ? isLight
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'bg-green-400 text-neutral-950'
                        : 'text-neutral-450 hover:text-neutral-200'
                    }`}
                  >
                    {t === '7d' ? '7D' : t === '30d' ? '30D' : '6M'}
                  </button>
                ))}
              </div>
            </div>

            {/* Operational KPI summary widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1 */}
              <div className={`border p-4.5 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Registered Signups</span>
                  <div className="text-2xl font-black font-display tracking-tight">
                    {currentSignups.total}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                    <span className={isLight ? 'text-indigo-600 font-bold' : 'text-green-400 font-bold'}>
                      {Math.round((currentSignups.premium / (currentSignups.total || 1)) * 100)}%
                    </span>
                    <span>premium conversion</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-green-400/10 text-green-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 2 */}
              <div className={`border p-4.5 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Total API Requests</span>
                  <div className="text-2xl font-black font-display tracking-tight">
                    {currentRequests.total.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                    <span className="text-emerald-500 font-bold">● Active</span>
                    <span>across 3 channels</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${isLight ? 'bg-purple-50 text-purple-600' : 'bg-purple-400/10 text-purple-400'}`}>
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 3 */}
              <div className={`border p-4.5 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Avg. Error Rate</span>
                  <div className="text-2xl font-black font-display tracking-tight flex items-baseline gap-1">
                    <span className={currentErrorRate > 2 ? 'text-amber-500' : isLight ? 'text-neutral-900' : 'text-white'}>
                      {currentErrorRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                    <span className={currentErrorRate > 2 ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {currentErrorRate > 2 ? 'Overheat warning' : 'Normal range'}
                    </span>
                    <span>(&lt; 2.5% threshold)</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${currentErrorRate > 2 ? 'bg-amber-50 text-amber-600' : isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-400/10 text-amber-400'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              {/* KPI 4 */}
              <div className={`border p-4.5 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Copilot Health Status</span>
                  <div className="text-lg font-black font-display tracking-tight uppercase flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-emerald-500">EXCELLENT</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                    <span>Nginx Proxy: </span>
                    <strong className={isLight ? 'text-indigo-600' : 'text-green-400'}>3000 binds</strong>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-400/10 text-emerald-400'}`}>
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Chart Card 1: User Signup Trends */}
              <div className={`lg:col-span-8 border rounded-2xl p-5 sm:p-6 transition-colors ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                    <h3 className={`font-display font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      User Registration Trends
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-450 font-bold uppercase">
                    Accumulated: {currentSignups.total} Users
                  </span>
                </div>

                <div className="h-[280px] w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timeframe === '7d' ? signupData7d : timeframe === '30d' ? signupData30d : signupData6m}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isLight ? '#4f46e5' : '#4ade80'} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={isLight ? '#4f46e5' : '#4ade80'} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#f3f4f6' : '#262626'} />
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isLight ? '#ffffff' : '#0a0a0a', 
                          borderColor: isLight ? '#e5e7eb' : '#262626',
                          borderRadius: '8px',
                          color: isLight ? '#000' : '#fff'
                        }} 
                      />
                      <Legend iconType="circle" />
                      <Area 
                        type="monotone" 
                        name="Organic Account Signups" 
                        dataKey="organic" 
                        stroke={isLight ? '#4f46e5' : '#4ade80'} 
                        fillOpacity={1} 
                        fill="url(#colorOrganic)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        name="Premium VIP Upgrades" 
                        dataKey="premium" 
                        stroke="#c084fc" 
                        fillOpacity={1} 
                        fill="url(#colorPremium)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart Card 2: Pie Traffic Share */}
              <div className={`lg:col-span-4 border rounded-2xl p-5 sm:p-6 transition-colors flex flex-col justify-between ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-4 border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Sliders className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                      <h3 className={`font-display font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        Traffic Channel Share
                      </h3>
                    </div>
                  </div>

                  <div className="h-[210px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {trafficShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isLight ? '#ffffff' : '#0a0a0a', 
                            borderColor: isLight ? '#e5e7eb' : '#262626',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-dashed border-neutral-800/40">
                  {trafficShareData.map((channel, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channel.color }} />
                        <span className={isLight ? 'text-neutral-700' : 'text-neutral-300'}>{channel.name}</span>
                      </div>
                      <span className="font-mono text-neutral-450 font-bold">
                        {channel.value.toLocaleString()} ({Math.round((channel.value / (currentRequests.total || 1)) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* API failure metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart Card 3: Stacked API request volume */}
              <div className={`lg:col-span-6 border rounded-2xl p-5 sm:p-6 transition-colors ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Server className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                    <h3 className={`font-display font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      API Request Counts by Channel
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-450 font-bold uppercase">
                    Accumulated: {currentRequests.total.toLocaleString()}
                  </span>
                </div>

                <div className="h-[250px] w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeframe === '7d' ? apiRequests7d : timeframe === '30d' ? apiRequests30d : apiRequests6m}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#f3f4f6' : '#262626'} />
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isLight ? '#ffffff' : '#0a0a0a', 
                          borderColor: isLight ? '#e5e7eb' : '#262626',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="gemini" name="Gemini AI API" stackId="a" fill="#a78bfa" />
                      <Bar dataKey="jsearch" name="JSearch Jobs API" stackId="a" fill="#34d399" />
                      <Bar dataKey="parser" name="Resume Parser" stackId="a" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart Card 4: System Error Rates */}
              <div className={`lg:col-span-6 border rounded-2xl p-5 sm:p-6 transition-colors ${
                isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <h3 className={`font-display font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      API Failure & Error Rates
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-450 font-bold uppercase">
                    Average: {currentErrorRate}%
                  </span>
                </div>

                <div className="h-[250px] w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeframe === '7d' ? errorRate7d : timeframe === '30d' ? errorRate30d : errorRate6m}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#f3f4f6' : '#262626'} />
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isLight ? '#ffffff' : '#0a0a0a', 
                          borderColor: isLight ? '#e5e7eb' : '#262626',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend iconType="circle" />
                      <Line 
                        type="monotone" 
                        name="Error Rate (%)" 
                        dataKey="rate" 
                        stroke="#fbbf24" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Simulator Control Panel and Live Logs Feed Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Interactive Simulation Control Panel */}
              <div className={`lg:col-span-4 border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-colors ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 border-b pb-2 border-neutral-200 dark:border-neutral-800">
                    <Sliders className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                    <h3 className="font-display font-black text-xs uppercase tracking-wider">Telemetry Simulator</h3>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
                    Inject mock pipeline requests, errors, and signups to immediately verify system stability and reactive dashboards.
                  </p>

                  <div className="space-y-4 pt-1">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                        Automated Load Rate: {simulationSpeed === 0 ? 'PAUSED' : `${simulationSpeed}x speed`}
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[0, 1, 2, 5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => setSimulationSpeed(speed)}
                            className={`py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded border cursor-pointer transition-all ${
                              simulationSpeed === speed
                                ? isLight
                                  ? 'bg-indigo-600 border-indigo-600 text-white font-extrabold'
                                  : 'bg-green-400 border-green-400 text-neutral-950 font-extrabold'
                                : isLight
                                ? 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                                : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:bg-neutral-900'
                            }`}
                          >
                            {speed === 0 ? 'Pause' : `${speed}x`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="block text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                        Inject Simulated Host Actions
                      </span>

                      <div className="space-y-2">
                        <button
                          onClick={() => triggerSimulation('signup')}
                          className={`w-full py-2 px-3 rounded-lg border text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                            isLight 
                              ? 'border-indigo-150 bg-indigo-50/40 text-indigo-950 hover:bg-indigo-50' 
                              : 'border-green-400/20 bg-green-400/5 text-green-300 hover:bg-green-400/10'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Simulate User Registration</span>
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => triggerSimulation('request')}
                          className={`w-full py-2 px-3 rounded-lg border text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                            isLight 
                              ? 'border-neutral-250 bg-neutral-50 text-neutral-800 hover:bg-neutral-100' 
                              : 'border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:bg-neutral-950'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Simulate Standard API Request</span>
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => triggerSimulation('error')}
                          className="w-full py-2 px-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-all"
                        >
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span>Inject Simulated 502 Pipeline Error</span>
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={triggerTrafficSpike}
                          disabled={isSimulatingSpike}
                          className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-display font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                            isSimulatingSpike
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-750'
                              : isLight
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                              : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                          }`}
                        >
                          {isSimulatingSpike ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Injecting Spike...</span>
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4" />
                              <span>Simulate Bulk Traffic Spike</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-neutral-500 border-neutral-200 dark:border-neutral-800">
                  <span>Simulation State: <strong>ONLINE</strong></span>
                  <button 
                    onClick={() => triggerSimulation('clear')}
                    className="hover:text-red-400 underline cursor-pointer"
                  >
                    Clear Terminal Log
                  </button>
                </div>
              </div>

              {/* Right Column: Live Logs Feed Terminal */}
              <div className={`lg:col-span-8 border rounded-2xl flex flex-col justify-between transition-colors overflow-hidden ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                
                {/* Header bar of Terminal with controls */}
                <div className={`px-4.5 py-3.5 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                  isLight ? 'bg-neutral-50 border-neutral-150' : 'bg-neutral-950 border-neutral-850'
                }`}>
                  <div className="flex items-center gap-2">
                    <Terminal className={`w-4.5 h-4.5 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                    <h3 className="font-display font-black text-xs uppercase tracking-wider">Live System Logs Feed</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={logLevelFilter}
                      onChange={(e) => setLogLevelFilter(e.target.value as any)}
                      className={`px-2 py-1 text-[10.5px] font-mono font-bold uppercase tracking-wide rounded border focus:outline-none focus:ring-1 focus:ring-green-400 ${
                        isLight 
                          ? 'border-neutral-200 bg-white text-neutral-700' 
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300'
                      }`}
                    >
                      <option value="ALL">All Levels</option>
                      <option value="SUCCESS">Success Only</option>
                      <option value="INFO">Info Only</option>
                      <option value="WARNING">Warning Only</option>
                      <option value="ERROR">Errors Only</option>
                    </select>

                    <select
                      value={logServiceFilter}
                      onChange={(e) => setLogServiceFilter(e.target.value as any)}
                      className={`px-2 py-1 text-[10.5px] font-mono font-bold uppercase tracking-wide rounded border focus:outline-none focus:ring-1 focus:ring-green-400 ${
                        isLight 
                          ? 'border-neutral-200 bg-white text-neutral-700' 
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300'
                      }`}
                    >
                      <option value="ALL">All Services</option>
                      <option value="Auth">Auth Gateway</option>
                      <option value="Gemini AI">Gemini AI</option>
                      <option value="JSearch Jobs">JSearch Jobs</option>
                      <option value="Resume Lab">Resume Lab</option>
                    </select>
                  </div>
                </div>

                {/* Search container */}
                <div className={`px-4 py-2.5 border-b flex items-center gap-2.5 ${
                  isLight ? 'bg-neutral-50/40 border-neutral-150' : 'bg-neutral-950/20 border-neutral-850'
                }`}>
                  <Search className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs by keyword..."
                    className={`w-full bg-transparent text-[11px] font-mono focus:outline-none ${
                      isLight ? 'text-neutral-900' : 'text-white'
                    }`}
                  />
                  {logSearch && (
                    <button 
                      onClick={() => setLogSearch('')}
                      className="text-[10px] font-mono text-neutral-400 hover:text-red-400 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Console text */}
                <div className={`flex-1 p-4.5 min-h-[220px] max-h-[300px] overflow-y-auto font-mono text-[10.5px] space-y-2 leading-relaxed ${
                  isLight ? 'bg-neutral-950 text-neutral-300' : 'bg-neutral-950 text-neutral-300'
                }`}>
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-neutral-600 font-bold">
                      &gt; NO LIVE SYSTEM LOGS MATCHED ACTIVE FILTERS
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {filteredLogs.map((log) => {
                        let badgeColor = 'text-blue-400';
                        if (log.level === 'SUCCESS') badgeColor = 'text-emerald-400';
                        if (log.level === 'WARNING') badgeColor = 'text-amber-400';
                        if (log.level === 'ERROR') badgeColor = 'text-red-500 font-bold';

                        return (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-b border-neutral-900/40 pb-1.5 last:border-0 hover:bg-neutral-900/30 px-1 py-0.5 rounded transition-colors"
                          >
                            <span className="text-neutral-500 mr-2 font-semibold">[{log.timestamp}]</span>
                            <span className={`${badgeColor} mr-2 font-black`}>[{log.level}]</span>
                            <span className="text-purple-400 mr-2 font-bold">&lt;{log.service}&gt;</span>
                            <span className="text-neutral-100">{log.message}</span>
                            {log.latencyMs !== undefined && (
                              <span className="text-neutral-500 ml-2 font-semibold">({log.latencyMs}ms)</span>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Footer status statistics */}
                <div className={`px-4.5 py-3 border-t flex items-center justify-between text-[10px] font-mono ${
                  isLight ? 'bg-neutral-50 border-neutral-150 text-neutral-500' : 'bg-neutral-950 border-neutral-850 text-neutral-400'
                }`}>
                  <span>Showing {filteredLogs.length} matching logs</span>
                  <span>Ingress Stream: <strong className="text-emerald-400 font-extrabold animate-pulse">● FEED ONLINE</strong></span>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="newsletter"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left Column: Registered Users list directory with mail toggles */}
            <div className={`lg:col-span-7 border rounded-2xl p-5 sm:p-6 transition-all ${
              isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-4 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Users className={`w-4.5 h-4.5 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">
                    Recipient User Directory
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-950 px-2.5 py-1 rounded-md font-bold">
                  {selectedEmails.length} of {filteredUsers.length} Targeted
                </span>
              </div>

              {/* Filtering / Search panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                  isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-850'
                }`}>
                  <Search className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search name, email, role..."
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-neutral-900 dark:text-neutral-100"
                  />
                  {userSearchQuery && (
                    <button 
                      onClick={() => setUserSearchQuery('')}
                      className="text-[10px] text-neutral-450 hover:text-red-400 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-450 uppercase font-bold flex-shrink-0">Filter Role:</span>
                  <select
                    value={userFilterRole}
                    onChange={(e) => setUserFilterRole(e.target.value as any)}
                    className={`w-full px-2 py-1.5 text-xs font-mono font-bold uppercase rounded border focus:outline-none ${
                      isLight 
                        ? 'border-neutral-200 bg-white text-neutral-700' 
                        : 'border-neutral-850 bg-neutral-950 text-neutral-300'
                    }`}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="user">Standard Seekers Only</option>
                    <option value="admin">Administrators Only</option>
                  </select>
                </div>
              </div>

              {/* Loading / Error/ User List Grid */}
              {isLoadingUsers ? (
                <div className="text-center py-16 space-y-3">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto text-green-400" />
                  <p className="text-xs font-mono text-neutral-400">Querying registered user tables...</p>
                </div>
              ) : usersError ? (
                <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-center space-y-2">
                  <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
                  <p className="text-xs font-mono text-red-400">{usersError}</p>
                  <button 
                    onClick={fetchAdminUsers}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[10px] font-mono uppercase font-bold rounded-md"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-xl border-neutral-200 dark:border-neutral-800 text-neutral-450">
                  <Users className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <p className="text-xs font-bold font-display uppercase tracking-wide">No registered users matched filters</p>
                  <button 
                    onClick={() => { setUserSearchQuery(''); setUserFilterRole('ALL'); }}
                    className="text-[10px] font-mono text-green-400 mt-1 underline"
                  >
                    Reset Active Filters
                  </button>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden border-neutral-200 dark:border-neutral-800">
                  {/* Table headers */}
                  <div className={`px-4 py-2 text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 ${
                    isLight ? 'bg-neutral-50 text-neutral-500' : 'bg-neutral-950 text-neutral-400'
                  }`}>
                    <div className="flex items-center gap-3 w-1/2">
                      <button 
                        onClick={toggleSelectAll}
                        className={`p-1 rounded transition-colors ${
                          isLight ? 'hover:bg-neutral-200 text-indigo-600' : 'hover:bg-neutral-850 text-green-400'
                        }`}
                        title="Select or deselect visible list"
                      >
                        <span className="text-[10px] underline font-bold tracking-tight">Toggle All</span>
                      </button>
                      <span>Registered Email / Name</span>
                    </div>
                    <span className="w-1/3 text-right">Job Target & Industry</span>
                    <span className="w-1/6 text-right">Access Role</span>
                  </div>

                  {/* Users rows list */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-850">
                    {filteredUsers.map((u) => {
                      const isSelected = selectedEmails.includes(u.email);
                      return (
                        <div 
                          key={u.email} 
                          className={`px-4 py-3 text-xs flex items-center justify-between transition-all group ${
                            isSelected 
                              ? isLight 
                                ? 'bg-indigo-50/20' 
                                : 'bg-green-400/5' 
                              : isLight 
                              ? 'hover:bg-neutral-50' 
                              : 'hover:bg-neutral-950/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 w-1/2 min-w-0">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleSelectEmail(u.email)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                isSelected 
                                  ? isLight 
                                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                                    : 'bg-green-400 border-green-400 text-neutral-950'
                                  : isLight 
                                  ? 'border-neutral-300 hover:border-indigo-600' 
                                  : 'border-neutral-800 hover:border-green-400'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            {/* Email Details */}
                            <div className="min-w-0">
                              <span className={`block font-semibold font-display tracking-wide truncate ${
                                isLight ? 'text-neutral-950' : 'text-neutral-100'
                              }`}>
                                {u.email}
                              </span>
                              <span className="text-[10px] font-semibold text-neutral-500 font-mono flex items-center gap-1.5 mt-0.5">
                                <span>{u.name || 'Anonymous User'}</span>
                                {u.emailVerified ? (
                                  <span className="text-[8px] font-bold px-1 py-0.2 bg-emerald-500/10 text-emerald-500 rounded uppercase">Verified</span>
                                ) : (
                                  <span className="text-[8px] font-bold px-1 py-0.2 bg-amber-500/10 text-amber-500 rounded uppercase">Pending</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Target and Industry */}
                          <div className="w-1/3 text-right text-[10.5px] truncate font-semibold pl-2">
                            <span className={`block truncate ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                              {u.targetRole || 'Not specified'}
                            </span>
                            <span className="text-[9px] text-neutral-500 font-mono uppercase font-bold tracking-tight">
                              {u.targetIndustry || 'General'} · Score: {u.resumeScore || 0}
                            </span>
                          </div>

                          {/* Access Badge */}
                          <div className="w-1/6 text-right font-mono">
                            <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              u.role === 'admin' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/25' 
                                : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-450 border-neutral-200 dark:border-neutral-850'
                            }`}>
                              {u.role || 'user'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Campaign composer and preset manager */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Composite Composer Form */}
              <div className={`border rounded-2xl p-5 sm:p-6 transition-all ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="flex items-center gap-2 border-b pb-3 mb-4 border-neutral-200 dark:border-neutral-800">
                  <MailOpen className={`w-4.5 h-4.5 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">
                    Compose Campaign Dispatch
                  </h3>
                </div>

                <form onSubmit={handleSendNewsletter} className="space-y-4">
                  {/* Select Preset Template */}
                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-mono font-bold text-neutral-450 uppercase tracking-wider">
                      Select Campaign Presets:
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-400 ${
                        isLight 
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-850' 
                          : 'border-neutral-800 bg-neutral-950 text-neutral-200'
                      }`}
                    >
                      {Object.entries(templates).map(([key, val]: [string, any]) => (
                        <option key={key} value={key}>
                          {val.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campaign Subject */}
                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-mono font-bold text-neutral-450 uppercase tracking-wider">
                      Campaign Subject Line:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 🚀 Welcome to Aura Copilot..."
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-green-400 font-semibold ${
                        isLight 
                          ? 'border-neutral-200 text-neutral-900' 
                          : 'border-neutral-800 bg-neutral-950 text-white'
                      }`}
                    />
                  </div>

                  {/* Campaign Message Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[9.5px] font-mono font-bold text-neutral-450 uppercase tracking-wider">
                        Email Message Body:
                      </label>
                      <span className="text-[9px] font-mono text-neutral-500 font-bold">
                        {campaignBody.length} Characters
                      </span>
                    </div>
                    <textarea
                      required
                      rows={12}
                      placeholder="Compose elegant campaign content..."
                      value={campaignBody}
                      onChange={(e) => setCampaignBody(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-green-400 font-mono leading-relaxed ${
                        isLight 
                          ? 'border-neutral-200 text-neutral-900' 
                          : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                      }`}
                    />
                  </div>

                  {/* Targets Stat Box */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    selectedEmails.length === 0
                      ? 'border-red-500/20 bg-red-500/5 text-red-400'
                      : isLight
                      ? 'border-indigo-100 bg-indigo-50/30 text-indigo-900'
                      : 'border-green-400/20 bg-green-400/5 text-green-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      <span>Targeting Audience:</span>
                    </div>
                    <span className="font-mono font-bold text-sm">
                      {selectedEmails.length} Recipients
                    </span>
                  </div>

                  {/* Dispatch Button */}
                  <button
                    type="submit"
                    disabled={isSendingNewsletter || selectedEmails.length === 0}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                      selectedEmails.length === 0
                        ? 'bg-neutral-800 border-neutral-750 text-neutral-500 cursor-not-allowed shadow-none'
                        : isSendingNewsletter
                        ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                        : isLight
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                        : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                    }`}
                  >
                    {isSendingNewsletter ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Broadcasting Newsletter...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Campaign Broadcast</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Newsletter Campaign Result Banner */}
              <AnimatePresence>
                {newsletterResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                      newsletterResult.success
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                        : 'border-red-500/20 bg-red-500/5 text-red-450'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-display font-black uppercase tracking-wider text-[11px]">
                      {newsletterResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span>
                        {newsletterResult.success ? 'Campaign Broadcast Dispatched!' : 'Broadcast Failed!'}
                      </span>
                    </div>
                    <p className="font-semibold text-neutral-300">
                      {newsletterResult.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-850">
                      <span>Server Timestamp: <strong>{newsletterResult.timestamp}</strong></span>
                      <span>Target Count: <strong>{selectedEmails.length} Users</strong></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
