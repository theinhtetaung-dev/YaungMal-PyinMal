"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n";
import { dataStore } from "../lib/dataService";
import { Profile } from "../types";
import { initialProfiles } from "../lib/mockData";
import {
  LayoutDashboard,
  Laptop,
  Boxes,
  ShoppingCart,
  Receipt,
  ShieldCheck,
  Wrench,
  BarChart3,
  Users,
  Settings,
  Tag,
  FolderTree,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]);

  useEffect(() => {
    setCurrentUser(dataStore.getCurrentUser());
  }, []);

  const isAdmin = currentUser.role === "admin";

  const navigation = [
    {
      name: t("nav.dashboard"),
      href: "/",
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      name: t("nav.laptops"),
      href: "/laptops",
      icon: Laptop,
      allowed: true,
    },
    {
      name: t("nav.brands"),
      href: "/brands",
      icon: Tag,
      allowed: isAdmin, // Admin only
    },
    {
      name: t("nav.categories"),
      href: "/categories",
      icon: FolderTree,
      allowed: isAdmin, // Admin only
    },
    {
      name: t("nav.inventory"),
      href: "/inventory",
      icon: Boxes,
      allowed: true,
    },
    {
      name: t("nav.pos"),
      href: "/pos",
      icon: ShoppingCart,
      allowed: true,
    },
    {
      name: t("nav.invoices"),
      href: "/invoices",
      icon: Receipt,
      allowed: true,
    },
    {
      name: t("nav.warranties"),
      href: "/warranties",
      icon: ShieldCheck,
      allowed: true,
    },
    {
      name: t("nav.services"),
      href: "/services",
      icon: Wrench,
      allowed: true,
    },
    {
      name: t("nav.reports"),
      href: "/reports",
      icon: BarChart3,
      allowed: true,
    },
    {
      name: t("nav.users"),
      href: "/users",
      icon: Users,
      allowed: isAdmin, // Admin only
    },
    {
      name: t("nav.settings"),
      href: "/settings",
      icon: Settings,
      allowed: isAdmin, // Admin only
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-[#2a3952] flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)] transition-colors no-print">
      {/* User Info */}
      <div className="p-3.5 border-b border-slate-200 dark:border-[#2a3952]">
        <div className="flex items-center gap-2.5 px-1">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-xs ${
              isAdmin ? "bg-blue-600" : "bg-emerald-600"
            }`}
          >
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-[#f8fafc] truncate">
              {currentUser.full_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAdmin ? "bg-blue-500" : "bg-emerald-500"
                }`}
              />
              <span className="text-[11px] uppercase font-bold tracking-wide text-slate-500 dark:text-[#94a3b8]">
                {isAdmin ? t("auth.roleAdmin") : t("auth.roleStaff")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {navigation
          .filter((item) => item.allowed)
          .map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-700 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-[#f8fafc]"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-[#64748b]"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* Compact footer */}
      <div className="p-2.5 border-t border-slate-200 dark:border-[#2a3952] text-[11px] text-slate-400 dark:text-[#64748b] text-center">
        YoungMal-PyinMal • MMK
      </div>
    </aside>
  );
};
