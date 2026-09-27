"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useTheme } from "../lib/theme";
import { showAlert } from "../lib/alerts";
import { dataStore } from "../lib/dataService";
import { UserRole, Profile } from "../types";
import { initialProfiles } from "../lib/mockData";
import {
  Sun,
  Moon,
  Globe,
  LogOut,
  Shield,
  User,
  Laptop as LaptopIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]);

  useEffect(() => {
    setCurrentUser(dataStore.getCurrentUser());
  }, []);

  const handleRoleToggle = (newRole: UserRole) => {
    dataStore.setCurrentRole(newRole);
    document.cookie = `yaungmal_session=${newRole}; path=/; max-age=86400; SameSite=Lax`;
    setCurrentUser(dataStore.getCurrentUser());
    window.location.reload();
  };

  const handleLogout = async () => {
    const confirmed = await showAlert.confirmLogout({
      title: t("alerts.confirmLogoutTitle"),
      text: t("alerts.confirmLogoutText"),
      confirmButtonText: t("alerts.logoutButton"),
      cancelButtonText: t("alerts.cancelButton"),
    });

    if (confirmed) {
      document.cookie = "yaungmal_session=; path=/; max-age=0; SameSite=Lax";
      router.push("/login");
    }
  };

  return (
    <header className="h-15 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#2a3952] px-5 sm:px-7 flex items-center justify-between sticky top-0 z-30 transition-colors no-print">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <LaptopIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-[#f8fafc] leading-tight">
            {t("common.appName")}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Role Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-[#172033] rounded-lg p-0.5 border border-slate-200 dark:border-[#2a3952] text-xs font-medium">
          <button
            type="button"
            onClick={() => handleRoleToggle("admin")}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 text-xs ${
              currentUser.role === "admin"
                ? "bg-blue-600 text-white font-medium shadow-xs"
                : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f8fafc]"
            }`}
            title="Switch to Admin role"
          >
            <Shield className="w-3 h-3" />
            <span>{t("auth.roleAdmin")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle("staff")}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 text-xs ${
              currentUser.role === "staff"
                ? "bg-emerald-600 text-white font-medium shadow-xs"
                : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f8fafc]"
            }`}
            title="Switch to Staff role"
          >
            <User className="w-3 h-3" />
            <span>{t("auth.roleStaff")}</span>
          </button>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-[#172033] rounded-lg p-0.5 border border-slate-200 dark:border-[#2a3952] text-xs font-medium">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-2 py-1 rounded-md transition-all text-xs ${
              language === "en"
                ? "bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f8fafc]"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("my")}
            className={`px-2 py-1 rounded-md transition-all text-xs ${
              language === "my"
                ? "bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f8fafc]"
            }`}
          >
            မြန်မာ
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-[#94a3b8] hover:bg-slate-200 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-[#f8fafc] transition-colors border border-slate-200 dark:border-[#2a3952]"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700" />
          )}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title={t("nav.logout")}
          className="p-1.5 rounded-lg bg-red-50 dark:bg-[#172033] text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors border border-red-200 dark:border-[#2a3952]"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
