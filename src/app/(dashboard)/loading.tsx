import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#2a3952] shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] p-4 shadow-xs h-64 flex flex-col justify-between">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
          <div className="flex items-end justify-between gap-3 h-40">
            {[1, 2, 3, 4, 5, 6].map((bar) => (
              <div
                key={bar}
                className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-md"
                style={{ height: `${(bar * 15 + 25) % 90}%` }}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] p-4 shadow-xs h-64 flex flex-col justify-between">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="flex items-center justify-center h-40">
            <div className="w-28 h-28 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] p-4 shadow-xs space-y-3">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-10 bg-slate-100 dark:bg-[#172033] rounded-lg w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
