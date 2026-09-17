"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import type { Role } from "@/lib/types";
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
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Shield,
  KeyRound,
  UserCog,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Settings2,
  Ban,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { serviceConfigs } from "@/components/services/service-configs";
import { allServiceTypes, serviceTypeLabels } from "@/lib/mock-data";
import type { PermissionLevel } from "@/lib/types";

export function EmployeesPage() {
  const lang = useAppStore((s) => s.lang);
  const currentUser = useAppStore((s) => s.currentUser);
  const employees = useAppStore((s) => s.employees);
  const users = useAppStore((s) => s.users);
  const addEmployee = useAppStore((s) => s.addEmployee);
  const deleteEmployee = useAppStore((s) => s.deleteEmployee);

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    role: "booking_officer" as Role,
    password: "",
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // إدارة الصلاحيات الدقيقة
  const [permOpen, setPermOpen] = useState(false);
  const [permUserId, setPermUserId] = useState<string | null>(null);
  const [permUsername, setPermUsername] = useState<string>("");
  const [permModules, setPermModules] = useState<Record<string, PermissionLevel>>({});
  const [permHiddenServices, setPermHiddenServices] = useState<Set<string>>(new Set());
  const [permSaving, setPermSaving] = useState(false);
  const [permLoading, setPermLoading] = useState(false);

  const isManager = currentUser?.role === "manager";

  const roleLabel = (r: Role) =>
    r === "manager" ? tr(lang, "role_general_manager")
    : r === "accountant" ? tr(lang, "role_accountant")
    : tr(lang, "role_booking");

  const roleColor = (r: string) =>
    r === "manager" ? "bg-pastel-lilac text-pastel-lilac"
    : r === "accountant" ? "bg-pastel-peach text-pastel-peach"
    : "bg-pastel-mint text-pastel-mint";

  const openCreate = () => {
    if (!isManager) {
      toast.error(tr(lang, "only_manager_can_manage"));
      return;
    }
    setForm({ fullName: "", username: "", role: "booking_officer", password: "" });
    setErrors({});
    setOpen(true);
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = lang === "ar" ? "مطلوب" : "Required";
    if (!form.username.trim()) errs.username = lang === "ar" ? "مطلوب" : "Required";
    if (form.password.length < 4) errs.password = tr(lang, "err_password_short");
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const result = await addEmployee(form);
    setSaving(false);
    if (!result.ok) {
      const errKey = result.error ?? "server_error";
      const msg = errKey === "username_exists" ? tr(lang, "err_username_exists") : errKey;
      setErrors({ username: msg });
      toast.error(msg);
      return;
    }
    toast.success(lang === "ar" ? "تم إنشاء حساب الموظف فوراً" : "Employee account created immediately");
    setOpen(false);
    setForm({ fullName: "", username: "", role: "booking_officer", password: "" });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEmployee(deleteId);
      setDeleteId(null);
      toast.success(lang === "ar" ? "تم حذف الموظف" : "Employee deleted");
    } catch (err) {
      toast.error(lang === "ar" ? "فشل الحذف" : "Failed to delete");
    }
  };

  // فتح نافذة الصلاحيات الدقيقة لموظف محدد
  const openPermissions = async (userId: string, username: string, role: Role) => {
    if (role === "manager") {
      toast.info(lang === "ar" ? "المدير العام لديه صلاحيات كاملة دائماً" : "Manager always has full permissions");
      return;
    }
    setPermUserId(userId);
    setPermUsername(username);
    setPermOpen(true);
    setPermLoading(true);

    try {
      const res = await fetch(`/api/users/${userId}/permissions`, { credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        const modules: Record<string, PermissionLevel> = {};
        const hiddenServices = new Set<string>();
        for (const p of data.permissions) {
          if (p.moduleKey.startsWith("service:")) {
            // خدمة محددة مُخفاة
            const svc = p.moduleKey.replace("service:", "");
            if (p.level === "hidden") hiddenServices.add(svc);
            else modules[p.moduleKey] = p.level as PermissionLevel;
          } else {
            modules[p.moduleKey] = p.level as PermissionLevel;
          }
        }
        setPermModules(modules);
        setPermHiddenServices(hiddenServices);
      }
    } catch (err) {
      toast.error(lang === "ar" ? "فشل تحميل الصلاحيات" : "Failed to load permissions");
    }
    setPermLoading(false);
  };

  const savePermissions = async () => {
    if (!permUserId) return;
    setPermSaving(true);

    // بناء قائمة الصلاحيات للإرسال
    const permissions: Array<{ moduleKey: string; level: string }> = [];

    // إضافة صلاحيات الوحدات
    for (const [moduleKey, level] of Object.entries(permModules)) {
      if (level && level !== "read") {
        permissions.push({ moduleKey, level });
      }
    }

    // إضافة الخدمات المخفية
    for (const svc of permHiddenServices) {
      permissions.push({ moduleKey: `service:${svc}`, level: "hidden" });
    }

    try {
      const res = await fetch(`/api/users/${permUserId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permissions }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(lang === "ar"
          ? `تم حفظ الصلاحيات بنجاح. على المستخدم «${permUsername}» إعادة تسجيل الدخول لتطبيق التغييرات.`
          : `Permissions saved. User «${permUsername}» must re-login for changes to take effect.`
        );
        setPermOpen(false);
        setPermUserId(null);
      } else {
        const msg = data.error === "cannot_modify_manager"
          ? (lang === "ar" ? "لا يمكن تعديل صلاحيات المدير العام" : "Cannot modify manager permissions")
          : (lang === "ar" ? "فشل الحفظ" : "Failed to save");
        toast.error(msg);
      }
    } catch (err) {
      toast.error(lang === "ar" ? "فشل الحفظ" : "Failed to save");
    }
    setPermSaving(false);
  };

  const toggleServiceHidden = (serviceType: string) => {
    const next = new Set(permHiddenServices);
    if (next.has(serviceType)) next.delete(serviceType);
    else next.add(serviceType);
    setPermHiddenServices(next);
  };

  const setModuleLevel = (moduleKey: string, level: PermissionLevel) => {
    const next = { ...permModules };
    if (level === "read") {
      delete next[moduleKey]; // read = الافتراضي، لا حاجة لحفظه
    } else {
      next[moduleKey] = level;
    }
    setPermModules(next);
  };

  const openEdit = (e: any) => {
    const linkedUser = users.find((u: any) => u.employeeId === e.id);
    setEditForm({
      fullName: e.fullName,
      username: linkedUser?.username ?? "",
      password: "",
    });
    setEditId(e.id);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editId) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/employees/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: editForm.fullName,
          username: editForm.username,
          password: editForm.password || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(lang === "ar" ? "تم تعديل بيانات الموظف" : "Employee updated");
        setEditOpen(false);
        setEditId(null);
        // تحديث البيانات
        window.location.reload();
      } else {
        const msg = data.error === "username_exists" ? tr(lang, "err_username_exists") : lang === "ar" ? "فشل التعديل" : "Failed";
        toast.error(msg);
      }
    } catch {
      toast.error(lang === "ar" ? "فشل التعديل" : "Failed");
    }
    setEditSaving(false);
  };

  if (!isManager) {
    return (
      <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Card className="border-border card-shadow">
          <CardContent className="p-12 text-center">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{tr(lang, "only_manager_can_manage")}</h3>
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "صفحة إدارة الموظفين متاحة للمدير العام فقط." : "Employee management is only available to the General Manager."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_employees")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{lang === "ar" ? `إجمالي الموظفين: ${employees.length}` : `Total employees: ${employees.length}`}</p>
        </div>
        <Button className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2 shadow-sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          {tr(lang, "create_employee")}
        </Button>
      </div>

      <Card className="border-border card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{tr(lang, "employee_name")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "employee_number")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "username")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "role")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                  <TableHead className="text-xs font-semibold text-end">{tr(lang, "actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12"><div className="flex flex-col items-center gap-3 text-muted-foreground"><div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center"><Plus className="w-6 h-6" /></div><p className="text-sm">{tr(lang, "empty_employees")}</p></div></TableCell></TableRow>
                ) : (
                  employees.map((e: any) => {
                    const linkedUser = users.find((u: any) => u.employeeId === e.id);
                    return (
                      <TableRow key={e.id} className="hover:bg-accent/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pastel-sky to-pastel-sky flex items-center justify-center text-pastel-sky font-bold text-sm">{e.fullName.charAt(0)}</div>
                            <div><div className="font-medium text-foreground text-sm">{e.fullName}</div><div className="text-[11px] text-muted-foreground">{e.jobTitle}</div></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{e.employeeNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">@{linkedUser?.username ?? "—"}</TableCell>
                        <TableCell>{linkedUser && <Badge variant="secondary" className={roleColor(linkedUser.role)}>{roleLabel(linkedUser.role)}</Badge>}</TableCell>
                        <TableCell>{linkedUser && <Badge variant="secondary" className={linkedUser.isActive ? "bg-pastel-mint text-pastel-mint" : "bg-muted text-muted-foreground"}>{linkedUser.isActive ? tr(lang, "active") : tr(lang, "inactive")}</Badge>}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex items-center justify-end gap-1">
                            {linkedUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-violet-600"
                                title={tr(lang, "edit_permissions")}
                                onClick={() => openPermissions(linkedUser.id, linkedUser.username, linkedUser.role)}
                              >
                                <Settings2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title={lang === "ar" ? "تعديل" : "Edit"} onClick={() => openEdit(e)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title={tr(lang, "action_delete")} onClick={() => setDeleteId(e.id)}>
                              <Trash2 className="w-4 h-4" />
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

      {/* Create Employee Dialog — اسم الموظف ← اسم المستخدم ← الدور ← كلمة مرور الموظف */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />{tr(lang, "create_employee")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_employee_name")} *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-background" placeholder={lang === "ar" ? "الاسم الكامل" : "Full name"} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_username")} *</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="bg-background num" placeholder="username" dir="ltr" />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "role")} *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">{tr(lang, "role_general_manager")}</SelectItem>
                  <SelectItem value="booking_officer">{tr(lang, "role_booking")}</SelectItem>
                  <SelectItem value="accountant">{tr(lang, "role_accountant")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_employee_password")} *</Label>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-background pe-9" dir="ltr" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 end-3 my-auto text-muted-foreground hover:text-foreground">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "لن تظهر كلمة المرور لاحقاً في أي جدول أو سجل." : "Password will not be shown later in any table or log."}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={submit} disabled={saving} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {tr(lang, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تعديل بيانات الموظف — الاسم + اسم المستخدم + كلمة المرور فقط */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              {lang === "ar" ? "تعديل بيانات الموظف" : "Edit Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_employee_name")} *</Label>
              <Input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} className="bg-background" placeholder={lang === "ar" ? "الاسم الكامل" : "Full name"} />
            </div>
            <div className="space-y-1.5">
              <Label>{tr(lang, "f_username")} *</Label>
              <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="bg-background num" placeholder="username" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{lang === "ar" ? "كلمة المرور الجديدة (اتركها فارغة لعدم التغيير)" : "New Password (leave empty to keep)"}</Label>
              <div className="relative">
                <Input type={showEditPwd ? "text" : "password"} value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="bg-background pe-9" dir="ltr" placeholder="••••••" />
                <button type="button" onClick={() => setShowEditPwd(!showEditPwd)} className="absolute inset-y-0 end-3 my-auto text-muted-foreground hover:text-foreground">{showEditPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "اتركها فارغة إذا كنت لا تريد تغيير كلمة المرور." : "Leave empty if you don't want to change the password."}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={submitEdit} disabled={editSaving} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {tr(lang, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr(lang, "action_delete")}</AlertDialogTitle>
            <AlertDialogDescription>{lang === "ar" ? "سيتم الحفاظ على السجل التاريخي للعمليات. هل أنت متأكد؟" : "Historical records will be preserved. Are you sure?"}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr(lang, "cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{tr(lang, "action_delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* نافذة الصلاحيات الدقيقة — قراءة/كتابة/تعديل/حذف/إخفاء خدمات/إخفاء قوائم */}
      <Dialog open={permOpen} onOpenChange={(o) => { setPermOpen(o); if (!o) { setPermUserId(null); setPermModules({}); setPermHiddenServices(new Set()); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              {tr(lang, "granular_permissions")}
              <Badge variant="secondary" className="bg-pastel-lilac text-pastel-lilac text-[11px] ms-2 num">@{permUsername}</Badge>
            </DialogTitle>
          </DialogHeader>

          {permLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="flex-1 max-h-[65vh] pe-3">
              <div className="space-y-5 py-2">
                {/* القسم الأول: صلاحيات الوحدات */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{tr(lang, "permissions_for_modules")}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">{tr(lang, "permission_level_label")}</p>
                  <div className="space-y-2">
                    {[
                      { key: "services", labelKey: "module_services" },
                      { key: "customers", labelKey: "module_customers" },
                      { key: "agents_companies", labelKey: "module_agents_companies" },
                      { key: "finance", labelKey: "module_finance" },
                      { key: "monitoring", labelKey: "module_monitoring" },
                      { key: "visa_expiry", labelKey: "module_visa_expiry" },
                      { key: "statistics", labelKey: "module_statistics" },
                      { key: "policies", labelKey: "module_policies" },
                    ].map((mod) => {
                      const currentLevel = permModules[mod.key] ?? "read";
                      const levels: PermissionLevel[] = ["read", "write", "update", "delete", "full", "hidden"];
                      return (
                        <div key={mod.key} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-accent/20">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{tr(lang, mod.labelKey)}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {levels.map((lvl) => {
                              const isActive = currentLevel === lvl;
                              const colorClass =
                                lvl === "hidden" ? "bg-muted text-muted-foreground border-muted"
                                : lvl === "delete" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"
                                : lvl === "full" ? "bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800"
                                : lvl === "write" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"
                                : lvl === "update" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900"
                                : isActive ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-background text-muted-foreground border-border";
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setModuleLevel(mod.key, lvl)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${isActive ? colorClass + " ring-1 ring-offset-0" : "bg-background text-muted-foreground border-border hover:bg-accent/40"}`}
                                >
                                  {tr(lang, `perm_${lvl}`)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* القسم الثاني: إخفاء الخدمات الفردية */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 mb-2 mt-3">
                    <Ban className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-foreground">{tr(lang, "permissions_for_services")}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">{tr(lang, "hide_service_help")}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allServiceTypes.map((svc) => {
                      const isHidden = permHiddenServices.has(svc);
                      const labelKey = serviceTypeLabels[svc as keyof typeof serviceTypeLabels] || svc;
                      return (
                        <label
                          key={svc}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-xs ${isHidden ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900" : "border-border hover:bg-accent/20"}`}
                        >
                          <Switch
                            checked={isHidden}
                            onCheckedChange={() => toggleServiceHidden(svc)}
                            className="scale-75"
                          />
                          <span className={`flex-1 truncate ${isHidden ? "text-orange-700 dark:text-orange-400 line-through" : "text-foreground"}`}>
                            {tr(lang, labelKey)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setPermOpen(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={savePermissions} disabled={permSaving || permLoading} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2">
              {permSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {tr(lang, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
