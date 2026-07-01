import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  ExternalLink, 
  Plus, 
  Check, 
  Database, 
  Cpu, 
  Info,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserProfile, JobApplication } from '../types';

interface JobsViewProps {
  user: UserProfile;
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  description: string;
  source: 'JSearch' | 'Adzuna' | 'Indeed' | 'LinkedIn' | 'AI Fallback';
  date_posted?: string;
}

interface DbStats {
  connected: boolean;
  dbType: string;
  totalApps: number;
  cacheCount: number;
  apiKeys: {
    jsearch: boolean;
    adzuna: boolean;
    indeed: boolean;
    linkedin: boolean;
    gemini: boolean;
  };
}

export default function JobsView({ user, applications, setApplications }: JobsViewProps) {
  const [query, setQuery] = useState(user.targetRole || '');
  const [location, setLocation] = useState('Remote');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [stats, setStats] = useState<DbStats>({
    connected: true,
    dbType: 'SQLite (career_copilot.db)',
    totalApps: applications.length,
    cacheCount: 0,
    apiKeys: {
      jsearch: false,
      adzuna: false,
      indeed: false,
      linkedin: false,
      gemini: true
    }
  });
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'info'} | null>(null);

  // Load database and API stats on mount
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/db-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          totalApps: data.totalApps,
          cacheCount: data.cacheCount,
          apiKeys: data.apiKeys
        }));
      }
    } catch (e) {
      console.error('Failed to load DB stats', e);
    }
  };

  useEffect(() => {
    fetchStats();
    handleSearch(true); // Initial search based on user profile
  }, []);

  // Sync applications count when the applications state changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalApps: applications.length
    }));
  }, [applications]);

  const handleSearch = async (isInitial = false) => {
    setIsLoading(true);
    setNotification(null);
    try {
      const sourceParam = selectedSource !== 'all' ? `&source=${selectedSource}` : '';
      const res = await fetch(`/api/jobs/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}${sourceParam}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.fromCache) {
          showNotification('Retrieved matching job listings directly from SQLite local cache!', 'info');
        }
        fetchStats(); // Update active cache count
      } else {
        const errData = await res.json();
        showNotification(errData.error || 'Failed to fetch job listings.', 'info');
      }
    } catch (e) {
      console.error('Error during job search:', e);
      showNotification('Unable to connect to backend search services.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleAddToTracker = async (job: JobListing) => {
    // Check if already added
    if (applications.some(app => app.company.toLowerCase() === job.company.toLowerCase() && app.role.toLowerCase() === job.title.toLowerCase())) {
      showNotification(`You are already tracking the ${job.title} position at ${job.company}!`, 'info');
      return;
    }

    try {
      const newApp = {
        company: job.company,
        role: job.title,
        salary: job.salary || 'Not specified',
        location: job.location || 'Remote',
        status: 'wishlist' as const,
        dateApplied: new Date().toISOString().split('T')[0],
        link: job.url,
        notes: `Imported from ${job.source} Job Search. Description:\n${job.description.substring(0, 300)}...`
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });

      if (response.ok) {
        const savedApp = await response.json();
        setApplications(prev => [savedApp, ...prev]);
        showNotification(`Successfully added ${job.title} at ${job.company} to your Application Tracker wishlist!`, 'success');
        fetchStats();
      } else {
        showNotification('Failed to add job to tracking board.', 'info');
      }
    } catch (e) {
      console.error('Failed to add job to tracker', e);
      showNotification('Connection error while adding job to tracker.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-2 uppercase">
            <Search className="text-green-400 w-6 h-6" />
            <span>Multi-API Job Listing Directory</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1 font-sans">
            Search live job openings compiled across premium sources: JSearch, Adzuna, Indeed, and LinkedIn, powered by SQLite caching.
          </p>
        </div>
      </div>

      {/* Persistence Architecture Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-400/10 text-green-400 mt-0.5">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider block">Database Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider">{stats.dbType}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-sans block mt-1">
              Active tracked board: <strong>{stats.totalApps}</strong> applications.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-400/10 text-green-400 mt-0.5">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider block">SQLite Caching Layer</span>
            <span className="text-xs font-display font-extrabold text-green-400 uppercase mt-0.5 block tracking-widest bg-neutral-950/60 px-1.5 py-0.5 rounded border border-neutral-800 inline-block">
              {stats.cacheCount} Cached Queries
            </span>
            <span className="text-[10px] text-neutral-400 font-sans block mt-1">
              Limits external API calls & ensures instant loading.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-400/10 text-green-400 mt-0.5">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider block">API Config Status</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase border ${stats.apiKeys.jsearch ? 'bg-green-950/30 text-green-400 border-green-900/40' : 'bg-neutral-950 text-neutral-500 border-neutral-850'}`}>
                JSearch: {stats.apiKeys.jsearch ? 'LIVE' : 'AI'}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase border ${stats.apiKeys.adzuna ? 'bg-green-950/30 text-green-400 border-green-900/40' : 'bg-neutral-950 text-neutral-500 border-neutral-850'}`}>
                Adzuna: {stats.apiKeys.adzuna ? 'LIVE' : 'AI'}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase border ${stats.apiKeys.indeed ? 'bg-green-950/30 text-green-400 border-green-900/40' : 'bg-neutral-950 text-neutral-500 border-neutral-850'}`}>
                Indeed: {stats.apiKeys.indeed ? 'LIVE' : 'AI'}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase border ${stats.apiKeys.linkedin ? 'bg-green-950/30 text-green-400 border-green-900/40' : 'bg-neutral-950 text-neutral-500 border-neutral-850'}`}>
                LinkedIn: {stats.apiKeys.linkedin ? 'LIVE' : 'AI'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-3.5 rounded-lg border text-xs font-sans flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
              : 'bg-neutral-900 border-green-500/20 text-neutral-200'
          }`}
        >
          <Info className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Search Filter Controls Panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <label htmlFor="job-title" className="sr-only">Job Title or Keyword</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Briefcase className="w-4 h-4" />
            </div>
            <input
              id="job-title"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job Title, Keyword, or Skill (e.g. React Developer)"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-green-400 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none transition-colors font-sans"
            />
          </div>

          <div className="md:col-span-3 relative">
            <label htmlFor="job-location" className="sr-only">Location</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="job-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State, or Remote"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-green-400 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none transition-colors font-sans"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="source-select" className="sr-only">API Source</label>
            <select
              id="source-select"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-green-400 rounded-lg py-2 px-3 text-xs text-white outline-none transition-colors font-sans"
            >
              <option value="all">All API Sources</option>
              <option value="jsearch">JSearch API</option>
              <option value="adzuna">Adzuna API</option>
              <option value="indeed">Indeed API</option>
              <option value="linkedin">LinkedIn API</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-400 hover:bg-green-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-display font-extrabold uppercase tracking-widest text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Job Listings Results Stage */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/20 border border-neutral-850 rounded-lg gap-3">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          <div className="text-center">
            <p className="text-xs font-display font-bold text-white uppercase tracking-wider">Querying Job API Aggregators...</p>
            <p className="text-[10px] text-neutral-500 font-sans mt-0.5">SQLite is indexing and preparing to cache results.</p>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-neutral-900/20 border border-neutral-850 rounded-lg p-6 text-center">
          <Briefcase className="w-10 h-10 text-neutral-600 mb-2" />
          <h3 className="font-display font-bold text-sm text-neutral-300 uppercase tracking-wider">No openings found</h3>
          <p className="text-xs text-neutral-500 max-w-md mt-1 font-sans">
            Try adjusting your query keywords or location filters. Or clear the filter to search globally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const isTracked = applications.some(app => 
              app.company.toLowerCase() === job.company.toLowerCase() && 
              app.role.toLowerCase() === job.title.toLowerCase()
            );

            return (
              <motion.div
                key={job.id}
                whileHover={{ y: -2 }}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between hover:border-neutral-700 transition-all shadow-md hover:shadow-neutral-950/40"
              >
                <div className="space-y-3">
                  {/* Job Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850 inline-block mb-1.5">
                        {job.source} API
                      </span>
                      <h3 className="font-display font-black text-sm uppercase tracking-wide text-white leading-tight">
                        {job.title}
                      </h3>
                      <p className="text-xs font-display font-bold text-green-400 mt-0.5 uppercase tracking-wide">
                        {job.company}
                      </p>
                    </div>

                    <span className="text-[10px] text-neutral-400 font-sans flex items-center gap-1 bg-neutral-950/40 px-2 py-1 rounded border border-neutral-850/50 flex-shrink-0">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      <span>{job.location || 'Remote'}</span>
                    </span>
                  </div>

                  {/* Job Body */}
                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed font-sans">
                    {job.description}
                  </p>

                  {job.salary && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-300 font-mono">
                      <DollarSign className="w-3.5 h-3.5 text-green-400" />
                      <span>Salary Range: <strong className="text-white font-semibold">{job.salary}</strong></span>
                    </div>
                  )}
                </div>

                {/* Job Footer Action buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-neutral-850">
                  <span className="text-[9px] text-neutral-500 font-mono">
                    {job.date_posted ? `Posted: ${job.date_posted}` : 'Active opening'}
                  </span>

                  <div className="flex items-center gap-2">
                    {isTracked ? (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-950/20 px-2.5 py-1.5 rounded border border-emerald-900/30">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tracked</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToTracker(job)}
                        className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-green-400 hover:text-white font-mono text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded flex items-center gap-1 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-400"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Track</span>
                      </button>
                    )}

                    <a
                      href={job.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="bg-green-400 hover:bg-green-500 text-neutral-950 font-mono text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded flex items-center gap-1 transition-all focus:outline-none focus:ring-1 focus:ring-green-400"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3 text-neutral-950" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
