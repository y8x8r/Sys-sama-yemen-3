"use client";

import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Shield, Lock, UserCog, KeyRound } from "lucide-react";

export function UsersPermissionsPage() {
  const lang = useAppStore((s) => s.lang);
  const users = useAppStore((s) => s.users);
  const employees = useAppStore((s) => s.employees);

  const roleLabel = (r: string) =>
    r === "manager" ? tr(lang, "role_manager") : r === "accountant" ? tr(lang, "role_accountant") : tr(lang, "role_booking");

  const roleColor = (r: string) =>
    r === "manager" ? "bg-[#F3E8FF] text-[#6D28D9]"
    : r === "accountant" ? "bg-[#FFEDD5] text-[#F97316]"
    : "bg-[#ECFDF5] text-[#10B981]";

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_users_permissions")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar"
              ? "إنشاء حسابات الموظفين وتحديد الأدوار والصلاحيات. التطبيق في الخلفية على كل Endpoint."
              : "Create employee accounts and assign roles & permissions. Enforced in backend on every endpoint."}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          {tr(lang, "add_user")}
        </Button>
      </div>

      {/* Permissions matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { role: "manager", label: tr(lang, "role_manager"), icon: Shield, color: "#7C3AED", bg: "#F3E8FF", perms: [
            lang === "ar" ? "صلاحيات كاملة" : "Full access",
            lang === "ar" ? "إدارة المستخدمين" : "Manage users",
            lang === "ar" ? "التقارير والاعتمادات" : "Reports & approvals",
            lang === "ar" ? "سجل التدقيق" : "Audit log",
            lang === "ar" ? "الإعدادات" : "Settings",
          ] },
          { role: "accountant", label: tr(lang, "role_accountant"), icon: KeyRound, color: "#F97316", bg: "#FFEDD5", perms: [
            lang === "ar" ? "الإيرادات والمصروفات" : "Revenues & expenses",
            lang === "ar" ? "المدفوعات والفواتير" : "Payments & invoices",
            lang === "ar" ? "قراءة الوحدات التشغيلية" : "Read operational units",
            lang === "ar" ? "التقارير المالية" : "Financial reports",
          ] },
          { role: "booking_officer", label: tr(lang, "role_booking"), icon: UserCog, color: "#10B981", bg: "#ECFDF5", perms: [
            lang === "ar" ? "إدخال الخدمات" : "Enter services",
            lang === "ar" ? "بحث العملاء" : "Search customers",
            lang === "ar" ? "طباعة المستندات" : "Print documents",
          ] },
        ].map((r) => (
          <Card key={r.role} className="border-border card-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: r.bg }}
                >
                  <r.icon className="w-5 h-5" style={{ color: r.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground num">
                    {users.filter((u) => u.role === r.role).length} {lang === "ar" ? "مستخدم" : "users"}
                  </p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {r.perms.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users table */}
      <Card className="border-border card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{tr(lang, "employee_name")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "username")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "role")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                  <TableHead className="text-xs font-semibold">{lang === "ar" ? "آخر دخول" : "Last Login"}</TableHead>
                  <TableHead className="text-xs font-semibold text-end">{tr(lang, "actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const emp = employees.find((e) => e.id === u.employeeId);
                  return (
                    <TableRow key={u.id} className="hover:bg-accent/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] flex items-center justify-center text-[#6D28D9] font-bold text-sm">
                            {emp?.fullName.charAt(0) ?? u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">{emp?.fullName ?? u.username}</div>
                            <div className="text-[11px] text-muted-foreground num">{emp?.employeeNumber}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground num">@{u.username}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColor(u.role)}>
                          {roleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={u.isActive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-muted text-muted-foreground"}>
                          {u.isActive ? tr(lang, "active") : tr(lang, "inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground num">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-GB") : "—"}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Lock className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
