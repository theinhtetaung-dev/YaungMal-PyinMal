"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const RouteProgressBar: React.FC = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 animate-[progress_0.3s_ease-in-out_infinite] w-full" />
    </div>
  );
};
