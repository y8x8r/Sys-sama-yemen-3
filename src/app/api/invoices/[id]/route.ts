import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

/** GET /api/invoices/[id] — فاتورة واحدة مع التفاصيل */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      service: true,
      payments: { where: { status: "approved" } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      serviceId: invoice.serviceId,
      serviceType: invoice.serviceType,
      serviceNumber: invoice.serviceNumber,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      remainingAmount: invoice.remainingAmount,
      currency: invoice.currency,
      status: invoice.status,
      issuedAt: invoice.issuedAt.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      service: invoice.service ? {
        id: invoice.service.id,
        serviceNumber: invoice.service.serviceNumber,
        details: JSON.parse(invoice.service.details || "{}"),
        notes: invoice.service.notes,
      } : null,
      payments: invoice.payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: p.amount,
        method: p.method,
        receivedAt: p.receivedAt.toISOString(),
      })),
    },
  });
}
