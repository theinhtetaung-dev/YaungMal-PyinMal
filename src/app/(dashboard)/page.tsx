"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatMMK, formatDateDDMMYYYY } from "@/shared/utils/formatters";
import { Laptop, Sale, LaptopService, Warranty } from "@/shared/types";
import {
  Laptop as LaptopIcon,
  ShoppingCart,
  Banknote,
  Wrench,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [services, setServices] = useState<LaptopService[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);

  useEffect(() => {
    setLaptops(dataStore.getLaptops());
    setSales(dataStore.getSales());
    setServices(dataStore.getServices());
    setWarranties(dataStore.getWarranties());
  }, []);

  // Compute metrics
  const totalLaptops = laptops.length;
  const availableLaptops = laptops.filter((l) => l.status === "in_stock").length;
  const lowStockCount = laptops.filter(
    (l) => l.stock_quantity <= 3 && l.status === "in_stock"
  ).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySales = sales
    .filter((s) => s.sale_date && s.sale_date.startsWith(todayStr))
    .reduce((sum, s) => sum + s.total, 0);

  const thisMonthStr = todayStr.substring(0, 7);
  const monthlySales = sales
    .filter((s) => s.sale_date && s.sale_date.startsWith(thisMonthStr))
    .reduce((sum, s) => sum + s.total, 0);

  const pendingServices = services.filter(
    (s) => s.status !== "completed" && s.status !== "delivered" && s.status !== "cancelled"
  ).length;

  const completedServices = services.filter(
    (s) => s.status === "completed" || s.status === "delivered"
  ).length;

  const activeWarranties = warranties.filter((w) => w.status === "active").length;

  // Monthly Sales Calculation for Vertical Bar Chart (Last 6 Months)
  const getMonthlyBarData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString("en-US", { month: "short" });

      const monthSales = sales.filter((s) => s.sale_date && s.sale_date.startsWith(yearMonth));
      const total = monthSales.reduce((sum, s) => sum + s.total, 0);
      const count = monthSales.length;

      months.push({ label, yearMonth, total, count });
    }

    const maxVal = Math.max(...months.map((m) => m.total), 1);
    return { months, maxVal };
  };

  const { months: monthlyData, maxVal: maxMonthlyVal } = getMonthlyBarData();

  // Brand Distribution for Pie/Donut Chart
  const getBrandPieData = () => {
    const brandCounts: Record<string, number> = {};
    laptops.forEach((lap) => {
      const b = lap.brand?.name || "Other";
      brandCounts[b] = (brandCounts[b] || 0) + (lap.stock_quantity || 1);
    });

    const entries = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
    const totalCount = entries.reduce((sum, [, count]) => sum + count, 0);

    const colors = [
      { fill: "#3b82f6", bg: "bg-blue-500", text: "text-blue-500" },
      { fill: "#10b981", bg: "bg-emerald-500", text: "text-emerald-500" },
      { fill: "#f59e0b", bg: "bg-amber-500", text: "text-amber-500" },
      { fill: "#8b5cf6", bg: "bg-purple-500", text: "text-purple-500" },
      { fill: "#06b6d4", bg: "bg-cyan-500", text: "text-cyan-500" },
      { fill: "#ec4899", bg: "bg-pink-500", text: "text-pink-500" },
    ];

    let cumulativePercent = 0;
    const slices = entries.slice(0, 5).map(([name, count], index) => {
      const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      return {
        name,
        count,
        percent,
        startPercent,
        color: colors[index % colors.length],
      };
    });

    // If more than 5, group into "Others"
    if (entries.length > 5) {
      const otherCount = entries.slice(5).reduce((sum, [, count]) => sum + count, 0);
      const otherPercent = totalCount > 0 ? (otherCount / totalCount) * 100 : 0;
      slices.push({
        name: "Others",
        count: otherCount,
        percent: otherPercent,
        startPercent: cumulativePercent,
        color: { fill: "#64748b", bg: "bg-slate-500", text: "text-slate-500" },
      });
    }

    return { slices, totalCount };
  };

  const { slices: pieSlices, totalCount: totalStockCount } = getBrandPieData();

  return (
    <div className="space-y-4">
      {/* Title & Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-[#f8fafc]">
          {t("dashboard.title")}
        </h1>
      </div>

      {/* KPI Cards Grid (Clickable to related pages) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Available Laptops -> /laptops */}
        <Link
          href="/laptops"
          className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#2a3952] shadow-xs flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {t("dashboard.availableLaptops")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
              {availableLaptops}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#64748b] mt-0.5">
              {t("dashboard.totalLaptops")}: {totalLaptops}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/40 group-hover:scale-105 transition-transform">
            <LaptopIcon className="w-5 h-5" />
          </div>
        </Link>

        {/* Today's Sales -> /invoices */}
        <Link
          href="/invoices"
          className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#2a3952] shadow-xs flex items-center justify-between hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {t("dashboard.todaySales")}
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatMMK(todaySales)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#64748b] mt-0.5">
              {t("dashboard.monthlySales")}: {formatMMK(monthlySales)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/40 group-hover:scale-105 transition-transform">
            <Banknote className="w-5 h-5" />
          </div>
        </Link>

        {/* Pending Services -> /services */}
        <Link
          href="/services"
          className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#2a3952] shadow-xs flex items-center justify-between hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {t("dashboard.pendingServices")}
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {pendingServices}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#64748b] mt-0.5">
              {t("dashboard.completedServices")}: {completedServices}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/40 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
        </Link>

        {/* Low Stock Alerts -> /inventory */}
        <Link
          href="/inventory"
          className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#2a3952] shadow-xs flex items-center justify-between hover:border-red-400 dark:hover:border-red-500 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {t("dashboard.lowStockCount")}
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5">
              {lowStockCount}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#64748b] mt-0.5">
              {t("dashboard.activeWarranties")}: {activeWarranties}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-900/40 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Charts Section: Vertical Bar Chart + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Vertical Bar Chart: Monthly Revenue & Sales */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/40">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] uppercase tracking-wider">
                  Monthly Revenue Trend
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-[#94a3b8]">Sales volume over last 6 months</p>
              </div>
            </div>
            <Link
              href="/reports"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full Report
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Bar Chart Area */}
          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100 dark:border-[#1e293b]">
            {monthlyData.map((m) => {
              const heightPercent = maxMonthlyVal > 0 ? Math.max((m.total / maxMonthlyVal) * 100, 6) : 6;
              return (
                <div key={m.yearMonth} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Amount Tooltip / Label */}
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-[#94a3b8] mb-1 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full text-center">
                    {m.total > 0 ? `${(m.total / 1000000).toFixed(1)}M` : "0"}
                  </span>
                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 dark:bg-[#1e293b] rounded-t-md flex items-end justify-center overflow-hidden h-[120px]">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 rounded-t-md transition-all duration-500 relative flex items-start justify-center pt-1"
                    />
                  </div>
                  {/* Month Label */}
                  <span className="text-[11px] font-medium text-slate-600 dark:text-[#94a3b8] mt-2">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie / Donut Chart: Inventory by Brand */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/40">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] uppercase tracking-wider">
                  Brand Stock Distribution
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-[#94a3b8]">Inventory share by brand</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#94a3b8]">
              {totalStockCount} Units
            </span>
          </div>

          {/* SVG Pie/Donut Chart + Legend */}
          <div className="flex items-center justify-center gap-5 py-1">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-slate-100 dark:text-[#1e293b]"
                />
                {/* Slices */}
                {pieSlices.map((slice, i) => {
                  const circumference = 2 * Math.PI * 38; // ~238.76
                  const strokeLength = (slice.percent / 100) * circumference;
                  const strokeOffset = -((slice.startPercent / 100) * circumference);

                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={slice.color.fill}
                      strokeWidth="14"
                      strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                      strokeDashoffset={strokeOffset}
                      className="transition-all duration-700"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                  {availableLaptops}
                </span>
                <span className="text-[9px] uppercase font-semibold text-slate-400 dark:text-[#64748b]">
                  Available
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-1.5 overflow-hidden">
              {pieSlices.map((slice, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${slice.color.bg}`} />
                    <span className="font-medium text-slate-700 dark:text-[#94a3b8] truncate">
                      {slice.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-[#f8fafc]">
                      {slice.count}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-[#64748b]">
                      ({slice.percent.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Sales & Recent Services (Each row is clickable) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sales Transactions */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-blue-500" />
              {t("dashboard.recentSales")}
            </h2>
            <Link
              href="/invoices"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {t("dashboard.viewAll")}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {sales.slice(0, 5).map((sale) => (
              <Link
                key={sale.id}
                href="/invoices"
                className="p-2.5 rounded-lg border border-slate-100 dark:border-[#1e293b] bg-slate-50/70 dark:bg-[#172033] flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-[#1e293b] hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer block group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-[#f8fafc] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sale.invoice_number}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                      {sale.payment_method.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#94a3b8] mt-0.5">
                    {sale.customer_name} • {sale.customer_phone}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#64748b]">
                    {formatDateDDMMYYYY(sale.sale_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc]">
                    {formatMMK(sale.total)}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                    {t("common.paid")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Laptop Services */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-500" />
              {t("dashboard.recentServices")}
            </h2>
            <Link
              href="/services"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {t("dashboard.viewAll")}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {services.slice(0, 5).map((srv) => (
              <Link
                key={srv.id}
                href="/services"
                className="p-2.5 rounded-lg border border-slate-100 dark:border-[#1e293b] bg-slate-50/70 dark:bg-[#172033] flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-[#1e293b] hover:border-amber-200 dark:hover:border-amber-900/50 transition-all cursor-pointer block group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-[#f8fafc] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {srv.service_ticket_no}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                        srv.status === "completed" || srv.status === "delivered"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : srv.status === "repairing" || srv.status === "checking"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {t(`services.status${srv.status.charAt(0).toUpperCase() + srv.status.slice(1)}`, srv.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-[#94a3b8] mt-0.5">
                    {srv.laptop_brand} {srv.laptop_model} • {srv.customer_name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#64748b] truncate max-w-xs">
                    {srv.problem_description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc]">
                    {formatMMK(srv.service_cost)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#64748b]">
                    {formatDateDDMMYYYY(srv.received_date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

