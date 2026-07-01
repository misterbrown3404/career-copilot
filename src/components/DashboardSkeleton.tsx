import React from 'react';
import { Sparkles, FileCheck, ClipboardList, Award, MessageSquare, DollarSign } from 'lucide-react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="relative overflow-hidden bg-neutral-900 border border-neutral-850 p-6 sm:p-8 rounded-lg">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-800 border border-neutral-750 text-neutral-500 text-[10px] font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 opacity-50" />
              <div className="h-2 w-28 bg-neutral-800 rounded"></div>
            </div>
            {/* Title Bar */}
            <div className="h-7 bg-neutral-800 rounded w-1/3 min-w-[200px]"></div>
            {/* Subtitle Bar */}
            <div className="space-y-1.5">
              <div className="h-3 bg-neutral-800 rounded w-1/2 min-w-[300px]"></div>
              <div className="h-3 bg-neutral-800 rounded w-1/3 min-w-[200px]"></div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4 bg-neutral-950/40 p-4 rounded-lg border border-neutral-850 self-start md:self-auto min-w-[140px] justify-center">
            <div className="text-center space-y-2">
              <div className="h-8 bg-neutral-800 rounded w-14 mx-auto"></div>
              <div className="h-2.5 bg-neutral-800 rounded w-20 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CV Strength */}
        <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-2.5 bg-neutral-800 rounded w-20"></div>
            <div className="p-2 bg-neutral-950 border border-neutral-850 text-neutral-700 rounded-md">
              <FileCheck className="w-4 h-4 opacity-30" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-neutral-800 rounded w-1/3"></div>
            <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-850">
              <div className="bg-neutral-800 h-full rounded-full w-2/3"></div>
            </div>
            <div className="h-2 bg-neutral-850 rounded w-24"></div>
          </div>
        </div>

        {/* Card 2: App Pipeline */}
        <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-2.5 bg-neutral-800 rounded w-20"></div>
            <div className="p-2 bg-neutral-950 border border-neutral-850 text-neutral-700 rounded-md">
              <ClipboardList className="w-4 h-4 opacity-30" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-neutral-800 rounded w-1/4"></div>
            <div className="h-2.5 bg-neutral-800 rounded w-5/6"></div>
            <div className="h-2 bg-neutral-850 rounded w-28"></div>
          </div>
        </div>

        {/* Card 3: Interview Coach */}
        <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-2.5 bg-neutral-800 rounded w-24"></div>
            <div className="p-2 bg-neutral-950 border border-neutral-850 text-neutral-700 rounded-md">
              <Award className="w-4 h-4 opacity-30" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-neutral-800 rounded w-1/2"></div>
            <div className="h-2.5 bg-neutral-800 rounded w-2/3"></div>
            <div className="h-2 bg-neutral-850 rounded w-24"></div>
          </div>
        </div>

        {/* Card 4: Career Mentors */}
        <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-2.5 bg-neutral-800 rounded w-20"></div>
            <div className="p-2 bg-neutral-950 border border-neutral-850 text-neutral-700 rounded-md">
              <MessageSquare className="w-4 h-4 opacity-30" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-neutral-800 rounded w-1/2"></div>
            <div className="h-2.5 bg-neutral-800 rounded w-4/5"></div>
            <div className="h-2 bg-neutral-850 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Recommended & Pipeline Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Actions: Bento Grid Skeletons */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-4 bg-neutral-800 rounded w-48"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="bg-neutral-900 p-5 rounded-lg border border-neutral-800 flex flex-col justify-between h-40"
              >
                <div className="space-y-2.5">
                  <div className="h-4.5 bg-neutral-850 rounded w-1/3"></div>
                  <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-neutral-800 rounded w-full"></div>
                    <div className="h-2.5 bg-neutral-800 rounded w-4/5"></div>
                  </div>
                </div>
                <div className="h-3 bg-neutral-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Pipelines list skeletons */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-neutral-800 rounded w-40"></div>
            <div className="h-3.5 bg-neutral-800 rounded w-12"></div>
          </div>

          <div className="bg-neutral-900 rounded-lg border border-neutral-850 p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="p-3.5 rounded-md border border-neutral-850 bg-neutral-950/40 flex items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="h-4 bg-neutral-800 rounded w-2/3"></div>
                  <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-800 rounded w-16 mt-1"></div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="h-4 bg-neutral-800 rounded w-16"></div>
                  <div className="h-3.5 bg-neutral-800 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
