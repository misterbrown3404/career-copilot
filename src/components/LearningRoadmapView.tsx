import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Map, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Clock, 
  BookOpen, 
  Briefcase,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { RoadmapNode, UserProfile } from '../types';

interface LearningRoadmapViewProps {
  user: UserProfile;
  theme?: 'light' | 'dark';
}

export default function LearningRoadmapView({ user, theme = 'dark' }: LearningRoadmapViewProps) {
  const isLight = theme === 'light';

  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or auto-generate on mount
  useEffect(() => {
    if (!user?.email) return;

    const loadRoadmap = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/user/data', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.roadmap && data.roadmap.length > 0) {
            setNodes(data.roadmap);
            setSelectedNode(data.roadmap[0]);
          } else {
            await generateLiveRoadmap();
          }
        }
      } catch (err) {
        console.error('Error fetching live roadmap:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoadmap();
  }, [user?.email, user?.targetRole]);

  // Save roadmap changes
  const saveRoadmapChanges = async (updatedNodes: RoadmapNode[]) => {
    if (!user?.email) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/user/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'roadmap',
          data: updatedNodes
        })
      });
    } catch (err) {
      console.error('Error saving updated roadmap:', err);
    }
  };

  const generateLiveRoadmap = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/gemini/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: user.targetRole || 'Software Engineer',
          targetIndustry: user.targetIndustry || 'Technology'
        })
      });

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setNodes(data);
        setSelectedNode(data[0]);
        await saveRoadmapChanges(data);
      }
    } catch (err) {
      console.error('Error compiling customized career roadmap:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateRoadmap = async () => {
    await generateLiveRoadmap();
  };

  const toggleNodeCompletion = (nodeId: string) => {
    const updated = nodes.map(n => {
      if (n.id === nodeId) {
        const nextStatus = n.status === 'completed' ? 'unlocked' : 'completed';
        const updatedNode = { ...n, status: nextStatus };
        if (selectedNode?.id === nodeId) {
          setSelectedNode(updatedNode as any);
        }
        return updatedNode as any;
      }
      return n;
    });
    setNodes(updated);
    saveRoadmapChanges(updated);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-7 bg-neutral-900 border border-neutral-850 rounded w-1/3 min-w-[200px]"></div>
            <div className="h-3.5 bg-neutral-900 border border-neutral-850 rounded w-2/3 min-w-[300px]"></div>
          </div>
          <div className="h-10 bg-neutral-900 border border-neutral-850 rounded w-44"></div>
        </div>

        {/* 2-Column main skeleton layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Visual Timeline List Skeleton */}
          <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-lg p-5 sm:p-6 space-y-5">
            <div className="h-3 bg-neutral-850 rounded w-24"></div>
            
            <div className="relative pl-6 space-y-6">
              <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-neutral-850" />

              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative space-y-2">
                  <div className="absolute -left-[22px] top-1.5 w-5 h-5 rounded-full bg-neutral-950 border-2 border-neutral-800" />
                  <div className="p-3.5 rounded-lg border border-neutral-850 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-neutral-800 rounded w-12"></div>
                      <div className="h-3 bg-neutral-800 rounded w-16"></div>
                    </div>
                    <div className="h-4.5 bg-neutral-800 rounded w-3/4"></div>
                    <div className="h-3.5 bg-neutral-800 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Spotlight Panel Skeleton */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-lg p-5 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
              <div className="space-y-2.5 flex-1">
                <div className="h-3 bg-neutral-850 rounded w-20"></div>
                <div className="h-6.5 bg-neutral-800 rounded w-1/2"></div>
                <div className="flex items-center gap-4 pt-1">
                  <div className="h-3 bg-neutral-850 rounded w-16"></div>
                  <div className="h-3 bg-neutral-850 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8.5 bg-neutral-800 rounded w-28"></div>
            </div>

            <div className="space-y-2">
              <div className="h-3 bg-neutral-850 rounded w-16"></div>
              <div className="space-y-1.5">
                <div className="h-3.5 bg-neutral-800 rounded w-full"></div>
                <div className="h-3.5 bg-neutral-800 rounded w-11/12"></div>
                <div className="h-3.5 bg-neutral-800 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRegenerating || nodes.length === 0 || !selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <Loader2 className={`w-12 h-12 animate-spin ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
        <h2 className={`text-lg font-display font-black uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>Mapping Career Roadmap...</h2>
        <p className="text-neutral-400 text-xs font-sans max-w-sm">
          Generating a real-time customized career roadmap using deep semantic search matching for {user.targetRole || 'your target role'}. Please wait a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>
            <Map className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
            <span>AI Customized Learning Roadmap</span>
          </h1>
          <p className={`text-sm mt-1 font-sans ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Accelerate your career transition. Our AI maps out a tailored step-by-step curriculum with validated resources and portfolio projects based on your target role.
          </p>
        </div>

        <button
          onClick={handleRegenerateRoadmap}
          disabled={isRegenerating}
          className={`font-display font-extrabold uppercase tracking-widest text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
            isLight 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
              : 'bg-green-400 hover:bg-green-500 text-neutral-950'
          }`}
          aria-label="Regenerate a custom roadmap based on current profile details"
        >
          <Sparkles className="w-4 h-4" />
          <span>Regenerate for {user.targetRole}</span>
        </button>
      </div>

      {/* Main Roadmap Content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual tree list */}
        <div className={`lg:col-span-5 border rounded-lg p-5 sm:p-6 space-y-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
        }`}>
          <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider px-1 block">Curriculum Phases</span>
          
          <div className="relative pl-6 space-y-6">
            {/* Vertical timeline line tracer */}
            <div className={`absolute top-3 bottom-3 left-2.5 w-0.5 ${isLight ? 'bg-neutral-200' : 'bg-neutral-850'}`} />

            {nodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              const isCompleted = node.status === 'completed';
              const isLocked = node.status === 'locked';

              return (
                <div 
                  key={node.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Phase bubble state indicator */}
                  <div className={`absolute -left-[22px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : isSelected
                      ? isLight ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-neutral-950 border-green-400 text-green-400'
                      : isLight ? 'bg-neutral-100 border-neutral-300 text-neutral-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500 group-hover:border-neutral-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950 stroke-[3px]" />
                    ) : isLocked ? (
                      <Lock className="w-2.5 h-2.5" />
                    ) : (
                      <Unlock className="w-2.5 h-2.5" />
                    )}
                  </div>

                  <div className={`p-3.5 rounded-lg border transition-all ${
                    isSelected 
                      ? isLight 
                        ? 'bg-neutral-50 border-neutral-250 shadow' 
                        : 'bg-neutral-850/80 border-neutral-800 shadow-lg' 
                      : 'bg-transparent border-transparent hover:bg-neutral-950/30'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase text-neutral-500">
                        Phase {idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-mono font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{node.duration}</span>
                      </div>
                    </div>
                    <h3 className={`font-display font-bold text-sm uppercase tracking-wide mt-1 transition-colors ${
                      isSelected 
                        ? isLight ? 'text-indigo-600' : 'text-white' 
                        : isLight ? 'text-neutral-850 group-hover:text-indigo-600' : 'text-neutral-300 group-hover:text-white'
                    }`}>
                      {node.title}
                    </h3>
                    <p className="text-neutral-400 text-xs leading-relaxed font-sans mt-1.5 line-clamp-2">
                      {node.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed phase card view */}
        <div className={`lg:col-span-7 border rounded-lg p-5 sm:p-8 space-y-6 transition-colors ${
          isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${
            isLight ? 'border-neutral-100' : 'border-neutral-850'
          }`}>
            <div className="space-y-1">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${isLight ? 'text-indigo-650' : 'text-green-400'}`}>Phase Spotlight</span>
              <h2 className={`text-xl font-display font-black uppercase tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>{selectedNode.title}</h2>
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 pt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedNode.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {selectedNode.resources.length} Core Guides</span>
              </div>
            </div>

            <button
              onClick={() => toggleNodeCompletion(selectedNode.id)}
              className={`font-display font-extrabold uppercase tracking-widest text-[10px] px-3.5 py-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedNode.status === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : isLight 
                  ? 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:border-neutral-400' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{selectedNode.status === 'completed' ? 'Completed' : 'Mark as Done'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider px-1 block">Overview</span>
            <p className={`text-sm leading-relaxed font-sans ${isLight ? 'text-neutral-750' : 'text-neutral-300'}`}>{selectedNode.description}</p>
          </div>

          {/* Validation resources list */}
          <div className="space-y-3.5">
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider px-1 block">AI Curated Resources</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedNode.resources.map((res, i) => (
                <motion.a
                  key={i}
                  href={res.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  whileHover={{ y: -2 }}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between text-left group cursor-pointer focus:outline-none focus:ring-2 ${
                    isLight 
                      ? 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50 hover:border-indigo-400 focus:ring-indigo-500/20' 
                      : 'border-neutral-850 bg-neutral-950/40 hover:bg-neutral-950 hover:border-green-400 focus:ring-green-400/20'
                  }`}
                  aria-label={`Open resource: ${res.name}`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-neutral-500 font-mono font-bold uppercase block">Resource {i + 1}</span>
                    <span className={`font-display font-bold text-xs truncate block mt-0.5 transition-colors uppercase tracking-wide ${
                      isLight ? 'text-neutral-800 group-hover:text-indigo-600' : 'text-neutral-200 group-hover:text-white'
                    }`}>{res.name}</span>
                  </div>
                  <ExternalLink className={`w-3.5 h-3.5 text-neutral-500 transition-colors flex-shrink-0 ml-2 ${
                    isLight ? 'group-hover:text-indigo-600' : 'group-hover:text-green-400'
                  }`} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* validation portfolio project */}
          <div className={`p-4 rounded-lg border space-y-3 ${
            isLight ? 'bg-indigo-50/50 border-indigo-100' : 'bg-green-400/5 border-green-500/10'
          }`}>
            <h3 className={`text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-indigo-600' : 'text-green-400'
            }`}>
              <Briefcase className="w-4 h-4" />
              <span>Portfolio Validation Project</span>
            </h3>

            <div className="space-y-1">
              <h4 className={`font-display font-bold text-xs uppercase tracking-wide ${isLight ? 'text-neutral-900' : 'text-white'}`}>{selectedNode.project.title}</h4>
              <p className={`text-[11.5px] leading-relaxed font-sans ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>{selectedNode.project.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
