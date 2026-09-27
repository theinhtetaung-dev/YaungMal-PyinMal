import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
}
