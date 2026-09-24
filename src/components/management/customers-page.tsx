"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // تم استيراد مكون شريط التحميل
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export function CustomersPage() {
  const lang = useAppStore((s) => s.lang);
  const services = useAppStore((s) => s.services);

  const [customers, setCustomers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // شريط التحميل الوهمي السريع
  const [progress, setProgress] = useState(13);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    passportNumber: "",
    nationalId: "",
    cardNumber: "",
    referralSource: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const loadCustomers = async (pageNumber = 1, searchQuery = search) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/customers?page=${pageNumber}&limit=100&q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();

      if (data.ok && Array.isArray(data.customers)) {
        if (pageNumber === 1) {
          setCustomers(data.customers);
        } else {
          setCustomers((prev) => [...prev, ...data.customers]);
        }
        setTotalCount(data.total ?? data.customers.length);
        setHasMore(Boolean(data.hasMore));
        setPage(pageNumber);
      }
    } catch (err) {
      console.error("فشل جلب العملاء:", err);
      toast.error(lang === "ar" ? "فشل جلب بيانات العملاء" : "Failed to load customers");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // التأكد من جلب البيانات عند التحميل الأولي ومع كل عملية بحث
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // التحكم بسرعة شريط التحميل البصري
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setProgress(100), 150); // يكتمل بسرعة خلال 150 ملي ثانية
      return () => clearTimeout(timer);
    } else {
      setProgress(13); // إعادة ضبط الشريط للتحميل القادم
    }
  }, [loading]);

  const openCreate = () => {
    setForm({ fullName: "", phoneNumber: "", passportNumber: "", nationalId: "", cardNumber: "", referralSource: "" });
    setEditingId(null);
    setErrors({});
    setFormDirty(false);
    setOpen(true);
  };

  const openEdit = (c: any) => {
    setForm({
      fullName: c.fullName,
      phoneNumber: c.phoneNumber,
      passportNumber: c.passportNumber ?? "",
      nationalId: c.nationalId ?? "",
      cardNumber: c.cardNumber ?? "",
      referralSource: c.referralSource ?? "",
    });
    setEditingId(c.id);
    setErrors({});
    setFormDirty(false);
    setOpen(true);
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = lang === "ar" ? "مطلوب" : "Required";
    if (!form.phoneNumber.trim()) errs.phoneNumber = lang === "ar" ? "مطلوب" : "Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/customers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.ok) {
          setCustomers((prev) => prev.map((c) => (c.id === editingId ? data.customer : c)));
          toast.success(lang === "ar" ? "تم تحديث العميل" : "Customer updated");
        } else {
          toast.error(lang === "ar" ? "فشل التحديث" : "Failed to update");
          setSaving(false);
          return;
        }
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.ok && data.customer) {
          setCustomers((prev) => [data.customer, ...prev]);
          setTotalCount((prev) => prev + 1);
          toast.success(lang === "ar" ? "تم حفظ العميل في قاعدة البيانات" : "Customer saved");
        } else {
          toast.error(data.error || (lang === "ar" ? "فشل حفظ العميل" : "Failed to save"));
          setSaving(false);
          return;
        }
      }
      setOpen(false);
      setForm({ fullName: "", phoneNumber: "", passportNumber: "", nationalId: "", cardNumber: "", referralSource: "" });
      setEditingId(null);
      setFormDirty(false);
    } catch (err) {
      toast.error(lang === "ar" ? "حدث خطأ في الاتصال" : "Network error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/customers/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== deleteId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setDeleteId(null);
        toast.success(lang === "ar" ? "تم حذف العميل" : "Customer deleted");
      } else {
        toast.error(data.error || (lang === "ar" ? "فشل الحذف" : "Failed to delete"));
      }
    } catch (err) {
      toast.error(lang === "ar" ? "فشل الحذف" : "Failed to delete");
    }
  };

  const exportExcel = (period: "weekly" | "monthly" | "yearly") => {
    const url = `/api/export?type=customers&period=${period}&format=excel`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${period}_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(lang === "ar" ? "تم تصدير ملف Excel" : "Excel file exported");
  };

  const exportPDF = (period: "weekly" | "monthly" | "yearly") => {
    const url = `/api/export?type=customers&period=${period}&format=pdf`;
    window.open(url, "_blank");
    toast.success(lang === "ar" ? "تم فتح تقرير PDF" : "PDF report opened");
  };

  const exportCustomExcel = (type: string) => {
    if (!customFromDate || !customToDate) {
      toast.error(lang === "ar" ? "يرجى تحديد التاريخ من وإلى" : "Please select from and to dates");
      return;
    }
    const url = `/api/export?type=${type}&period=custom&format=excel&fromDate=${customFromDate}&toDate=${customToDate}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_custom_${customFromDate}_to_${customToDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCustomDateOpen(false);
    toast.success(lang === "ar" ? "تم تصدير ملف Excel" : "Excel file exported");
  };

  const exportCustomPDF = (type: string) => {
    if (!customFromDate || !customToDate) {
      toast.error(lang === "ar" ? "يرجى تحديد التاريخ من وإلى" : "Please select from and to dates");
      return;
    }
    const url = `/api/export?type=${type}&period=custom&format=pdf&fromDate=${customFromDate}&toDate=${customToDate}`;
    window.open(url, "_blank");
    setCustomDateOpen(false);
    toast.success(lang === "ar" ? "تم فتح تقرير PDF" : "PDF report opened");
  };

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen && formDirty) {
      if (!window.confirm(lang === "ar" ? "لديك تغييرات غير محفوظة. هل تريد المغادرة؟" : "You have unsaved changes. Leave anyway?")) {
        return;
      }
    }
    setOpen(isOpen);
    if (!isOpen) {
      setForm({ fullName: "", phoneNumber: "", passportNumber: "", nationalId: "", cardNumber: "", referralSource: "" });
      setEditingId(null);
      setFormDirty(false);
    }
  };

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_customers")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" 
              ? `إجمالي العملاء: ${totalCount} (المعروض: ${customers.length})` 
              : `Total customers: ${totalCount} (Showing: ${customers.length})`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => exportExcel("yearly")}>
                <Calendar className="w-4 h-4" />
                {lang === "ar" ? "تصدير سنوي" : "Yearly Export"}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setCustomDateOpen(true)}>
                <Calendar className="w-4 h-4" />
                {lang === "ar" ? "تصدير حسب التاريخ" : "Custom Date Export"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background gap-2">
                <FileText className="w-4 h-4" />
                {tr(lang, "export_pdf")}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={lang === "ar" ? "start" : "end"}>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => exportPDF("weekly")}>
                <Calendar className="w-4 h-4" />
                {tr(lang, "export_weekly")}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => exportPDF("monthly")}>
                <Calendar className="w-4 h-4" />
                {tr(lang, "export_monthly")}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => exportPDF("yearly")}>
                <Calendar className="w-4 h-4" />
                {lang === "ar" ? "تصدير سنوي" : "Yearly Export"}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setCustomDateOpen(true)}>
                <Calendar className="w-4 h-4" />
                {lang === "ar" ? "تصدير حسب التاريخ" : "Custom Date Export"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2 shadow-sm"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4" />
            {tr(lang, "add")}
          </Button>
        </div>
      </div>

      <Card className="border-border card-shadow">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "بحث بالاسم، رقم العميل، الهاتف، الجواز..." : "Search by name, no., phone, passport..."}
              className="ps-9 h-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>{tr(lang, "customer_name")}</TableHead>
                  <TableHead>{tr(lang, "phone")}</TableHead>
                  <TableHead>{tr(lang, "passport_number")}</TableHead>
                  <TableHead>{tr(lang, "customer_joined")}</TableHead>
                  <TableHead>{tr(lang, "customer_referral")}</TableHead>
                  <TableHead>{tr(lang, "status")}</TableHead>
                  <TableHead className="text-end">{tr(lang, "actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
                        <p className="text-muted-foreground text-sm font-medium animate-pulse">
                          {lang === "ar" ? "جاري تحميل بيانات العملاء..." : "Loading customers data..."}
                        </p>
                        {/* تم إضافة شريط التقدم هنا ليملأ بنسبة 100% بسرعة */}
                        <Progress value={progress} className="w-full h-2" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
                          <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-sm">{tr(lang, "empty_customers")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((c) => {
                    const custServices = services.filter((s) => s.customerId === c.id);
                    return (
                      <TableRow key={c.id} className="hover:bg-accent/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm">
                              {c.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="font-medium text-foreground text-sm">{c.fullName}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {custServices.length} {lang === "ar" ? "معاملة" : "transactions"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.phoneNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.passportNumber ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.joinedOn}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.referralSource ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={c.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"}>
                            {c.isActive ? tr(lang, "active") : tr(lang, "inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title={tr(lang, "delete_customer")} onClick={() => setDeleteId(c.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title={tr(lang, "edit_customer")} onClick={() => openEdit(c)}>
                              <Pencil className="w-4 h-4" />
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

          {hasMore && (
            <div className="flex justify-center p-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => loadCustomers(page + 1)}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "ar" ? "جاري تحميل الدفعة التالية..." : "Loading next batch..."}</span>
                  </>
                ) : (
                  <span>{lang === "ar" ? "تحميل المزيد (100 عميل)" : "Load more (100 customers)"}</span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingId ? tr(lang, "edit_customer") : tr(lang, "add")} — {tr(lang, "nav_customers")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{tr(lang, "f_customer_name")} *</Label>
              <Input value={form.fullName} onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setFormDirty(true); }} className="bg-background" />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_phone")} *</Label>
              <Input value={form.phoneNumber} onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }); setFormDirty(true); }} className="bg-background" />
              {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "passport_number")}</Label>
              <Input value={form.passportNumber} onChange={(e) => { setForm({ ...form, passportNumber: e.target.value }); setFormDirty(true); }} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_card_number")}</Label>
              <Input value={form.cardNumber} onChange={(e) => { setForm({ ...form, cardNumber: e.target.value }); setFormDirty(true); }} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "customer_referral")}</Label>
              <Input value={form.referralSource} onChange={(e) => { setForm({ ...form, referralSource: e.target.value }); setFormDirty(true); }} className="bg-background" placeholder={lang === "ar" ? "توصية، إعلان..." : "Referral, ad..."} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => handleDialogChange(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={submit} disabled={saving} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {tr(lang, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr(lang, "delete_customer")}</AlertDialogTitle>
            <AlertDialogDescription>{tr(lang, "confirm_delete_customer")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr(lang, "cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {tr(lang, "action_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={customDateOpen} onOpenChange={setCustomDateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {lang === "ar" ? "تصدير حسب التاريخ" : "Export by Date Range"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>{lang === "ar" ? "من تاريخ" : "From Date"}</Label>
              <Input type="date" value={customFromDate} onChange={(e) => setCustomFromDate(e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>{lang === "ar" ? "إلى تاريخ" : "To Date"}</Label>
              <Input type="date" value={customToDate} onChange={(e) => setCustomToDate(e.target.value)} className="bg-background" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setCustomDateOpen(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={() => exportCustomExcel("customers")} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              {tr(lang, "export_excel")}
            </Button>
            <Button onClick={() => exportCustomPDF("customers")} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              <FileText className="w-4 h-4" />
              {tr(lang, "export_pdf")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}