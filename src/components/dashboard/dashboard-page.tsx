"use client";

import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Receipt,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  Plane,
  Ticket,
  Hotel,
  Ship,
  HeartPulse,
  Briefcase,
  IdCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const currencySymbol = (c: string) => (c === "SAR" ? "ر.س" : c === "YER" ? "ر.ي" : "$");

function fmtMoney(amount: number, currency: string) {
  return `${amount.toLocaleString("en-US")} ${currencySymbol(currency)}`;
}

interface KpiCardProps {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "lilac" | "sky" | "peach" | "mint" | "yellow";
  onClick?: () => void;
}

const variantStyles: Record<
  KpiCardProps["variant"],
  { bg: string; icon: string }
> = {
  lilac: { bg: "bg-[#F3E8FF]", icon: "text-[#8B5CF6]" },
  sky: { bg: "bg-[#E0F2FE]", icon: "text-[#0EA5E9]" },
  peach: { bg: "bg-[#FFEDD5]", icon: "text-[#F97316]" },
  mint: { bg: "bg-[#D1FAE5]", icon: "text-[#10B981]" },
  yellow: { bg: "bg-[#FEF9C3]", icon: "text-[#EAB308]" },
};

function KpiCard({ title, value, trend, trendLabel, icon: Icon, variant, onClick }: KpiCardProps) {
  const v = variantStyles[variant];
  return (
    <Card
      className="border-border card-shadow hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center",
              v.bg
            )}
          >
            <Icon className={cn("w-5 h-5", v.icon)} />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
                trend >= 0 ? "bg-mint/30 text-[#10B981]" : "bg-red-50 text-destructive"
              )}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span className="num">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold text-foreground num tracking-tight">{value}</p>
          {trendLabel && (
            <p className="text-[11px] text-muted-foreground">{trendLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mini transaction status card
function StatusCard({
  label,
  count,
  color,
  bgColor,
  icon: Icon,
}: {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/40 transition-colors">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold text-foreground num">{count}</p>
      </div>
    </div>
  );
}

const serviceTypeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hajj_program: Plane,
  hajj_regular: Plane,
  umrah_program: Plane,
  umrah_regular: Plane,
  passport_attendance: IdCard,
  passport_without: IdCard,
  flight_ticket: Ticket,
  intl_bus: Briefcase,
  intl_car: Briefcase,
  local_bus: Briefcase,
  local_car: Briefcase,
  visa_medical: HeartPulse,
  visa_tourist: Plane,
  visa_work: Briefcase,
  visa_visit: Briefcase,
  shipping: Ship,
  customs: Ship,
  security_approval: ShieldAlert,
  medical_report: HeartPulse,
  travel_insurance: ShieldAlert,
  hotel_booking: Hotel,
};

export function DashboardPage() {
  const lang = useAppStore((s) => s.lang);
  const services = useAppStore((s) => s.services);
  const customers = useAppStore((s) => s.customers);
  const invoices = useAppStore((s) => s.invoices);
  const expenses = useAppStore((s) => s.expenses);
  const payments = useAppStore((s) => s.payments);
  const visaExpiry = useAppStore((s) => s.visaExpiry);
  const setPage = useAppStore((s) => s.setPage);

  // Compute KPIs
  const activeTransactions = services.filter(
    (s) => s.status === "pending" || s.status === "processing"
  ).length;
  const todayRevenue = payments
    .filter((p) => p.status === "approved" && new Date(p.receivedAt).toDateString() === new Date().toDateString())
    .reduce((sum, p) => {
      // Convert all to USD approx for display
      const rate = p.currency === "SAR" ? 0.27 : p.currency === "YER" ? 0.0004 : 1;
      return sum + p.amount * rate;
    }, 0);
  const todayExpenses = expenses
    .filter((e) => e.status === "approved" && new Date(e.paidAt).toDateString() === new Date().toDateString())
    .reduce((sum, e) => {
      const rate = e.currency === "SAR" ? 0.27 : e.currency === "YER" ? 0.0004 : 1;
      return sum + e.amount * rate;
    }, 0);
  const unpaidInvoices = invoices.filter(
    (i) => i.status === "issued" || i.status === "partial"
  ).length;

  // Status counts
  const statusCounts = {
    pending: services.filter((s) => s.status === "pending").length,
    processing: services.filter((s) => s.status === "processing").length,
    completed: services.filter((s) => s.status === "completed").length,
    cancelled: services.filter((s) => s.status === "cancelled").length,
  };

  // Top services (count by type)
  const topServicesMap = new Map<string, { count: number; revenue: number }>();
  services.forEach((s) => {
    const cur = topServicesMap.get(s.serviceType) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += s.paid;
    topServicesMap.set(s.serviceType, cur);
  });
  const topServices = Array.from(topServicesMap.entries())
    .map(([type, v]) => ({ type, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent customers
  const recentCustomers = [...customers].slice(0, 5);

  // Service distribution for donut chart
  const distribution = topServices.map((s) => ({
    name: tr(lang, `nav_${s.type}`),
    value: s.count,
  }));

  // Financial chart data (last 7 days)
  const financialData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const rev = payments
      .filter((p) => new Date(p.receivedAt).toDateString() === dayStr)
      .reduce((sum, p) => sum + (p.currency === "SAR" ? p.amount * 0.27 : p.currency === "YER" ? p.amount * 0.0004 : p.amount), 0);
    const exp = expenses
      .filter((e) => new Date(e.paidAt).toDateString() === dayStr)
      .reduce((sum, e) => sum + (e.currency === "SAR" ? e.amount * 0.27 : e.currency === "YER" ? e.amount * 0.0004 : e.amount), 0);
    return {
      day: d.toLocaleDateString(lang === "ar" ? "ar" : "en", { weekday: "short" }),
      revenue: Math.round(rev),
      expenses: Math.round(exp),
    };
  });

  const pieColors = ["#7C3AED", "#F97316", "#10B981", "#EC4899", "#3B82F6"];

  return (
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {tr(lang, "nav_dashboard")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar"
              ? `أهلاً بك! إليك ملخص نشاط المكتب اليوم ${new Date().toLocaleDateString("en-GB")}`
              : `Welcome! Here's your office activity summary for ${new Date().toLocaleDateString("en-GB")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-background"
            onClick={() => setPage("umrah_regular")}
          >
            {tr(lang, "add_transaction")}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          title={tr(lang, "kpi_active_transactions")}
          value={String(activeTransactions)}
          trend={12}
          trendLabel={tr(lang, "this_week")}
          icon={Activity}
          variant="lilac"
          onClick={() => setPage("flight_ticket")}
        />
        <KpiCard
          title={tr(lang, "kpi_today_revenue")}
          value={`$${Math.round(todayRevenue).toLocaleString("en-US")}`}
          trend={8}
          trendLabel={tr(lang, "today")}
          icon={TrendingUp}
          variant="mint"
          onClick={() => setPage("revenues_expenses")}
        />
        <KpiCard
          title={tr(lang, "kpi_today_expenses")}
          value={`$${Math.round(todayExpenses).toLocaleString("en-US")}`}
          trend={-3}
          trendLabel={tr(lang, "today")}
          icon={TrendingDown}
          variant="peach"
          onClick={() => setPage("revenues_expenses")}
        />
        <KpiCard
          title={tr(lang, "kpi_unpaid_invoices")}
          value={String(unpaidInvoices)}
          trend={5}
          trendLabel={tr(lang, "this_month")}
          icon={Receipt}
          variant="sky"
          onClick={() => setPage("invoices")}
        />
        <KpiCard
          title={tr(lang, "kpi_visa_near_expiry")}
          value={String(visaExpiry.length)}
          trend={-15}
          trendLabel={tr(lang, "this_week")}
          icon={ShieldAlert}
          variant="yellow"
          onClick={() => setPage("visa_expiry")}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions status (left wide) */}
        <Card className="lg:col-span-2 border-border card-shadow">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">
              {tr(lang, "widget_transactions_status")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary text-xs gap-1"
              onClick={() => setPage("flight_ticket")}
            >
              {tr(lang, "view_all")}
              <ChevronLeft className="w-3 h-3 rotate-180 rtl:rotate-0" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatusCard
                label={tr(lang, "pending")}
                count={statusCounts.pending}
                color="#F97316"
                bgColor="#FFF7ED"
                icon={Activity}
              />
              <StatusCard
                label={tr(lang, "processing")}
                count={statusCounts.processing}
                color="#3B82F6"
                bgColor="#EFF6FF"
                icon={Activity}
              />
              <StatusCard
                label={tr(lang, "completed")}
                count={statusCounts.completed}
                color="#10B981"
                bgColor="#ECFDF5"
                icon={Activity}
              />
              <StatusCard
                label={tr(lang, "cancelled")}
                count={statusCounts.cancelled}
                color="#EF4444"
                bgColor="#FEF2F2"
                icon={Activity}
              />
            </div>

            {/* Financial chart */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {tr(lang, "widget_financial_overview")}
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                    {tr(lang, "kpi_today_revenue")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                    {tr(lang, "kpi_today_expenses")}
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={financialData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fill="url(#gradRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    fill="url(#gradExp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Visa alerts (right narrow) */}
        <Card className="border-border card-shadow">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">
              {tr(lang, "widget_visa_alerts")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary text-xs gap-1"
              onClick={() => setPage("visa_expiry")}
            >
              {tr(lang, "view_all")}
              <ChevronLeft className="w-3 h-3 rotate-180 rtl:rotate-0" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto pe-1">
              {visaExpiry.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {tr(lang, "no_data")}
                </div>
              ) : (
                visaExpiry.slice(0, 6).map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() => setPage("visa_expiry")}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                        v.status === "expired"
                          ? "bg-destructive"
                          : v.status === "urgent"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      )}
                    >
                      {v.daysRemaining > 0 ? v.daysRemaining : "!"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {v.customerName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {v.visaKind} — {v.expiryDate}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent customers */}
        <Card className="lg:col-span-2 border-border card-shadow">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">
              {tr(lang, "widget_recent_customers")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary text-xs gap-1"
              onClick={() => setPage("customers")}
            >
              {tr(lang, "view_all")}
              <ChevronLeft className="w-3 h-3 rotate-180 rtl:rotate-0" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCustomers.map((c) => {
                const lastService = services.find((s) => s.customerId === c.id);
                const Icon = lastService ? serviceTypeIconMap[lastService.serviceType] ?? Briefcase : Briefcase;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() => setPage("customers")}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] flex items-center justify-center text-[#6D28D9] font-bold text-sm flex-shrink-0">
                      {c.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {c.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground num">
                        {c.customerNumber} • {c.phoneNumber}
                      </p>
                    </div>
                    {lastService && (
                      <Badge
                        variant="secondary"
                        className="bg-[#ECFDF5] text-[#10B981] hover:bg-[#ECFDF5] text-[11px] gap-1"
                      >
                        <Icon className="w-3 h-3" />
                        {tr(lang, `nav_${lastService.serviceType}`)}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Service distribution donut */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {tr(lang, "widget_service_distribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {distribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: pieColors[i % pieColors.length] }}
                    />
                    <span className="text-muted-foreground truncate max-w-[140px]">
                      {d.name}
                    </span>
                  </span>
                  <span className="font-semibold text-foreground num">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top services */}
        <Card className="lg:col-span-2 border-border card-shadow">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">
              {tr(lang, "widget_top_services")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary text-xs gap-1"
              onClick={() => setPage("statistics")}
            >
              {tr(lang, "view_details")}
              <ChevronLeft className="w-3 h-3 rotate-180 rtl:rotate-0" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topServices.map((s) => ({
                  name: tr(lang, `nav_${s.type}`),
                  count: s.count,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "#F3E8FF" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topServices.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance report */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {tr(lang, "widget_performance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-[#F3E8FF]">
                <p className="text-xs text-[#6D28D9] mb-1">{tr(lang, "kpi_today_revenue")}</p>
                <p className="text-lg font-bold text-[#6D28D9] num">
                  ${Math.round(todayRevenue).toLocaleString("en-US")}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#FFEDD5]">
                <p className="text-xs text-[#F97316] mb-1">{tr(lang, "kpi_today_expenses")}</p>
                <p className="text-lg font-bold text-[#F97316] num">
                  ${Math.round(todayExpenses).toLocaleString("en-US")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {lang === "ar" ? "صافي الربح" : "Net Profit"}
                </span>
                <span className="font-bold text-[#10B981] num">
                  ${Math.round(todayRevenue - todayExpenses).toLocaleString("en-US")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {lang === "ar" ? "نسبة المصروفات" : "Expense Ratio"}
                </span>
                <span className="font-bold text-foreground num">
                  {todayRevenue > 0
                    ? `${Math.round((todayExpenses / todayRevenue) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {lang === "ar" ? "إجمالي المعاملات" : "Total Transactions"}
                </span>
                <span className="font-bold text-foreground num">{services.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {lang === "ar" ? "إجمالي العملاء" : "Total Customers"}
                </span>
                <span className="font-bold text-foreground num">{customers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
