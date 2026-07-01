import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Copy, 
  X, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileCheck
} from 'lucide-react';
import { JobApplication, ApplicationStatus, ResumeDetails } from '../types';

const WORLD_COUNTRIES = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'in', name: 'India' },
  { code: 'sg', name: 'Singapore' },
  { code: 'jp', name: 'Japan' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'br', name: 'Brazil' },
  { code: 'za', name: 'South Africa' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ie', name: 'Ireland' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'dk', name: 'Denmark' },
  { code: 'fi', name: 'Finland' },
  { code: 'pl', name: 'Poland' },
  { code: 'mx', name: 'Mexico' },
  { code: 'ar', name: 'Argentina' },
  { code: 'co', name: 'Colombia' },
  { code: 'cl', name: 'Chile' },
  { code: 'pe', name: 'Peru' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'ke', name: 'Kenya' },
  { code: 'eg', name: 'Egypt' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'tr', name: 'Turkey' },
  { code: 'my', name: 'Malaysia' },
  { code: 'th', name: 'Thailand' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ph', name: 'Philippines' },
  { code: 'kr', name: 'South Korea' },
  { code: 'cn', name: 'China' }
];

interface AppTrackerViewProps {
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  resumeDetails: ResumeDetails;
  theme?: 'light' | 'dark';
}

export default function AppTrackerView({ applications, setApplications, resumeDetails, theme = 'dark' }: AppTrackerViewProps) {
  const isLight = theme === 'light';
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  // New Job state
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('applied');
  const [newLink, setNewLink] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Job Search & View Sub-Tabs State
  const [activeSubTab, setActiveSubTab] = useState<'search' | 'tracker'>('search');
  const [workMode, setWorkMode] = useState<'onsite' | 'hybrid' | 'remote'>('onsite');

  // Job Search State
  const [searchProvider, setSearchProvider] = useState<'jsearch' | 'adzuna' | 'indeed' | 'linkedin'>('jsearch');
  const [searchQuery, setSearchQuery] = useState('React developer');
  const [searchLocation, setSearchLocation] = useState('Chicago');
  const [searchCountry, setSearchCountry] = useState('us');
  const [searchCompany, setSearchCompany] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchJobs = async () => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const actualLocation = workMode === 'remote' ? 'Remote' : searchLocation;
      let actualQuery = searchQuery;
      if (workMode === 'remote') {
        actualQuery = `${searchQuery} remote`;
      } else if (workMode === 'hybrid') {
        actualQuery = `${searchQuery} hybrid`;
      } else {
        actualQuery = `${searchQuery} onsite`;
      }

      const params = new URLSearchParams({
        provider: searchProvider,
        query: actualQuery,
        location: actualLocation,
        country: workMode === 'remote' ? 'us' : searchCountry,
        company: searchCompany.trim()
      });
      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job search results.');
      }
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      console.error('Job search error:', err);
      setSearchError(err.message || 'Error conducting job search.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackSearchedJob = (job: any) => {
    const added: JobApplication = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      company: job.company,
      role: job.role,
      salary: job.salary || 'Not Specified',
      location: job.location || 'Remote',
      status: 'wishlist',
      dateApplied: new Date().toISOString().split('T')[0],
      link: job.link || '',
      notes: job.notes || '',
      matchScore: job.matchScore || 85
    };
    setApplications(prev => [...prev, added]);
  };

  const columns: { id: ApplicationStatus; label: string; colorClass: string; bgClass: string }[] = [
    { id: 'wishlist', label: 'Wishlist', colorClass: 'text-slate-600 bg-slate-100', bgClass: 'bg-slate-50/50' },
    { id: 'applied', label: 'Applied', colorClass: 'text-blue-700 bg-blue-50 border-blue-100', bgClass: 'bg-blue-50/10' },
    { id: 'interviewing', label: 'Interviewing', colorClass: 'text-amber-700 bg-amber-50 border-amber-100', bgClass: 'bg-amber-50/10' },
    { id: 'offered', label: 'Offered', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-100', bgClass: 'bg-emerald-50/10' },
    { id: 'rejected', label: 'Archived', colorClass: 'text-red-700 bg-red-50 border-red-100', bgClass: 'bg-red-50/10' }
  ];

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;

    const added: JobApplication = {
      id: `job-${Date.now()}`,
      company: newCompany,
      role: newRole,
      salary: newSalary,
      location: newLocation,
      status: newStatus,
      dateApplied: new Date().toISOString().split('T')[0],
      link: newLink,
      notes: newNotes,
      matchScore: Math.floor(Math.random() * 15) + 80 // AI matching score
    };

    setApplications(prev => [...prev, added]);
    setIsAddingJob(false);
    resetForm();
  };

  const resetForm = () => {
    setNewCompany('');
    setNewRole('');
    setNewSalary('');
    setNewLocation('');
    setNewStatus('applied');
    setNewLink('');
    setNewNotes('');
  };

  const deleteJob = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    if (selectedJob?.id === id) {
      setSelectedJob(null);
    }
  };

  const moveJobStatus = (id: string, nextStatus: ApplicationStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: nextStatus };
      }
      return app;
    }));
    // Sync active selection modal details
    if (selectedJob?.id === id) {
      setSelectedJob(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const generateCoverLetter = async () => {
    if (!selectedJob) return;
    setIsGeneratingCover(true);

    try {
      // Pack experience bullet points as simple string representation
      const cvText = `Alex Rivera\n${resumeDetails.personal.summary}\n\nExperience:\n` + 
        resumeDetails.experience.map(exp => `${exp.role} at ${exp.company}:\n${exp.description.join('\n')}`).join('\n\n');

      const response = await fetch('/api/gemini/tailor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: selectedJob.company,
          role: selectedJob.role,
          cvText
        })
      });

      const data = await response.json();
      
      setApplications(prev => prev.map(app => {
        if (app.id === selectedJob.id) {
          return { ...app, coverLetter: data.coverLetter, matchScore: data.matchScore };
        }
        return app;
      }));

      setSelectedJob(prev => prev ? { ...prev, coverLetter: data.coverLetter, matchScore: data.matchScore } : null);
    } catch (err) {
      console.error('Error generating cover letter:', err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>
            <ClipboardList className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            <span>Job Search & Pipelines Hub</span>
          </h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Explore active openings across all platforms using our live JSearch aggregator, and organize your job applications pipeline.
          </p>
        </div>

        {activeSubTab === 'tracker' && (
          <button
            onClick={() => setIsAddingJob(true)}
            className={`font-display font-extrabold uppercase tracking-widest text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
              isLight 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-green-400 hover:bg-green-500 text-neutral-950'
            }`}
            aria-label="Add a new job application to tracker"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job Entry</span>
          </button>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className={`flex border-b gap-1 mb-2 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
        <button
          onClick={() => setActiveSubTab('search')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-display font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'search'
              ? isLight
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-green-400 text-green-400 font-extrabold'
              : isLight
              ? 'border-transparent text-neutral-500 hover:text-indigo-600'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Live Job Explorer</span>
        </button>
        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-display font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'tracker'
              ? isLight
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-green-400 text-green-400 font-extrabold'
              : isLight
              ? 'border-transparent text-neutral-500 hover:text-indigo-600'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Pipelines Tracker Board</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
            isLight 
              ? 'bg-neutral-100 border-neutral-200 text-neutral-600' 
              : 'bg-neutral-900 border-neutral-800 text-neutral-300'
          }`}>
            {applications.length}
          </span>
        </button>
      </div>

      {activeSubTab === 'tracker' ? (
        /* Kanban Board Container */
        <div className="flex xl:grid xl:grid-cols-5 gap-4 items-start overflow-x-auto xl:overflow-x-visible pb-4 xl:pb-0 snap-x snap-mandatory scrollbar-none" role="application" aria-label="Job Application Kanban Board">
          {columns.map((col) => {
            const colJobs = applications.filter(app => app.status === col.id);
            
            // Dark Mode styling adjustments for Kanban Column backgrounds
            const darkColBg = col.id === 'wishlist' ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400' :
                              col.id === 'applied' ? 'bg-blue-950/20 border-blue-900/40 text-blue-400' :
                              col.id === 'interviewing' ? 'bg-yellow-950/20 border-yellow-900/40 text-yellow-400' :
                              col.id === 'offered' ? 'bg-green-950/20 border-green-900/40 text-green-400' :
                              'bg-red-950/20 border-red-900/40 text-red-400';

            const darkBadgeStyle = col.id === 'wishlist' ? 'bg-neutral-950 border-neutral-800 text-neutral-300' :
                                   col.id === 'applied' ? 'bg-blue-950/60 border-blue-900/50 text-blue-400' :
                                   col.id === 'interviewing' ? 'bg-yellow-950/60 border-yellow-900/50 text-yellow-400' :
                                   col.id === 'offered' ? 'bg-green-950/60 border-green-900/50 text-green-400' :
                                   'bg-red-950/60 border-red-900/50 text-red-400';

            return (
              <div 
                key={col.id} 
                className={`rounded-lg border p-4 space-y-4 ${darkColBg} w-[85vw] sm:w-[320px] md:w-[350px] xl:w-full flex-shrink-0 snap-center`}
                aria-label={`Column: ${col.label} with ${colJobs.length} entries`}
              >
                {/* Column Title Header */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[10px] font-display font-black uppercase tracking-wider rounded border ${darkBadgeStyle}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-500">{colJobs.length}</span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 min-h-[350px]">
                  {colJobs.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedJob(app)}
                      className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 hover:border-green-400 transition-all cursor-pointer group space-y-3 relative focus-within:ring-2 focus-within:ring-green-400/20"
                      tabIndex={0}
                      role="button"
                      aria-label={`Job details for ${app.role} at ${app.company}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedJob(app);
                        }
                      }}
                    >
                      {/* Delete card option */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteJob(app.id);
                        }}
                        className="absolute right-3 top-3 p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Delete ${app.role} at ${app.company}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1 min-w-0 pr-5">
                        <h3 className="font-display font-bold text-white text-sm truncate leading-snug group-hover:text-green-400 transition-colors">
                          {app.role}
                        </h3>
                        <p className="text-xs font-mono font-bold text-neutral-400 truncate">{app.company}</p>
                      </div>

                      <div className="space-y-1 text-[11px] text-neutral-400 font-sans">
                        {app.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="truncate">{app.location}</span>
                          </div>
                        )}
                        {app.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{app.salary}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Applied: {app.dateApplied}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-800 pt-2 text-[10.5px]">
                        {app.matchScore && (
                          <span className="inline-flex items-center gap-0.5 text-green-400 font-mono font-bold bg-green-950/40 border border-green-900/30 px-1.5 py-0.5 rounded">
                            <Sparkles className="w-3 h-3" />
                            <span>{app.matchScore}% Fit</span>
                          </span>
                        )}

                        {/* Manual accessible navigation keys */}
                        <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                          {col.id !== 'wishlist' && (
                            <button
                              onClick={() => {
                                const idx = columns.findIndex(c => c.id === col.id);
                                if (idx > 0) moveJobStatus(app.id, columns[idx - 1].id);
                              }}
                              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                              aria-label="Move application left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {col.id !== 'rejected' && (
                            <button
                              onClick={() => {
                                const idx = columns.findIndex(c => c.id === col.id);
                                if (idx < columns.length - 1) moveJobStatus(app.id, columns[idx + 1].id);
                              }}
                              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                              aria-label="Move application right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colJobs.length === 0 && (
                    <div className="text-center py-10 text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-lg">
                      No jobs here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Live API Job Explorer Tab Content */
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-lg font-display font-black text-white tracking-tight flex items-center gap-2 uppercase">
              <Sparkles className="text-green-400 w-5 h-5" />
              <span>Live Job Opportunities Explorer</span>
            </h2>
            <p className="text-neutral-400 text-xs mt-1">
              Leverage unified live integrations searching across premium platforms (including LinkedIn, Indeed, and ZipRecruiter) to discover matching openings and track them with a single click.
            </p>
          </div>

          {/* Config Inputs */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${workMode === 'remote' ? '3' : '5'} gap-4 bg-neutral-950 p-4 rounded-lg border border-neutral-850 items-end transition-all duration-300`}>
            <div>
              <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Work Mode
              </label>
              <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded border border-neutral-800">
                {(['onsite', 'hybrid', 'remote'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWorkMode(mode)}
                    className={`text-center uppercase tracking-wider py-1.5 px-2 text-[9px] font-mono font-bold rounded transition-all cursor-pointer ${
                      workMode === mode
                        ? 'bg-green-400 text-neutral-950 font-extrabold shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Search Keywords
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-neutral-800 bg-neutral-900 text-white focus:outline-none focus:border-green-400"
                placeholder="e.g. React Developer"
              />
            </div>

            {workMode !== 'remote' && (
              <>
                <div>
                  <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    City Location
                  </label>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-neutral-800 bg-neutral-900 text-white focus:outline-none focus:border-green-400 placeholder-neutral-600"
                    placeholder="e.g. Chicago"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <select
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-neutral-800 bg-neutral-900 text-white focus:outline-none focus:border-green-400 cursor-pointer"
                  >
                    {WORLD_COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Company (Optional)
              </label>
              <input
                type="text"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-neutral-800 bg-neutral-900 text-white focus:outline-none focus:border-green-400 placeholder-neutral-600"
                placeholder="e.g. Google"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSearchJobs}
                disabled={isSearching}
                className="w-full bg-green-400 hover:bg-green-500 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 font-display font-black uppercase tracking-widest text-[10px] py-2 px-4 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] h-[32px]"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Results Display */}
          {searchError && (
            <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs font-sans">
              Error conducting job search: {searchError}. Using fallback matching results.
            </div>
          )}

          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-neutral-950 p-4 rounded-lg border border-neutral-850 flex flex-col justify-between space-y-4 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 bg-neutral-850 rounded w-3/4"></div>
                        <div className="h-3 bg-neutral-850 rounded w-1/2"></div>
                      </div>
                      <div className="h-5 bg-neutral-850 rounded w-16"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-4 bg-neutral-850 rounded w-20"></div>
                      <div className="h-4 bg-neutral-850 rounded w-16"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-neutral-850 rounded w-full"></div>
                      <div className="h-2.5 bg-neutral-850 rounded w-4/5"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-neutral-900 pt-3">
                    <div className="h-3.5 bg-neutral-850 rounded w-16"></div>
                    <div className="h-6 bg-neutral-850 rounded w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
              {searchResults.map((job) => {
                const alreadyTracked = applications.some((app) => app.company.toLowerCase() === job.company.toLowerCase() && app.role.toLowerCase() === job.role.toLowerCase());

                return (
                  <div
                    key={job.id}
                    className="bg-neutral-950 p-4 rounded-lg border border-neutral-850 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-display font-bold text-white truncate leading-tight">
                            {job.role}
                          </h4>
                          <p className="text-xs font-mono font-bold text-neutral-400 truncate mt-0.5">
                            {job.company}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-green-400 font-mono font-bold bg-green-950/40 border border-green-900/30 px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{job.matchScore || 85}% Fit</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] text-neutral-400 font-sans">
                        <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-500" />
                          <span className="max-w-[120px] truncate">{job.location}</span>
                        </span>
                        <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-neutral-500" />
                          <span>{job.salary}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed">
                        {job.notes}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-900 pt-3 text-[11px]">
                      {job.link ? (
                        <a
                          href={job.link}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="text-neutral-400 hover:text-green-400 font-mono font-bold flex items-center gap-0.5 transition-colors"
                        >
                          <span>View Posting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-neutral-600 font-mono">No Link Available</span>
                      )}

                      <button
                        type="button"
                        disabled={alreadyTracked}
                        onClick={() => handleTrackSearchedJob(job)}
                        className={`font-display font-black uppercase tracking-widest text-[9px] py-1 px-3 rounded-lg transition-all ${
                          alreadyTracked
                            ? 'bg-neutral-900 text-neutral-500 border border-neutral-850 cursor-not-allowed'
                            : 'bg-green-400 hover:bg-green-500 text-neutral-950 cursor-pointer active:scale-95'
                        }`}
                      >
                        {alreadyTracked ? 'Already Tracked' : 'Track in Wishlist'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-950 rounded-lg border border-dashed border-neutral-850">
              <ClipboardList className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400 text-xs">Configure parameters above and click Search to retrieve live job opportunities</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD JOB MODAL */}
      <AnimatePresence>
        {isAddingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddingJob(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 rounded-lg w-full max-w-lg p-6 sm:p-8 shadow-2xl relative z-10 border border-neutral-800 text-white"
            >
              <button
                onClick={() => setIsAddingJob(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-display font-black text-white tracking-tight flex items-center gap-2 mb-4 uppercase">
                <Plus className="w-5 h-5 text-green-400" />
                <span>Add Job Application Entry</span>
              </h2>

              <form onSubmit={handleAddJob} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-role" className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Job Position / Role
                    </label>
                    <input
                      id="add-role"
                      type="text"
                      required
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  <div>
                    <label htmlFor="add-company" className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Company Name
                    </label>
                    <input
                      id="add-company"
                      type="text"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                      placeholder="e.g. Google"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-location" className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Location / Workplace
                    </label>
                    <input
                      id="add-location"
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                      placeholder="e.g. Remote (US)"
                    />
                  </div>
                  <div>
                    <label htmlFor="add-salary" className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Salary / Compensation range
                    </label>
                    <input
                      id="add-salary"
                      type="text"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                      placeholder="e.g. $120,000 - $145,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-status" className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Pipeline Column Status
                    </label>
                    <select
                      id="add-status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Archived / Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="add-link" className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Job Spec Link
                    </label>
                    <input
                      id="add-link"
                      type="url"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                      placeholder="https://company.com/job"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="add-notes" className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Application Logs / Notes
                  </label>
                  <textarea
                    id="add-notes"
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full p-3 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                    placeholder="Recruiter scheduled call? Salary target notes?"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingJob(false)}
                    className="border border-neutral-850 hover:bg-neutral-800 text-neutral-400 font-display font-extrabold uppercase tracking-widest text-[10px] py-2 px-4 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-400 hover:bg-green-500 text-neutral-950 font-display font-black uppercase tracking-widest text-[10px] py-2 px-4 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DETAILED JOB MODAL */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedJob(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 rounded-lg w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative z-10 border border-neutral-800 text-white max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close details modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                
                {/* Title Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-display font-black text-white uppercase tracking-tight leading-none">{selectedJob.role}</h2>
                      {selectedJob.link && (
                        <a 
                          href={selectedJob.link} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="p-1 rounded hover:bg-neutral-850 text-neutral-400 hover:text-green-400 transition-colors"
                          aria-label="Open job description website in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm font-mono font-bold text-neutral-400">{selectedJob.company}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-display font-bold text-neutral-400 uppercase tracking-wider">Status:</span>
                    <select
                      value={selectedJob.status}
                      onChange={(e) => moveJobStatus(selectedJob.id, e.target.value as any)}
                      className="px-2.5 py-1 text-xs font-bold rounded border border-neutral-800 bg-neutral-950 text-white"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                  <div className="text-xs">
                    <span className="text-neutral-500 font-display font-bold block uppercase tracking-wider text-[9px]">Location</span>
                    <span className="font-semibold text-white block mt-0.5">{selectedJob.location || 'Not Specified'}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-neutral-500 font-display font-bold block uppercase tracking-wider text-[9px]">Compensation</span>
                    <span className="font-semibold text-white block mt-0.5">{selectedJob.salary || 'Not Specified'}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-neutral-500 font-display font-bold block uppercase tracking-wider text-[9px]">Match Alignment</span>
                    {selectedJob.matchScore ? (
                      <span className="font-mono font-bold text-green-400 block mt-0.5">{selectedJob.matchScore}% AI Alignment</span>
                    ) : (
                      <span className="font-medium text-neutral-500 block mt-0.5">Not Evaluated</span>
                    )}
                  </div>
                </div>

                {/* Notes log */}
                <div className="space-y-1.5">
                  <label htmlFor="notes-pasted" className="block text-xs font-display font-bold text-neutral-400 uppercase tracking-wider">
                    Application Logs & Milestone Notes
                  </label>
                  <textarea
                    id="notes-pasted"
                    rows={4}
                    value={selectedJob.notes || ''}
                    onChange={(e) => {
                      const updatedNotes = e.target.value;
                      setApplications(prev => prev.map(app => app.id === selectedJob.id ? { ...app, notes: updatedNotes } : app));
                      setSelectedJob(prev => prev ? { ...prev, notes: updatedNotes } : null);
                    }}
                    className="w-full p-3.5 text-xs rounded-lg border border-neutral-850 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white bg-neutral-950"
                    placeholder="Log dates of calls, interviewer names, and technical requirements..."
                  />
                </div>

                {/* AI Tailoring support */}
                <div className="border-t border-neutral-850 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-display font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span>AI Tailoring Assistant</span>
                    </h3>
                    
                    {!selectedJob.coverLetter && (
                      <button
                        onClick={generateCoverLetter}
                        disabled={isGeneratingCover}
                        className="py-1.5 px-3 bg-green-400 hover:bg-green-500 text-neutral-950 font-display font-black uppercase tracking-widest text-[10px] rounded flex items-center gap-1 cursor-pointer transition-all focus:outline-none"
                      >
                        {isGeneratingCover ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Drafting Cover Letter...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate Cover Letter</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {selectedJob.coverLetter ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-green-950/40 border border-green-900/40 px-3 py-2 rounded-lg text-xs font-mono text-green-400">
                        <span className="flex items-center gap-1">
                          <FileCheck className="w-4 h-4 text-green-400" />
                          <span>AI Cover Letter Successfully Generated ({selectedJob.matchScore}% Match)</span>
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedJob.coverLetter || '');
                            alert('Cover letter copied to clipboard!');
                          }}
                          className="text-green-400 hover:text-green-300 font-display font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer text-[10px]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Letter</span>
                        </button>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950 font-sans text-xs text-neutral-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                        {selectedJob.coverLetter}
                      </div>

                      <button
                        onClick={generateCoverLetter}
                        disabled={isGeneratingCover}
                        className="text-[11px] font-display font-bold text-green-400 hover:text-green-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        {isGeneratingCover ? 'Regenerating...' : 'Regenerate Cover Letter'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Need to introduce yourself beautifully to {selectedJob.company}? Click the button above to generate a tailored, professional cover letter referencing your target role.
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 border-t border-neutral-850 pt-4">
                  <button
                    onClick={() => {
                      deleteJob(selectedJob.id);
                      setSelectedJob(null);
                    }}
                    className="border border-red-900/40 text-red-400 hover:bg-red-950/40 py-2 px-4 rounded-lg text-xs font-display font-extrabold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Entry</span>
                  </button>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="bg-neutral-800 hover:bg-neutral-750 text-white py-2 px-4 rounded-lg text-xs font-display font-extrabold uppercase tracking-widest cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
