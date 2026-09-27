# Laptop Shop POS & Service Management System

## 1. Project Overview

This system is for a laptop shop.

The system manages:

* Laptop products
* Laptop specifications
* Stock
* Laptop sales
* Payments
* Invoices
* Warranty
* Laptop services
* Service history
* Reports

The system has two roles:

* Admin
* Staff

---

# 2. Tech Stack

## Frontend

**Next.js**

* Next.js
* TypeScript
* React
* Tailwind CSS
* Responsive UI

The system should work well on:

* Laptop
* Desktop
* Tablet

The main target is **Laptop/Desktop**.

---

## Backend

**Supabase**

Supabase will be used for:

* PostgreSQL Database
* Authentication
* Row Level Security (RLS)
* Storage
* Backend API

---

## Database

**PostgreSQL**

The database will store:

* Users
* Laptops
* Laptop Specifications
* Brands
* Categories
* Stock
* Sales
* Sale Items
* Payments
* Invoices
* Warranties
* Services
* Service History

---

## Authentication

Use:

**Supabase Auth**

The system supports:

* Admin Login
* Staff Login
* Logout
* Password Change

User roles:

```text
Admin
Staff
```

---

## Security

Use **Supabase Row Level Security (RLS)**.

Admin has full access.

Staff has limited access based on their permissions.

Example:

```text
Admin
 ├── Full Access
 ├── Manage Laptops
 ├── Manage Staff
 ├── Manage Settings
 └── View All Reports

Staff
 ├── View Laptops
 ├── Create Sales
 ├── Create Services
 ├── Update Services
 └── View Allowed Reports
```

---

# 3. User Roles

## 3.1 Admin

Admin has full access to the system.

Admin can:

* Manage laptops
* Manage laptop specifications
* Manage brands
* Manage categories
* Manage stock
* Create sales
* Manage payments
* Create invoices
* Manage warranties
* Manage laptop services
* View service history
* View reports
* Manage Staff accounts
* Manage system settings

---

## 3.2 Staff

Staff can perform normal shop operations.

Staff can:

* View laptops
* Search laptops
* Create sales
* Record customer information during a sale
* Create invoices
* View invoices
* Record laptop service
* Record customer information during a service
* Update service status
* View service history
* View stock

Staff cannot:

* Manage Staff accounts
* Delete important system data
* Change system settings
* Manage database backup
* Manage Admin account
* Manage system configuration

---

# 4. Currency and Date Format

## Currency

The system must use:

**MMK**

All money values must use a thousand separator.

Examples:

```text
1,000 MMK
10,000 MMK
100,000 MMK
1,000,000 MMK
1,500,000 MMK
```

## Date Format

The system must use:

**DD/MM/YYYY**

Examples:

```text
27/09/2026
05/10/2026
31/12/2026
```

The system should not display:

```text
2026-09-27
09/27/2026
```

---

# 5. Dashboard

The Dashboard shows important shop information.

### Features

* Total Laptops
* Available Laptops
* Sold Laptops
* Today's Sales
* Monthly Sales
* Pending Services
* Completed Services
* Low Stock Count
* Active Warranty Count

Admin can view all dashboard information.

Staff can view basic dashboard information.

---

# 6. Laptop Management

Admin can manage laptop products.

### Features

* Add Laptop
* Edit Laptop
* Delete Laptop
* View Laptop
* Search Laptop
* Filter Laptop
* View Laptop Details

### Laptop Information

Each laptop contains:

* Laptop ID
* Brand
* Model
* Category
* Serial Number
* Product Code
* Cost Price
* Selling Price
* Stock Quantity
* Warranty Period
* Status
* Created Date
* Updated Date

### Laptop Status

```text
In Stock
Sold
Reserved
Service
Damaged
```

---

# 7. Laptop Specifications

Each laptop must contain detailed specifications.

### Specifications

* CPU
* CPU Generation
* RAM
* RAM Type
* Storage
* Storage Type
* GPU
* Display Size
* Display Resolution
* Display Type
* Operating System
* Battery
* Battery Capacity
* Color
* Weight
* Keyboard
* Backlit Keyboard
* Touchscreen
* Fingerprint
* Webcam
* Wi-Fi
* Bluetooth
* USB Ports
* HDMI
* Other Specifications

---

# 8. Brand Management

Admin can manage laptop brands.

### Features

* Add Brand
* Edit Brand
* Delete Brand
* View Brands
* Search Brand

---

# 9. Category Management

Admin can manage laptop categories.

### Features

* Add Category
* Edit Category
* Delete Category
* View Categories

---

# 10. Inventory Management

The system tracks laptop stock.

### Features

* Add Stock
* Remove Stock
* View Current Stock
* Stock History
* Low Stock
* Sold Stock
* Serial Number Tracking

The system should automatically update stock after a sale.

---

# 11. Customer Information

There is **no Customer Management / Customer CRUD module**.

The system only records basic customer information when the customer:

1. Buys a laptop
2. Brings a laptop for service

### Customer Information

* Customer Name
* Phone Number
* Email
* Address
* Notes

Customer information is stored together with the **Sale** or **Service** record.

---

# 12. POS / Sales

The POS is used to sell laptops.

### Sales Process

```text
Search Laptop
      ↓
Select Laptop
      ↓
Add to Cart
      ↓
Enter Customer Information
      ↓
Apply Discount
      ↓
Select Payment Method
      ↓
Complete Sale
      ↓
Create Invoice
      ↓
Update Stock
```

### Features

* Search Laptop
* Add Laptop to Cart
* Remove Laptop from Cart
* Enter Customer Information
* Add Discount
* Calculate Total
* Select Payment Method
* Complete Sale
* Cancel Sale

---

# 13. Payment Management

The system records payment information.

### Payment Methods

* Cash
* Bank Transfer
* Mobile Payment
* Card Payment

### Payment Information

* Payment Method
* Payment Amount
* Payment Date
* Payment Status

---

# 14. Invoice Management

The system creates an invoice after a sale.

### Invoice Information

* Invoice Number
* Sale Date
* Customer Name
* Customer Phone
* Laptop Brand
* Laptop Model
* Serial Number
* Quantity
* Unit Price
* Discount
* Total
* Payment Method
* Warranty Information

### Features

* Create Invoice
* View Invoice
* Print Invoice
* Reprint Invoice
* Search Invoice
* Invoice History

---

# 15. Warranty Management

The system manages laptop warranty.

### Warranty Information

* Warranty Period
* Warranty Start Date
* Warranty End Date
* Warranty Status
* Laptop Serial Number
* Customer Name
* Customer Phone

### Features

* Add Warranty
* View Warranty
* Search Warranty
* Active Warranty
* Expired Warranty
* Warranty History

### Warranty Status

```text
Active
Expired
```

---

# 16. Laptop Service Management

The system manages laptop repair and service.

A customer does not need to be created separately.

When a customer brings a laptop for service, the system records the customer information directly in the service record.

### Service Information

* Service ID
* Customer Name
* Customer Phone
* Laptop Brand
* Laptop Model
* Serial Number
* Received Date
* Problem / Error
* Diagnosis
* Repair Details
* Service Cost
* Paid Amount
* Payment Method
* Completed Date
* Service Status
* Notes

---

# 17. Service Status

The system should support:

```text
Received
Checking
Waiting for Parts
Repairing
Completed
Delivered
Cancelled
```

Admin and Staff can update the service status according to their permissions.

---

# 18. Service History

The system keeps all service records.

Admin and Staff can search service history.

### Search By

* Service ID
* Customer Name
* Customer Phone
* Laptop Brand
* Laptop Model
* Serial Number
* Service Status
* Date

---

# 19. Service Payment

The system records service payment.

### Information

* Service Cost
* Paid Amount
* Payment Method
* Payment Date

All amounts use MMK.

---

# 20. Search and Filter

The system should provide search and filter functions.

## Laptop

Search by:

* Brand
* Model
* Serial Number
* Product Code

## Sales

Search by:

* Invoice Number
* Customer Name
* Phone Number
* Laptop Model
* Serial Number
* Date

## Services

Search by:

* Service ID
* Customer Name
* Phone Number
* Laptop Model
* Serial Number
* Service Status
* Date

---

# 21. Reports

Admin can view all reports.

## Sales Reports

* Daily Sales
* Monthly Sales
* Yearly Sales
* Sales by Laptop
* Sales by Brand

## Inventory Reports

* Current Stock
* Low Stock
* Sold Laptops
* Stock History

## Warranty Reports

* Active Warranty
* Expired Warranty
* Warranty History

## Service Reports

* Pending Services
* Completed Services
* Cancelled Services
* Service History
* Service Income

---

# 22. Notifications / Alerts

The system should show important alerts.

### Alerts

* Low Stock Alert
* Warranty Expiry Alert
* Pending Service Alert
* Unpaid Service Alert

---

# 23. User Management

Only Admin can manage Staff accounts.

### Features

* Add Staff
* Edit Staff
* Disable Staff
* Reset Staff Password
* View Staff
* Staff Login History

Admin cannot be deleted from the system.

---

# 24. Admin and Staff Permissions

| Feature             | Admin | Staff     |
| ------------------- | ----- | --------- |
| Dashboard           | Yes   | Yes       |
| View Laptop         | Yes   | Yes       |
| Add Laptop          | Yes   | No        |
| Edit Laptop         | Yes   | No        |
| Delete Laptop       | Yes   | No        |
| Brand Management    | Yes   | No        |
| Category Management | Yes   | No        |
| Stock Management    | Yes   | View Only |
| Create Sale         | Yes   | Yes       |
| View Sales          | Yes   | Yes       |
| Create Invoice      | Yes   | Yes       |
| Warranty            | Yes   | Yes       |
| Create Service      | Yes   | Yes       |
| Update Service      | Yes   | Yes       |
| Service History     | Yes   | Yes       |
| Reports             | Yes   | Limited   |
| Staff Management    | Yes   | No        |
| System Settings     | Yes   | No        |
| Database Backup     | Yes   | No        |

---

# 25. System Settings

Admin can manage:

* Shop Name
* Shop Address
* Shop Phone Number
* Shop Email
* Invoice Settings
* Currency
* Date Format
* Admin Password
* Database Backup
* Database Restore

### Default Settings

```text
Currency:
MMK

Number Format:
1,000,000 MMK

Date Format:
DD/MM/YYYY
```

---

# 26. Data Validation

The system should validate important data.

### Laptop

* Laptop model cannot be empty.
* Serial number should be unique.
* Selling price cannot be negative.
* Stock cannot be negative.

### Sale

* Customer name is required.
* Customer phone is required.
* Laptop is required.
* Payment method is required.

### Service

* Customer name is required.
* Customer phone is required.
* Laptop model is required.
* Problem / Error is required.
* Received date is required.

### Invoice

* Invoice number must be unique.

---

# 27. Main System Structure

```text
Laptop Shop POS
│
├── Dashboard
│
├── Laptops
│   ├── Laptop List
│   ├── Add Laptop
│   ├── Laptop Specifications
│   ├── Brands
│   └── Categories
│
├── Inventory
│   ├── Stock
│   ├── Stock History
│   └── Serial Numbers
│
├── Sales / POS
│   ├── New Sale
│   ├── Sales History
│   ├── Payments
│   └── Invoices
│
├── Warranty
│   ├── Active Warranty
│   ├── Expired Warranty
│   └── Warranty History
│
├── Services
│   ├── New Service
│   ├── Pending Services
│   ├── Repairing
│   ├── Completed
│   └── Service History
│
├── Reports
│   ├── Sales Reports
│   ├── Inventory Reports
│   ├── Warranty Reports
│   └── Service Reports
│
├── User Management
│   └── Staff
│
└── Settings
    ├── Shop Information
    ├── Invoice Settings
    ├── Currency
    ├── Date Format
    └── Database Backup
```

---

# 28. Main Business Flow

## Laptop Sale

```text
Laptop
   ↓
POS
   ↓
Customer Information
   ↓
Payment
   ↓
Invoice
   ↓
Warranty
   ↓
Stock Update
```

Customer information is saved as part of the **sale record**.

There is no separate Customer CRUD.

---

## Laptop Service

```text
Laptop
   ↓
Service
   ↓
Customer Information
   ↓
Problem / Error
   ↓
Diagnosis
   ↓
Repair
   ↓
Service Payment
   ↓
Completed
   ↓
Service History
```

Customer information is saved as part of the **service record**.

There is no separate Customer CRUD.

---

# 29. Technical Requirements

## Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS

## Backend

* Supabase

## Database

* Supabase PostgreSQL

## Authentication

* Supabase Auth

## Security

* Supabase Row Level Security (RLS)

## Storage

* Supabase Storage

Storage can be used for:

* Laptop images
* Invoice files
* Service images
* Other shop documents

---

# 30. Final Requirements

The system must:

* Support Admin and Staff roles.
* Have no separate Customer Management CRUD.
* Record customer information when buying a laptop.
* Record customer information when servicing a laptop.
* Store complete laptop specifications.
* Store laptop serial numbers.
* Track laptop stock.
* Manage laptop sales.
* Manage payments.
* Generate invoices.
* Manage warranty.
* Manage laptop services.
* Store service history.
* Allow Admin and Staff to search service records.
* Provide sales reports.
* Provide inventory reports.
* Provide warranty reports.
* Provide service reports.
* Use MMK currency.
* Use thousand separators for all money values.
* Use DD/MM/YYYY date format.
* Allow only Admin to manage Staff accounts.
* Allow only Admin to change system settings.
* Allow only Admin to perform database backup and restore.
* Use Next.js for the frontend.
* Use Supabase for authentication, database, storage, and backend services.
* Use PostgreSQL as the database.
* Use Supabase RLS for role-based data security.


1. Install packages
Run this command to install the required dependencies.
Code:
File: Code
```
npm install @supabase/supabase-js @supabase/ssr
```

2. Add files
Add env variables, create Supabase client helpers, and set up middleware to keep sessions refreshed.
Code:
File: .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://knfqypvnhxyrmzwqlpkp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_JfR4jTwI939iJeHU-zIn3Q_idA-Dujm
```

File: page.tsx
```
1import { createClient } from '@/utils/supabase/server'
2import { cookies } from 'next/headers'
3
4export default async function Page() {
5  const cookieStore = await cookies()
6  const supabase = createClient(cookieStore)
7
8  const { data: todos } = await supabase.from('todos').select()
9
10  return (
11    <ul>
12      {todos?.map((todo) => (
13        <li key={todo.id}>{todo.name}</li>
14      ))}
15    </ul>
16  )
17}
```

File: utils/supabase/server.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { cookies } from "next/headers";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
6
7export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
8  return createServerClient(
9    supabaseUrl!,
10    supabaseKey!,
11    {
12      cookies: {
13        getAll() {
14          return cookieStore.getAll()
15        },
16        setAll(cookiesToSet) {
17          try {
18            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
19          } catch {
20            // The `setAll` method was called from a Server Component.
21            // This can be ignored if you have middleware refreshing
22            // user sessions.
23          }
24        },
25      },
26    },
27  );
28};
```

File: utils/supabase/client.ts
```
1import { createBrowserClient } from "@supabase/ssr";
2
3const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
4const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
5
6export const createClient = () =>
7  createBrowserClient(
8    supabaseUrl!,
9    supabaseKey!,
10  );
```

File: utils/supabase/middleware.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { type NextRequest, NextResponse } from "next/server";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
6
7export const createClient = (request: NextRequest) => {
8  // Create an unmodified response
9  let supabaseResponse = NextResponse.next({
10    request: {
11      headers: request.headers,
12    },
13  });
14
15  const supabase = createServerClient(
16    supabaseUrl!,
17    supabaseKey!,
18    {
19      cookies: {
20        getAll() {
21          return request.cookies.getAll()
22        },
23        setAll(cookiesToSet) {
24          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
25          supabaseResponse = NextResponse.next({
26            request,
27          })
28          cookiesToSet.forEach(({ name, value, options }) =>
29            supabaseResponse.cookies.set(name, value, options)
30          )
31        },
32      },
33    },
34  );
35
36  return supabaseResponse
37};
```

3. Install Agent Skills (optional)
Agent Skills give AI coding tools ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently.
Code:
File: Code
```
npx skills add supabase/agent-skills
```


# 31. Architecture

## Vertical Slice Architecture (Feature-Based)

The project uses **Vertical Slice Architecture**.

Each feature is a self-contained slice. A slice owns its UI, logic, API calls, types, and validation. Features do not share business logic across slices.

### Structure

```text
src/
├── app/                          # Next.js App Router (routes only)
│   ├── (auth)/
│   │   ├── login/
│   │   └── logout/
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── laptops/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── warranties/
│   │   ├── services/
│   │   ├── reports/
│   │   ├── users/
│   │   └── settings/
│   └── layout.tsx
│
├── features/                     # Vertical slices
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   └── index.ts
│   ├── laptops/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   └── index.ts
│   ├── brands/
│   ├── categories/
│   ├── inventory/
│   ├── sales/
│   ├── payments/
│   ├── invoices/
│   ├── warranties/
│   ├── services/
│   ├── reports/
│   ├── users/
│   └── settings/
│
├── shared/                       # Shared only (UI primitives, utils, types)
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
│
└── utils/
    └── supabase/
        ├── client.ts
        ├── server.ts
        └── middleware.ts

# 32. Language / i18n

## Supported Languages

* English (en)
* Myanmar / Burmese (my)

## Requirements

* Language switcher available in the UI (Admin and Staff).
* Selected language is persisted (cookie or local storage).
* Default language: English.
* Every user-facing English string in frontend files must have a Fluent Burmese translation.
* No hard-coded English text in components. All UI text uses translation keys.
* Dates remain DD/MM/YYYY. Currency remains MMK with thousand separators in both languages.

## Structure

```text
src/
├── i18n/
│   ├── locales/
│   │   ├── en.json
│   │   └── my.json
│   ├── config.ts
│   └── index.ts

# 33. Theme and Alerts

## Light / Dark Mode

* Support Light mode and Dark mode.
* Theme switcher available in the UI (Admin and Staff).
* Selected theme is persisted (cookie or local storage).
* Default theme: Light.
* Use solid colors only. No gradients in either mode.
* All components, tables, forms, dialogs, and status badges must support both themes.

## Alerts / Confirmations

* Do not use the default JavaScript `alert()`, `confirm()`, or `prompt()`.
* Use SweetAlert2 (or equivalent) for all alerts and confirmations.
* Required confirmations:
  * Delete (any record)
  * Logout
* Success, error, warning, and info messages use SweetAlert2.
* All SweetAlert titles, texts, and button labels must be translated (English and Fluent Burmese).