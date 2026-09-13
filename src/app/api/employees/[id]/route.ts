import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

/**
 * DELETE /api/employees/[id] — حذف موظف نهائياً مع إلغاء جميع صلاحياته
 *
 * يقوم بـ:
 *   1. حذف صلاحيات المستخدم (user_permissions)
 *   2. تعطيل حساب المستخدم المرتبط (users.isActive = false)
 *   3. حذف الموظف من جدول employees
 *
 * المدير العام فقط يستطيع الحذف.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  if (user.role !== "manager") {
    return NextResponse.json({ ok: false, error: "only_manager_can_delete" }, { status: 403 });
  }

  const { id } = await params;

  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  try {
    await db.$transaction(async (tx) => {
      // 1. البحث عن المستخدم المرتبط
      const linkedUser = await tx.user.findFirst({ where: { employeeId: id } });

      if (linkedUser) {
        // 2. حذف جميع صلاحيات المستخدم
        await tx.userPermission.deleteMany({ where: { userId: linkedUser.id } });
        // 3. تعطيل حساب المستخدم
        await tx.user.update({
          where: { id: linkedUser.id },
          data: { isActive: false, employeeId: null },
        });
      }

      // 4. حذف الموظف
      await tx.employee.delete({ where: { id } });
    });

    await logAudit(user, "حذف موظف", "users", `حذف الموظف: ${employee.fullName} (${employee.employeeNumber}) مع إلغاء جميع صلاحياته`, "employee", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete employee error:", err);
    return NextResponse.json({ ok: false, error: "delete_failed", details: String(err) }, { status: 500 });
  }
}
