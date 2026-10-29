import React from 'react';

export const ProyectosSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="h-7 bg-slate-200 rounded w-80" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 bg-slate-200 rounded-xl w-44" />
          <div className="h-9 bg-slate-200 rounded-xl w-32" />
          <div className="h-9 bg-slate-200 rounded-xl w-36" />
        </div>
      </div>

      {/* Skeleton KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="w-8 h-8 rounded-xl bg-slate-200" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-36" />
            <div className="h-2.5 bg-slate-200 rounded w-48" />
          </div>
        ))}
      </div>

      {/* Skeleton Analytics Section (Chart 60% / Categories 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-48" />
            <div className="h-6 bg-slate-200 rounded-lg w-28" />
          </div>
          <div className="h-48 bg-slate-100 rounded-xl flex items-end justify-between p-3 gap-2">
            {[40, 65, 80, 50, 90, 70, 85, 95, 60, 75].map((pct, idx) => (
              <div key={idx} className="flex-1 bg-slate-200 rounded-t-lg" style={{ height: `${pct}%` }} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="h-4 bg-slate-200 rounded w-40" />
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-32" />
                  <div className="h-3 bg-slate-200 rounded w-20" />
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton Data Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-56" />
          <div className="h-9 bg-slate-200 rounded-xl w-64" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-11 bg-slate-50 border border-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
