"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { showAlert } from "@/shared/lib/alerts";
import { Profile, UserRole } from "@/shared/types";
import { initialProfiles } from "@/shared/lib/mockData";
import { Users, Plus, Shield, User, X, Check, Lock, ShieldAlert } from "lucide-react";

export default function UsersPage() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("staff");

  const loadProfiles = () => {
    setProfiles(dataStore.getProfiles());
    setCurrentUser(dataStore.getCurrentUser());
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const isAdmin = currentUser.role === "admin";

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto mt-12 space-y-3">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("users.adminOnly")}
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingProfile(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("staff");
    setIsModalOpen(true);
  };

  const handleToggleStatus = (p: Profile) => {
    if (p.role === "admin") {
      showAlert.warning(t("alerts.warningTitle"), "Admin account cannot be deactivated.");
      return;
    }
    dataStore.saveProfile({ id: p.id, is_active: !p.is_active });
    loadProfiles();
    showAlert.success(t("alerts.successTitle"), "Account status updated.");
  };

  const handleResetPassword = async (p: Profile) => {
    const confirmed = await showAlert.confirm({
      title: t("users.resetPassword"),
      text: `Reset password for ${p.full_name}? A temporary password will be assigned.`,
      confirmButtonText: "Yes, reset",
    });
    if (confirmed) {
      showAlert.success(t("alerts.successTitle"), `Password reset link/temporary password sent to ${p.email}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    dataStore.saveProfile({
      id: editingProfile ? editingProfile.id : undefined,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      is_active: true,
    });

    loadProfiles();
    setIsModalOpen(false);
    showAlert.success(t("alerts.successTitle"), t("alerts.savedSuccess"));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          {t("users.title")}
        </h1>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("users.addStaff")}
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("users.fullName")}</th>
                <th className="px-4 py-3">{t("users.email")}</th>
                <th className="px-4 py-3">{t("users.phone")}</th>
                <th className="px-4 py-3">{t("users.role")}</th>
                <th className="px-4 py-3">{t("users.status")}</th>
                <th className="px-4 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                      {p.full_name.charAt(0)}
                    </div>
                    {p.full_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.email}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        p.role === "admin"
                          ? "bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                      }`}
                    >
                      {p.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {p.role === "admin" ? t("auth.roleAdmin") : t("auth.roleStaff")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        p.is_active
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                          : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                      }`}
                    >
                      {p.is_active ? t("users.active") : t("users.disabled")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t("users.resetPassword")}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      {p.role !== "admin" && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                            p.is_active
                              ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                              : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                          }`}
                        >
                          {p.is_active ? "Disable" : "Enable"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("users.addStaff")}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("users.fullName")} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("users.email")} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("users.phone")}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("users.role")}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="staff">{t("auth.roleStaff")}</option>
                  <option value="admin">{t("auth.roleAdmin")}</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {t("common.save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
