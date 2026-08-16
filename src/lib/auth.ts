import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";
import { sessions } from "../app/api/auth/login/route";

export interface SessionUser {
  userId: string;
  username: string;
  role: string;
}

/** الحصول على المستخدم الحالي من الجلسة */
export async function getCurrentUser(req: NextRequest): Promise<SessionUser | null> {
  const sessionId = req.cookies.get("sama_session")?.value;
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;

  // التحقق من أن المستخدم لا يزال نشطاً
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) {
    sessions.delete(sessionId);
    return null;
  }

  return { userId: user.id, username: user.username, role: user.role };
}

/** التحقق من الصلاحية — مدير عام فقط */
export function requireManager(user: SessionUser | null) {
  return user?.role === "manager";
}

/** تسجيل عملية في سجل التدقيق */
export async function logAudit(
  user: SessionUser,
  action: string,
  moduleKey: string,
  summary: string,
  entityType: string = "",
  entityId?: string,
  beforeData?: object,
  afterData?: object
) {
  await db.auditLog.create({
    data: {
      actorUsername: user.username,
      actorRole: user.role,
      actorUserId: user.userId,
      action,
      moduleKey,
      entityType,
      entityId,
      summary,
      beforeData: beforeData ? JSON.stringify(beforeData) : null,
      afterData: afterData ? JSON.stringify(afterData) : null,
    },
  });
}

/** توليد رقم تسلسلي */
export function genNumber(prefix: string, seq: number, year: number = new Date().getFullYear()): string {
  return `${prefix}-${year}-${String(seq).padStart(5, "0")}`;
}

/** الحصول على الرقم التسلسلي التالي لنموذج */
export async function nextSeq(model: string): Promise<number> {
  const counters: Record<string, () => Promise<number>> = {
    customers: async () => {
      const count = await db.customer.count();
      return count + 1;
    },
    services: async () => {
      const count = await db.serviceRecord.count();
      return count + 1;
    },
    invoices: async () => {
      const count = await db.invoice.count();
      return count + 1;
    },
    payments: async () => {
      const count = await db.payment.count();
      return count + 1;
    },
    expenses: async () => {
      const count = await db.expense.count();
      return count + 1;
    },
    employees: async () => {
      const count = await db.employee.count();
      return count + 1;
    },
  };
  return counters[model]?.() ?? 1;
}
