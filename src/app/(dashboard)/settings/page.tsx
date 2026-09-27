"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { showAlert } from "@/shared/lib/alerts";
import { ShopSettings, Profile } from "@/shared/types";
import { initialProfiles, initialShopSettings } from "@/shared/lib/mockData";
import { Settings, Save, Database, ShieldAlert, Download } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ShopSettings>(initialShopSettings);
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]);

  useEffect(() => {
    setSettings(dataStore.getSettings());
    setCurrentUser(dataStore.getCurrentUser());
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
          Only administrators can modify system settings and perform database backups.
        </p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateSettings(settings);
    showAlert.success(t("alerts.successTitle"), t("alerts.savedSuccess"));
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      shop_settings: dataStore.getSettings(),
      brands: dataStore.getBrands(),
      categories: dataStore.getCategories(),
      laptops: dataStore.getLaptops(),
      sales: dataStore.getSales(),
      warranties: dataStore.getWarranties(),
      services: dataStore.getServices(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yaungmal_pyinmal_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showAlert.success(t("alerts.successTitle"), "Database backup snapshot exported successfully.");
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Settings className="w-4 h-4" />
          </div>
          {t("settings.title")}
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Shop Information */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4.5 space-y-3.5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5">
            {t("settings.shopInfo")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.shopName")}
              </label>
              <input
                type="text"
                value={settings.shop_name}
                onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.shopPhone")}
              </label>
              <input
                type="text"
                value={settings.shop_phone}
                onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.shopEmail")}
              </label>
              <input
                type="email"
                value={settings.shop_email}
                onChange={(e) => setSettings({ ...settings, shop_email: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.shopAddress")}
              </label>
              <input
                type="text"
                value={settings.shop_address}
                onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4.5 space-y-3.5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5">
            {t("settings.invoiceSettings")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.invoiceHeader")}
              </label>
              <input
                type="text"
                value={settings.invoice_header}
                onChange={(e) => setSettings({ ...settings, invoice_header: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.invoiceFooter")}
              </label>
              <input
                type="text"
                value={settings.invoice_footer}
                onChange={(e) => setSettings({ ...settings, invoice_footer: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4.5 space-y-3.5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5">
            System Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.currency")}
              </label>
              <input
                type="text"
                disabled
                value="MMK (Myanmar Kyats)"
                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.dateFormat")}
              </label>
              <input
                type="text"
                disabled
                value="DD/MM/YYYY"
                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                {t("settings.lowStockThreshold")} (Units)
              </label>
              <input
                type="number"
                min="1"
                value={settings.low_stock_threshold}
                onChange={(e) => setSettings({ ...settings, low_stock_threshold: Number(e.target.value) || 3 })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              {t("settings.saveSettings")}
            </button>
          </div>
        </div>
      </form>

      {/* Database Backup Section */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {t("settings.backup")}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Export all data as a backup JSON snapshot file
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportBackup}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 border border-slate-200 dark:border-slate-700"
        >
          <Download className="w-3.5 h-3.5" />
          Export Backup JSON
        </button>
      </div>
    </div>
  );
}
