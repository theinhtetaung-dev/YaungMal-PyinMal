"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatMMK, formatDateDDMMYYYY } from "@/shared/utils/formatters";
import { Sale } from "@/shared/types";
import { Receipt, Search, Printer, Eye, X, Calendar, RotateCcw } from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
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

  const handleResetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setSales(dataStore.getSales());
  }, []);

  const isDateInRange = (dateStr?: string | null) => {
    if (!dateStr) return true;
    const itemDate = dateStr.substring(0, 10);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  };

  const filteredSales = sales.filter((s) => {
    if (!isDateInRange(s.sale_date)) return false;
    const q = appliedSearch.toLowerCase();
    if (!q) return true;
    const matchesSerial = s.items?.some((i) => i.serial_number?.toLowerCase().includes(q));
    const matchesModel = s.items?.some((i) => i.laptop_model.toLowerCase().includes(q));
    return (
      s.invoice_number.toLowerCase().includes(q) ||
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_phone.includes(q) ||
      matchesSerial ||
      matchesModel
    );
  });

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Receipt className="w-4 h-4" />
          </div>
          {t("invoices.title")}
        </h1>
        {(appliedSearch || startDate || endDate) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Search & Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="md:col-span-6 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("invoices.searchPlaceholder")}
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            {appliedSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>

          {/* Date Filters */}
          <div className="md:col-span-6 grid grid-cols-2 gap-2 items-center">
            {/* Start Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                From:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                To:
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("invoices.invoiceNo")}</th>
                <th className="px-4 py-3">{t("invoices.saleDate")}</th>
                <th className="px-4 py-3">{t("invoices.billTo")}</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">{t("common.total")}</th>
                <th className="px-4 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {sale.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {formatDateDDMMYYYY(sale.sale_date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{sale.customer_name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{sale.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 font-medium capitalize">
                        {sale.payment_method.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      {formatMMK(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(sale)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 hover:border-blue-500"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t("invoices.reprint")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200/80 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSales.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between no-print">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {selectedInvoice.invoice_number}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {t("invoices.printInvoice")}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="border border-slate-700 rounded-lg p-6 bg-white text-slate-900 space-y-4 font-sans text-xs">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold">YaungMal-PyinMal Laptop Shop</h2>
                <p className="text-slate-500 text-[11px]">Laptop Sales, Accessories & Quality Repair Services</p>
                <p className="text-slate-500 text-[11px]">Yangon, Myanmar • Ph: 09-123456789</p>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p><span className="font-semibold">{t("invoices.billTo")}:</span> {selectedInvoice.customer_name}</p>
                  <p><span className="font-semibold">{t("warranties.phone")}:</span> {selectedInvoice.customer_phone}</p>
                  {selectedInvoice.customer_address && (
                    <p><span className="font-semibold">Address:</span> {selectedInvoice.customer_address}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{selectedInvoice.invoice_number}</p>
                  <p className="text-slate-500">{formatDateDDMMYYYY(selectedInvoice.sale_date)}</p>
                  <p className="uppercase font-semibold text-slate-600">{selectedInvoice.payment_method.replace("_", " ")}</p>
                </div>
              </div>

              <table className="w-full text-left border-t border-b border-slate-200 py-2">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                    <th className="py-1.5">{t("invoices.item")}</th>
                    <th className="py-1.5">{t("invoices.serial")}</th>
                    <th className="py-1.5 text-center">{t("invoices.qty")}</th>
                    <th className="py-1.5 text-right">{t("invoices.unitPrice")}</th>
                    <th className="py-1.5 text-right">{t("common.total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 font-medium">
                        {item.laptop_brand} {item.laptop_model}
                        <span className="block text-[10px] text-slate-400">
                          {t("invoices.warrantyPeriod")}: {item.warranty_period_months} Mo
                        </span>
                      </td>
                      <td className="py-2 font-mono text-[11px] text-slate-600">{item.serial_number || "N/A"}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">{formatMMK(item.unit_price)}</td>
                      <td className="py-2 text-right font-semibold">{formatMMK(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right">
                <p>
                  <span className="text-slate-500">{t("common.subtotal")}:</span>{" "}
                  <span className="font-semibold">{formatMMK(selectedInvoice.subtotal)}</span>
                </p>
                {selectedInvoice.discount > 0 && (
                  <p>
                    <span className="text-slate-500">{t("common.discount")}:</span>{" "}
                    <span className="font-semibold text-red-600">-{formatMMK(selectedInvoice.discount)}</span>
                  </p>
                )}
                <p className="text-sm font-bold pt-1 border-t border-slate-200">
                  <span>{t("common.total")}:</span>{" "}
                  <span>{formatMMK(selectedInvoice.total)}</span>
                </p>
              </div>

              <div className="text-center pt-3 border-t border-slate-200 text-slate-500 text-[10px]">
                <p>ဝယ်ယူအားပေးမှုကို အထူးကျေးဇူးတင်ရှိပါသည်။</p>
                <p>Official Store Invoice Receipt • YaungMal-PyinMal</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
