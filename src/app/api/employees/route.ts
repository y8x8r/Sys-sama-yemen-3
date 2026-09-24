export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

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

  const cleanUsername = username?.trim().toLowerCase();

  if (!fullName?.trim() || !cleanUsername || !password || password.length < 4) {
    return NextResponse.json(
      { ok: false, error: "missing_fields_or_short_password" },
      { status: 400 }
    );
  }

  // 1. التحقق من عدم وجود مستخدم "نشط" بنفس الاسم 
  const activeUser = await db.user.findFirst({
    where: {
      username: cleanUsername,
      isActive: true,
    },
  });

  if (activeUser) {
    return NextResponse.json(
      { ok: false, error: "اسم المستخدم مستخدم بالفعل لموظف نشط" },
      { status: 400 }
    );
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // 2. البحث عن أي مستخدمين معطلين (محذوفين) يحملون نفس الاسم وتحرير الاسم فوراً
      const inactiveUsers = await tx.user.findMany({
        where: {
          username: cleanUsername,
          isActive: false,
        },
      });

      for (const oldUser of inactiveUsers) {
        await tx.user.update({
          where: { id: oldUser.id },
          data: { username: `${cleanUsername}_del_${Date.now()}_${Math.floor(Math.random() * 1000)}` },
        });
      }

      // 3. حساب رقم الموظف التالي بشكل فريد وآمن لتجنب تكرار EMP-000X
      const latestEmp = await tx.employee.findFirst({
        orderBy: { createdAt: "desc" },
        select: { employeeNumber: true },
      });

      let nextNum = 1;
      if (latestEmp?.employeeNumber) {
        const match = latestEmp.employeeNumber.match(/\d+/);
        if (match) {
          nextNum = parseInt(match[0], 10) + 1;
        }
      }
      const employeeNumber = `EMP-${String(nextNum).padStart(4, "0")}`;

      // 4. إنشاء سجل الموظف
      const employee = await tx.employee.create({
        data: {
          employeeNumber,
          fullName: fullName.trim(),
          hiredOn: new Date(),
          jobTitle: role === "manager" ? "مدير عام" : role === "accountant" ? "محاسب" : "مسؤول حجوزات",
          isActive: true,
        },
      });

      // 5. إنشاء حساب المستخدم وربطه بالموظف
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

    await logAudit(
      user,
      "إنشاء حساب موظف",
      "users",
      `إنشاء حساب للموظف ${result.employee.fullName} (${result.employee.employeeNumber}) بدور: ${role === "manager" ? "مدير عام" : role === "accountant" ? "محاسب" : "مسؤول حجوزات"}`,
      "user",
      result.user.id
    );

    // التعديل هنا: إرجاع بيانات الموظف واليوزر لكي يتم إضافتها في الجدول مباشرة
    return NextResponse.json({ ok: true, employee: result.employee, user: result.user });
  } catch (err) {
    console.error("Create employee error:", err);
    return NextResponse.json({ ok: false, error: "create_failed", details: String(err) }, { status: 500 });
  }
}