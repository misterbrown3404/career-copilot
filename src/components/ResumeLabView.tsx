import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileEdit, 
  Sparkles, 
  Printer, 
  Plus, 
  Trash2, 
  Check, 
  Eye, 
  Settings,
  ChevronDown,
  Download,
  Loader2,
  Copy
} from 'lucide-react';
import { ResumeDetails, UserProfile } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { fetchJson } from '../utils/apiClient';
import AIErrorDialog from './AIErrorDialog';

interface ResumeLabViewProps {
  resumeDetails: ResumeDetails;
  user: UserProfile;
  setResumeDetails: React.Dispatch<React.SetStateAction<ResumeDetails>>;
  theme?: 'light' | 'dark';
}

export default function ResumeLabView({ resumeDetails, user, setResumeDetails, theme = 'dark' }: ResumeLabViewProps) {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [bulletDraft, setBulletDraft] = useState('');
  const [aiError, setAiError] = useState(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [improvedResult, setImprovedResult] = useState<{ optimized: string; reason: string } | null>(null);
  const [improvedError, setImprovedError] = useState<string | null>(null);

  // Experience operations
  const handlePersonalChange = (field: keyof ResumeDetails['personal'], value: string) => {
    setResumeDetails(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleExperienceChange = (id: string, field: string, value: any, idx?: number) => {
    setResumeDetails(prev => {
      const exp = prev.experience.map(item => {
        if (item.id === id) {
          if (field === 'description' && idx !== undefined) {
            const desc = [...item.description];
            desc[idx] = value;
            return { ...item, description: desc };
          }
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, experience: exp };
    });
  };

  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Role Position',
      duration: '2024 - Present',
      description: [
        'Collaborated with engineering stakeholders to design highly interactive web features.',
        'Optimized system load times and database queries.'
      ]
    };
    setResumeDetails(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const deleteExperience = (id: string) => {
    setResumeDetails(prev => ({
      ...prev,
      experience: prev.experience.filter(item => item.id !== id)
    }));
  };

  const addExperienceBullet = (id: string) => {
    setResumeDetails(prev => {
      const exp = prev.experience.map(item => {
        if (item.id === id) {
          return { ...item, description: [...item.description, 'New optimized impact point...'] };
        }
        return item;
      });
      return { ...prev, experience: exp };
    });
  };

  const deleteExperienceBullet = (id: string, idx: number) => {
    setResumeDetails(prev => {
      const exp = prev.experience.map(item => {
        if (item.id === id) {
          return { ...item, description: item.description.filter((_, i) => i !== idx) };
        }
        return item;
      });
      return { ...prev, experience: exp };
    });
  };

  // Education operations
  const handleEducationChange = (id: string, field: string, value: string) => {
    setResumeDetails(prev => {
      const edu = prev.education.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, education: edu };
    });
  };

  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      institution: 'University Name',
      degree: 'B.S. Computer Science',
      duration: 'Graduated 2023'
    };
    setResumeDetails(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const deleteEducation = (id: string) => {
    setResumeDetails(prev => ({
      ...prev,
      education: prev.education.filter(item => item.id !== id)
    }));
  };

  const handleSkillsChange = (commaList: string) => {
    const list = commaList.split(',').map(s => s.trim()).filter(Boolean);
    setResumeDetails(prev => ({
      ...prev,
      skills: list
    }));
  };

  // Smart bullet improver action
  const handleImproveBullet = async () => {
    if (!bulletDraft.trim()) return;
    setIsImproving(true);
    setImprovedResult(null);
    setImprovedError(null);

    try {
      const data = await fetchJson<{ optimized: string; reason: string }>('/api/gemini/generate-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet: bulletDraft, targetRole: user.targetRole || 'Software Architect' })
      });
      setImprovedResult(data);
    } catch (err: any) {
      console.error('Error optimizing resume bullet point:', err);
      setImprovedError(err?.message || 'Failed to optimize bullet. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  // Export to PDF using html2pdf
  const handleExportPDF = () => {
    const element = document.getElementById('resume-printable-canvas');
    if (!element) return;

    setIsExporting(true);

    const opt: any = {
      margin: 0.25,
      filename: `${resumeDetails.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setIsExporting(false);
      })
      .catch((err: any) => {
        console.error('Error exporting PDF:', err);
        setIsExporting(false);
        alert('Failed to generate PDF. You can also try using the fallback "System Print" option.');
      });
  };

  return (
    <div className="space-y-6">
      <AIErrorDialog open={!!aiError} message={aiError||""} onClose={()=>setAiError(null)} theme={theme} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>
            <FileEdit className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            <span>Interactive Resume Lab & Builder</span>
          </h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Build and optimize a sleek, recruiter-ready resume in real-time. Use our Smart Improver to rewrite plain-text bullet points.
          </p>
        </div>

        {/* Action controls */}
        <div className={`flex p-1 rounded-lg self-start sm:self-auto border transition-colors ${
          isLight ? 'bg-neutral-100 border-neutral-250' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 text-xs font-display font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-all focus:outline-none cursor-pointer ${
              activeTab === 'edit' 
                ? isLight ? 'bg-white text-indigo-600 border border-neutral-200 shadow-sm' : 'bg-neutral-950 text-white border border-neutral-800' 
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-white'
            }`}
            aria-label="Edit resume fields"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Fields</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-xs font-display font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-all focus:outline-none cursor-pointer ${
              activeTab === 'preview' 
                ? isLight ? 'bg-white text-indigo-600 border border-neutral-200 shadow-sm' : 'bg-neutral-950 text-white border border-neutral-800' 
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-white'
            }`}
            aria-label="Preview resume canvas"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Canvas</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Forms / Editor, or Live Preview depending on tab) */}
        <div className="xl:col-span-8">
          {activeTab === 'edit' ? (
            <div className="space-y-6">
              
              {/* Form 1: Personal Profile */}
              <div className={`border rounded-lg p-5 sm:p-6 space-y-4 transition-colors ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <h3 className={`font-display font-bold text-xs uppercase tracking-wider border-b pb-2 ${
                  isLight ? 'border-neutral-100 text-neutral-800' : 'border-neutral-800 text-white'
                }`}>Personal & Summary</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}>Full Name</label>
                    <input
                      type="text"
                      value={resumeDetails.personal.fullName}
                      onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                        isLight 
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                          : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}>Professional Email</label>
                    <input
                      type="email"
                      value={resumeDetails.personal.email}
                      onChange={(e) => handlePersonalChange('email', e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                        isLight 
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                          : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}>Phone Number</label>
                    <input
                      type="text"
                      value={resumeDetails.personal.phone}
                      onChange={(e) => handlePersonalChange('phone', e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                        isLight 
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                          : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}>Portfolio Website</label>
                    <input
                      type="text"
                      value={resumeDetails.personal.website}
                      onChange={(e) => handlePersonalChange('website', e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                        isLight 
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                          : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>Professional Summary</label>
                  <textarea
                    rows={4}
                    value={resumeDetails.personal.summary}
                    onChange={(e) => handlePersonalChange('summary', e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                      isLight 
                        ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                        : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                    }`}
                  />
                </div>
              </div>

              {/* Form 2: Experience entries */}
              <div className={`border rounded-lg p-5 sm:p-6 space-y-5 transition-colors ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className={`font-display font-bold text-xs uppercase tracking-wider ${
                    isLight ? 'text-neutral-800' : 'text-white'
                  }`}>Work Experience History</h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className={`font-display font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                      isLight 
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-250' 
                        : 'bg-green-400/5 hover:bg-green-400/10 text-green-400 border-green-400/20'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {resumeDetails.experience.map((exp, idx) => (
                    <div 
                      key={exp.id} 
                      className={`p-4 rounded-lg border relative space-y-4 ${
                        isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-850'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => deleteExperience(exp.id)}
                        className="absolute right-3 top-3 text-neutral-500 hover:text-red-400 cursor-pointer"
                        title="Delete Role Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                            isLight ? 'text-neutral-500' : 'text-neutral-400'
                          }`}>Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded border focus:outline-none focus:ring-2 ${
                              isLight 
                                ? 'border-neutral-200 bg-white text-neutral-950 focus:ring-indigo-500/10' 
                                : 'border-neutral-800 bg-neutral-900 text-white focus:ring-green-400/50'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                            isLight ? 'text-neutral-500' : 'text-neutral-400'
                          }`}>Target Role/Position</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded border focus:outline-none focus:ring-2 ${
                              isLight 
                                ? 'border-neutral-200 bg-white text-neutral-950 focus:ring-indigo-500/10' 
                                : 'border-neutral-800 bg-neutral-900 text-white focus:ring-green-400/50'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                            isLight ? 'text-neutral-500' : 'text-neutral-400'
                          }`}>Duration / Years</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded border focus:outline-none focus:ring-2 ${
                              isLight 
                                ? 'border-neutral-200 bg-white text-neutral-950 focus:ring-indigo-500/10' 
                                : 'border-neutral-800 bg-neutral-900 text-white focus:ring-green-400/50'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Bullet points sublist */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`block text-[10px] font-display font-bold uppercase tracking-wider ${
                            isLight ? 'text-neutral-500' : 'text-neutral-400'
                          }`}>Key Accomplishments & Responsibilities</label>
                          <button
                            type="button"
                            onClick={() => addExperienceBullet(exp.id)}
                            className="text-[9px] font-mono font-bold uppercase text-neutral-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Bullet</span>
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {exp.description.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex gap-2 items-center">
                              <span className="text-[10px] text-neutral-500 font-mono font-bold flex-shrink-0">#{bIdx + 1}</span>
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value, bIdx)}
                                className={`flex-1 px-3 py-1.5 text-xs rounded border focus:outline-none focus:ring-2 ${
                                  isLight 
                                    ? 'border-neutral-200 bg-white text-neutral-950 focus:ring-indigo-500/10' 
                                    : 'border-neutral-800 bg-neutral-900 text-white focus:ring-green-400/50'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => deleteExperienceBullet(exp.id, bIdx)}
                                className="text-neutral-500 hover:text-red-400 flex-shrink-0 cursor-pointer"
                                title="Delete bullet point"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form 3: Education */}
              <div className={`border rounded-lg p-5 sm:p-6 space-y-5 transition-colors ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className={`font-display font-bold text-xs uppercase tracking-wider ${
                    isLight ? 'text-neutral-800' : 'text-white'
                  }`}>Education Credentials</h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className={`font-display font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                      isLight 
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-250' 
                        : 'bg-green-400/5 hover:bg-green-400/10 text-green-400 border-green-400/20'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {resumeDetails.education.map((edu) => (
                    <div 
                      key={edu.id}
                      className={`p-4 rounded-lg border relative grid grid-cols-1 sm:grid-cols-3 gap-4 ${
                        isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-850'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => deleteEducation(edu.id)}
                        className="absolute right-3 top-3 text-neutral-500 hover:text-red-400 cursor-pointer"
                        title="Delete education credential"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}>Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs rounded border focus:outline-none focus:ring-2 ${
                            isLight 
                              ? 'border-neutral-200 bg-white text-neutral-950 focus:ring-indigo-500/10' 
                              : 'border-neutral-800 bg-neutral-900 text-white focus:ring-green-400/50'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}>Degree & Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs rounded border focus:outline-none focus:ring-2 ${
                            isLight 
                              ? 'border-neutral-200 bg-white text-neutral-950 focus:ring-indigo-500/10' 
                              : 'border-neutral-800 bg-neutral-900 text-white focus:ring-green-400/50'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}>Duration / Date</label>
                        <input
                          type="text"
                          value={edu.duration}
                          onChange={(e) => handleEducationChange(edu.id, 'duration', e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs rounded border focus:outline-none focus:ring-2 ${
                            isLight 
                              ? 'border-neutral-200 bg-white text-neutral-950 focus:ring-indigo-500/10' 
                              : 'border-neutral-800 bg-neutral-900 text-white focus:ring-green-400/50'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form 4: Skills */}
              <div className={`border rounded-lg p-5 sm:p-6 space-y-3 transition-colors ${
                isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
              }`}>
                <h3 className={`font-display font-bold text-xs uppercase tracking-wider border-b pb-2 ${
                  isLight ? 'border-neutral-100' : 'border-neutral-800'
                }`}>Skills & Technologies</h3>
                <div>
                  <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-neutral-550' : 'text-neutral-400'
                  }`}>Comma-Separated Skills</label>
                  <input
                    type="text"
                    defaultValue={resumeDetails.skills.join(', ')}
                    onBlur={(e) => handleSkillsChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                      isLight 
                        ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                        : 'border-neutral-800 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                    }`}
                    placeholder="JavaScript, React, Node.js, REST APIs..."
                  />
                  <p className="text-[10px] text-neutral-500 mt-1 font-mono">Click outside the input box to apply changes to the preview.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Tab: Preview Canvas (Normal printed sheet simulation) */
            <div className={`rounded-lg p-4 sm:p-8 flex justify-center border ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div 
                className="w-full max-w-[8.5in] min-h-[11in] bg-white text-black p-10 sm:p-12 shadow-2xl space-y-6 relative border border-slate-300 print:shadow-none print:border-none print:p-0"
                id="resume-printable-canvas"
              >
                {/* Visual Header */}
                <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
                  <h1 className="text-2xl font-extrabold uppercase tracking-wide text-slate-950">{resumeDetails.personal.fullName}</h1>
                  <div className="text-xs font-semibold text-slate-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
                    <span>{resumeDetails.personal.email}</span>
                    <span>{resumeDetails.personal.phone}</span>
                    <span>{resumeDetails.personal.website}</span>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">Professional Summary</h3>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">{resumeDetails.personal.summary}</p>
                </div>

                {/* Professional Experience Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">Experience History</h3>
                  
                  {resumeDetails.experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-950">
                        <span>{exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                        <span className="text-xs text-slate-500">{exp.duration}</span>
                      </div>
                      
                      <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-800">
                        {exp.description.map((desc, i) => (
                          <li key={i} className="leading-relaxed text-justify">{desc}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Education Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">Education Credentials</h3>
                  
                  {resumeDetails.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between text-xs font-bold text-slate-950">
                      <span>{edu.degree} — <span className="font-semibold text-slate-700">{edu.institution}</span></span>
                      <span className="text-xs text-slate-500 font-medium">{edu.duration}</span>
                    </div>
                  ))}
                </div>

                {/* Skills Section */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">Technical Skillset</h3>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    <strong>Core Technologies & Methodology:</strong> {resumeDetails.skills.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Tools Sidebar: Smart Bullet optimization, Download) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Smart Bullet Point improver */}
          <div className={`border rounded-lg p-5 space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <span>Smart Bullet Point Optimizer</span>
            </h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed font-semibold">
              Recruiters love results, not tasks. Paste a plain, task-oriented description bullet below and let Our platform transform it into a robust metric-driven accomplishment.
            </p>

            <div className="space-y-3.5">
              <textarea
                rows={3}
                value={bulletDraft}
                onChange={(e) => setBulletDraft(e.target.value)}
                placeholder="e.g., I helped work on a React and PostgreSQL web application for clients."
                className={`w-full p-3 text-xs rounded border focus:outline-none focus:ring-2 focus:border-green-400 transition-colors font-mono ${
                  isLight 
                    ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10' 
                    : 'border-neutral-800 bg-neutral-950 text-white focus:ring-green-400/50'
                }`}
              />

              <button
                type="button"
                onClick={handleImproveBullet}
                disabled={!bulletDraft.trim() || isImproving}
                className={`w-full py-2 px-4 rounded text-xs font-display font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  bulletDraft.trim() && !isImproving
                    ? isLight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                    : isLight 
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed' 
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed'
                }`}
              >
                {isImproving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Optimize Description</span>
                  </>
                )}
              </button>
            </div>

            {/* Optimized results wrapper */}
            {improvedError && (
              <div className={`p-4 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-xs`}>
                {improvedError}
              </div>
            )}
            {improvedResult && (
              <div className={`p-4 rounded-lg border space-y-3 animate-fadeIn ${
                isLight ? 'bg-indigo-50/50 border-indigo-100' : 'bg-green-950/10 border-green-900/10'
              }`}>
                <div className="space-y-1">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block ${
                    isLight ? 'text-indigo-600' : 'text-green-400'
                  }`}>Optimized Output</span>
                  
                  <div className="flex gap-2 items-start">
                    <p className={`text-xs font-semibold leading-relaxed ${isLight ? 'text-neutral-800' : 'text-white'}`}>
                      "{improvedResult.optimized}"
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(improvedResult.optimized);
                        alert('Copied to clipboard! You can paste it directly into your Experience accomplishment points.');
                      }}
                      className="text-neutral-500 hover:text-white cursor-pointer"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 border-t border-dashed border-neutral-800 pt-2 text-[10.5px]">
                  <strong className={`font-display block ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>Hiring Justification:</strong>
                  <p className="text-neutral-500 leading-relaxed font-sans">{improvedResult.reason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Export utility tools */}
          <div className={`border rounded-lg p-5 space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider">Export Tools</h3>
            
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting}
                className={`w-full py-2.5 px-4 rounded-lg font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isLight 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow' 
                    : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-md'
                }`}
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Format</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className={`w-full py-2.5 px-4 rounded-lg border font-display font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-neutral-800 hover:text-white ${
                  isLight ? 'border-neutral-250 text-neutral-700 bg-white hover:bg-neutral-50' : 'border-neutral-800 text-neutral-400 bg-neutral-950'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>System Print Dialogue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

