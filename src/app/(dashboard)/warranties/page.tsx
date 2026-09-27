"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatDateDDMMYYYY } from "@/shared/utils/formatters";
import { Warranty } from "@/shared/types";
import { ShieldCheck, Search, AlertCircle, Clock, X } from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";

export default function WarrantiesPage() {
  const { t } = useTranslation();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setWarranties(dataStore.getWarranties());
  }, []);

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredWarranties = warranties.filter((w) => {
    const q = appliedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      w.customer_name.toLowerCase().includes(q) ||
      w.customer_phone.includes(q) ||
      w.laptop_model.toLowerCase().includes(q) ||
      w.serial_number.toLowerCase().includes(q);

    const days = getDaysRemaining(w.end_date);
    const isActuallyExpired = days < 0 || w.status === "expired";
    const statusMatches =
      selectedStatus === "all" ||
      (selectedStatus === "active" && !isActuallyExpired) ||
      (selectedStatus === "expired" && isActuallyExpired);

    return matchesSearch && statusMatches;
  });

  const totalPages = Math.ceil(filteredWarranties.length / ITEMS_PER_PAGE);
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          {t("warranties.title")}
        </h1>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <form onSubmit={handleSearch} className="sm:col-span-9 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("warranties.searchPlaceholder")}
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          {appliedSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium shrink-0 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="sm:col-span-3 px-3 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
        >
          <option value="all">{t("common.all")} Statuses</option>
          <option value="active">{t("warranties.active")}</option>
          <option value="expired">{t("warranties.expired")}</option>
        </select>
      </div>

      {/* Warranties Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("warranties.serialNumber")}</th>
                <th className="px-4 py-3">{t("warranties.model")}</th>
                <th className="px-4 py-3">{t("warranties.customer")}</th>
                <th className="px-4 py-3">{t("warranties.startDate")}</th>
                <th className="px-4 py-3">{t("warranties.endDate")}</th>
                <th className="px-4 py-3 text-center">{t("warranties.daysRemaining")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredWarranties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginatedWarranties.map((w) => {
                  const days = getDaysRemaining(w.end_date);
                  const isExpired = days <= 0;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {w.serial_number}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {w.laptop_model}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{w.customer_name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{w.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                        {formatDateDDMMYYYY(w.start_date)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {formatDateDDMMYYYY(w.end_date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${
                            isExpired
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700/50"
                              : days < 30
                              ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                              : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                          }`}
                        >
                          {isExpired ? "0 days" : `${days} days`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                            !isExpired
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                          }`}
                        >
                          {isExpired ? t("warranties.expired") : t("warranties.active")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200/80 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredWarranties.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
