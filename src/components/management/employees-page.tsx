"use client";

import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function EmployeesPage() {
  const lang = useAppStore((s) => s.lang);
  const employees = useAppStore((s) => s.employees);
  const users = useAppStore((s) => s.users);

  const roleLabel = (r: string) =>
    r === "manager" ? tr(lang, "role_manager") : r === "accountant" ? tr(lang, "role_accountant") : tr(lang, "role_booking");

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_employees")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? `إجمالي الموظفين: ${employees.length}` : `Total employees: ${employees.length}`}
        </p>
      </div>

      <Card className="border-border card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{tr(lang, "employee_name")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "employee_number")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "f_start_date")}</TableHead>
                  <TableHead className="text-xs font-semibold">{lang === "ar" ? "الوظيفة" : "Job Title"}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "role")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e) => {
                  const linkedUser = users.find((u) => u.employeeId === e.id);
                  return (
                    <TableRow key={e.id} className="hover:bg-accent/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] flex items-center justify-center text-[#0EA5E9] font-bold text-sm">
                            {e.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">{e.fullName}</div>
                            {linkedUser && (
                              <div className="text-[11px] text-muted-foreground num">@{linkedUser.username}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground num">{e.employeeNumber}</TableCell>
                      <TableCell className="text-sm text-muted-foreground num">{e.hiredOn}</TableCell>
                      <TableCell className="text-sm text-foreground">{e.jobTitle}</TableCell>
                      <TableCell>
                        {linkedUser && (
                          <Badge variant="secondary" className="bg-[#F3E8FF] text-[#6D28D9]">
                            {roleLabel(linkedUser.role)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={e.isActive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-muted text-muted-foreground"}>
                          {e.isActive ? tr(lang, "active") : tr(lang, "inactive")}
                        </Badge>
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
