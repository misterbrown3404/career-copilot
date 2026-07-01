import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  Terminal, 
  Check, 
  Cpu, 
  Globe, 
  ShieldCheck,
  Server,
  Key,
  Upload,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ShieldAlert,
  Sliders,
  FolderSync
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  theme?: 'light' | 'dark';
}

export default function SettingsView({ user, setUser, theme = 'dark' }: SettingsViewProps) {
  const isLight = theme === 'light';

  // State management
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [targetRole, setTargetRole] = useState(user.targetRole);
  const [targetIndustry, setTargetIndustry] = useState(user.targetIndustry);
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel);
  const [avatar, setAvatar] = useState(user.avatar || '');

  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle saving of career settings
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      name,
      email,
      targetRole,
      targetIndustry,
      experienceLevel,
      resumeScore: user.resumeScore,
      avatar,
      isAdmin: user.isAdmin
    });
    alert('Career profile settings saved successfully!');
  };

  // Avatar file handling
  const handleAvatarFile = (file: File) => {
    if (!file) return;
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedImageTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Avatar image is too large! Please choose an image smaller than 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setAvatar(base64);
        setUser(prev => ({
          ...prev,
          avatar: base64
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
          isLight ? 'text-neutral-900' : 'text-white'
        }`}>
          <Settings className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
          <span>System Settings & Profile</span>
        </h1>
        <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Review your target preferences and personalize your profile.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Form Settings */}
        <div className={`border rounded-2xl p-5 sm:p-6 space-y-6 transition-colors duration-300 ${
          isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <h3 className={`font-display font-bold text-xs uppercase tracking-wider border-b pb-2 flex items-center gap-2 ${
            isLight ? 'text-neutral-900 border-neutral-100' : 'text-white border-neutral-800'
          }`}>
            <User className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            <span>Target Professional Profile</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Interactive Profile Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-dashed transition-all duration-300 bg-neutral-950/20 border-neutral-800">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-24 h-24 rounded-full flex-shrink-0 cursor-pointer overflow-hidden border-2 flex items-center justify-center transition-all ${
                  dragActive 
                    ? 'border-green-400 scale-105 bg-green-400/10' 
                    : isLight 
                    ? 'border-indigo-200 hover:border-indigo-400 bg-neutral-50' 
                    : 'border-neutral-750 hover:border-green-400/50 bg-neutral-900'
                }`}
                title="Click or drag image here to upload profile avatar"
              >
                {avatar ? (
                  <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 flex flex-col items-center">
                    <Upload className={`w-5 h-5 mb-1 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div className="text-center sm:text-left space-y-1">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${isLight ? 'text-indigo-600' : 'text-green-400'}`}>
                  Profile Avatar Image
                </span>
                <p className={`text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                  Interactive Drag & Drop Upload
                </p>
                <p className="text-[10.5px] text-neutral-500 max-w-sm">
                  Click the circle or drag an image file to personalize your professional profile header and sidebar avatar (max 1.5MB).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="set-name" className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Full Name
                </label>
                <input
                  id="set-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                    isLight 
                      ? 'border-neutral-200 bg-white focus:ring-indigo-500/10 focus:border-indigo-500 text-neutral-900' 
                      : 'border-neutral-800 bg-neutral-950 focus:ring-green-400/50 focus:border-green-400 text-white'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="set-email" className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Email Address
                </label>
                <input
                  id="set-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                    isLight 
                      ? 'border-neutral-200 bg-white focus:ring-indigo-500/10 focus:border-indigo-500 text-neutral-900' 
                      : 'border-neutral-800 bg-neutral-950 focus:ring-green-400/50 focus:border-green-400 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="set-role" className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Target Role
                </label>
                <input
                  id="set-role"
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                    isLight 
                      ? 'border-neutral-200 bg-white focus:ring-indigo-500/10 focus:border-indigo-500 text-neutral-900' 
                      : 'border-neutral-800 bg-neutral-950 focus:ring-green-400/50 focus:border-green-400 text-white'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="set-industry" className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Target Industry
                </label>
                <input
                  id="set-industry"
                  type="text"
                  required
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                    isLight 
                      ? 'border-neutral-200 bg-white focus:ring-indigo-500/10 focus:border-indigo-500 text-neutral-900' 
                      : 'border-neutral-800 bg-neutral-950 focus:ring-green-400/50 focus:border-green-400 text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="set-level" className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                Experience Level
              </label>
              <select
                id="set-level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isLight 
                    ? 'border-neutral-200 bg-white focus:ring-indigo-500/10 focus:border-indigo-500 text-neutral-900' 
                    : 'border-neutral-800 bg-neutral-950 focus:ring-green-400/50 focus:border-green-400 text-white'
                }`}
              >
                <option value="Entry">Entry Level (0-2 years)</option>
                <option value="Mid">Mid Level (2-5 years)</option>
                <option value="Senior">Senior Level (5-10 years)</option>
                <option value="Executive">Executive / Director (10+ years)</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`font-display font-black py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-1.5 text-xs cursor-pointer focus:outline-none focus:ring-2 ${
                  isLight 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 focus:ring-indigo-500' 
                    : 'bg-green-400 hover:bg-green-500 text-neutral-950 shadow-green-950/20 focus:ring-green-400'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Parameters</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
