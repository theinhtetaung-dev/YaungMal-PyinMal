-- ==============================================================================
-- YaungMal-PyinMal (ရောင်းမယ်-ပြင်မယ်)
-- Laptop Shop POS & Service Management System
-- Supabase PostgreSQL Database Schema
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Users & Roles: admin, staff)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    email text not null,
    phone text,
    role text not null check (role in ('admin', 'staff')) default 'staff',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. BRANDS
create table if not exists public.brands (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    created_at timestamptz not null default now()
);

-- 3. CATEGORIES
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    created_at timestamptz not null default now()
);

-- 4. LAPTOPS
create table if not exists public.laptops (
    id uuid primary key default gen_random_uuid(),
    brand_id uuid references public.brands(id) on delete set null,
    category_id uuid references public.categories(id) on delete set null,
    model text not null,
    product_code text,
    serial_number text unique,
    cost_price numeric(15, 2) not null default 0 check (cost_price >= 0),
    selling_price numeric(15, 2) not null check (selling_price >= 0),
    stock_quantity int not null default 0 check (stock_quantity >= 0),
    warranty_period_months int not null default 12,
    status text not null check (status in ('in_stock', 'sold', 'reserved', 'service', 'damaged')) default 'in_stock',
    image_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. LAPTOP SPECIFICATIONS (1:1 with laptops)
create table if not exists public.laptop_specifications (
    id uuid primary key default gen_random_uuid(),
    laptop_id uuid not null unique references public.laptops(id) on delete cascade,
    cpu text,
    cpu_generation text,
    ram text,
    ram_type text,
    storage text,
    storage_type text,
    gpu text,
    display_size text,
    display_resolution text,
    display_type text,
    os text,
    battery text,
    battery_capacity text,
    color text,
    weight text,
    keyboard text,
    backlit_keyboard boolean default false,
    touchscreen boolean default false,
    fingerprint boolean default false,
    webcam boolean default true,
    wifi text,
    bluetooth text,
    usb_ports text,
    hdmi boolean default true,
    other_specifications text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 6. STOCK MOVEMENTS (Audit & Tracking)
create table if not exists public.stock_movements (
    id uuid primary key default gen_random_uuid(),
    laptop_id uuid not null references public.laptops(id) on delete cascade,
    type text not null check (type in ('in', 'out', 'adjustment', 'sale', 'service', 'return')),
    quantity int not null,
    previous_stock int not null,
    new_stock int not null,
    reference_id text,
    notes text,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now()
);

-- 7. SALES (Customer info embedded directly - No separate Customer CRUD)
create table if not exists public.sales (
    id uuid primary key default gen_random_uuid(),
    invoice_number text unique not null,
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    customer_address text,
    customer_notes text,
    subtotal numeric(15, 2) not null default 0,
    discount numeric(15, 2) not null default 0,
    total numeric(15, 2) not null default 0,
    payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'mobile_payment', 'card_payment')),
    payment_status text not null check (payment_status in ('paid', 'pending', 'partial', 'refunded')) default 'paid',
    sale_date timestamptz not null default now(),
    staff_id uuid references public.profiles(id),
    notes text,
    created_at timestamptz not null default now()
);

-- 8. SALE ITEMS
create table if not exists public.sale_items (
    id uuid primary key default gen_random_uuid(),
    sale_id uuid not null references public.sales(id) on delete cascade,
    laptop_id uuid references public.laptops(id) on delete set null,
    laptop_brand text not null,
    laptop_model text not null,
    serial_number text,
    quantity int not null default 1,
    unit_price numeric(15, 2) not null,
    discount numeric(15, 2) not null default 0,
    total_price numeric(15, 2) not null,
    warranty_period_months int not null default 12,
    created_at timestamptz not null default now()
);

-- 9. WARRANTIES
create table if not exists public.warranties (
    id uuid primary key default gen_random_uuid(),
    sale_id uuid references public.sales(id) on delete set null,
    laptop_id uuid references public.laptops(id) on delete set null,
    serial_number text not null,
    laptop_model text not null,
    customer_name text not null,
    customer_phone text not null,
    start_date date not null default current_date,
    end_date date not null,
    warranty_period_months int not null default 12,
    status text not null check (status in ('active', 'expired', 'void')) default 'active',
    terms text,
    created_at timestamptz not null default now()
);

-- 10. LAPTOP SERVICES / REPAIRS (Customer info embedded directly)
create table if not exists public.services (
    id uuid primary key default gen_random_uuid(),
    service_ticket_no text unique not null,
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    customer_address text,
    laptop_brand text not null,
    laptop_model text not null,
    serial_number text,
    received_date timestamptz not null default now(),
    problem_description text not null,
    diagnosis text,
    repair_details text,
    service_cost numeric(15, 2) not null default 0,
    paid_amount numeric(15, 2) not null default 0,
    payment_method text check (payment_method in ('cash', 'bank_transfer', 'mobile_payment', 'card_payment')),
    payment_status text not null check (payment_status in ('unpaid', 'partial', 'paid')) default 'unpaid',
    completed_date timestamptz,
    delivered_date timestamptz,
    status text not null check (status in ('received', 'checking', 'waiting_for_parts', 'repairing', 'completed', 'delivered', 'cancelled')) default 'received',
    notes text,
    assigned_staff_id uuid references public.profiles(id),
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 11. SERVICE HISTORY / STATUS LOGS
create table if not exists public.service_history (
    id uuid primary key default gen_random_uuid(),
    service_id uuid not null references public.services(id) on delete cascade,
    status text not null,
    notes text,
    changed_by uuid references public.profiles(id),
    created_at timestamptz not null default now()
);

-- 12. SHOP SETTINGS
create table if not exists public.shop_settings (
    id text primary key default 'default',
    shop_name text not null default 'YaungMal-PyinMal Laptop Shop',
    shop_address text default 'Yangon, Myanmar',
    shop_phone text default '09-123456789',
    shop_email text default 'info@yaungmal-pyinmal.com',
    invoice_header text default 'Laptop Sales & Repair Specialist',
    invoice_footer text default 'Thank you for your business! / ဝယ်ယူအားပေးမှုကို အထူးကျေးဇူးတင်ရှိပါသည်။',
    currency text not null default 'MMK',
    date_format text not null default 'DD/MM/YYYY',
    low_stock_threshold int not null default 3,
    updated_at timestamptz not null default now()
);

-- Insert default settings row if not exists
insert into public.shop_settings (id)
values ('default')
on conflict (id) do nothing;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.laptops enable row level security;
alter table public.laptop_specifications enable row level security;
alter table public.stock_movements enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.warranties enable row level security;
alter table public.services enable row level security;
alter table public.service_history enable row level security;
alter table public.shop_settings enable row level security;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Profiles: Authenticated users can view active profiles; Admins can manage all profiles
create policy "Allow logged-in users to view profiles"
on public.profiles for select
using (auth.role() = 'authenticated');

create policy "Allow user to update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Allow admins full access to profiles"
on public.profiles for all
using (public.is_admin());

-- General catalog tables (brands, categories, laptops, specs): Authenticated can view; Admins can insert/update/delete
create policy "Allow authenticated users to view brands" on public.brands for select using (auth.role() = 'authenticated');
create policy "Allow admins to manage brands" on public.brands for all using (public.is_admin());

create policy "Allow authenticated users to view categories" on public.categories for select using (auth.role() = 'authenticated');
create policy "Allow admins to manage categories" on public.categories for all using (public.is_admin());

create policy "Allow authenticated users to view laptops" on public.laptops for select using (auth.role() = 'authenticated');
create policy "Allow admins to manage laptops" on public.laptops for all using (public.is_admin());

create policy "Allow authenticated users to view laptop specs" on public.laptop_specifications for select using (auth.role() = 'authenticated');
create policy "Allow admins to manage laptop specs" on public.laptop_specifications for all using (public.is_admin());

-- Stock movements: Authenticated can view and insert
create policy "Allow authenticated users to view stock movements" on public.stock_movements for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert stock movements" on public.stock_movements for insert with check (auth.role() = 'authenticated');

-- Sales & Sale items: Authenticated users (Staff and Admin) can view, create
create policy "Allow authenticated users to view sales" on public.sales for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to create sales" on public.sales for insert with check (auth.role() = 'authenticated');
create policy "Allow admins to update or delete sales" on public.sales for update using (public.is_admin());
create policy "Allow admins to delete sales" on public.sales for delete using (public.is_admin());

create policy "Allow authenticated users to view sale items" on public.sale_items for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert sale items" on public.sale_items for insert with check (auth.role() = 'authenticated');

-- Warranties: Authenticated can view & create
create policy "Allow authenticated to view warranties" on public.warranties for select using (auth.role() = 'authenticated');
create policy "Allow authenticated to insert warranties" on public.warranties for insert with check (auth.role() = 'authenticated');
create policy "Allow admins to update warranties" on public.warranties for update using (public.is_admin());

-- Services & Service History: Authenticated can view, insert, update
create policy "Allow authenticated to view services" on public.services for select using (auth.role() = 'authenticated');
create policy "Allow authenticated to insert services" on public.services for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated to update services" on public.services for update using (auth.role() = 'authenticated');
create policy "Allow admins to delete services" on public.services for delete using (public.is_admin());

create policy "Allow authenticated to view service history" on public.service_history for select using (auth.role() = 'authenticated');
create policy "Allow authenticated to insert service history" on public.service_history for insert with check (auth.role() = 'authenticated');

-- Shop Settings: Authenticated can view; Only Admins can modify
create policy "Allow authenticated to view settings" on public.shop_settings for select using (auth.role() = 'authenticated');
create policy "Allow admins to update settings" on public.shop_settings for update using (public.is_admin());
