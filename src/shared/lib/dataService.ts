import {
  Laptop,
  Brand,
  Category,
  Sale,
  SaleItem,
  Warranty,
  LaptopService,
  ServiceStatus,
  ShopSettings,
  Profile,
  StockMovement,
  UserRole,
} from "../types";
import {
  initialBrands,
  initialCategories,
  initialLaptops,
  initialSales,
  initialWarranties,
  initialServices,
  initialShopSettings,
  initialProfiles,
} from "./mockData";

class DataStore {
  private brands: Brand[] = [];
  private categories: Category[] = [];
  private laptops: Laptop[] = [];
  private sales: Sale[] = [];
  private warranties: Warranty[] = [];
  private services: LaptopService[] = [];
  private settings: ShopSettings = initialShopSettings;
  private profiles: Profile[] = [];
  private currentUser: Profile = initialProfiles[0]; // Admin by default
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === "undefined") {
      this.brands = [...initialBrands];
      this.categories = [...initialCategories];
      this.laptops = [...initialLaptops];
      this.sales = [...initialSales];
      this.warranties = [...initialWarranties];
      this.services = [...initialServices];
      this.settings = { ...initialShopSettings };
      this.profiles = [...initialProfiles];
      this.currentUser = { ...initialProfiles[0] };
      return;
    }

    try {
      const storedBrands = localStorage.getItem("ymp_brands");
      this.brands = storedBrands ? JSON.parse(storedBrands) : [...initialBrands];

      const storedCategories = localStorage.getItem("ymp_categories");
      this.categories = storedCategories ? JSON.parse(storedCategories) : [...initialCategories];

      const storedLaptops = localStorage.getItem("ymp_laptops");
      const parsedLaptops = storedLaptops ? JSON.parse(storedLaptops) : null;
      this.laptops = parsedLaptops && parsedLaptops.length >= 35 ? parsedLaptops : [...initialLaptops];

      const storedSales = localStorage.getItem("ymp_sales");
      const parsedSales = storedSales ? JSON.parse(storedSales) : null;
      this.sales = parsedSales && parsedSales.length >= 500 ? parsedSales : [...initialSales];

      const storedWarranties = localStorage.getItem("ymp_warranties");
      const parsedWarranties = storedWarranties ? JSON.parse(storedWarranties) : null;
      this.warranties = parsedWarranties && parsedWarranties.length >= 500 ? parsedWarranties : [...initialWarranties];

      const storedServices = localStorage.getItem("ymp_services");
      this.services = storedServices ? JSON.parse(storedServices) : [...initialServices];

      const storedSettings = localStorage.getItem("ymp_settings");
      this.settings = storedSettings ? JSON.parse(storedSettings) : { ...initialShopSettings };

      const storedProfiles = localStorage.getItem("ymp_profiles");
      this.profiles = storedProfiles ? JSON.parse(storedProfiles) : [...initialProfiles];

      const storedCurrent = localStorage.getItem("ymp_current_user");
      this.currentUser = storedCurrent ? JSON.parse(storedCurrent) : { ...initialProfiles[0] };

      this.persist();
      this.initialized = true;
    } catch {
      this.brands = [...initialBrands];
      this.categories = [...initialCategories];
      this.laptops = [...initialLaptops];
      this.sales = [...initialSales];
      this.warranties = [...initialWarranties];
      this.services = [...initialServices];
      this.settings = { ...initialShopSettings };
      this.profiles = [...initialProfiles];
      this.currentUser = { ...initialProfiles[0] };
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ymp_brands", JSON.stringify(this.brands));
      localStorage.setItem("ymp_categories", JSON.stringify(this.categories));
      localStorage.setItem("ymp_laptops", JSON.stringify(this.laptops));
      localStorage.setItem("ymp_sales", JSON.stringify(this.sales));
      localStorage.setItem("ymp_warranties", JSON.stringify(this.warranties));
      localStorage.setItem("ymp_services", JSON.stringify(this.services));
      localStorage.setItem("ymp_settings", JSON.stringify(this.settings));
      localStorage.setItem("ymp_profiles", JSON.stringify(this.profiles));
      localStorage.setItem("ymp_current_user", JSON.stringify(this.currentUser));
    } catch (e) {
      console.warn("Storage quota exceeded or unavailable", e);
    }
  }

  // --- Auth & User Role ---
  getCurrentUser(): Profile {
    return this.currentUser;
  }

  setCurrentRole(role: UserRole) {
    const user = this.profiles.find((p) => p.role === role) || {
      id: `user-${role}`,
      full_name: role === "admin" ? "Shop Administrator" : "Shop Staff Member",
      email: `${role}@yaungmal.com`,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.currentUser = user;
    this.persist();
  }

  getProfiles(): Profile[] {
    return this.profiles;
  }

  saveProfile(profileData: Partial<Profile>): Profile {
    if (profileData.id) {
      const idx = this.profiles.findIndex((p) => p.id === profileData.id);
      if (idx >= 0) {
        this.profiles[idx] = {
          ...this.profiles[idx],
          ...profileData,
          updated_at: new Date().toISOString(),
        };
        this.persist();
        return this.profiles[idx];
      }
    }
    const newProfile: Profile = {
      id: `user-${Date.now()}`,
      full_name: profileData.full_name || "New Staff",
      email: profileData.email || `staff${Date.now()}@yaungmal.com`,
      phone: profileData.phone || "",
      role: profileData.role || "staff",
      is_active: profileData.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    this.persist();
    return newProfile;
  }

  // --- Brands ---
  getBrands(): Brand[] {
    return this.brands;
  }

  saveBrand(brand: Partial<Brand>): Brand {
    if (brand.id) {
      const idx = this.brands.findIndex((b) => b.id === brand.id);
      if (idx >= 0) {
        this.brands[idx] = { ...this.brands[idx], ...brand };
        this.persist();
        return this.brands[idx];
      }
    }
    const newBrand: Brand = {
      id: `b-${Date.now()}`,
      name: brand.name!,
      description: brand.description || null,
      created_at: new Date().toISOString(),
    };
    this.brands.push(newBrand);
    this.persist();
    return newBrand;
  }

  deleteBrand(id: string) {
    this.brands = this.brands.filter((b) => b.id !== id);
    this.persist();
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.categories;
  }

  saveCategory(cat: Partial<Category>): Category {
    if (cat.id) {
      const idx = this.categories.findIndex((c) => c.id === cat.id);
      if (idx >= 0) {
        this.categories[idx] = { ...this.categories[idx], ...cat };
        this.persist();
        return this.categories[idx];
      }
    }
    const newCat: Category = {
      id: `c-${Date.now()}`,
      name: cat.name!,
      description: cat.description || null,
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCat);
    this.persist();
    return newCat;
  }

  deleteCategory(id: string) {
    this.categories = this.categories.filter((c) => c.id !== id);
    this.persist();
  }

  // --- Laptops ---
  getLaptops(): Laptop[] {
    return this.laptops.map((lap) => {
      const brand = this.brands.find((b) => b.id === lap.brand_id) || lap.brand;
      const category = this.categories.find((c) => c.id === lap.category_id) || lap.category;
      return { ...lap, brand, category };
    });
  }

  getLaptopById(id: string): Laptop | undefined {
    return this.getLaptops().find((l) => l.id === id);
  }

  saveLaptop(lap: Partial<Laptop>): Laptop {
    if (lap.id) {
      const idx = this.laptops.findIndex((l) => l.id === lap.id);
      if (idx >= 0) {
        this.laptops[idx] = {
          ...this.laptops[idx],
          ...lap,
          updated_at: new Date().toISOString(),
        };
        this.persist();
        return this.getLaptopById(lap.id)!;
      }
    }
    const newId = `lap-${Date.now()}`;
    const newLaptop: Laptop = {
      id: newId,
      model: lap.model!,
      brand_id: lap.brand_id || null,
      category_id: lap.category_id || null,
      product_code: lap.product_code || null,
      serial_number: lap.serial_number || `SN-${Date.now()}`,
      cost_price: Number(lap.cost_price) || 0,
      selling_price: Number(lap.selling_price) || 0,
      stock_quantity: Number(lap.stock_quantity) || 0,
      warranty_period_months: Number(lap.warranty_period_months) || 12,
      status: lap.status || "in_stock",
      image_url: lap.image_url || null,
      specifications: lap.specifications
        ? { ...lap.specifications, laptop_id: newId }
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.laptops.unshift(newLaptop);
    this.persist();
    return this.getLaptopById(newId)!;
  }

  deleteLaptop(id: string) {
    this.laptops = this.laptops.filter((l) => l.id !== id);
    this.persist();
  }

  adjustStock(laptopId: string, quantityChange: number, notes?: string) {
    const lap = this.laptops.find((l) => l.id === laptopId);
    if (!lap) return;
    lap.stock_quantity = Math.max(0, lap.stock_quantity + quantityChange);
    lap.updated_at = new Date().toISOString();
    this.persist();
  }

  // --- Sales & Invoices (Embedded customer info) ---
  getSales(): Sale[] {
    return this.sales;
  }

  getSaleById(id: string): Sale | undefined {
    return this.sales.find((s) => s.id === id);
  }

  createSale(
    saleData: Omit<Sale, "id" | "invoice_number" | "created_at" | "sale_date">
  ): Sale {
    const invoiceNum = `INV-${new Date().getFullYear()}-${String(
      this.sales.length + 1
    ).padStart(4, "0")}`;
    const saleId = `sale-${Date.now()}`;

    const newSale: Sale = {
      ...saleData,
      id: saleId,
      invoice_number: invoiceNum,
      sale_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      staff_id: this.currentUser.id,
    };

    // Deduct stock and automatically generate warranties
    if (newSale.items && newSale.items.length > 0) {
      newSale.items.forEach((item) => {
        if (item.laptop_id) {
          const lap = this.laptops.find((l) => l.id === item.laptop_id);
          if (lap) {
            lap.stock_quantity = Math.max(0, lap.stock_quantity - item.quantity);
            if (lap.stock_quantity === 0) {
              lap.status = "sold";
            }
          }
        }

        // Create Warranty record
        const months = item.warranty_period_months || 12;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        const warranty: Warranty = {
          id: `war-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sale_id: saleId,
          laptop_id: item.laptop_id || null,
          serial_number: item.serial_number || "N/A",
          laptop_model: item.laptop_model,
          customer_name: newSale.customer_name,
          customer_phone: newSale.customer_phone,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          warranty_period_months: months,
          status: "active",
          terms: `Official Warranty for ${months} months covering hardware defects.`,
          created_at: new Date().toISOString(),
        };
        this.warranties.unshift(warranty);
      });
    }

    this.sales.unshift(newSale);
    this.persist();
    return newSale;
  }

  // --- Warranties ---
  getWarranties(): Warranty[] {
    return this.warranties;
  }

  // --- Laptop Services (Embedded customer info) ---
  getServices(): LaptopService[] {
    return this.services;
  }

  getServiceById(id: string): LaptopService | undefined {
    return this.services.find((s) => s.id === id);
  }

  createService(
    serviceData: Omit<
      LaptopService,
      "id" | "service_ticket_no" | "created_at" | "updated_at" | "history"
    >
  ): LaptopService {
    const ticketNo = `SRV-${new Date().getFullYear()}-${String(
      this.services.length + 1
    ).padStart(4, "0")}`;
    const serviceId = `srv-${Date.now()}`;

    const newService: LaptopService = {
      ...serviceData,
      id: serviceId,
      service_ticket_no: ticketNo,
      status: "received",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: this.currentUser.id,
      history: [
        {
          id: `h-${Date.now()}`,
          service_id: serviceId,
          status: "received",
          notes: "Laptop received at service counter.",
          changed_by: this.currentUser.full_name,
          created_at: new Date().toISOString(),
        },
      ],
    };

    this.services.unshift(newService);
    this.persist();
    return newService;
  }

  updateServiceStatus(
    serviceId: string,
    status: ServiceStatus,
    notes?: string
  ): LaptopService | undefined {
    const srv = this.services.find((s) => s.id === serviceId);
    if (!srv) return;

    srv.status = status;
    srv.updated_at = new Date().toISOString();
    if (status === "completed") {
      srv.completed_date = new Date().toISOString();
    }
    if (status === "delivered") {
      srv.delivered_date = new Date().toISOString();
    }

    if (!srv.history) srv.history = [];
    srv.history.push({
      id: `h-${Date.now()}`,
      service_id: serviceId,
      status,
      notes: notes || `Status updated to ${status}`,
      changed_by: this.currentUser.full_name,
      created_at: new Date().toISOString(),
    });

    this.persist();
    return srv;
  }

  updateService(serviceId: string, data: Partial<LaptopService>): LaptopService | undefined {
    const idx = this.services.findIndex((s) => s.id === serviceId);
    if (idx === -1) return;
    this.services[idx] = {
      ...this.services[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.services[idx];
  }

  deleteService(id: string) {
    this.services = this.services.filter((s) => s.id !== id);
    this.persist();
  }

  // --- Shop Settings ---
  getSettings(): ShopSettings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<ShopSettings>): ShopSettings {
    this.settings = { ...this.settings, ...newSettings, updated_at: new Date().toISOString() };
    this.persist();
    return this.settings;
  }
}

export const dataStore = new DataStore();
