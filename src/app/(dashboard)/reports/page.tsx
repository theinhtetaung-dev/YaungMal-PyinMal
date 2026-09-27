"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatMMK, formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "@/shared/utils/formatters";
import { Laptop, Sale, LaptopService, Warranty, ShopSettings } from "@/shared/types";
import { initialShopSettings } from "@/shared/lib/mockData";
import {
  BarChart3,
  Boxes,
  Wrench,
  ShieldCheck,
  Calendar,
  Filter,
  Printer,
  FileDown,
  RotateCcw,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Eye,
  X,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";

export default function ReportsPage() {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [services, setServices] = useState<LaptopService[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(initialShopSettings);
  const [activeTab, setActiveTab] = useState<"sales" | "services" | "inventory" | "warranties">("sales");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const ITEMS_PER_PAGE = 15;

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filter States (Default to Today)
  const [startDate, setStartDate] = useState<string>(() => getTodayDateString());
  const [endDate, setEndDate] = useState<string>(() => getTodayDateString());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    setSales(dataStore.getSales());
    setLaptops(dataStore.getLaptops());
    setServices(dataStore.getServices());
    setWarranties(dataStore.getWarranties());
    setShopSettings(dataStore.getSettings());
  }, []);

  const handleResetFilters = () => {
    const today = getTodayDateString();
    setStartDate(today);
    setEndDate(today);
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const handleClearAllDates = () => {
    setStartDate("");
    setEndDate("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper date checker
  const isDateInRange = (dateStr?: string | null) => {
    if (!dateStr) return true;
    const itemDate = dateStr.substring(0, 10);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  };

  // Filtered Data Calculations
  const filteredSales = sales.filter((s) => {
    const matchesDate = isDateInRange(s.sale_date);
    const matchesStatus =
      selectedStatus === "all" ||
      s.payment_method === selectedStatus;
    return matchesDate && matchesStatus;
  });

  const filteredServices = services.filter((srv) => {
    const matchesDate = isDateInRange(srv.received_date);
    const matchesStatus = selectedStatus === "all" || srv.status === selectedStatus;
    return matchesDate && matchesStatus;
  });

  const filteredLaptops = laptops.filter((l) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "in_stock") return l.status === "in_stock";
    if (selectedStatus === "low_stock") return l.stock_quantity <= 3 && l.status === "in_stock";
    if (selectedStatus === "sold") return l.status === "sold";
    return l.status === selectedStatus;
  });

  const filteredWarranties = warranties.filter((w) => {
    const isExpired = new Date(w.end_date) < new Date();
    const matchesDate = isDateInRange(w.start_date);
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && !isExpired && w.status === "active") ||
      (selectedStatus === "expired" && (isExpired || w.status === "expired"));
    return matchesDate && matchesStatus;
  });

  // KPI Calculations on Filtered Data
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalServiceIncome = filteredServices.reduce((sum, s) => sum + s.paid_amount, 0);
  const totalUnitsSold = filteredSales.reduce(
    (sum, s) => sum + (s.items?.reduce((itemSum, i) => itemSum + i.quantity, 0) || 0),
    0
  );
  const totalInventoryValuation = filteredLaptops.reduce(
    (sum, l) => sum + l.selling_price * l.stock_quantity,
    0
  );

  // Filtered Slices for Pagination
  const totalPages = Math.ceil(
    (activeTab === "sales"
      ? filteredSales.length
      : activeTab === "services"
      ? filteredServices.length
      : activeTab === "inventory"
      ? filteredLaptops.length
      : filteredWarranties.length) / ITEMS_PER_PAGE
  );

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const paginatedLaptops = filteredLaptops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-5">
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            {t("reports.title")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate, filter by date & status, preview and print business reports
          </p>
        </div>

        {/* Action Buttons: Preview / Print / Generate PDF */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Preview Report"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Report</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t("invoices.print", "Print")}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Export PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Hidden when printing) */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs space-y-3 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Filter Report</span>
            {startDate === getTodayDateString() && endDate === getTodayDateString() && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-semibold lowercase tracking-normal">
                Today (Current Day)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {startDate && endDate && (
              <button
                type="button"
                onClick={handleClearAllDates}
                className="text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
              >
                All Time History
              </button>
            )}
            {(startDate !== getTodayDateString() || endDate !== getTodayDateString() || selectedStatus !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Today</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Start Date */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dynamic Status Filter based on active tab */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {activeTab === "sales" && (
                <>
                  <option value="cash">Cash</option>
                  <option value="mobile_payment">Mobile Payment (KPay / Wave)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card_payment">Card Payment</option>
                </>
              )}
              {activeTab === "services" && (
                <>
                  <option value="received">Received</option>
                  <option value="checking">Checking</option>
                  <option value="repairing">Repairing</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
              {activeTab === "inventory" && (
                <>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock (≤ 3)</option>
                  <option value="sold">Sold</option>
                </>
              )}
              {activeTab === "warranties" && (
                <>
                  <option value="active">Active Warranty</option>
                  <option value="expired">Expired Warranty</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Header (Visible only on Print or at top of document) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-black">{shopSettings.shop_name}</h1>
            <p className="text-xs text-slate-600">{shopSettings.shop_address} • {shopSettings.shop_phone}</p>
            <p className="text-sm font-semibold uppercase mt-2 text-blue-800 tracking-wider">
              {activeTab.toUpperCase()} REPORT
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Generated: {formatDateTimeDDMMYYYY(new Date().toISOString())}</p>
            <p>
              Date Range: {startDate || "All"} to {endDate || "All"}
            </p>
            <p>Status: {selectedStatus.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("reports.totalRevenue")}</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatMMK(totalSalesRevenue)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{filteredSales.length} Transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("reports.serviceIncome")}</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatMMK(totalServiceIncome)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{filteredServices.length} Service Jobs</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("reports.unitsSold")}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalUnitsSold} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Units</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Valuation: {formatMMK(totalInventoryValuation)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("reports.completedRepairs")}</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {filteredServices.filter((s) => s.status === "completed" || s.status === "delivered").length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{filteredWarranties.length} Warranties</p>
        </div>
      </div>

      {/* Tab Navigation (Hidden on Print) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-xs font-semibold no-print">
        <button
          type="button"
          onClick={() => {
            setActiveTab("sales");
            setSelectedStatus("all");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === "sales"
              ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {t("reports.salesReport")} ({filteredSales.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("services");
            setSelectedStatus("all");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === "services"
              ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {t("reports.serviceReport")} ({filteredServices.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("inventory");
            setSelectedStatus("all");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === "inventory"
              ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {t("reports.inventoryReport")} ({filteredLaptops.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("warranties");
            setSelectedStatus("all");
            setCurrentPage(1);
          }}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === "warranties"
              ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {t("reports.warrantyReport")} ({filteredWarranties.length})
        </button>
      </div>

      {/* Tab Content & Printable Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
        {/* Sales Report Table */}
        {activeTab === "sales" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Sales Breakdown by Transaction
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total: {formatMMK(totalSalesRevenue)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Amount (MMK)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No sales match the selected date & status filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedSales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-semibold text-blue-600 dark:text-blue-400">{s.invoice_number}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 text-xs">{formatDateDDMMYYYY(s.sale_date)}</td>
                        <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium">{s.customer_name}</td>
                        <td className="px-4 py-2.5 capitalize text-slate-600 dark:text-slate-300">{s.payment_method.replace("_", " ")}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">{formatMMK(s.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Services Report Table */}
        {activeTab === "services" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Service Jobs & Repair Income Breakdown
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Income: {formatMMK(totalServiceIncome)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Laptop</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                    <th className="px-4 py-3 text-right">Paid (MMK)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        No service jobs match the selected date & status filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedServices.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-semibold text-blue-600 dark:text-blue-400">{srv.service_ticket_no}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 text-xs">{formatDateDDMMYYYY(srv.received_date)}</td>
                        <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium">{srv.customer_name}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{srv.laptop_brand} {srv.laptop_model}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] px-2 py-0.5 rounded-md font-medium capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                            {srv.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{formatMMK(srv.service_cost)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatMMK(srv.paid_amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Report Table */}
        {activeTab === "inventory" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Current Laptop Valuation & Stock Levels
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Stock Valuation: {formatMMK(totalInventoryValuation)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Laptop & Model</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Price (MMK)</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Total Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLaptops.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No inventory items match the selected status filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedLaptops.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                          {l.brand?.name} {l.model}
                        </td>
                        <td className="px-4 py-2.5 capitalize">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                              l.stock_quantity <= 3
                                ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                                : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            }`}
                          >
                            {l.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">
                          {formatMMK(l.selling_price)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {l.stock_quantity}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400">
                          {formatMMK(l.selling_price * l.stock_quantity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Warranties Report Table */}
        {activeTab === "warranties" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Warranty & Expiry Summary
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {filteredWarranties.length} Recorded Warranties
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Laptop & Model</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredWarranties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No warranties match the selected date & status filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedWarranties.map((w) => {
                      const isExpired = new Date(w.end_date) < new Date();
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                            {w.customer_name}
                            <span className="block text-[10px] text-slate-400">{w.customer_phone}</span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                            {w.laptop_model}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                            {formatDateDDMMYYYY(w.start_date)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                            {formatDateDDMMYYYY(w.end_date)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                isExpired
                                  ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40"
                                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                              }`}
                            >
                              {isExpired ? "Expired" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Pagination */}
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={
              activeTab === "sales"
                ? filteredSales.length
                : activeTab === "services"
                ? filteredServices.length
                : activeTab === "inventory"
                ? filteredLaptops.length
                : filteredWarranties.length
            }
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Report Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Control Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                  {activeTab} Report Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Preview Sheet Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-100 dark:bg-slate-950/40">
              <div className="max-w-3xl mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 space-y-6 font-sans text-xs">
                {/* Store Document Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{shopSettings.shop_name}</h1>
                    <p className="text-slate-600 text-xs mt-0.5">{shopSettings.shop_address}</p>
                    <p className="text-slate-600 text-xs">Tel: {shopSettings.shop_phone} • Email: {shopSettings.shop_email}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs uppercase tracking-wider">
                      OFFICIAL {activeTab.toUpperCase()} REPORT
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Generated: {formatDateTimeDDMMYYYY(new Date().toISOString())}
                    </p>
                  </div>
                </div>

                {/* Filter & Range Overview Strip */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date Range</span>
                    <strong className="text-slate-800">{startDate || "Beginning"} → {endDate || "Present"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status Filter</span>
                    <strong className="text-slate-800 capitalize">{selectedStatus.replace("_", " ")}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Matching Records</span>
                    <strong className="text-blue-700">
                      {activeTab === "sales"
                        ? `${filteredSales.length} Invoices`
                        : activeTab === "services"
                        ? `${filteredServices.length} Jobs`
                        : activeTab === "inventory"
                        ? `${filteredLaptops.length} Items`
                        : `${filteredWarranties.length} Warranties`}
                    </strong>
                  </div>
                </div>

                {/* Table Data Preview */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  {activeTab === "sales" && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                        <tr>
                          <th className="p-2.5">Invoice #</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Customer</th>
                          <th className="p-2.5">Payment</th>
                          <th className="p-2.5 text-right">Total (MMK)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSales.slice(0, 50).map((s) => (
                          <tr key={s.id}>
                            <td className="p-2 font-mono font-semibold text-blue-700">{s.invoice_number}</td>
                            <td className="p-2 text-slate-600">{formatDateDDMMYYYY(s.sale_date)}</td>
                            <td className="p-2 font-medium">{s.customer_name}</td>
                            <td className="p-2 capitalize text-slate-600">{s.payment_method.replace("_", " ")}</td>
                            <td className="p-2 text-right font-bold">{formatMMK(s.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "services" && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                        <tr>
                          <th className="p-2.5">Ticket #</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Customer</th>
                          <th className="p-2.5">Laptop</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Cost</th>
                          <th className="p-2.5 text-right">Paid (MMK)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredServices.slice(0, 50).map((srv) => (
                          <tr key={srv.id}>
                            <td className="p-2 font-mono font-semibold text-blue-700">{srv.service_ticket_no}</td>
                            <td className="p-2 text-slate-600">{formatDateDDMMYYYY(srv.received_date)}</td>
                            <td className="p-2 font-medium">{srv.customer_name}</td>
                            <td className="p-2">{srv.laptop_brand} {srv.laptop_model}</td>
                            <td className="p-2 capitalize font-semibold">{srv.status.replace("_", " ")}</td>
                            <td className="p-2 text-right">{formatMMK(srv.service_cost)}</td>
                            <td className="p-2 text-right font-bold text-emerald-700">{formatMMK(srv.paid_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "inventory" && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                        <tr>
                          <th className="p-2.5">Model</th>
                          <th className="p-2.5">Brand</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Price</th>
                          <th className="p-2.5 text-right">Stock Qty</th>
                          <th className="p-2.5 text-right">Valuation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLaptops.slice(0, 50).map((l) => (
                          <tr key={l.id}>
                            <td className="p-2 font-medium">{l.model}</td>
                            <td className="p-2 text-slate-600">{l.brand?.name}</td>
                            <td className="p-2 capitalize">{l.status.replace("_", " ")}</td>
                            <td className="p-2 text-right">{formatMMK(l.selling_price)}</td>
                            <td className="p-2 text-right font-bold">{l.stock_quantity}</td>
                            <td className="p-2 text-right font-bold text-blue-700">{formatMMK(l.selling_price * l.stock_quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "warranties" && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                        <tr>
                          <th className="p-2.5">Customer</th>
                          <th className="p-2.5">Laptop Model</th>
                          <th className="p-2.5">Start Date</th>
                          <th className="p-2.5">Expiry Date</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredWarranties.slice(0, 50).map((w) => {
                          const isExpired = new Date(w.end_date) < new Date();
                          return (
                            <tr key={w.id}>
                              <td className="p-2 font-medium">{w.customer_name} ({w.customer_phone})</td>
                              <td className="p-2">{w.laptop_model}</td>
                              <td className="p-2 text-slate-600">{formatDateDDMMYYYY(w.start_date)}</td>
                              <td className="p-2 text-slate-600">{formatDateDDMMYYYY(w.end_date)}</td>
                              <td className="p-2 text-right font-bold">
                                {isExpired ? "Expired" : "Active"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Document Summary & Sign-off */}
                <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-end">
                  <div className="text-[11px] text-slate-500">
                    <p>Official verified report generated automatically.</p>
                    <p>{shopSettings.shop_name} Management Information System</p>
                  </div>
                  <div className="text-center w-48 border-t border-slate-400 pt-1 text-xs">
                    <p className="font-semibold text-slate-800">Authorized Signature</p>
                    <p className="text-[10px] text-slate-500">Store Manager / Auditor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Footer Summary */}
      <div className="hidden print:block pt-6 border-t border-slate-300 text-xs text-slate-500 text-center">
        Thank you for choosing {shopSettings.shop_name} • System Generated Official Report
      </div>
    </div>
  );
}
