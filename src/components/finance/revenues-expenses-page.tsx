"use client";

import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { useState } from "react";

const currencySymbol = (c: string) => (c === "SAR" ? "ر.س" : c === "YER" ? "ر.ي" : "$");
const rateToUsd = (c: string) => (c === "SAR" ? 0.27 : c === "YER" ? 0.0004 : 1);

export function RevenuesExpensesPage() {
  const lang = useAppStore((s) => s.lang);
  const payments = useAppStore((s) => s.payments);
  const expenses = useAppStore((s) => s.expenses);
  const [period, setPeriod] = useState("overall");

  // Totals in USD
  const totalRevenue = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amount * rateToUsd(p.currency), 0);
  const totalExpenses = expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount * rateToUsd(e.currency), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Today's values
  const todayRevenue = payments
    .filter((p) => p.status === "approved" && new Date(p.receivedAt).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.amount * rateToUsd(p.currency), 0);
  const todayExpenses = expenses
    .filter((e) => e.status === "approved" && new Date(e.paidAt).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount * rateToUsd(e.currency), 0);

  // Chart data — last 14 days
  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dayStr = d.toDateString();
    const rev = payments
      .filter((p) => p.status === "approved" && new Date(p.receivedAt).toDateString() === dayStr)
      .reduce((sum, p) => sum + p.amount * rateToUsd(p.currency), 0);
    const exp = expenses
      .filter((e) => e.status === "approved" && new Date(e.paidAt).toDateString() === dayStr)
      .reduce((sum, e) => sum + e.amount * rateToUsd(e.currency), 0);
    return {
      day: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue: Math.round(rev),
      expenses: Math.round(exp),
    };
  });

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_revenues_expenses")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "نظرة مالية شاملة على الإيرادات والمصروفات" : "Comprehensive financial overview"}
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-10 w-44 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{tr(lang, "today")}</SelectItem>
            <SelectItem value="week">{tr(lang, "this_week")}</SelectItem>
            <SelectItem value="month">{tr(lang, "this_month")}</SelectItem>
            <SelectItem value="overall">{tr(lang, "overall")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <Badge className="bg-[#ECFDF5] text-[#10B981] hover:bg-[#ECFDF5] gap-1">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{tr(lang, "kpi_today_revenue")}</p>
            <p className="text-2xl font-bold text-foreground num mt-1">
              ${Math.round(period === "today" ? todayRevenue : totalRevenue).toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#FFEDD5] flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#F97316]" />
              </div>
              <Badge className="bg-[#FEF2F2] text-destructive hover:bg-[#FEF2F2] gap-1">
                <ArrowDownRight className="w-3 h-3" /> 3%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{tr(lang, "kpi_today_expenses")}</p>
            <p className="text-2xl font-bold text-foreground num mt-1">
              ${Math.round(period === "today" ? todayExpenses : totalExpenses).toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#F3E8FF] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <Badge className="bg-[#ECFDF5] text-[#10B981] hover:bg-[#ECFDF5] gap-1">
                <ArrowUpRight className="w-3 h-3" /> 8%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{lang === "ar" ? "صافي الربح" : "Net Profit"}</p>
            <p className="text-2xl font-bold text-foreground num mt-1">
              ${Math.round(netProfit).toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-border card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{lang === "ar" ? "الإيرادات والمصروفات (14 يوم)" : "Revenue & Expenses (14 days)"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="e1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
              <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fill="url(#r1)" />
              <Area type="monotone" dataKey="expenses" stroke="#F97316" strokeWidth={2.5} fill="url(#e1)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent revenues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              {tr(lang, "kpi_today_revenue")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_no")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_name")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 5).map((p) => (
                  <TableRow key={p.id} className="hover:bg-accent/30">
                    <TableCell className="text-xs text-muted-foreground num">{p.paymentNumber}</TableCell>
                    <TableCell className="text-sm font-medium">{p.customerName}</TableCell>
                    <TableCell className="text-sm font-bold num text-[#10B981]">
                      {p.amount.toLocaleString("en-US")} {currencySymbol(p.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#F97316]" />
              {tr(lang, "kpi_today_expenses")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{lang === "ar" ? "رقم المصروف" : "Expense No."}</TableHead>
                  <TableHead className="text-xs font-semibold">{lang === "ar" ? "الفئة" : "Category"}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0, 5).map((e) => (
                  <TableRow key={e.id} className="hover:bg-accent/30">
                    <TableCell className="text-xs text-muted-foreground num">{e.expenseNumber}</TableCell>
                    <TableCell className="text-sm font-medium">{e.category}</TableCell>
                    <TableCell className="text-sm font-bold num text-[#F97316]">
                      {e.amount.toLocaleString("en-US")} {currencySymbol(e.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
