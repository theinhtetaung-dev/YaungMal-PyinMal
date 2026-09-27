"use client";

import React from "react";
import { ThemeProvider } from "../lib/theme";
import { I18nProvider } from "@/i18n";
import { RouteProgressBar } from "./RouteProgressBar";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <RouteProgressBar />
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
};
