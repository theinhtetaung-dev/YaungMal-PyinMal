"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatMMK, formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "@/shared/utils/formatters";
import { showAlert } from "@/shared/lib/alerts";
import { LaptopService, ServiceStatus, PaymentMethod, ServicePaymentStatus } from "@/shared/types";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Eye,
  Edit3,
  X,
  History,
  User,
  Phone,
  Laptop as LaptopIcon,
  DollarSign,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<LaptopService[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
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

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewService, setViewService] = useState<LaptopService | null>(null);
  const [statusUpdateService, setStatusUpdateService] = useState<LaptopService | null>(null);

  // Status Update state
  const [newStatus, setNewStatus] = useState<ServiceStatus>("checking");
  const [statusNote, setStatusNote] = useState("");

  // New Service Form state (Direct customer recording)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    laptop_brand: "",
    laptop_model: "",
    serial_number: "",
    problem_description: "",
    diagnosis: "",
    repair_details: "",
    service_cost: 0,
    paid_amount: 0,
    payment_method: "cash" as PaymentMethod,
    notes: "",
  });

  const loadServices = () => {
    setServices(dataStore.getServices());
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = services.filter((srv) => {
    const q = appliedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      srv.service_ticket_no.toLowerCase().includes(q) ||
      srv.customer_name.toLowerCase().includes(q) ||
      srv.customer_phone.includes(q) ||
      srv.laptop_model.toLowerCase().includes(q) ||
      srv.laptop_brand.toLowerCase().includes(q) ||
      (srv.serial_number && srv.serial_number.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === "all" || srv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      showAlert.error(t("alerts.errorTitle"), "Customer name and phone number are required.");
      return;
    }

    if (!formData.laptop_brand.trim() || !formData.laptop_model.trim()) {
      showAlert.error(t("alerts.errorTitle"), "Laptop brand and model are required.");
      return;
    }

    if (!formData.problem_description.trim()) {
      showAlert.error(t("alerts.errorTitle"), "Reported problem description is required.");
      return;
    }

    const cost = Number(formData.service_cost) || 0;
    const paid = Number(formData.paid_amount) || 0;
    let paymentStatus: ServicePaymentStatus = "unpaid";
    if (paid >= cost && cost > 0) {
      paymentStatus = "paid";
    } else if (paid > 0) {
      paymentStatus = "partial";
    }

    dataStore.createService({
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_email: formData.customer_email.trim() || null,
      customer_address: formData.customer_address.trim() || null,
      laptop_brand: formData.laptop_brand.trim(),
      laptop_model: formData.laptop_model.trim(),
      serial_number: formData.serial_number.trim() || null,
      received_date: new Date().toISOString(),
      problem_description: formData.problem_description.trim(),
      diagnosis: formData.diagnosis.trim() || null,
      repair_details: formData.repair_details.trim() || null,
      status: "received",
      service_cost: cost,
      paid_amount: paid,
      payment_method: paid > 0 ? formData.payment_method : null,
      payment_status: paymentStatus,
      completed_date: null,
      delivered_date: null,
      notes: formData.notes.trim() || null,
    });

    loadServices();
    setIsNewModalOpen(false);
    showAlert.success(t("alerts.successTitle"), t("alerts.savedSuccess"));

    // Reset Form
    setFormData({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      customer_address: "",
      laptop_brand: "",
      laptop_model: "",
      serial_number: "",
      problem_description: "",
      diagnosis: "",
      repair_details: "",
      service_cost: 0,
      paid_amount: 0,
      payment_method: "cash",
      notes: "",
    });
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdateService) return;

    dataStore.updateServiceStatus(statusUpdateService.id, newStatus, statusNote.trim() || undefined);
    loadServices();
    setStatusUpdateService(null);
    setStatusNote("");
    showAlert.success(t("alerts.successTitle"), "Service status updated successfully.");
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "received":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60";
      case "checking":
        return "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20";
      case "waiting_for_parts":
        return "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
      case "repairing":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "completed":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "delivered":
        return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
      case "cancelled":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60";
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Wrench className="w-4 h-4" />
          </div>
          {t("services.title")}
        </h1>
        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("services.newService")}
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <form onSubmit={handleSearch} className="sm:col-span-9 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by ticket, customer name, phone, model, or serial..."
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
          <option value="received">{t("services.statusReceived")}</option>
          <option value="checking">{t("services.statusChecking")}</option>
          <option value="waiting_for_parts">{t("services.statusWaitingForParts")}</option>
          <option value="repairing">{t("services.statusRepairing")}</option>
          <option value="completed">{t("services.statusCompleted")}</option>
          <option value="delivered">{t("services.statusDelivered")}</option>
          <option value="cancelled">{t("services.statusCancelled")}</option>
        </select>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("services.ticketNo")}</th>
                <th className="px-4 py-3">{t("services.customerName")}</th>
                <th className="px-4 py-3">Laptop</th>
                <th className="px-4 py-3">{t("services.receivedDate")}</th>
                <th className="px-4 py-3">{t("services.status")}</th>
                <th className="px-4 py-3 text-right">{t("services.serviceCost")}</th>
                <th className="px-4 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginatedServices.map((srv) => (
                  <tr
                    key={srv.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {srv.service_ticket_no}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {srv.customer_name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{srv.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {srv.laptop_brand} {srv.laptop_model}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {srv.serial_number || "No S/N"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {formatDateDDMMYYYY(srv.received_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${getStatusBadge(
                          srv.status
                        )}`}
                      >
                        {t(
                          `services.status${
                            srv.status.charAt(0).toUpperCase() + srv.status.slice(1)
                          }`,
                          srv.status
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      <div>
                        {formatMMK(srv.service_cost)}
                        <span
                          className={`block text-[10px] font-normal ${
                            srv.payment_status === "paid"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : srv.payment_status === "partial"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {t(`common.${srv.payment_status}`)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewService(srv)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t("common.view")}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusUpdateService(srv);
                            setNewStatus(srv.status);
                          }}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t("services.updateStatus")}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            totalItems={filteredServices.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Service Details & History Modal */}
      {viewService && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400">
                  {viewService.service_ticket_no}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                  {viewService.laptop_brand} {viewService.laptop_model}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewService(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Laptop Info Card */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs">
              <div>
                <p className="text-slate-500">{t("services.customerName")}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{viewService.customer_name}</p>
                <p className="text-slate-500 mt-2">{t("services.customerPhone")}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{viewService.customer_phone}</p>
              </div>
              <div>
                <p className="text-slate-500">{t("services.serialNumber")}</p>
                <p className="font-mono text-slate-900 dark:text-white">{viewService.serial_number || "N/A"}</p>
                <p className="text-slate-500 mt-2">{t("services.receivedDate")}</p>
                <p className="font-medium text-slate-900 dark:text-white">{formatDateDDMMYYYY(viewService.received_date)}</p>
              </div>
            </div>

            {/* Problem & Diagnosis */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-lg border border-rose-200 dark:border-rose-500/20">
                <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                  {t("services.problem")}:
                </span>
                <p className="text-slate-700 dark:text-slate-200">{viewService.problem_description}</p>
              </div>

              {viewService.diagnosis && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <span className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                    {t("services.diagnosis")}:
                  </span>
                  <p className="text-slate-700 dark:text-slate-200">{viewService.diagnosis}</p>
                </div>
              )}

              {viewService.repair_details && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <span className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                    {t("services.repairDetails")}:
                  </span>
                  <p className="text-slate-700 dark:text-slate-200">{viewService.repair_details}</p>
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                {t("services.serviceHistory")}
              </h4>
              <div className="space-y-1.5 text-xs">
                {viewService.history?.map((h) => (
                  <div
                    key={h.id}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold capitalize text-slate-900 dark:text-white">
                        {h.status.replace("_", " ")}
                      </span>
                      {h.notes && <span className="text-slate-500 dark:text-slate-400 ml-2">— {h.notes}</span>}
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      {formatDateTimeDDMMYYYY(h.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewService(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusUpdateService && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateStatusSubmit}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("services.updateStatus")}: <span className="text-blue-600 dark:text-blue-400 font-mono">{statusUpdateService.service_ticket_no}</span>
              </h3>
              <button
                type="button"
                onClick={() => setStatusUpdateService(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("services.status")}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ServiceStatus)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="received">{t("services.statusReceived")}</option>
                  <option value="checking">{t("services.statusChecking")}</option>
                  <option value="waiting_for_parts">{t("services.statusWaitingForParts")}</option>
                  <option value="repairing">{t("services.statusRepairing")}</option>
                  <option value="completed">{t("services.statusCompleted")}</option>
                  <option value="delivered">{t("services.statusDelivered")}</option>
                  <option value="cancelled">{t("services.statusCancelled")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("services.notes")}
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Enter status change note..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusUpdateService(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {t("common.update")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Service Modal (Direct Customer Information) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateService}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("services.newService")}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. {t("pos.customerInfo")}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.customerName")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.customerPhone")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Laptop Details */}
            <div className="space-y-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Laptop Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.laptopBrand")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell, HP, Lenovo"
                    value={formData.laptop_brand}
                    onChange={(e) => setFormData({ ...formData, laptop_brand: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.laptopModel")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inspiron 15"
                    value={formData.laptop_model}
                    onChange={(e) => setFormData({ ...formData, laptop_model: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.serialNumber")}
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Problem & Diagnosis */}
            <div className="space-y-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Problem & Diagnosis
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("services.problem")} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.problem_description}
                  onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                  placeholder="Describe issues reported by the customer..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  {t("services.diagnosis")}
                </label>
                <textarea
                  rows={2}
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Initial technician assessment..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Cost & Payment */}
            <div className="space-y-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Estimated Cost & Payment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.serviceCost")} (MMK)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.service_cost}
                    onChange={(e) => setFormData({ ...formData, service_cost: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.paidAmount")} (MMK)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paid_amount}
                    onChange={(e) => setFormData({ ...formData, paid_amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    {t("services.paymentMethod")}
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="cash">{t("pos.cash")}</option>
                    <option value="mobile_payment">KPay / Wave</option>
                    <option value="bank_transfer">{t("pos.bankTransfer")}</option>
                    <option value="card_payment">{t("pos.cardPayment")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
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
