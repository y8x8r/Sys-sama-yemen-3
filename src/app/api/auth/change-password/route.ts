import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "../login/route";

/** تغيير كلمة المرور للمستخدم الحالي */
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("sama_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });
  }
  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // التحقق من كلمة المرور الحالية
  if (user.passwordHash !== currentPassword) {
    return NextResponse.json({ ok: false, error: "wrong_password" }, { status: 401 });
  }

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ ok: false, error: "password_too_short" }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPassword,
      mustChangePassword: false,
    },
  });

  await db.auditLog.create({
    data: {
      actorUsername: user.username,
      actorRole: user.role,
      actorUserId: user.id,
      action: "تغيير كلمة المرور",
      moduleKey: "auth",
      entityType: "user",
      entityId: user.id,
      summary: "تغيير كلمة المرور",
    },
  });

  return NextResponse.json({ ok: true });
}
