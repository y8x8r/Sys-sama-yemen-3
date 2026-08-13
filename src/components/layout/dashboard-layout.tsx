"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const lang = useAppStore((s) => s.lang);
  const theme = useAppStore((s) => s.theme);

  // Apply theme & direction to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, theme]);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={cn(
        "min-h-screen flex bg-background",
        lang === "ar" ? "font-cairo" : "font-cairo"
      )}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
