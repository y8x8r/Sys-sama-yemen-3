"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus,
  Search,
  User as UserIcon,
  Phone,
  IdCard,
  Calendar,
  TrendingUp,
} from "lucide-react";

export function CustomersPage() {
  const lang = useAppStore((s) => s.lang);
  const customers = useAppStore((s) => s.customers);
  const services = useAppStore((s) => s.services);
  const addCustomer = useAppStore((s) => s.addCustomer);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    passportNumber: "",
    nationalId: "",
    referralSource: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const list = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.customerNumber.toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q) ||
        (c.passportNumber ?? "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = lang === "ar" ? "مطلوب" : "Required";
    if (!form.phoneNumber.trim()) errs.phoneNumber = lang === "ar" ? "مطلوب" : "Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    addCustomer({
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      passportNumber: form.passportNumber || undefined,
      nationalId: form.nationalId || undefined,
      referralSource: form.referralSource || undefined,
    });
    toast.success(lang === "ar" ? "تم حفظ العميل" : "Customer saved");
    setOpen(false);
    setForm({ fullName: "", phoneNumber: "", passportNumber: "", nationalId: "", referralSource: "" });
  };

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_customers")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? `إجمالي العملاء: ${customers.length}` : `Total customers: ${customers.length}`}
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2 shadow-sm"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {tr(lang, "add")}
        </Button>
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
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_name")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_number")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "phone")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "passport_number")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_joined")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_referral")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {tr(lang, "no_data")}
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((c) => {
                    const custServices = services.filter((s) => s.customerId === c.id);
                    return (
                      <TableRow key={c.id} className="hover:bg-accent/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] flex items-center justify-center text-[#6D28D9] font-bold text-sm">
                              {c.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-foreground text-sm">{c.fullName}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {custServices.length} {lang === "ar" ? "معاملة" : "transactions"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.customerNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.phoneNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.passportNumber ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.joinedOn}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.referralSource ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={c.isActive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-muted text-muted-foreground"}>
                            {c.isActive ? tr(lang, "active") : tr(lang, "inactive")}
                          </Badge>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {lang === "ar" ? "إضافة عميل جديد" : "Add new customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{tr(lang, "f_customer_name")} *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-background" />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_phone")} *</Label>
              <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="bg-background" />
              {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "passport_number")}</Label>
              <Input value={form.passportNumber} onChange={(e) => setForm({ ...form, passportNumber: e.target.value })} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_national_id")}</Label>
              <Input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "customer_referral")}</Label>
              <Input value={form.referralSource} onChange={(e) => setForm({ ...form, referralSource: e.target.value })} className="bg-background" placeholder={lang === "ar" ? "توصية، إعلان..." : "Referral, ad..."} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={submit} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95">{tr(lang, "save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
