"use client";

import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Menu,
  Moon,
  Sun,
  Globe,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronLeft,
} from "lucide-react";

const pageLabels: Record<string, string> = {
  dashboard: "nav_dashboard",
  hajj_program: "nav_hajj_program",
  hajj_regular: "nav_hajj_regular",
  umrah_program: "nav_umrah_program",
  umrah_regular: "nav_umrah_regular",
  passport_attendance: "nav_passport_attendance",
  passport_without: "nav_passport_without",
  flight_ticket: "nav_flight_ticket",
  intl_bus: "nav_intl_bus",
  intl_car: "nav_intl_car",
  local_bus: "nav_local_bus",
  local_car: "nav_local_car",
  visa_medical: "nav_visa_medical",
  visa_tourist: "nav_visa_tourist",
  visa_work: "nav_visa_work",
  visa_visit: "nav_visa_visit",
  shipping: "nav_shipping",
  customs: "nav_customs",
  security_approval: "nav_security_approval",
  medical_report: "nav_medical_report",
  travel_insurance: "nav_travel_insurance",
  hotel_booking: "nav_hotel_booking",
  customers: "nav_customers",
  employees: "nav_employees",
  agents_companies: "nav_agents_companies",
  revenues_expenses: "nav_revenues_expenses",
  payments: "nav_payments",
  invoices: "nav_invoices",
  statistics: "nav_statistics",
  audit_log: "nav_audit_log",
  visa_expiry: "nav_visa_expiry",
  users_permissions: "nav_users_permissions",
  system_settings: "nav_system_settings",
};

export function Topbar() {
  const lang = useAppStore((s) => s.lang);
  const theme = useAppStore((s) => s.theme);
  const setLang = useAppStore((s) => s.setLang);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const currentUser = useAppStore((s) => s.currentUser);
  const setPage = useAppStore((s) => s.setPage);
  const logout = useAppStore((s) => s.logout);
  const currentPage = useAppStore((s) => s.currentPage);
  const visaExpiry = useAppStore((s) => s.visaExpiry);

  const roleLabel =
    currentUser?.role === "manager"
      ? tr(lang, "role_manager")
      : currentUser?.role === "accountant"
      ? tr(lang, "role_accountant")
      : tr(lang, "role_booking");

  const pageTitle = tr(lang, pageLabels[currentPage] ?? "nav_dashboard");

  const initials = currentUser?.username?.slice(0, 2).toUpperCase() ?? "SY";

  return (
    <header
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 gap-4">
        {/* Right side (in RTL): breadcrumb + page title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-muted-foreground hidden sm:inline">
              {tr(lang, "nav_dashboard")}
            </span>
            <ChevronLeft className="w-4 h-4 text-muted-foreground hidden sm:inline rotate-180 rtl:rotate-0" />
            <span className="font-semibold text-foreground truncate">{pageTitle}</span>
          </div>
        </div>

        {/* Left side (in RTL): actions */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="gap-2 text-foreground"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">
              {lang === "ar" ? "EN" : "ع"}
            </span>
          </Button>

          {/* Theme */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {visaExpiry.length > 0 && (
                  <span className="absolute top-1 end-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={lang === "ar" ? "start" : "end"} className="w-80">
              <div className="px-3 py-2 font-semibold text-sm border-b border-border">
                {tr(lang, "notifications")}
              </div>
              {visaExpiry.slice(0, 5).map((v) => (
                <DropdownMenuItem
                  key={v.id}
                  className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  onClick={() => setPage("visa_expiry")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        v.status === "expired"
                          ? "bg-destructive"
                          : v.status === "urgent"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm font-medium flex-1">
                      {v.customerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {v.daysRemaining > 0
                        ? `${v.daysRemaining} ${lang === "ar" ? "يوم" : "d"}`
                        : lang === "ar" ? "منتهية" : "expired"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ps-4">
                    {v.visaKind} — {v.serviceNumber}
                  </p>
                </DropdownMenuItem>
              ))}
              {visaExpiry.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {tr(lang, "no_data")}
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center text-primary cursor-pointer"
                onClick={() => setPage("visa_expiry")}
              >
                {tr(lang, "view_all")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 ps-1 pe-2">
                <Avatar className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#A855F7]">
                  <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground leading-tight">
                    {currentUser?.username ?? "—"}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    {roleLabel}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={lang === "ar" ? "start" : "end"} className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{currentUser?.username}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setPage("system_settings")}
              >
                <UserIcon className="w-4 h-4 me-2" />
                {tr(lang, "profile")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setPage("system_settings")}
              >
                <SettingsIcon className="w-4 h-4 me-2" />
                {tr(lang, "nav_system_settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 me-2" />
                {tr(lang, "logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
