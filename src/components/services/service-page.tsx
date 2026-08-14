"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import type {
  ServiceType,
  ServiceStatus,
  Currency,
  PaymentMethod,
} from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Printer,
  Search,
  Filter,
  Eye,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  UserPlus,
} from "lucide-react";

export interface FieldDef {
  name: string;
  labelKey: string;
  type: "text" | "number" | "date" | "time" | "datetime-local" | "select" | "tel" | "textarea";
  options?: { value: string; labelKey: string }[];
  required?: boolean;
  placeholder?: string;
  fromCustomer?: "fullName" | "customerNumber" | "phoneNumber" | "passportNumber" | "nationalId";
  computed?: boolean;
  hideInTable?: boolean;
  span2?: boolean;
}

export interface ServiceConfig {
  serviceType: ServiceType;
  labelKey: string;
  fields: FieldDef[];
  withFinance?: boolean;
}

const statusColors: Record<ServiceStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: "var(--status-pending-bg)", fg: "#F97316", label: "list_urgent" },
  processing: { bg: "var(--status-processing-bg)", fg: "#3B82F6", label: "processing" },
  completed: { bg: "var(--status-delivered-bg)", fg: "#10B981", label: "completed" },
  cancelled: { bg: "var(--status-cancelled-bg)", fg: "#EF4444", label: "cancelled" },
  delivered: { bg: "var(--status-shipped-bg)", fg: "#7C3AED", label: "delivered" },
};

const currencySymbol = (c: string) => (c === "SAR" ? "ر.س" : c === "YER" ? "ر.ي" : "$");

interface Props {
  config: ServiceConfig;
}

export function ServicePage({ config }: Props) {
  const lang = useAppStore((s) => s.lang);
  const services = useAppStore((s) => s.services);
  const customers = useAppStore((s) => s.customers);
  const currentUser = useAppStore((s) => s.currentUser);
  const addService = useAppStore((s) => s.addService);
  const updateService = useAppStore((s) => s.updateService);
  const deleteService = useAppStore((s) => s.deleteService);
  const setPage = useAppStore((s) => s.setPage);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewRecord, setViewRecord] = useState<null | (typeof services)[0]>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => {
    let l = services.filter((s) => s.serviceType === config.serviceType);
    if (search.trim()) {
      const q = search.toLowerCase();
      l = l.filter(
        (s) =>
          s.customerName.toLowerCase().includes(q) ||
          s.serviceNumber.toLowerCase().includes(q) ||
          (s.details && JSON.stringify(s.details).toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") {
      l = l.filter((s) => s.status === statusFilter);
    }
    return l;
  }, [services, config.serviceType, search, statusFilter]);

  const resetForm = () => {
    setForm({});
    setErrors({});
    setEditingId(null);
  };

  const openCreate = () => {
    if (customers.length === 0) {
      toast.error(tr(lang, "no_customers_yet"));
      setPage("customers");
      return;
    }
    resetForm();
    setOpen(true);
  };

  const openEdit = (record: (typeof services)[0]) => {
    const newForm: Record<string, string> = {
      customerId: record.customerId,
      customerName: record.customerName,
      customerNumber: customers.find((c) => c.id === record.customerId)?.customerNumber ?? "",
      phoneNumber: customers.find((c) => c.id === record.customerId)?.phoneNumber ?? "",
      passportNumber: record.details.passportNumber as string ?? customers.find((c) => c.id === record.customerId)?.passportNumber ?? "",
      nationalId: customers.find((c) => c.id === record.customerId)?.nationalId ?? "",
      price: String(record.price),
      paid: String(record.paid),
      currency: record.currency,
      paymentMethod: record.paymentMethod ?? "",
      transferNo: record.transferNo ?? "",
      status: record.status,
      notes: record.notes ?? "",
    };
    for (const f of config.fields) {
      if (["customerId", "customerName", "customerNumber", "phoneNumber", "passportNumber", "nationalId", "price", "paid", "currency", "paymentMethod", "transferNo", "status", "notes"].includes(f.name)) continue;
      if (record.details[f.name] !== undefined) newForm[f.name] = String(record.details[f.name]);
    }
    setForm(newForm);
    setEditingId(record.id);
    setOpen(true);
  };

  const onCustomerSelect = (customerId: string) => {
    const c = customers.find((x) => x.id === customerId);
    if (!c) return;
    const next = { ...form };
    next.customerId = c.id;
    next.customerName = c.fullName;
    next.customerNumber = c.customerNumber;
    next.phoneNumber = c.phoneNumber;
    // اعتماد رقم الجواز تلقائياً من ملف العميل عند توفره
    if (c.passportNumber) next.passportNumber = c.passportNumber;
    if (c.nationalId) next.nationalId = c.nationalId;
    setForm(next);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.customerId) errs.customerId = lang === "ar" ? "اختر عميلاً" : "Select a customer";
    for (const f of config.fields) {
      if (f.computed) continue;
      if (f.fromCustomer) continue; // handle customer separately
      if (f.required && !form[f.name]?.trim()) {
        errs[f.name] = lang === "ar" ? "هذا الحقل مطلوب" : "This field is required";
      }
    }
    if (config.withFinance) {
      const price = parseFloat(form.price || "0");
      const paid = parseFloat(form.paid || "0");
      if (price <= 0) errs.price = lang === "ar" ? "أدخل سعراً صحيحاً" : "Enter valid price";
      if (paid > price) errs.paid = lang === "ar" ? "المبلغ المسلَّم أكبر من السعر" : "Paid > price";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = () => {
    if (!validate()) {
      toast.error(lang === "ar" ? "تحقق من الحقول المطلوبة" : "Check required fields");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const price = parseFloat(form.price || "0");
      const paid = parseFloat(form.paid || "0");
      const currency = (form.currency as Currency) || "SAR";
      const method = form.paymentMethod as PaymentMethod | undefined;
      const status = (form.status as ServiceStatus) || "pending";
      const customer = customers.find((c) => c.id === form.customerId);
      const details: Record<string, string | number | undefined> = {};
      for (const f of config.fields) {
        if (["price", "paid", "currency", "paymentMethod", "status", "customerId", "customerName", "customerNumber", "phoneNumber", "passportNumber", "nationalId"].includes(f.name)) continue;
        if (form[f.name]) details[f.name] = form[f.name];
      }
      if (editingId) {
        updateService(editingId, {
          status,
          price,
          paid,
          remaining: price - paid,
          currency,
          paymentMethod: method,
          transferNo: form.transferNo,
          notes: form.notes,
          details,
        });
        toast.success(lang === "ar" ? "تم تحديث المعاملة بنجاح" : "Transaction updated successfully");
      } else {
        addService({
          serviceType: config.serviceType,
          customerId: form.customerId,
          customerName: customer?.fullName ?? form.customerName ?? "—",
          handledByEmployeeId: currentUser?.employeeId,
          status,
          price,
          paid,
          remaining: price - paid,
          currency,
          paymentMethod: method,
          transferNo: form.transferNo,
          notes: form.notes,
          details,
        });
        toast.success(lang === "ar" ? "تم حفظ المعاملة بنجاح" : "Transaction saved successfully");
      }
      setSaving(false);
      setOpen(false);
      resetForm();
    }, 400);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteService(deleteId);
    setDeleteId(null);
    toast.success(lang === "ar" ? "تم حذف المعاملة" : "Transaction deleted");
  };

  const printRecord = (record: (typeof services)[0]) => {
    setViewRecord(record);
    setTimeout(() => window.print(), 300);
  };

  const exportExcel = (period: "weekly" | "monthly") => {
    const now = new Date();
    const from = new Date(now);
    if (period === "weekly") from.setDate(now.getDate() - 7);
    else from.setMonth(now.getMonth() - 1);

    const filtered = list.filter((s) => new Date(s.createdAt) >= from);
    if (filtered.length === 0) {
      toast.info(lang === "ar" ? "لا توجد بيانات للتصدير في الفترة المحددة" : "No data to export for the selected period");
      return;
    }
    // توليد ملف CSV بسيط (Excel-compatible)
    const headers = [tr(lang, "customer_name"), tr(lang, "audit_record_no"), tr(lang, "status"), tr(lang, "price"), tr(lang, "paid"), tr(lang, "remaining"), tr(lang, "date")];
    const rows = filtered.map((s) => [
      s.customerName,
      s.serviceNumber,
      tr(lang, statusColors[s.status].label),
      String(s.price),
      String(s.paid),
      String(s.remaining),
      new Date(s.createdAt).toLocaleDateString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const bom = "\uFEFF"; // دعم العربية في Excel
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.serviceType}_${period}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ar" ? `تم تصدير ${filtered.length} سجل` : `Exported ${filtered.length} records`);
  };

  const renderField = (f: FieldDef) => {
    const val = form[f.name] ?? "";
    const err = errors[f.name];

    if (f.fromCustomer) {
      return (
        <div key={f.name} className={cn("space-y-1.5", f.span2 && "sm:col-span-2")}>
          <Label className="text-xs font-medium text-foreground">
            {tr(lang, f.labelKey)}
            {f.required && <span className="text-destructive ms-1">*</span>}
          </Label>
          <Select value={form.customerId ?? ""} onValueChange={(v) => onCustomerSelect(v)}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder={tr(lang, "select_customer")} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.fullName} — <span className="num">{c.customerNumber}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {customers.length === 0 && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {tr(lang, "no_customers_yet")}
            </p>
          )}
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      );
    }

    if (f.type === "select") {
      return (
        <div key={f.name} className={cn("space-y-1.5", f.span2 && "sm:col-span-2")}>
          <Label className="text-xs font-medium text-foreground">
            {tr(lang, f.labelKey)}
            {f.required && <span className="text-destructive ms-1">*</span>}
          </Label>
          <Select value={val} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder={f.placeholder ?? "—"} />
            </SelectTrigger>
            <SelectContent>
              {f.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {tr(lang, o.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      );
    }

    if (f.type === "textarea") {
      return (
        <div key={f.name} className={cn("space-y-1.5", f.span2 && "sm:col-span-2")}>
          <Label className="text-xs font-medium text-foreground">
            {tr(lang, f.labelKey)}
          </Label>
          <Textarea
            value={val}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            className="bg-background min-h-[70px]"
            placeholder={f.placeholder}
          />
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      );
    }

    const isAutoFilledPassport = f.name === "passportNumber" && form.customerId && val;
    return (
      <div key={f.name} className={cn("space-y-1.5", f.span2 && "sm:col-span-2")}>
        <Label className="text-xs font-medium text-foreground">
          {tr(lang, f.labelKey)}
          {f.required && <span className="text-destructive ms-1">*</span>}
          {f.computed && (
            <span className="text-[10px] text-muted-foreground ms-1">
              ({lang === "ar" ? "محسوب تلقائياً" : "auto"})
            </span>
          )}
          {isAutoFilledPassport && (
            <span className="text-[10px] text-emerald-600 ms-1">
              {tr(lang, "auto_filled_passport")}
            </span>
          )}
        </Label>
        <Input
          type={f.type}
          value={f.computed ? computeVal(f.name) : val}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
          disabled={f.computed}
          className={cn("h-10 bg-background", f.computed && "bg-muted text-muted-foreground")}
          placeholder={f.placeholder}
        />
        {err && <p className="text-xs text-destructive">{err}</p>}
      </div>
    );
  };

  const computeVal = (name: string): string => {
    if (name === "remaining") {
      const price = parseFloat(form.price || "0");
      const paid = parseFloat(form.paid || "0");
      return String(price - paid);
    }
    if (name === "daysLeft" && form.entryDate) {
      const entry = new Date(form.entryDate);
      const expiry = new Date(entry);
      expiry.setDate(expiry.getDate() + 85);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `${diff} ${lang === "ar" ? "يوم" : "days"}`;
    }
    return "";
  };

  const allFields: FieldDef[] = config.withFinance
    ? [
        ...config.fields,
        { name: "price", labelKey: "price", type: "number", required: true, placeholder: "0.00" },
        { name: "currency", labelKey: "currency", type: "select", required: true, options: [
          { value: "SAR", labelKey: "sar" },
          { value: "YER", labelKey: "yer" },
          { value: "USD", labelKey: "usd" },
        ] },
        { name: "paymentMethod", labelKey: "f_payment_method", type: "select", options: [
          { value: "cash", labelKey: "list_cash" },
          { value: "transfer", labelKey: "list_transfer" },
          { value: "wallet", labelKey: "list_wallet" },
        ] },
        { name: "transferNo", labelKey: "f_transfer_no", type: "text", placeholder: "—" },
        { name: "paid", labelKey: "f_paid_amount", type: "number", placeholder: "0.00" },
        { name: "remaining", labelKey: "f_remaining", type: "text", computed: true },
        { name: "status", labelKey: "status", type: "select", required: true, options: [
          { value: "pending", labelKey: "list_urgent" },
          { value: "processing", labelKey: "processing" },
          { value: "completed", labelKey: "completed" },
          { value: "cancelled", labelKey: "cancelled" },
          { value: "delivered", labelKey: "delivered" },
        ] },
        { name: "notes", labelKey: "f_office_notes", type: "textarea", span2: true },
      ]
    : config.fields;

  const tableFields = allFields.filter((f) => !f.hideInTable).slice(0, 6);

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* تصنيف الخدمة عنوان واضح في أعلى القسم */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, config.labelKey)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? `إجمالي السجلات: ${list.length}` : `Total records: ${list.length}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* تصدير Excel أسبوعي وشهري */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                {tr(lang, "export_excel")}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={lang === "ar" ? "start" : "end"}>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => exportExcel("weekly")}>
                <Calendar className="w-4 h-4" />
                {tr(lang, "export_weekly")}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => exportExcel("monthly")}>
                <Calendar className="w-4 h-4" />
                {tr(lang, "export_monthly")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="gap-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 shadow-sm"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4" />
            {tr(lang, "add")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border card-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr(lang, "search")}
                className="ps-9 h-10 bg-background"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-44 bg-background">
                <Filter className="w-4 h-4 text-muted-foreground me-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr(lang, "overall")}</SelectItem>
                <SelectItem value="pending">{tr(lang, "list_urgent")}</SelectItem>
                <SelectItem value="processing">{tr(lang, "processing")}</SelectItem>
                <SelectItem value="completed">{tr(lang, "completed")}</SelectItem>
                <SelectItem value="cancelled">{tr(lang, "cancelled")}</SelectItem>
                <SelectItem value="delivered">{tr(lang, "delivered")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_name")}</TableHead>
                  {tableFields.map((f) => (
                    <TableHead key={f.name} className="text-xs font-semibold whitespace-nowrap">
                      {tr(lang, f.labelKey)}
                    </TableHead>
                  ))}
                  <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                  <TableHead className="text-xs font-semibold text-end">{tr(lang, "actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableFields.length + 3} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
                          <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-sm">{tr(lang, "empty_services")}</p>
                        {customers.length === 0 && (
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => setPage("customers")}>
                            <UserPlus className="w-4 h-4" />
                            {tr(lang, "nav_customers")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((s) => {
                    const sc = statusColors[s.status];
                    return (
                      <TableRow key={s.id} className="hover:bg-accent/30">
                        <TableCell>
                          <div className="font-medium text-foreground text-sm">{s.customerName}</div>
                          <div className="text-[11px] text-muted-foreground num">{s.serviceNumber}</div>
                        </TableCell>
                        {tableFields.map((f) => {
                          let val: string | number | undefined;
                          if (f.name === "price") val = s.price;
                          else if (f.name === "paid") val = s.paid;
                          else if (f.name === "remaining") val = s.remaining;
                          else if (f.name === "currency") val = currencySymbol(s.currency);
                          else val = s.details?.[f.name];
                          if (f.name === "price" || f.name === "paid" || f.name === "remaining") {
                            return (
                              <TableCell key={f.name} className="text-sm num whitespace-nowrap">
                                {val !== undefined ? `${Number(val).toLocaleString("en-US")}` : "—"}
                              </TableCell>
                            );
                          }
                          if (f.type === "select" && f.options && val) {
                            const opt = f.options.find((o) => o.value === val);
                            val = opt ? tr(lang, opt.labelKey) : val;
                          }
                          return (
                            <TableCell key={f.name} className="text-sm text-muted-foreground whitespace-nowrap">
                              {val ?? "—"}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Badge variant="secondary" className="text-[11px] font-medium gap-1" style={{ background: sc.bg, color: sc.fg }}>
                            {tr(lang, sc.label)}
                          </Badge>
                        </TableCell>
                        {/* ترتيب الإجراءات: معاينة ← حذف ← تعديل ← طباعة */}
                        <TableCell className="text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title={tr(lang, "action_preview")} onClick={() => setViewRecord(s)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title={tr(lang, "action_delete")} onClick={() => setDeleteId(s.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title={tr(lang, "action_edit")} onClick={() => openEdit(s)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title={tr(lang, "action_print")} onClick={() => printRecord(s)}>
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? tr(lang, "action_edit") : tr(lang, "add")} — {tr(lang, config.labelKey)}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {allFields.map(renderField)}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {tr(lang, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewRecord} onOpenChange={(o) => !o && setViewRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-normal num">
                {viewRecord?.serviceNumber}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">{tr(lang, "customer_name")}</p>
                <p className="font-semibold text-foreground">{viewRecord?.customerName}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">{tr(lang, "status")}</p>
                <p className="font-semibold text-foreground">
                  {viewRecord && tr(lang, statusColors[viewRecord.status].label)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-pastel-lilac">
                <p className="text-xs text-pastel-lilac">{tr(lang, "price")}</p>
                <p className="font-semibold text-pastel-lilac num">
                  {viewRecord && `${viewRecord.price.toLocaleString("en-US")} ${currencySymbol(viewRecord.currency)}`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-pastel-mint">
                <p className="text-xs text-pastel-mint">{tr(lang, "paid")}</p>
                <p className="font-semibold text-pastel-mint num">
                  {viewRecord && `${viewRecord.paid.toLocaleString("en-US")} ${currencySymbol(viewRecord.currency)}`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-pastel-peach">
                <p className="text-xs text-pastel-peach">{tr(lang, "remaining")}</p>
                <p className="font-semibold text-pastel-peach num">
                  {viewRecord && `${viewRecord.remaining.toLocaleString("en-US")} ${currencySymbol(viewRecord.currency)}`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">{tr(lang, "date")}</p>
                <p className="font-semibold text-foreground text-sm num">
                  {viewRecord && new Date(viewRecord.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <h4 className="text-sm font-semibold mb-2">
                {lang === "ar" ? "التفاصيل" : "Details"}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {viewRecord &&
                  Object.entries(viewRecord.details).map(([k, v]) => {
                    const field = config.fields.find((f) => f.name === k);
                    const label = field ? tr(lang, field.labelKey) : k;
                    let display: string = String(v ?? "—");
                    if (field?.type === "select" && field.options) {
                      const opt = field.options.find((o) => o.value === v);
                      display = opt ? tr(lang, opt.labelKey) : display;
                    }
                    return (
                      <div key={k} className="text-sm">
                        <span className="text-muted-foreground">{label}: </span>
                        <span className="font-medium text-foreground">{display}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            {viewRecord?.notes && (
              <div className="border-t border-border pt-3">
                <h4 className="text-sm font-semibold mb-1">{tr(lang, "f_office_notes")}</h4>
                <p className="text-sm text-muted-foreground">{viewRecord.notes}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setViewRecord(null)}>{tr(lang, "cancel")}</Button>
            <Button className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2" onClick={() => viewRecord && printRecord(viewRecord)}>
              <Printer className="w-4 h-4" />
              {tr(lang, "print")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr(lang, "action_delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr(lang, "confirm_delete_service")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr(lang, "cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tr(lang, "action_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
