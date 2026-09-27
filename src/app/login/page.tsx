"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n";
import { useTheme } from "@/shared/lib/theme";
import { dataStore } from "@/shared/lib/dataService";
import { showAlert } from "@/shared/lib/alerts";
import { UserRole } from "@/shared/types";
import { Laptop, Eye, EyeOff, Sun, Moon, LogIn, Shield, User } from "lucide-react";

// Mock credentials for demo login
const MOCK_CREDENTIALS: Record<string, { role: UserRole; name: string }> = {
  "admin@yaungmal.com": { role: "admin", name: "Shop Admin (Owner)" },
  "staff@yaungmal.com": { role: "staff", name: "Ko Kyaw Zin (Staff)" },
};

export default function LoginPage() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      await showAlert.warning(t("auth.loginError"), t("auth.loginError"));
      return;
    }

    setIsLoading(true);

    try {
      // Simulate async login
      await new Promise((r) => setTimeout(r, 800));

      const match = MOCK_CREDENTIALS[email.trim().toLowerCase()];

      if (match && password.length >= 4) {
        // Set the current user role in dataStore
        dataStore.setCurrentRole(match.role);
        document.cookie = `yaungmal_session=${match.role}; path=/; max-age=86400; SameSite=Lax`;

        // Use auto-dismissing toast so navigation isn't blocked
        showAlert.toast(t("auth.loginSuccess"), match.name);
        router.push("/");
      } else {
        await showAlert.error(t("auth.loginError"), t("auth.invalidCredentials") || "Invalid email or password. Use admin@yaungmal.com or staff@yaungmal.com with 4+ character password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      dataStore.setCurrentRole(role);
      document.cookie = `yaungmal_session=${role}; path=/; max-age=86400; SameSite=Lax`;
      showAlert.toast(t("auth.loginSuccess"), role === "admin" ? "Shop Admin (Owner)" : "Ko Kyaw Zin (Staff)");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0b1220] p-4 transition-colors">
      {/* Top Controls */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-[#f8fafc] text-base block leading-tight">
              {t("common.appName")}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#94a3b8]">POS &amp; Service</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Switcher */}
          <div className="flex items-center bg-white dark:bg-[#172033] rounded-lg p-0.5 border border-slate-200 dark:border-[#2a3952] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === "en"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f8fafc]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("my")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === "my"
                  ? "bg-blue-600 text-white shadow-xs"
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
            className="p-1.5 rounded-lg bg-white dark:bg-[#172033] text-slate-600 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-[#f8fafc] transition-colors border border-slate-200 dark:border-[#2a3952]"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#2a3952] shadow-xl p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#f8fafc]">
            {t("auth.signInTitle")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-0.5">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-700 dark:text-[#94a3b8] mb-1.5"
            >
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yaungmal.com"
              autoComplete="username"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-[#2a3952] bg-slate-50 dark:bg-[#172033] text-slate-900 dark:text-[#f8fafc] placeholder-slate-400 dark:placeholder-[#64748b] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-700 dark:text-[#94a3b8] mb-1.5"
            >
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 dark:border-[#2a3952] bg-slate-50 dark:bg-[#172033] text-slate-900 dark:text-[#f8fafc] placeholder-slate-400 dark:placeholder-[#64748b] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-[#64748b] dark:hover:text-[#94a3b8]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("auth.loggingIn")}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t("auth.login")}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-[#2a3952]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-[#111827] px-2.5 text-slate-400 dark:text-[#64748b] font-semibold tracking-wider">
              {language === "my" ? "အမြန် စမ်းသပ်ဝင်ရောက်ရန်" : "Quick Demo Access"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="quick-admin-btn"
            type="button"
            onClick={() => handleQuickLogin("admin")}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 font-medium text-xs transition-colors disabled:opacity-50"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t("auth.roleAdmin")}</span>
          </button>
          <button
            id="quick-staff-btn"
            type="button"
            onClick={() => handleQuickLogin("staff")}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 font-medium text-xs transition-colors disabled:opacity-50"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t("auth.roleStaff")}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-[#64748b] text-center font-mono mt-4">
          admin@yaungmal.com • staff@yaungmal.com
        </p>
      </div>
    </div>
  );
}
