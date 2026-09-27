"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { dataStore } from "@/shared/lib/dataService";
import { formatMMK, formatDateDDMMYYYY } from "@/shared/utils/formatters";
import { showAlert } from "@/shared/lib/alerts";
import { Laptop, Sale, SaleItem, PaymentMethod } from "@/shared/types";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";

interface CartItem {
  laptop: Laptop;
  quantity: number;
  discount: number;
}

export default function POSPage() {
  const { t } = useTranslation();
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
  };

  // Customer Information (Embedded directly - NO separate customer CRUD)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [orderDiscount, setOrderDiscount] = useState<number>(0);

  // Success Invoice Modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const loadLaptops = () => {
    setLaptops(dataStore.getLaptops().filter((l) => l.status === "in_stock" && l.stock_quantity > 0));
  };

  useEffect(() => {
    loadLaptops();
  }, []);

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

  const addToCart = (lap: Laptop) => {
    const existingIndex = cart.findIndex((item) => item.laptop.id === lap.id);
    if (existingIndex >= 0) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > lap.stock_quantity) {
        showAlert.warning(t("alerts.warningTitle"), t("pos.insufficientStock"));
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { laptop: lap, quantity: 1, discount: 0 }]);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const item = cart[index];
    if (newQty > item.laptop.stock_quantity) {
      showAlert.warning(t("alerts.warningTitle"), t("pos.insufficientStock"));
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.laptop.selling_price * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - Number(orderDiscount || 0));

  const handleCheckout = () => {
    if (cart.length === 0) {
      showAlert.warning(t("alerts.warningTitle"), t("pos.emptyCart"));
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      showAlert.error(t("alerts.errorTitle"), t("pos.customerRequired"));
      return;
    }

    const saleItems: SaleItem[] = cart.map((item) => ({
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sale_id: "",
      laptop_id: item.laptop.id,
      laptop_brand: item.laptop.brand?.name || "Laptop",
      laptop_model: item.laptop.model,
      serial_number: item.laptop.serial_number,
      quantity: item.quantity,
      unit_price: item.laptop.selling_price,
      discount: item.discount,
      total_price: item.laptop.selling_price * item.quantity - item.discount,
      warranty_period_months: item.laptop.warranty_period_months || 12,
    }));

    const newSale = dataStore.createSale({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || null,
      customer_address: customerAddress.trim() || null,
      customer_notes: customerNotes.trim() || null,
      subtotal,
      discount: Number(orderDiscount || 0),
      total,
      payment_method: paymentMethod,
      payment_status: "paid",
      notes: "POS Counter Sale",
      items: saleItems,
    });

    // Reset Form
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerNotes("");
    setOrderDiscount(0);
    loadLaptops();

    // Show Printable Invoice
    setCompletedSale(newSale);
    showAlert.success(t("alerts.successTitle"), t("pos.saleSuccess"));
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
          {t("pos.title")}
        </h1>
      </div>

      {/* Main Grid: Left Catalog, Right Cart & Customer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Laptop Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Search Bar Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("pos.searchLaptopPlaceholder")}
                className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors shadow-xs"
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

          {/* Laptops Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
            {filteredLaptops.length === 0 ? (
              <div className="col-span-2 p-10 text-center bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                {t("common.noData")}
              </div>
            ) : (
              filteredLaptops.map((lap) => (
                <div
                  key={lap.id}
                  onClick={() => addToCart(lap)}
                  className="bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700/50">
                        {lap.brand?.name}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        {lap.stock_quantity} in stock
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {lap.model}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {lap.serial_number}
                    </p>
                    {lap.specifications && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {lap.specifications.cpu} • {lap.specifications.ram} • {lap.specifications.storage}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatMMK(lap.selling_price)}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      title="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Cart, Customer & Checkout (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-xs">
          {/* Cart Section */}
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t("pos.cart")} ({cart.reduce((s, c) => s + c.quantity, 0)})
              </h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 dark:text-rose-400 hover:underline transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                {t("pos.emptyCart")}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-48 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={item.laptop.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {item.laptop.brand?.name} {item.laptop.model}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        {formatMMK(item.laptop.selling_price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("pos.customerInfo")}
            </h3>

            <div className="space-y-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={`${t("pos.customerName")} *`}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={`${t("pos.customerPhone")} (09...) *`}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={t("pos.customerAddress")}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t("pos.paymentMethod")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === "cash"
                    ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                {t("pos.cash")}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("mobile_payment")}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === "mobile_payment"
                    ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                KPay / Wave
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === "bank_transfer"
                    ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                {t("pos.bankTransfer")}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card_payment")}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === "card_payment"
                    ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                {t("pos.cardPayment")}
              </button>
            </div>
          </div>

          {/* Order Summary & Discount */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{t("common.subtotal")}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatMMK(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">{t("pos.addDiscount")}</span>
              <input
                type="number"
                min="0"
                value={orderDiscount || ""}
                onChange={(e) => setOrderDiscount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-28 text-right px-2 py-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>{t("common.total")}</span>
              <span className="text-blue-600 dark:text-blue-400">
                {formatMMK(total)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            {t("pos.completeSale")}
          </button>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 max-w-2xl w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header / Actions */}
            <div className="flex items-center justify-between no-print">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <CheckCircle className="w-5 h-5" />
                {t("pos.saleSuccess")}
              </div>
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
                  onClick={() => setCompletedSale(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Body */}
            <div className="border border-slate-700 rounded-lg p-6 bg-white text-slate-900 space-y-4 font-sans text-xs">
              {/* Shop Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold">YaungMal-PyinMal Laptop Shop</h2>
                <p className="text-slate-500 text-[11px]">
                  Laptop Sales, Accessories & Quality Repair Services
                </p>
                <p className="text-slate-500 text-[11px]">
                  Yangon, Myanmar • Ph: 09-123456789
                </p>
              </div>

              {/* Invoice Meta */}
              <div className="flex justify-between items-start">
                <div>
                  <p>
                    <span className="font-semibold">{t("invoices.billTo")}:</span> {completedSale.customer_name}
                  </p>
                  <p>
                    <span className="font-semibold">{t("warranties.phone")}:</span> {completedSale.customer_phone}
                  </p>
                  {completedSale.customer_address && (
                    <p>
                      <span className="font-semibold">Address:</span> {completedSale.customer_address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{completedSale.invoice_number}</p>
                  <p className="text-slate-500">{formatDateDDMMYYYY(completedSale.sale_date)}</p>
                  <p className="uppercase font-semibold text-slate-600">
                    {completedSale.payment_method.replace("_", " ")}
                  </p>
                </div>
              </div>

              {/* Items Table */}
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
                  {completedSale.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 font-medium">
                        {item.laptop_brand} {item.laptop_model}
                        <span className="block text-[10px] text-slate-400">
                          {t("invoices.warrantyPeriod")}: {item.warranty_period_months} Mo
                        </span>
                      </td>
                      <td className="py-2 font-mono text-[11px] text-slate-600">
                        {item.serial_number || "N/A"}
                      </td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">{formatMMK(item.unit_price)}</td>
                      <td className="py-2 text-right font-semibold">{formatMMK(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-1 text-right">
                <p>
                  <span className="text-slate-500">{t("common.subtotal")}:</span>{" "}
                  <span className="font-semibold">{formatMMK(completedSale.subtotal)}</span>
                </p>
                {completedSale.discount > 0 && (
                  <p>
                    <span className="text-slate-500">{t("common.discount")}:</span>{" "}
                    <span className="font-semibold text-red-600">-{formatMMK(completedSale.discount)}</span>
                  </p>
                )}
                <p className="text-sm font-bold pt-1 border-t border-slate-200">
                  <span>{t("common.total")}:</span>{" "}
                  <span>{formatMMK(completedSale.total)}</span>
                </p>
              </div>

              {/* Footer Notice */}
              <div className="text-center pt-3 border-t border-slate-200 text-slate-500 text-[10px] space-y-0.5">
                <p>ဝယ်ယူအားပေးမှုကို အထူးကျေးဇူးတင်ရှိပါသည်။</p>
                <p>Please keep this invoice receipt for official warranty verification.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
