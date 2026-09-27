"use client";

import React from "react";
import { Header } from "@/shared/components/Header";
import { Sidebar } from "@/shared/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-5 sm:p-7 overflow-y-auto w-full max-w-[1720px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
