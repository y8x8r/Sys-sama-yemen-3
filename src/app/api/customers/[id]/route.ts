import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

/** PUT /api/customers/[id] — تعديل عميل */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await db.customer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const updated = await db.customer.update({
    where: { id },
    data: {
      fullName: body.fullName?.trim() ?? existing.fullName,
      phoneNumber: body.phoneNumber?.trim() ?? existing.phoneNumber,
      passportNumber: body.passportNumber ?? existing.passportNumber,
      nationalId: body.nationalId ?? existing.nationalId,
      cardNumber: body.cardNumber ?? existing.cardNumber,
      referralSource: body.referralSource ?? existing.referralSource,
    },
  });

  await logAudit(user, "تعديل عميل", "customers", `تعديل بيانات العميل: ${updated.fullName}`, "customer", id, existing, updated);

  return NextResponse.json({
    ok: true,
    customer: {
      id: updated.id,
      customerNumber: updated.customerNumber,
      fullName: updated.fullName,
      phoneNumber: updated.phoneNumber,
      passportNumber: updated.passportNumber,
      nationalId: updated.nationalId,
      cardNumber: updated.cardNumber,
      joinedOn: updated.joinedOn.toISOString().split("T")[0],
      referralSource: updated.referralSource,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}

/** DELETE /api/customers/[id] — حذف عميل (مع الحفاظ على السجل التاريخي) */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { id } = await params;
  const existing = await db.customer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // تعطيل العميل بدلاً من حذفه للحفاظ على السجل التاريخي
  await db.customer.update({
    where: { id },
    data: { isActive: false },
  });

  await logAudit(user, "حذف عميل", "customers", `حذف العميل: ${existing.fullName} (مع الحفاظ على السجل التاريخي)`, "customer", id);

  return NextResponse.json({ ok: true });
}
