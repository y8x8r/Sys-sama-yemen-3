import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

/** GET /api/expenses — قائمة المصروفات */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const expenses = await db.expense.findMany({
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    expenses: expenses.map((e) => ({
      id: e.id,
      expenseNumber: e.expenseNumber,
      category: e.category,
      description: e.description,
      beneficiary: e.beneficiary,
      amount: e.amount,
      currency: e.currency,
      method: e.method,
      reference: e.reference,
      status: e.status,
      paidAt: e.paidAt.toISOString(),
      createdAt: e.createdAt.toISOString(),
      createdBy: e.createdBy,
    })),
  });
}

/**
 * POST /api/expenses — إضافة مصروف
 *
 * الحقول بالترتيب: رقم المصروف (تلقائي) ← غرض الصرف ← تاريخ الصرف ← المبلغ
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const body = await req.json();
  const { purpose, paidAt, amount, currency } = body;

  if (!purpose?.trim() || !paidAt || !amount || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 }
    );
  }

  const seq = (await db.expense.count()) + 1;
  const expenseNumber = `EXP-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`;

  const expense = await db.expense.create({
    data: {
      expenseNumber,
      category: purpose,
      description: purpose,
      beneficiary: "—",
      amount,
      currency: currency || "SAR",
      method: "cash",
      status: "approved",
      paidAt: new Date(paidAt),
      createdBy: user.username,
    },
  });

  await logAudit(user, "إضافة مصروف", "expenses", `إضافة مصروف ${expense.expenseNumber} — ${purpose} (${amount} ${currency})`, "expense", expense.id);

  return NextResponse.json({
    ok: true,
    expense: {
      id: expense.id,
      expenseNumber: expense.expenseNumber,
      category: expense.category,
      description: expense.description,
      beneficiary: expense.beneficiary,
      amount: expense.amount,
      currency: expense.currency,
      method: expense.method,
      reference: expense.reference,
      status: expense.status,
      paidAt: expense.paidAt.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      createdBy: expense.createdBy,
    },
  });
}
