# 💻 YaungMal-PyinMal (ရောင်းမယ် ပြင်မယ်)

> **Laptop Shop POS & Service Management System**  
> A full-featured, modern Point of Sale (POS), Inventory, Service & Repair Ticketing, and Warranty Management web application built for laptop retail stores and service centers.

---

## 🚀 Key Features

### 🛒 Point of Sale (POS)
- **Fast Checkout Flow**: Search laptops by name, SKU, brand, or barcode/serial number.
- **Cart & Discount Management**: Add multiple items, apply item-level or order-level discounts.
- **Multiple Payment Methods**: Cash, Bank Transfer, Mobile Payments (KBZPay, WavePay, etc.).
- **Printable Invoices**: Instant receipt and invoice generation for completed transactions.

### 📦 Inventory & Laptop Catalog
- **Detailed Specifications**: Manage CPU, RAM, Storage (SSD/HDD), GPU, Screen Size, and OS details.
- **Brand & Category Management**: Organize products by top brands (ASUS, Dell, Lenovo, HP, Apple, Acer, etc.) and categories (Gaming, Ultrabook, Business, Budget).
- **Stock Tracking & Low-Stock Alerts**: Real-time stock status, automated notifications for depleted inventory.

### 🛠️ Service & Repair Management
- **Service Job Ticketing**: Create repair tickets with customer details, issue descriptions, device serial numbers, and preliminary assessments.
- **Status Workflow**: Track repair progress (*Pending &rarr; In Progress &rarr; Waiting for Parts &rarr; Completed &rarr; Delivered*).
- **Cost & Parts Estimation**: Add labor charges, replacement parts cost, and track technician assignments.
- **Service History**: Full historical log of repairs per device/customer.

### 🛡️ Warranty Management
- **Automated Warranty Registration**: Issue warranties automatically upon laptop purchase.
- **Warranty Verification**: Check warranty validity via Serial Number or Invoice ID.
- **Claim Processing**: Manage warranty repair requests and status updates.

### 📊 Analytics & Reporting
- **Sales & Revenue Dashboards**: Daily, weekly, monthly sales figures and gross profit metrics.
- **Top Sellers**: Discover best-performing laptop models and most frequent service requests.
- **Exporting**: Generate detailed summaries for bookkeeping and audit trails.

### 👥 User Roles & Security
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to financial reports, user management, inventory settings, and logs.
  - **Staff / Cashier / Technician**: Access to POS, inventory lookup, and service ticket handling.
- **Supabase Row Level Security (RLS)**: Secure data isolation and database-level protection.
- **Bilingual Support**: Built-in multi-language support (**English** & **Myanmar / မြန်မာ**).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database & Backend** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| **Icons & UI** | [Lucide React](https://lucide.dev/), [SweetAlert2](https://sweetalert2.github.io/) |
| **Hosting** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```text
YaungMal-PyinMal/
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Main application dashboard routes
│   │   │   ├── brands/          # Brand management
│   │   │   ├── categories/      # Category management
│   │   │   ├── inventory/       # Stock tracking & catalog
│   │   │   ├── invoices/        # Sales invoices & receipt view
│   │   │   ├── laptops/         # Laptop specifications & inventory
│   │   │   ├── pos/             # Point of Sale terminal
│   │   │   ├── reports/         # Analytics & financial reports
│   │   │   ├── services/        # Repair & service ticketing
│   │   │   ├── settings/        # Store & system settings
│   │   │   ├── users/           # User & staff role management
│   │   │   ├── warranties/      # Warranty tracker & claims
│   │   │   └── page.tsx         # Executive dashboard overview
│   │   ├── login/               # Authentication & login screen
│   │   ├── layout.tsx           # Root application layout
│   │   └── globals.css          # Global styles & Tailwind configuration
│   ├── i18n/                    # Localization (English & Myanmar)
│   ├── shared/                  # Reusable UI components & hooks
│   ├── utils/                   # Supabase clients, helpers & utilities
│   └── middleware.ts            # Route protection & auth session handling
├── supabase/                    # Database migrations & schemas
├── public/                      # Static assets & icons
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.18.0 or later
- **npm**, **yarn**, or **pnpm**
- A **[Supabase](https://supabase.com)** project

### 2. Clone the Repository
```bash
git clone https://github.com/theinhtetaung-dev/YaungMal-PyinMal.git
cd YaungMal-PyinMal
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key
```

### 5. Run Database Migrations
Execute the SQL schemas located in the `supabase/` folder within your Supabase SQL Editor to create required tables, relationships, and RLS policies.

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the system.

---

## 🌐 Deploying to Vercel

The easiest way to deploy this application is through the **[Vercel Platform](https://vercel.com/)**:

1. Push your latest code to your GitHub repository.
2. Import the repository on [Vercel Dashboard](https://vercel.com/new).
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Click **Deploy**.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
