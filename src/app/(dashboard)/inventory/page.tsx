"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatMMK, formatDateDDMMYYYY } from "@/shared/utils/formatters";
import { showAlert } from "@/shared/lib/alerts";
import { Laptop, Profile } from "@/shared/types";
import { initialProfiles } from "@/shared/lib/mockData";
import {
  Boxes,
  Search,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  ArrowUpDown,
  History,
  X,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";

export default function InventoryPage() {
  const { t } = useTranslation();
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  // Stock Adjustment Modal
  const [adjustLaptop, setAdjustLaptop] = useState<Laptop | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(1);
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out">("in");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  const loadLaptops = () => {
    setLaptops(dataStore.getLaptops());
    setCurrentUser(dataStore.getCurrentUser());
  };

  useEffect(() => {
    loadLaptops();
  }, []);

  const isAdmin = currentUser.role === "admin";

  const filteredLaptops = laptops.filter((lap) => {
    const q = appliedSearch.toLowerCase();
    if (!q) return true;
    return (
      lap.model.toLowerCase().includes(q) ||
      (lap.brand?.name && lap.brand.name.toLowerCase().includes(q)) ||
      (lap.serial_number && lap.serial_number.toLowerCase().includes(q)) ||
      (lap.product_code && lap.product_code.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredLaptops.length / ITEMS_PER_PAGE);
  const paginatedLaptops = filteredLaptops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustLaptop) return;

    const change = adjustmentType === "in" ? Math.abs(adjustmentQty) : -Math.abs(adjustmentQty);
    dataStore.adjustStock(adjustLaptop.id, change, adjustmentNotes);
    loadLaptops();
    setAdjustLaptop(null);
    setAdjustmentNotes("");
    showAlert.success(t("alerts.successTitle"), "Stock successfully updated.");
  };

  const totalStockItems = laptops.reduce((sum, lap) => sum + lap.stock_quantity, 0);
  const lowStockCount = laptops.filter((lap) => lap.stock_quantity <= 3 && lap.status === "in_stock").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Boxes className="w-4 h-4" />
          </div>
          {t("inventory.title")}
        </h1>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("inventory.currentStock")}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalStockItems} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Units</span></p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("inventory.lowStockWarning")}</p>
          <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
            {lowStockCount} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Laptops</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Asset Value</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatMMK(laptops.reduce((sum, lap) => sum + lap.selling_price * lap.stock_quantity, 0))}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("pos.searchLaptopPlaceholder")}
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

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("laptops.model")}</th>
                <th className="px-4 py-3">{t("laptops.brand")}</th>
                <th className="px-4 py-3 text-right">{t("laptops.sellingPrice")}</th>
                <th className="px-4 py-3 text-center">{t("inventory.currentStock")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
                {isAdmin && <th className="px-4 py-3 text-right">{t("inventory.adjustStock")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLaptops.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginatedLaptops.map((lap) => {
                  const isLowStock = lap.stock_quantity <= 3 && lap.status === "in_stock";
                  return (
                    <tr
                      key={lap.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isLowStock ? "bg-amber-50/60 dark:bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {lap.model}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {lap.brand?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                        {formatMMK(lap.selling_price)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isLowStock
                              ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50"
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                          {lap.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                            lap.status === "in_stock"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/40"
                          }`}
                        >
                          {t(`laptops.${lap.status.replace("_", "")}`, lap.status)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustLaptop(lap);
                              setAdjustmentQty(1);
                              setAdjustmentType("in");
                            }}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white rounded-md text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 hover:border-blue-500"
                          >
                            {t("inventory.adjustStock")}
                          </button>
                        </td>
                      )}
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
            totalItems={filteredLaptops.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Adjust Stock Modal (Admin Only) */}
      {adjustLaptop && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustSubmit}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("inventory.adjustStock")}: <span className="text-blue-600 dark:text-blue-400">{adjustLaptop.model}</span>
              </h3>
              <button
                type="button"
                onClick={() => setAdjustLaptop(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current Stock: <strong className="text-slate-900 dark:text-white">{adjustLaptop.stock_quantity} units</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                  {t("inventory.movementType")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("in")}
                    className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                      adjustmentType === "in"
                        ? "bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40"
                        : "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {t("inventory.typeIn")} (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("out")}
                    className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                      adjustmentType === "out"
                        ? "bg-rose-50 dark:bg-rose-600/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/40"
                        : "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    {t("inventory.typeOut")} (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("inventory.quantity")}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Reason for adjustment (e.g. Supplier delivery, damaged in store)..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustLaptop(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
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
