import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "../login/route";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("sama_session")?.value;
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (session) {
      // تسجيل الخروج في سجل التدقيق
      await db.auditLog.create({
        data: {
          actorUsername: session.username,
          actorRole: session.role,
          actorUserId: session.userId,
          action: "تسجيل خروج",
          moduleKey: "auth",
          entityType: "user",
          entityId: session.userId,
          summary: "تسجيل خروج",
        },
      });
      sessions.delete(sessionId);
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("sama_session");
  return response;
}
