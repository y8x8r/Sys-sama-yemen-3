import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/export?type=customers|services|invoices|payments|expenses&period=weekly|monthly|overall&serviceType=<type>&format=excel|pdf
 *
 * - Excel: CSV مع BOM لدعم العربية (يفتح في Excel بشكل منظم)
 * - PDF: نص منسق للطباعة (RTL)
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "not_authed" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "customers";
  const period = searchParams.get("period") ?? "overall";
  const serviceType = searchParams.get("serviceType");
  const format = searchParams.get("format") ?? "excel";

  // حساب الفترة الزمنية
  const now = new Date();
  const from = new Date(now);
  if (period === "weekly") from.setDate(now.getDate() - 7);
  else if (period === "monthly") from.setMonth(now.getMonth() - 1);
  else from.setFullYear(2020); // overall

  // جلب البيانات حسب النوع
  let records: any[] = [];
  let headers: string[] = [];
  let title = "";

  if (type === "customers") {
    headers = ["اسم العميل", "رقم العميل", "رقم الهاتف", "رقم الجواز", "رقم الهوية", "تاريخ الانضمام", "كيف عرف عنّا", "الحالة"];
    const customers = await db.customer.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
    });
    records = customers.map((c) => [
      c.fullName,
      c.customerNumber,
      c.phoneNumber,
      c.passportNumber ?? "",
      c.nationalId ?? "",
      c.joinedOn.toISOString().split("T")[0],
      c.referralSource ?? "",
      c.isActive ? "نشط" : "غير نشط",
    ]);
    title = "قائمة العملاء";
  } else if (type === "services") {
    headers = ["اسم العميل", "رقم المعاملة", "نوع الخدمة", "السعر", "المدفوع", "المتبقي", "العملة", "الحالة", "التاريخ"];
    const services = await db.serviceRecord.findMany({
      where: {
        createdAt: { gte: from },
        ...(serviceType && serviceType !== "all" ? { serviceType } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    records = services.map((s) => [
      s.customerName,
      s.serviceNumber,
      s.serviceType,
      String(s.price),
      String(s.paid),
      String(s.remaining),
      s.currency,
      s.status,
      s.createdAt.toISOString().split("T")[0],
    ]);
    title = serviceType ? `قائمة ${serviceType}` : "قائمة الخدمات";
  } else if (type === "invoices") {
    headers = ["رقم الفاتورة", "اسم العميل", "الإجمالي", "المدفوع", "المتبقي", "العملة", "الحالة", "التاريخ"];
    const invoices = await db.invoice.findMany({
      where: { issuedAt: { gte: from } },
      orderBy: { issuedAt: "desc" },
    });
    records = invoices.map((i) => [
      i.invoiceNumber,
      i.customerName,
      String(i.totalAmount),
      String(i.paidAmount),
      String(i.remainingAmount),
      i.currency,
      i.status,
      i.issuedAt.toISOString().split("T")[0],
    ]);
    title = "قائمة الفواتير";
  } else if (type === "payments") {
    headers = ["رقم السند", "اسم العميل", "رقم الفاتورة", "المبلغ", "العملة", "طريقة الدفع", "الحالة", "التاريخ"];
    const payments = await db.payment.findMany({
      where: { receivedAt: { gte: from } },
      orderBy: { receivedAt: "desc" },
    });
    records = payments.map((p) => [
      p.paymentNumber,
      p.customerName,
      p.invoiceNumber ?? "",
      String(p.amount),
      p.currency,
      p.method,
      p.status,
      p.receivedAt.toISOString().split("T")[0],
    ]);
    title = "قائمة المدفوعات";
  } else if (type === "expenses") {
    headers = ["رقم المصروف", "غرض الصرف", "المبلغ", "العملة", "طريقة الدفع", "الحالة", "تاريخ الصرف"];
    const expenses = await db.expense.findMany({
      where: { paidAt: { gte: from } },
      orderBy: { paidAt: "desc" },
    });
    records = expenses.map((e) => [
      e.expenseNumber,
      e.category,
      String(e.amount),
      e.currency,
      e.method,
      e.status,
      e.paidAt.toISOString().split("T")[0],
    ]);
    title = "قائمة المصروفات";
  }

  if (format === "pdf") {
    // توليد PDF بصيغة HTML قابل للطباعة (RTL)
    const periodLabel = period === "weekly" ? "تقرير أسبوعي" : period === "monthly" ? "تقرير شهري" : period === "daily" ? "تقرير يومي" : "تقرير شامل";
    const dateRange = `من ${from.toISOString().split("T")[0]} إلى ${now.toISOString().split("T")[0]}`;

    // ترميز اسم الملف لتجنب أحرف غير ASCII في Content-Disposition (يحدث HTTP 500)
    const safeFilename = `report_${type}_${period}.html`;
    const encodedFilename = encodeURIComponent(safeFilename);

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${title} — ${periodLabel}</title>
<style>
  body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; color: #1F2937; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #7C3AED; padding-bottom: 20px; }
  .office-name { font-size: 32px; font-weight: bold; color: #7C3AED; margin-bottom: 5px; }
  .report-title { font-size: 18px; font-weight: 600; }
  .period { font-size: 14px; color: #64748B; margin-top: 5px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { background: #F3E8FF; color: #6D28D9; padding: 12px 8px; text-align: right; font-size: 13px; font-weight: 600; border: 1px solid #E2E8F0; }
  td { padding: 10px 8px; text-align: right; font-size: 12px; border: 1px solid #E2E8F0; }
  tr:nth-child(even) { background: #F8F9FC; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 15px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="office-name">سما اليمن للسفريات والسياحة</div>
    <div class="report-title">${title} — ${periodLabel}</div>
    <div class="period">${dateRange}</div>
  </div>
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${records.length === 0 ? `<tr><td colspan="${headers.length}" style="text-align:center;padding:30px;">لا توجد بيانات في هذه الفترة</td></tr>` : records.map((r) => `<tr>${r.map((c) => `<td>${String(c).replace(/</g, "&lt;")}</td>`).join("")}</tr>`).join("")}
    </tbody>
  </table>
  <div class="footer">جميع الحقوق محفوظة لدى Sky Link 2026</div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  }

  // Excel (CSV مع BOM)
  const bom = "\uFEFF";
  const csv = [headers, ...records].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const csvContent = bom + csv;
  const safeCsvName = `report_${type}_${period}.csv`;
  const encodedCsvName = encodeURIComponent(safeCsvName);

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodedCsvName}"; filename*=UTF-8''${encodedCsvName}`,
    },
  });
}
