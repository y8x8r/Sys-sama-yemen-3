export const dynamic = "force-dynamic";
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
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });
  if (user.role !== "manager") {
    return NextResponse.json({ ok: false, error: "only_manager_can_manage" }, { status: 403 });
  }

  const body = await req.json();
  const { fullName, username, role, password } = body;

  const cleanUsername = username?.trim();

  if (!fullName?.trim() || !cleanUsername || !password || password.length < 4) {
    return NextResponse.json(
      { ok: false, error: "missing_fields_or_short_password" },
      { status: 400 }
    );
  }

  // التحقق من عدم وجود مستخدم "نشط" بنفس الاسم
  const activeUser = await db.user.findFirst({
    where: { username: cleanUsername, isActive: true },
  });

  if (activeUser) {
    return NextResponse.json({ ok: false, error: "اسم المستخدم محجوز لموظف آخر" }, { status: 400 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // تحرير الاسم إذا كان يتبع لموظف محذوف
      const inactiveUsers = await tx.user.findMany({
        where: { username: cleanUsername, isActive: false },
      });

      for (const oldUser of inactiveUsers) {
        await tx.user.update({
          where: { id: oldUser.id },
          data: { username: `${cleanUsername}_del_${Date.now()}` },
        });
      }

      // توليد رقم الموظف
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
          username: cleanUsername,
          passwordHash: password,
          role,
          employeeId: employee.id,
          isActive: true,
          mustChangePassword: false,
        },
      });

      return { employee, user: newUser };
    });

    await logAudit(user, "إنشاء حساب موظف", "users", `إنشاء حساب للموظف ${result.employee.fullName}`, "user", result.user.id);

    // إرجاع بيانات الموظف ليظهر في الواجهة مباشرة
    return NextResponse.json({
      ok: true,
      employee: {
        id: result.employee.id,
        employeeNumber: result.employee.employeeNumber,
        fullName: result.employee.fullName,
        hiredOn: result.employee.hiredOn.toISOString().split("T")[0],
        jobTitle: result.employee.jobTitle,
        isActive: result.employee.isActive,
        createdAt: result.employee.createdAt.toISOString(),
        linkedUser: {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
          isActive: result.user.isActive,
          lastLoginAt: result.user.lastLoginAt?.toISOString() ?? null,
        },
      },
    });
  } catch (err) {
    console.error("Create employee error:", err);
    return NextResponse.json({ ok: false, error: "create_failed", details: String(err) }, { status: 500 });
  }
}