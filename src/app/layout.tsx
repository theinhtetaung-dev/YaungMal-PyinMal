import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/shared/components/Providers";

export const metadata: Metadata = {
  title: "YaungMal-PyinMal | Laptop Shop POS & Service Management System",
  description:
    "ရောင်းမယ်-ပြင်မယ် - Comprehensive Laptop Shop POS, Inventory, Warranty & Repair Service Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
