export type UserRole = "admin" | "staff";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export type LaptopStatus = "in_stock" | "sold" | "reserved" | "service" | "damaged";

export interface Laptop {
  id: string;
  brand_id?: string | null;
  category_id?: string | null;
  brand?: Brand | null;
  category?: Category | null;
  model: string;
  product_code?: string | null;
  serial_number: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  warranty_period_months: number;
  status: LaptopStatus;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  specifications?: LaptopSpecification | null;
}

export interface LaptopSpecification {
  id?: string;
  laptop_id: string;
  cpu?: string | null;
  cpu_generation?: string | null;
  ram?: string | null;
  ram_type?: string | null;
  storage?: string | null;
  storage_type?: string | null;
  gpu?: string | null;
  display_size?: string | null;
  display_resolution?: string | null;
  display_type?: string | null;
  os?: string | null;
  battery?: string | null;
  battery_capacity?: string | null;
  color?: string | null;
  weight?: string | null;
  keyboard?: string | null;
  backlit_keyboard?: boolean;
  touchscreen?: boolean;
  fingerprint?: boolean;
  webcam?: boolean;
  wifi?: string | null;
  bluetooth?: string | null;
  usb_ports?: string | null;
  hdmi?: boolean;
  other_specifications?: string | null;
}

export type PaymentMethod = "cash" | "bank_transfer" | "mobile_payment" | "card_payment";
export type PaymentStatus = "paid" | "pending" | "partial" | "refunded";

export interface Sale {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address?: string | null;
  customer_notes?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  sale_date: string;
  staff_id?: string | null;
  notes?: string | null;
  created_at?: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  laptop_id?: string | null;
  laptop_brand: string;
  laptop_model: string;
  serial_number?: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  warranty_period_months: number;
  created_at?: string;
}

export type WarrantyStatus = "active" | "expired" | "void";

export interface Warranty {
  id: string;
  sale_id?: string | null;
  laptop_id?: string | null;
  serial_number: string;
  laptop_model: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  warranty_period_months: number;
  status: WarrantyStatus;
  terms?: string | null;
  created_at?: string;
}

export type ServiceStatus =
  | "received"
  | "checking"
  | "waiting_for_parts"
  | "repairing"
  | "completed"
  | "delivered"
  | "cancelled";

export type ServicePaymentStatus = "unpaid" | "partial" | "paid";

export interface LaptopService {
  id: string;
  service_ticket_no: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address?: string | null;
  laptop_brand: string;
  laptop_model: string;
  serial_number?: string | null;
  received_date: string;
  problem_description: string;
  diagnosis?: string | null;
  repair_details?: string | null;
  service_cost: number;
  paid_amount: number;
  payment_method?: PaymentMethod | null;
  payment_status: ServicePaymentStatus;
  completed_date?: string | null;
  delivered_date?: string | null;
  status: ServiceStatus;
  notes?: string | null;
  assigned_staff_id?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  history?: ServiceHistoryItem[];
}

export interface ServiceHistoryItem {
  id: string;
  service_id: string;
  status: ServiceStatus;
  notes?: string | null;
  changed_by?: string | null;
  created_at: string;
}

export type StockMovementType = "in" | "out" | "adjustment" | "sale" | "service" | "return";

export interface StockMovement {
  id: string;
  laptop_id: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  laptop?: Laptop;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  shop_email: string;
  invoice_header: string;
  invoice_footer: string;
  currency: string;
  date_format: string;
  low_stock_threshold: number;
  updated_at?: string;
}
