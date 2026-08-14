"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import type { Currency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const currencySymbol = (c: string) => (c === "SAR" ? "ر.س" : c === "YER" ? "ر.ي" : "$");
const rateToUsd = (c: string) => (c === "SAR" ? 0.27 : c === "YER" ? 0.0004 : 1);

export function RevenuesExpensesPage() {
  const lang = useAppStore((s) => s.lang);
  const payments = useAppStore((s) => s.payments);
  const expenses = useAppStore((s) => s.expenses);
  const addExpense = useAppStore((s) => s.addExpense);
  const seqExpense = useAppStore((s) => s.seqExpense);
  const [period, setPeriod] = useState("overall");
  const [openExpense, setOpenExpense] = useState(false);
  const [expForm, setExpForm] = useState({
    purpose: "",
    paidAt: new Date().toISOString().split("T")[0],
    amount: "",
    currency: "SAR" as Currency,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // لا يتم عرض صافي الربح نهائياً — فقط الإيرادات والمصروفات
  const totalRevenue = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amount * rateToUsd(p.currency), 0);
  const totalExpenses = expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount * rateToUsd(e.currency), 0);

  const todayRevenue = payments
    .filter((p) => p.status === "approved" && new Date(p.receivedAt).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.amount * rateToUsd(p.currency), 0);
  const todayExpenses = expenses
    .filter((e) => e.status === "approved" && new Date(e.paidAt).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount * rateToUsd(e.currency), 0);

  // مخطط 14 يوم — لا يعرض صافي الربح
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

  const nextExpNumber = `EXP-${new Date().getFullYear()}-${String(seqExpense).padStart(5, "0")}`;

  const submitExpense = () => {
    const errs: Record<string, string> = {};
    if (!expForm.purpose.trim()) errs.purpose = lang === "ar" ? "مطلوب" : "Required";
    if (!expForm.paidAt) errs.paidAt = lang === "ar" ? "مطلوب" : "Required";
    const amt = parseFloat(expForm.amount);
    if (!amt || amt <= 0) errs.amount = lang === "ar" ? "أدخل مبلغاً صحيحاً" : "Enter valid amount";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addExpense({
      purpose: expForm.purpose,
      paidAt: expForm.paidAt,
      amount: amt,
      currency: expForm.currency,
    });
    toast.success(lang === "ar" ? "تم حفظ المصروف فوراً" : "Expense saved immediately");
    setOpenExpense(false);
    setExpForm({ purpose: "", paidAt: new Date().toISOString().split("T")[0], amount: "", currency: "SAR" });
  };

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_revenues_expenses")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "نظرة مالية شاملة على الإيرادات والمصروفات" : "Comprehensive financial overview"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button
            className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2 shadow-sm"
            onClick={() => setOpenExpense(true)}
          >
            <Plus className="w-4 h-4" />
            {tr(lang, "add_expense")}
          </Button>
        </div>
      </div>

      {/* Stat cards — تم إزالة صافي الربح نهائياً، نعرض الإيرادات والمصروفات فقط */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-pastel-mint flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pastel-mint" />
              </div>
              <Badge className="bg-pastel-mint text-pastel-mint hover:bg-pastel-mint gap-1">+12%</Badge>
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
              <div className="w-11 h-11 rounded-xl bg-pastel-peach flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-pastel-peach" />
              </div>
              <Badge className="bg-pastel-peach text-pastel-peach hover:bg-pastel-peach gap-1">-3%</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{tr(lang, "kpi_today_expenses")}</p>
            <p className="text-2xl font-bold text-foreground num mt-1">
              ${Math.round(period === "today" ? todayExpenses : totalExpenses).toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-border card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {lang === "ar" ? "الإيرادات والمصروفات (14 يوم)" : "Revenue & Expenses (14 days)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 && expenses.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              {tr(lang, "empty_expenses")}
            </div>
          ) : (
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fill="url(#r1)" />
                <Area type="monotone" dataKey="expenses" stroke="#F97316" strokeWidth={2.5} fill="url(#e1)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent revenues & expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pastel-mint" />
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
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-sm text-muted-foreground">
                      {tr(lang, "empty_payments")}
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.slice(0, 5).map((p) => (
                    <TableRow key={p.id} className="hover:bg-accent/30">
                      <TableCell className="text-xs text-muted-foreground num">{p.paymentNumber}</TableCell>
                      <TableCell className="text-sm font-medium">{p.customerName}</TableCell>
                      <TableCell className="text-sm font-bold num text-pastel-mint">
                        {p.amount.toLocaleString("en-US")} {currencySymbol(p.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-pastel-peach" />
              {tr(lang, "kpi_today_expenses")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{lang === "ar" ? "رقم المصروف" : "Expense No."}</TableHead>
                  <TableHead className="text-xs font-semibold">{lang === "ar" ? "غرض الصرف" : "Purpose"}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-sm text-muted-foreground">
                      {tr(lang, "empty_expenses")}
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.slice(0, 5).map((e) => (
                    <TableRow key={e.id} className="hover:bg-accent/30">
                      <TableCell className="text-xs text-muted-foreground num">{e.expenseNumber}</TableCell>
                      <TableCell className="text-sm font-medium">{e.category}</TableCell>
                      <TableCell className="text-sm font-bold num text-pastel-peach">
                        {e.amount.toLocaleString("en-US")} {currencySymbol(e.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* نموذج إضافة مصروف — رقم تلقائي ← غرض الصرف ← تاريخ الصرف ← المبلغ */}
      <Dialog open={openExpense} onOpenChange={setOpenExpense}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              {tr(lang, "add_expense")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* رقم المصروف — ترقيم تلقائي، غير قابل للتعديل */}
            <div className="space-y-1.5">
              <Label>{tr(lang, "expense_no_auto")}</Label>
              <Input value={nextExpNumber} disabled className="bg-muted text-muted-foreground num" />
            </div>
            {/* غرض الصرف */}
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_expense_purpose")} *</Label>
              <Input
                value={expForm.purpose}
                onChange={(e) => setExpForm({ ...expForm, purpose: e.target.value })}
                className="bg-background"
                placeholder={lang === "ar" ? "مثال: إيجار المكتب، رواتب..." : "e.g. Office rent, salaries..."}
              />
              {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
            </div>
            {/* تاريخ الصرف */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {tr(lang, "f_expense_date")} *
              </Label>
              <Input
                type="date"
                value={expForm.paidAt}
                onChange={(e) => setExpForm({ ...expForm, paidAt: e.target.value })}
                className="bg-background num"
              />
              {errors.paidAt && <p className="text-xs text-destructive">{errors.paidAt}</p>}
            </div>
            {/* المبلغ + العملة */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tr(lang, "payment_amount")} *</Label>
                <Input
                  type="number"
                  value={expForm.amount}
                  onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                  className="bg-background num"
                  placeholder="0.00"
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{tr(lang, "currency")}</Label>
                <Select value={expForm.currency} onValueChange={(v) => setExpForm({ ...expForm, currency: v as Currency })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">{tr(lang, "sar")}</SelectItem>
                    <SelectItem value="YER">{tr(lang, "yer")}</SelectItem>
                    <SelectItem value="USD">{tr(lang, "usd")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpenExpense(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={submitExpense} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {tr(lang, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
