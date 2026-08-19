import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { serviceConfigs } from "@/components/services/service-configs";
import { tr } from "@/lib/translations";

/**
 * GET /api/print/invoice?id=<invoiceId>
 *
 * يُرجع HTML قابل للطباعة لفاتورة واحدة.
 * - يدعم RTL والعربية
 * - اسم المكتب بخط كبير وواضح
 * - يعرض بيانات العميل والخدمة والمبالغ
 * - نظيف: بدون أزرار × أو إلغاء أو طباعة
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      service: true,
      payments: { where: { status: "approved" } },
    },
  });

  if (!invoice) {
    // منع عرض قالب فارغ — عرض رسالة واضحة بدلاً منه
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>فواتير غير موجودة</title>
<style>
  body { font-family: 'Cairo', Arial, sans-serif; padding: 60px; text-align: center; color: #1F2937; }
  .alert { max-width: 500px; margin: 0 auto; padding: 30px; border: 2px solid #EF4444; border-radius: 12px; background: #FEF2F2; }
  .icon { font-size: 48px; color: #EF4444; margin-bottom: 16px; }
  h1 { color: #EF4444; margin-bottom: 8px; }
  p { color: #64748B; }
</style>
</head>
<body>
  <div class="alert">
    <div class="icon">⚠</div>
    <h1>بيانات الفاتورة غير موجودة</h1>
    <p>تعذر إنشاء نسخة الطباعة — الفاتورة المطلوبة غير موجودة أو تم حذفها.</p>
    <p style="font-size: 11px; color: #94A3B8; margin-top: 20px;">جميع الحقوق محفوظة لدى Sky Link 2026</p>
  </div>
</body>
</html>`;
    return new NextResponse(html, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // التحقق من اكتمال البيانات الأساسية للفاتورة
  if (!invoice.invoiceNumber || !invoice.customerId || invoice.totalAmount === undefined) {
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>بيانات الفاتورة غير مكتملة</title>
<style>
  body { font-family: 'Cairo', Arial, sans-serif; padding: 60px; text-align: center; color: #1F2937; }
  .alert { max-width: 500px; margin: 0 auto; padding: 30px; border: 2px solid #F97316; border-radius: 12px; background: #FFF7ED; }
  .icon { font-size: 48px; color: #F97316; margin-bottom: 16px; }
  h1 { color: #F97316; margin-bottom: 8px; }
  p { color: #64748B; }
</style>
</head>
<body>
  <div class="alert">
    <div class="icon">⚠</div>
    <h1>بيانات الفاتورة غير مكتملة</h1>
    <p>تعذر إنشاء نسخة الطباعة — بيانات الفاتورة غير مكتملة.</p>
    <p style="font-size: 11px; color: #94A3B8; margin-top: 20px;">جميع الحقوق محفوظة لدى Sky Link 2026</p>
  </div>
</body>
</html>`;
    return new NextResponse(html, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // جلب بيانات العميل
  const customer = await db.customer.findUnique({ where: { id: invoice.customerId } });

  // إعداد تفاصيل الخدمة
  const cfg = serviceConfigs[invoice.serviceType as keyof typeof serviceConfigs];
  const serviceDetails = invoice.service ? JSON.parse(invoice.service.details || "{}") : {};
  const serviceNotes = invoice.service?.notes ?? "";

  // ترجمة تسميات تفاصيل الخدمة
  const detailRows: Array<{ label: string; value: string }> = [];
  if (cfg) {
    for (const f of cfg.fields) {
      const v = serviceDetails[f.name];
      if (v === undefined || v === null || v === "") continue;
      let display: string = String(v);
      if (f.type === "select" && f.options) {
        const opt = f.options.find((o) => o.value === v);
        if (opt) display = tr("ar", opt.labelKey);
      }
      detailRows.push({ label: tr("ar", f.labelKey), value: display });
    }
  }

  const statusLabelAr = (s: string) =>
    s === "paid" ? "مدفوعة" : s === "partial" ? "جزئية" : s === "issued" ? "صادرة" : "مسودة";

  const currencySymbol = (c: string) => (c === "SAR" ? "ر.س" : c === "YER" ? "ر.ي" : "$");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>فاتورة ${invoice.invoiceNumber}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; color: #1F2937; margin: 0; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #7C3AED; padding-bottom: 20px; }
  .office-name { font-size: 32px; font-weight: bold; color: #7C3AED; margin-bottom: 5px; }
  .invoice-label { font-size: 14px; color: #64748B; margin: 0; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .meta-block { }
  .meta-label { font-size: 12px; color: #64748B; margin: 0; }
  .meta-value { font-size: 16px; font-weight: bold; margin: 5px 0 0 0; }
  .customer { margin-bottom: 20px; padding: 12px; background: #F8F9FC; border-radius: 8px; }
  .customer-label { font-size: 12px; color: #64748B; margin: 0; }
  .customer-value { font-size: 16px; font-weight: bold; margin: 5px 0 0 0; }
  .section-title { font-size: 14px; font-weight: 600; color: #6D28D9; margin: 20px 0 10px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #F3E8FF; color: #6D28D9; padding: 12px 8px; text-align: right; font-size: 13px; font-weight: 600; border: 1px solid #E2E8F0; }
  td { padding: 10px 8px; text-align: right; font-size: 13px; border: 1px solid #E2E8F0; }
  .totals { margin-top: 20px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0; }
  .total-row.bold { font-weight: bold; font-size: 16px; border-top: 2px solid #7C3AED; border-bottom: none; padding-top: 12px; }
  .status-paid { color: #10B981; }
  .status-partial { color: #EAB308; }
  .status-issued { color: #3B82F6; }
  .notes { margin-top: 20px; padding: 12px; background: #FEF9C3; border-radius: 8px; font-size: 12px; color: #92400E; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 15px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="office-name">سما اليمن للسفريات والسياحة</div>
    <p class="invoice-label">فاتورة رسمية</p>
  </div>

  <div class="meta">
    <div class="meta-block">
      <p class="meta-label">رقم الفاتورة</p>
      <p class="meta-value">${invoice.invoiceNumber}</p>
    </div>
    <div class="meta-block" style="text-align: left;">
      <p class="meta-label">تاريخ الإصدار</p>
      <p class="meta-value">${new Date(invoice.issuedAt).toLocaleDateString("en-GB")}</p>
    </div>
  </div>

  <div class="customer">
    <p class="customer-label">العميل</p>
    <p class="customer-value">${invoice.customerName}</p>
    ${customer ? `<p class="meta-label" style="margin-top: 5px;">${customer.customerNumber} • ${customer.phoneNumber}</p>` : ""}
  </div>

  ${detailRows.length > 0 ? `
  <div class="section-title">تفاصيل الخدمة</div>
  <table>
    <thead>
      <tr>
        <th>البند</th>
        <th>القيمة</th>
      </tr>
    </thead>
    <tbody>
      ${detailRows.map((r) => `<tr><td>${r.label}</td><td>${r.value}</td></tr>`).join("")}
    </tbody>
  </table>
  ` : ""}

  <div class="totals">
    <div class="total-row">
      <span>الإجمالي</span>
      <span>${invoice.totalAmount.toLocaleString("en-US")} ${currencySymbol(invoice.currency)}</span>
    </div>
    <div class="total-row">
      <span>المدفوع</span>
      <span class="status-paid">${invoice.paidAmount.toLocaleString("en-US")} ${currencySymbol(invoice.currency)}</span>
    </div>
    <div class="total-row">
      <span>المتبقي</span>
      <span style="color: #F97316;">${invoice.remainingAmount.toLocaleString("en-US")} ${currencySymbol(invoice.currency)}</span>
    </div>
    <div class="total-row bold">
      <span>الحالة</span>
      <span class="status-${invoice.status}">${statusLabelAr(invoice.status)}</span>
    </div>
  </div>

  ${serviceNotes ? `<div class="notes"><strong>ملاحظات:</strong> ${serviceNotes}</div>` : ""}

  <div class="footer">جميع الحقوق محفوظة لدى Sky Link 2026</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
