import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

/** GET /api/employees — قائمة الموظفين */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const employees = await db.employee.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    employees: employees.map((e) => ({
      id: e.id,
      employeeNumber: e.employeeNumber,
      fullName: e.fullName,
      hiredOn: e.hiredOn.toISOString().split("T")[0],
      jobTitle: e.jobTitle,
      isActive: e.isActive,
      createdAt: e.createdAt.toISOString(),
      linkedUser: e.user
        ? {
            id: e.user.id,
            username: e.user.username,
            role: e.user.role,
            isActive: e.user.isActive,
            lastLoginAt: e.user.lastLoginAt?.toISOString() ?? null,
          }
        : null,
    })),
    users: employees.filter((e) => e.user).map((e) => ({
      id: e.user!.id,
      username: e.user!.username,
      role: e.user!.role,
      employeeId: e.user!.employeeId,
      isActive: e.user!.isActive,
      lastLoginAt: e.user!.lastLoginAt?.toISOString() ?? null,
      createdAt: e.user!.createdAt.toISOString(),
    })),
  });
}

/**
 * POST /api/employees — إنشاء حساب موظف
 *
 * الحقول بالترتيب: اسم الموظف ← اسم المستخدم ← الدور ← كلمة مرور الموظف
 * المدير العام فقط يستطيع إنشاء الحسابات.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });
  if (user.role !== "manager") {
    return NextResponse.json({ ok: false, error: "only_manager_can_manage" }, { status: 403 });
  }

  const body = await req.json();
  const { fullName, username, role, password } = body;

  if (!fullName?.trim() || !username?.trim() || !password || password.length < 4) {
    return NextResponse.json(
      { ok: false, error: "missing_fields_or_short_password" },
      { status: 400 }
    );
  }

  // التحقق من عدم تكرار اسم المستخدم — فقط للمستخدمين النشطين
  // المستخدمون المحذوفون/المعطلون لا يمنعون إعادة استخدام اسم المستخدم
  const exists = await db.user.findFirst({
    where: { username: { equals: username.trim() }, isActive: true },
  });
  if (exists) {
    return NextResponse.json({ ok: false, error: "username_exists" }, { status: 400 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // التحقق من وجود مستخدم معطلون بنفس اسم المستخدم
      // إذا وُجد، نعيد تسمية اسم المستخدم القديم لتحرير الاسم الأصلي
      // ( Prisma @unique constraint يمنع تكرار اسم المستخدم حتى لو كان معطّلاً)
      const inactiveUser = await tx.user.findFirst({
        where: { username: { equals: username.trim() }, isActive: false },
      });
      if (inactiveUser) {
        // إعادة تسمية المستخدم المعطّل بإضافة لاحقة فريدة
        const suffix = `_deleted_${Date.now()}`;
        await tx.user.update({
          where: { id: inactiveUser.id },
          data: { username: `${inactiveUser.username}${suffix}` },
        });
      }

      const seq = (await tx.employee.count()) + 1;
      const employeeNumber = `EMP-${String(seq).padStart(4, "0")}`;

      const employee = await tx.employee.create({
        data: {
          employeeNumber,
          fullName: fullName.trim(),
          hiredOn: new Date(),
          jobTitle: role === "manager" ? "مدير عام" : role === "accountant" ? "محاسب" : "مسؤول حجوزات",
          isActive: true,
        },
      });

      const newUser = await tx.user.create({
        data: {
          username: username.trim(),
          passwordHash: password,
          role,
          employeeId: employee.id,
          isActive: true,
          mustChangePassword: false,
        },
      });

      return { employee, user: newUser };
    });

    await logAudit(user, "إنشاء حساب موظف", "users", `إنشاء حساب للموظف ${result.employee.fullName} (${result.employee.employeeNumber}) بدور: ${role === "manager" ? "مدير عام" : role === "accountant" ? "محاسب" : "مسؤول حجوزات"}`, "user", result.user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Create employee error:", err);
    return NextResponse.json({ ok: false, error: "create_failed", details: String(err) }, { status: 500 });
  }
}
