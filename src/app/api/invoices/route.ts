import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

/** GET /api/invoices — قائمة الفواتير */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;

  const invoices = await db.invoice.findMany({
    where,
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    invoices: invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      customerId: i.customerId,
      customerName: i.customerName,
      serviceId: i.serviceId,
      serviceType: i.serviceType,
      serviceNumber: i.serviceNumber,
      totalAmount: i.totalAmount,
      paidAmount: i.paidAmount,
      remainingAmount: i.remainingAmount,
      currency: i.currency,
      status: i.status,
      issuedAt: i.issuedAt.toISOString(),
      createdAt: i.createdAt.toISOString(),
    })),
  });
}

/** PUT /api/invoices/[id] — تعديل فاتورة + تزامن الدفعة */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await db.invoice.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const totalAmount = body.totalAmount ?? existing.totalAmount;
  const paidAmount = body.paidAmount ?? existing.paidAmount;
  const status = body.status ?? existing.status;

  try {
    const result = await db.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: {
          totalAmount,
          paidAmount,
          remainingAmount: totalAmount - paidAmount,
          status,
        },
      });

      // تحديث الخدمة المرتبطة
      await tx.serviceRecord.update({
        where: { id: existing.serviceId },
        data: {
          price: totalAmount,
          paid: paidAmount,
          remaining: totalAmount - paidAmount,
        },
      });

      // تحديث الدفعة المرتبطة
      const existingPayment = await tx.payment.findFirst({
        where: { invoiceId: id, status: "approved" },
      });

      if (paidAmount > 0) {
        if (existingPayment) {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: { amount: paidAmount },
          });
        } else {
          const seqPayment = await tx.payment.count() + 1;
          const paymentNumber = `PAY-${new Date().getFullYear()}-${String(seqPayment).padStart(5, "0")}`;
          await tx.payment.create({
            data: {
              paymentNumber,
              customerId: existing.customerId,
              customerName: existing.customerName,
              invoiceId: id,
              invoiceNumber: existing.invoiceNumber,
              serviceId: existing.serviceId,
              serviceNumber: existing.serviceNumber,
              amount: paidAmount,
              currency: existing.currency,
              method: "cash",
              status: "approved",
            },
          });
        }
      }

      return updated;
    });

    await logAudit(user, "تعديل فاتورة", "invoices", `تعديل الفاتورة: ${existing.invoiceNumber}`, "invoice", id, existing, result);

    return NextResponse.json({ ok: true, invoice: result });
  } catch (err) {
    console.error("Update invoice error:", err);
    return NextResponse.json({ ok: false, error: "update_failed", details: String(err) }, { status: 500 });
  }
}

/** DELETE /api/invoices/[id] — حذف فاتورة */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { id } = await params;
  const existing = await db.invoice.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  await db.invoice.delete({ where: { id } });

  await logAudit(user, "حذف فاتورة", "invoices", `حذف الفاتورة: ${existing.invoiceNumber}`, "invoice", id);

  return NextResponse.json({ ok: true });
}
