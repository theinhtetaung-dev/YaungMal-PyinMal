"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatMMK, formatDateDDMMYYYY } from "@/shared/utils/formatters";
import { showAlert } from "@/shared/lib/alerts";
import { Laptop, Brand, Category, Profile } from "@/shared/types";
import { initialProfiles } from "@/shared/lib/mockData";
import { Pagination } from "@/shared/components/Pagination";
import {
  Laptop as LaptopIcon,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Cpu,
  HardDrive,
  Monitor,
  CheckCircle,
  AlertCircle,
  Zap,
  Scale,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function LaptopsPage() {
  const { t } = useTranslation();
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]);

  // Search and Filter states
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
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
  const [viewLaptop, setViewLaptop] = useState<Laptop | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    model: "",
    brand_id: "",
    category_id: "",
    serial_number: "",
    product_code: "",
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 1,
    warranty_period_months: 12,
    status: "in_stock",
    // Specifications
    cpu: "",
    cpu_generation: "",
    ram: "",
    ram_type: "",
    storage: "",
    storage_type: "",
    gpu: "",
    display_size: "",
    display_resolution: "",
    os: "Windows 11",
    battery: "",
    color: "",
    weight: "",
    backlit_keyboard: false,
    touchscreen: false,
    fingerprint: false,
  });

  const loadData = () => {
    setLaptops(dataStore.getLaptops());
    setBrands(dataStore.getBrands());
    setCategories(dataStore.getCategories());
    setCurrentUser(dataStore.getCurrentUser());
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = currentUser.role === "admin";

  const filteredLaptops = laptops.filter((lap) => {
    const q = appliedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      lap.model.toLowerCase().includes(q) ||
      (lap.brand?.name && lap.brand.name.toLowerCase().includes(q)) ||
      (lap.serial_number && lap.serial_number.toLowerCase().includes(q)) ||
      (lap.product_code && lap.product_code.toLowerCase().includes(q));

    const matchesBrand = selectedBrand === "all" || lap.brand_id === selectedBrand;
    const matchesCategory = selectedCategory === "all" || lap.category_id === selectedCategory;
    const matchesStatus = selectedStatus === "all" || lap.status === selectedStatus;

    return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLaptops.length / ITEMS_PER_PAGE);
  const paginatedLaptops = filteredLaptops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = () => {
    setEditingLaptop(null);
    setFormData({
      model: "",
      brand_id: brands[0]?.id || "",
      category_id: categories[0]?.id || "",
      serial_number: `SN-${Date.now().toString().slice(-6)}`,
      product_code: `PRD-${Date.now().toString().slice(-4)}`,
      cost_price: 0,
      selling_price: 0,
      stock_quantity: 1,
      warranty_period_months: 12,
      status: "in_stock",
      cpu: "",
      cpu_generation: "",
      ram: "16GB",
      ram_type: "DDR5",
      storage: "512GB SSD",
      storage_type: "NVMe M.2",
      gpu: "Integrated Graphics",
      display_size: "15.6 inch",
      display_resolution: "1920x1080 FHD",
      os: "Windows 11 Home",
      battery: "3-Cell 54Wh",
      color: "Silver",
      weight: "1.7 kg",
      backlit_keyboard: true,
      touchscreen: false,
      fingerprint: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (lap: Laptop) => {
    setEditingLaptop(lap);
    setFormData({
      model: lap.model,
      brand_id: lap.brand_id || "",
      category_id: lap.category_id || "",
      serial_number: lap.serial_number,
      product_code: lap.product_code || "",
      cost_price: lap.cost_price,
      selling_price: lap.selling_price,
      stock_quantity: lap.stock_quantity,
      warranty_period_months: lap.warranty_period_months,
      status: lap.status,
      cpu: lap.specifications?.cpu || "",
      cpu_generation: lap.specifications?.cpu_generation || "",
      ram: lap.specifications?.ram || "",
      ram_type: lap.specifications?.ram_type || "",
      storage: lap.specifications?.storage || "",
      storage_type: lap.specifications?.storage_type || "",
      gpu: lap.specifications?.gpu || "",
      display_size: lap.specifications?.display_size || "",
      display_resolution: lap.specifications?.display_resolution || "",
      os: lap.specifications?.os || "",
      battery: lap.specifications?.battery || "",
      color: lap.specifications?.color || "",
      weight: lap.specifications?.weight || "",
      backlit_keyboard: lap.specifications?.backlit_keyboard || false,
      touchscreen: lap.specifications?.touchscreen || false,
      fingerprint: lap.specifications?.fingerprint || false,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (lap: Laptop) => {
    const confirmed = await showAlert.confirmDelete({
      title: t("alerts.confirmDeleteTitle"),
      text: lap.model,
      confirmButtonText: t("alerts.deleteButton"),
      cancelButtonText: t("alerts.cancelButton"),
    });

    if (confirmed) {
      dataStore.deleteLaptop(lap.id);
      loadData();
      showAlert.success(t("alerts.successTitle"), t("alerts.deletedSuccess"));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.model.trim()) {
      showAlert.error(t("alerts.errorTitle"), "Laptop model name is required");
      return;
    }

    const payload: Partial<Laptop> = {
      id: editingLaptop ? editingLaptop.id : undefined,
      model: formData.model.trim(),
      brand_id: formData.brand_id,
      category_id: formData.category_id,
      serial_number: formData.serial_number,
      product_code: formData.product_code,
      cost_price: Number(formData.cost_price),
      selling_price: Number(formData.selling_price),
      stock_quantity: Number(formData.stock_quantity),
      warranty_period_months: Number(formData.warranty_period_months),
      status: formData.status as any,
      specifications: {
        laptop_id: editingLaptop ? editingLaptop.id : "",
        cpu: formData.cpu,
        cpu_generation: formData.cpu_generation,
        ram: formData.ram,
        ram_type: formData.ram_type,
        storage: formData.storage,
        storage_type: formData.storage_type,
        gpu: formData.gpu,
        display_size: formData.display_size,
        display_resolution: formData.display_resolution,
        os: formData.os,
        battery: formData.battery,
        color: formData.color,
        weight: formData.weight,
        backlit_keyboard: formData.backlit_keyboard,
        touchscreen: formData.touchscreen,
        fingerprint: formData.fingerprint,
      },
    };

    dataStore.saveLaptop(payload);
    loadData();
    setIsFormOpen(false);
    showAlert.success(t("alerts.successTitle"), t("alerts.savedSuccess"));
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#f8fafc]">
            {t("laptops.title")}
          </h1>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Laptop</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200 dark:border-[#2a3952] shadow-xs flex flex-wrap items-center gap-2.5">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-[#64748b]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("pos.searchLaptopPlaceholder")}
              className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#2a3952] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-[#f8fafc] placeholder-slate-400 dark:placeholder-[#64748b]"
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
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          {appliedSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium shrink-0 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#2a3952] rounded-lg text-xs text-slate-700 dark:text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">{t("common.all")} Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#2a3952] rounded-lg text-xs text-slate-700 dark:text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">{t("common.all")} Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#2a3952] rounded-lg text-xs text-slate-700 dark:text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">{t("common.all")} Statuses</option>
          <option value="in_stock">{t("laptops.inStock")}</option>
          <option value="sold">{t("laptops.sold")}</option>
          <option value="reserved">{t("laptops.reserved")}</option>
          <option value="service">{t("laptops.service")}</option>
          <option value="damaged">{t("laptops.damaged")}</option>
        </select>
      </div>

      {/* Laptops Table */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#2a3952] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#2a3952] text-[11px] uppercase font-bold text-slate-500 dark:text-[#94a3b8]">
              <tr>
                <th className="px-4 py-3">{t("laptops.model")}</th>
                <th className="px-4 py-3">{t("laptops.brand")}</th>
                <th className="px-4 py-3 text-right">{t("laptops.sellingPrice")}</th>
                <th className="px-4 py-3 text-center">{t("laptops.stockQuantity")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
                <th className="px-4 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]">
              {filteredLaptops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-[#64748b]">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginatedLaptops.map((lap) => (
                  <tr
                    key={lap.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#172033]/60 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-[#f8fafc]">
                      <div>
                        <span>{lap.model}</span>
                        {lap.category?.name && (
                          <span className="block text-[11px] text-slate-500 dark:text-[#94a3b8]">
                            {lap.category.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-[#94a3b8]">
                      {lap.brand?.name || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-[#f8fafc]">
                      {formatMMK(lap.selling_price)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          lap.stock_quantity === 0
                            ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400"
                            : lap.stock_quantity <= 2
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {lap.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          lap.status === "in_stock"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                            : lap.status === "sold"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            : lap.status === "damaged"
                            ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {t(`laptops.${lap.status.replace("_", "")}`, lap.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewLaptop(lap)}
                          className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-[#172033]"
                          title={t("common.view")}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(lap)}
                              className="p-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-slate-100 dark:hover:bg-[#172033]"
                              title={t("common.edit")}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(lap)}
                              className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-[#172033]"
                              title={t("common.delete")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-3.5 bg-slate-50/50 dark:bg-[#172033]/40 border-t border-slate-200/80 dark:border-[#2a3952]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLaptops.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Laptop Specifications Modal */}
      {viewLaptop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#2a3952] max-w-2xl w-full p-6 space-y-4.5 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
                    {viewLaptop.brand?.name || "Laptop"}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-semibold capitalize ${
                      viewLaptop.status === "in_stock"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50"
                        : viewLaptop.status === "sold"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50"
                    }`}
                  >
                    {viewLaptop.status.replace("_", " ")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#f8fafc]">
                  {viewLaptop.brand?.name} {viewLaptop.model}
                </h3>
                {viewLaptop.product_code && (
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#94a3b8] pt-0.5">
                    <span className="font-mono bg-slate-100 dark:bg-[#172033] px-2 py-0.5 rounded border border-slate-200 dark:border-[#2a3952]">
                      Code: {viewLaptop.product_code}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewLaptop(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#172033] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-[#2a3952]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {t("laptops.sellingPrice")}
                </span>
                <p className="text-base sm:text-lg font-bold text-blue-950 dark:text-blue-200 mt-0.5">
                  {formatMMK(viewLaptop.selling_price)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t("laptops.stockQuantity")}
                </span>
                <p className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-200 mt-0.5">
                  {viewLaptop.stock_quantity} <span className="text-xs font-normal">Units</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {t("laptops.warrantyMonths")}
                </span>
                <p className="text-base sm:text-lg font-bold text-purple-950 dark:text-purple-200 mt-0.5">
                  {viewLaptop.warranty_period_months} <span className="text-xs font-normal">Months</span>
                </p>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#f8fafc]">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span>{t("laptops.specifications")}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* CPU */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.cpu")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.cpu || "Standard Processor"}
                    </p>
                  </div>
                </div>

                {/* RAM */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.ram")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.ram || "-"} {viewLaptop.specifications?.ram_type ? `(${viewLaptop.specifications.ram_type})` : ""}
                    </p>
                  </div>
                </div>

                {/* Storage */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.storage")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.storage || "-"} {viewLaptop.specifications?.storage_type ? `(${viewLaptop.specifications.storage_type})` : ""}
                    </p>
                  </div>
                </div>

                {/* GPU */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.gpu")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.gpu || "Integrated Graphics"}
                    </p>
                  </div>
                </div>

                {/* Display */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100/80 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.displaySize")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.display_size || "-"} {viewLaptop.specifications?.display_resolution ? `(${viewLaptop.specifications.display_resolution})` : ""}
                    </p>
                  </div>
                </div>

                {/* OS */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-100/80 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                    <LaptopIcon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.os")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.os || "Windows 11"}
                    </p>
                  </div>
                </div>

                {/* Battery */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100/80 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.battery")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.battery || "Integrated Battery"}
                    </p>
                  </div>
                </div>

                {/* Weight */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#172033] border border-slate-200/80 dark:border-[#2a3952] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#94a3b8]">
                      {t("laptops.weight")}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc] mt-0.5">
                      {viewLaptop.specifications?.weight || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewLaptop(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1f2c44] text-slate-800 dark:text-[#f8fafc] rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-[#2a3952]"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Laptop Modal (Admin Only) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingLaptop ? t("laptops.editLaptop") : t("laptops.addNew")}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("laptops.model")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("laptops.brand")}
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("laptops.category")}
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("laptops.costPrice")} (MMK)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("laptops.sellingPrice")} (MMK) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("laptops.stockQuantity")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("laptops.warrantyMonths")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.warranty_period_months}
                  onChange={(e) => setFormData({ ...formData, warranty_period_months: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Specifications Section */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                {t("laptops.specifications")}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("laptops.cpu")}</label>
                  <input
                    type="text"
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("laptops.ram")}</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("laptops.storage")}</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("laptops.gpu")}</label>
                  <input
                    type="text"
                    value={formData.gpu}
                    onChange={(e) => setFormData({ ...formData, gpu: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("laptops.displaySize")}</label>
                  <input
                    type="text"
                    value={formData.display_size}
                    onChange={(e) => setFormData({ ...formData, display_size: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("laptops.os")}</label>
                  <input
                    type="text"
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
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
