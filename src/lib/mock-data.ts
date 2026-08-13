import type {
  Customer,
  Employee,
  User,
  Agent,
  TransportCompany,
  ServiceRecord,
  Invoice,
  Payment,
  Expense,
  AuditLog,
  VisaExpiryRecord,
  ServiceType,
} from "./types";

/** رقم فاتورة تسلسلي */
export function genInvoiceNo(seq: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(seq).padStart(5, "0")}`;
}
export function genServiceNo(seq: number): string {
  const year = new Date().getFullYear();
  return `SRV-${year}-${String(seq).padStart(5, "0")}`;
}
export function genCustomerNo(seq: number): string {
  return `CUST-${String(seq).padStart(5, "0")}`;
}
export function genEmployeeNo(seq: number): string {
  return `EMP-${String(seq).padStart(4, "0")}`;
}
export function genPaymentNo(seq: number): string {
  const year = new Date().getFullYear();
  return `PAY-${year}-${String(seq).padStart(5, "0")}`;
}
export function genExpenseNo(seq: number): string {
  const year = new Date().getFullYear();
  return `EXP-${year}-${String(seq).padStart(5, "0")}`;
}

export const customers: Customer[] = [
  { id: "c1", customerNumber: "CUST-00001", fullName: "أحمد محمد الصبري", phoneNumber: "+967777112233", passportNumber: "P5236987", nationalId: "01234567891", joinedOn: "2025-02-14", referralSource: "توصية صديق", isActive: true, createdAt: "2025-02-14T09:00:00Z" },
  { id: "c2", customerNumber: "CUST-00002", fullName: "سالم عبدالله باوزير", phoneNumber: "+967777445566", passportNumber: "P8874120", joinedOn: "2025-03-08", referralSource: "إعلان إنستغرام", isActive: true, createdAt: "2025-03-08T11:30:00Z" },
  { id: "c3", customerNumber: "CUST-00003", fullName: "خالد سعيد الحضرمي", phoneNumber: "+967777998877", passportNumber: "P3325147", joinedOn: "2025-04-22", referralSource: "بحث جوجل", isActive: true, createdAt: "2025-04-22T14:15:00Z" },
  { id: "c4", customerNumber: "CUST-00004", fullName: "فاطمة علي المخلافي", phoneNumber: "+967778112233", passportNumber: "P9966332", joinedOn: "2025-05-19", referralSource: "صفحة فيسبوك", isActive: true, createdAt: "2025-05-19T08:45:00Z" },
  { id: "c5", customerNumber: "CUST-00005", fullName: "عبدالرحمن ياسين النوبي", phoneNumber: "+967778554433", passportNumber: "P1144588", joinedOn: "2025-06-30", referralSource: "توصية عميل سابق", isActive: true, createdAt: "2025-06-30T13:20:00Z" },
  { id: "c6", customerNumber: "CUST-00006", fullName: "منى حسن العمري", phoneNumber: "+967779221100", passportNumber: "P5588774", joinedOn: "2025-07-12", referralSource: "لافتة الشارع", isActive: true, createdAt: "2025-07-12T10:10:00Z" },
  { id: "c7", customerNumber: "CUST-00007", fullName: "يوسف إبراهيم الأهدل", phoneNumber: "+967779667788", passportNumber: "P2233699", joinedOn: "2026-01-05", referralSource: "توصية صديق", isActive: true, createdAt: "2026-01-05T09:30:00Z" },
  { id: "c8", customerNumber: "CUST-00008", fullName: "نورا عبدالكريم الشميري", phoneNumber: "+967770334455", passportNumber: "P7745123", joinedOn: "2026-02-18", referralSource: "إعلان واتساب", isActive: true, createdAt: "2026-02-18T15:00:00Z" },
  { id: "c9", customerNumber: "CUST-00009", fullName: "محمد قاسم العولقي", phoneNumber: "+967770998877", passportNumber: "P6655447", joinedOn: "2026-03-22", referralSource: "بحث جوجل", isActive: true, createdAt: "2026-03-22T12:45:00Z" },
  { id: "c10", customerNumber: "CUST-00010", fullName: "ريم سامي الزبيري", phoneNumber: "+967771556677", passportNumber: "P4411996", joinedOn: "2026-05-08", referralSource: "صفحة فيسبوك", isActive: true, createdAt: "2026-05-08T11:00:00Z" },
];

export const employees: Employee[] = [
  { id: "e1", employeeNumber: "EMP-0001", fullName: "علي محمد الصبري", hiredOn: "2024-01-15", jobTitle: "مدير عام", isActive: true, createdAt: "2024-01-15T08:00:00Z" },
  { id: "e2", employeeNumber: "EMP-0002", fullName: "هالة عبدالله باحمدان", hiredOn: "2024-04-02", jobTitle: "محاسب أول", isActive: true, createdAt: "2024-04-02T08:00:00Z" },
  { id: "e3", employeeNumber: "EMP-0003", fullName: "ماجد سعيد الحداد", hiredOn: "2024-08-19", jobTitle: "موظف حجوزات", isActive: true, createdAt: "2024-08-19T08:00:00Z" },
  { id: "e4", employeeNumber: "EMP-0004", fullName: "إيمان ناصر العزي", hiredOn: "2025-01-10", jobTitle: "موظف حجوزات", isActive: true, createdAt: "2025-01-10T08:00:00Z" },
  { id: "e5", employeeNumber: "EMP-0005", fullName: "طارق فهد الشامي", hiredOn: "2025-06-22", jobTitle: "موظف استقبال", isActive: false, createdAt: "2025-06-22T08:00:00Z" },
];

export const users: User[] = [
  { id: "u1", username: "manager", role: "manager", employeeId: "e1", isActive: true, mustChangePassword: false, lastLoginAt: "2026-08-13T16:00:00Z", createdAt: "2024-01-15T08:00:00Z" },
  { id: "u2", username: "accountant", role: "accountant", employeeId: "e2", isActive: true, mustChangePassword: false, lastLoginAt: "2026-08-13T15:30:00Z", createdAt: "2024-04-02T08:00:00Z" },
  { id: "u3", username: "booking", role: "booking_officer", employeeId: "e3", isActive: true, mustChangePassword: false, lastLoginAt: "2026-08-13T14:00:00Z", createdAt: "2024-08-19T08:00:00Z" },
];

export const agents: Agent[] = [
  { id: "a1", officeName: "وكالة البدر للحج والعمرة", agentNumber: "AGT-001", serviceType: "حج وعمرة", isActive: true, createdAt: "2024-02-01T00:00:00Z" },
  { id: "a2", officeName: "وكالة الأمانة للسياحة", agentNumber: "AGT-002", serviceType: "تأشيرات سياحية", isActive: true, createdAt: "2024-03-15T00:00:00Z" },
  { id: "a3", officeName: "وكالة الشروق للنقل", agentNumber: "AGT-003", serviceType: "نقل دولي", isActive: true, createdAt: "2024-05-22T00:00:00Z" },
  { id: "a4", officeName: "وكالة الخير للتأشيرات", agentNumber: "AGT-004", serviceType: "تأشيرات عمل", isActive: false, createdAt: "2024-09-10T00:00:00Z" },
];

export const transportCompanies: TransportCompany[] = [
  { id: "tc1", companyName: "شركة الناقل الذهبي", companyNumber: "TRN-001", address: "عدن — خور مكسر", isActive: true, createdAt: "2024-01-20T00:00:00Z" },
  { id: "tc2", companyName: "شركة المسافر الدولية", companyNumber: "TRN-002", address: "تعز — شارع تعز-عدن", isActive: true, createdAt: "2024-04-12T00:00:00Z" },
  { id: "tc3", companyName: "شركة الأمل للنقل", companyNumber: "TRN-003", address: "حضرموت — المكلا", isActive: true, createdAt: "2024-11-05T00:00:00Z" },
];

const today = new Date();
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}
function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export const services: ServiceRecord[] = [
  {
    id: "s1", serviceType: "umrah_regular", serviceNumber: "SRV-2026-00001",
    customerId: "c1", customerName: "أحمد محمد الصبري", handledByEmployeeId: "e3",
    status: "completed", price: 3500, paid: 3500, remaining: 0, currency: "SAR",
    paymentMethod: "transfer", transferNo: "TRF-998123",
    createdAt: daysAgo(2),
    details: { agency: "وكالة البدر للحج والعمرة", entryDate: "2026-06-15", exitDate: "2026-06-25", daysLeft: 0, guarantorName: "سالم أحمد", guarantorNo: "+967777111222", guarantorAddress: "عدن — كريتر", guaranteeType: "list_commercial", visaStatus: "list_sent_customer" },
  },
  {
    id: "s2", serviceType: "flight_ticket", serviceNumber: "SRV-2026-00002",
    customerId: "c2", customerName: "سالم عبدالله باوزير", handledByEmployeeId: "e3",
    status: "processing", price: 850, paid: 850, remaining: 0, currency: "USD",
    paymentMethod: "cash",
    createdAt: daysAgo(1),
    details: { route: "عدن → القاهرة", company: "اليمنية", ticketNo: "YMN-784512", ticketDate: "2026-08-15", departTime: "2026-08-15 08:30", arrivalTime: "2026-08-15 12:00", notes: "تذكرة ذهاب فقط" },
  },
  {
    id: "s3", serviceType: "visa_tourist", serviceNumber: "SRV-2026-00003",
    customerId: "c3", customerName: "خالد سعيد الحضرمي", handledByEmployeeId: "e4",
    status: "pending", price: 1200, paid: 600, remaining: 600, currency: "SAR",
    paymentMethod: "wallet", transferNo: "WLT-445122",
    createdAt: daysAgo(3),
    details: { destination: "تركيا", validity: "90 يوم", processingPeriod: "7-10 أيام", deportDate: "2026-08-25" },
  },
  {
    id: "s4", serviceType: "passport_attendance", serviceNumber: "SRV-2026-00004",
    customerId: "c4", customerName: "فاطمة علي المخلافي", handledByEmployeeId: "e3",
    status: "processing", price: 25000, paid: 15000, remaining: 10000, currency: "YER",
    paymentMethod: "cash",
    createdAt: daysAgo(5),
    details: { cardNo: "022145", governorate: "gov_aden", receiveDate: "2026-08-08", arrivalDate: "2026-08-18", agentName: "ماجد الحداد", agentNumber: "+967777445566", passportStatus: "list_in_passport" },
  },
  {
    id: "s5", serviceType: "hotel_booking", serviceNumber: "SRV-2026-00005",
    customerId: "c5", customerName: "عبدالرحمن ياسين النوبي", handledByEmployeeId: "e4",
    status: "completed", price: 2200, paid: 2200, remaining: 0, currency: "SAR",
    paymentMethod: "transfer", transferNo: "TRF-662340",
    createdAt: daysAgo(7),
    details: { city: "جدة", hotelName: "فندق هيلتون جدة", arrivalDate: "2026-08-01", departureDate: "2026-08-07", totalPrice: 2200, cancelPolicy: "list_cancellable" },
  },
  {
    id: "s6", serviceType: "umrah_program", serviceNumber: "SRV-2026-00006",
    customerId: "c6", customerName: "منى حسن العمري", handledByEmployeeId: "e3",
    status: "processing", price: 5800, paid: 3000, remaining: 2800, currency: "SAR",
    paymentMethod: "cash",
    createdAt: daysAgo(10),
    details: { programName: "عمرة رمضان المبارك", programNo: "PRG-UMR-026", programType: "list_group", agency: "وكالة البدر للحج والعمرة", duration: "10 أيام", startDate: "2026-08-25", endDate: "2026-09-04" },
  },
  {
    id: "s7", serviceType: "flight_ticket", serviceNumber: "SRV-2026-00007",
    customerId: "c7", customerName: "يوسف إبراهيم الأهدل", handledByEmployeeId: "e4",
    status: "completed", price: 650, paid: 650, remaining: 0, currency: "USD",
    paymentMethod: "cash",
    createdAt: daysAgo(15),
    details: { route: "عدن → دبي", company: "الإماراتية", ticketNo: "UAE-996633", ticketDate: "2026-07-29", departTime: "2026-07-29 22:00", arrivalTime: "2026-07-30 01:30" },
  },
  {
    id: "s8", serviceType: "visa_work", serviceNumber: "SRV-2026-00008",
    customerId: "c8", customerName: "نورا عبدالكريم الشميري", handledByEmployeeId: "e3",
    status: "cancelled", price: 4500, paid: 1000, remaining: 0, currency: "SAR",
    paymentMethod: "wallet", transferNo: "WLT-778899",
    createdAt: daysAgo(20),
    details: { visaType: "list_work_3m", visaDuration: "3 شهور", processingPeriod: "30-45 يوم", receiveDate: "2026-07-25", officeNotes: "أُلغيت بناءً على طلب العميل" },
  },
  {
    id: "s9", serviceType: "shipping", serviceNumber: "SRV-2026-00009",
    customerId: "c9", customerName: "محمد قاسم العولقي", handledByEmployeeId: "e4",
    status: "processing", price: 1800, paid: 1800, remaining: 0, currency: "SAR",
    paymentMethod: "transfer", transferNo: "TRF-554433",
    createdAt: daysAgo(4),
    details: { shipmentType: "أغراض شخصية", shipmentWeight: "25 كجم", shippingType: "list_air", fromCountry: "السعودية", toCountry: "اليمن", receiveDateOffice: "2026-08-08", sendDate: "2026-08-09", estArrival: "5-7 أيام" },
  },
  {
    id: "s10", serviceType: "hajj_program", serviceNumber: "SRV-2026-00010",
    customerId: "c10", customerName: "ريم سامي الزبيري", handledByEmployeeId: "e3",
    status: "pending", price: 18500, paid: 5000, remaining: 13500, currency: "SAR",
    paymentMethod: "cash",
    createdAt: daysAgo(0),
    details: { programName: "حج تم一边 2026", programNo: "PRG-HJJ-001", programType: "list_special", agency: "وكالة البدر للحج والعمرة", startDate: "2026-08-25", endDate: "2026-09-10" },
  },
  {
    id: "s11", serviceType: "travel_insurance", serviceNumber: "SRV-2026-00011",
    customerId: "c1", customerName: "أحمد محمد الصبري", handledByEmployeeId: "e4",
    status: "completed", price: 320, paid: 320, remaining: 0, currency: "USD",
    paymentMethod: "cash",
    createdAt: daysAgo(30),
    details: { insuredName: "أحمد محمد الصبري", insuredNo: "CUST-00001", birthDate: "1985-04-12", insuranceStart: "2026-07-15", insuranceEnd: "2026-08-15", tripType: "سياحية" },
  },
  {
    id: "s12", serviceType: "intl_bus", serviceNumber: "SRV-2026-00012",
    customerId: "c3", customerName: "خالد سعيد الحضرمي", handledByEmployeeId: "e3",
    status: "completed", price: 450, paid: 450, remaining: 0, currency: "SAR",
    paymentMethod: "cash",
    createdAt: daysAgo(45),
    details: { companyName: "شركة الناقل الذهبي", route: "عدن → الرياض", tripDate: "2026-07-01", arrivalTime: "2026-07-01 18:00", departTime: "2026-07-01 06:00", tripType: "list_regular" },
  },
  {
    id: "s13", serviceType: "visa_visit", serviceNumber: "SRV-2026-00013",
    customerId: "c4", customerName: "فاطمة علي المخلافي", handledByEmployeeId: "e4",
    status: "processing", price: 850, paid: 425, remaining: 425, currency: "SAR",
    paymentMethod: "transfer", transferNo: "TRF-112345",
    createdAt: daysAgo(8),
    details: { hostName: "عبدالله الفاطمي", hostNo: "+967771234567", visaDuration: "30 يوم", processingPeriod: "10-15 يوم", receiveDate: "2026-08-05" },
  },
  {
    id: "s14", serviceType: "local_car", serviceNumber: "SRV-2026-00014",
    customerId: "c5", customerName: "عبدالرحمن ياسين النوبي", handledByEmployeeId: "e3",
    status: "completed", price: 180, paid: 180, remaining: 0, currency: "USD",
    paymentMethod: "cash",
    createdAt: daysAgo(2),
    details: { carType: "تويوتا كامري", carModel: "2024", route: "المطار → الفندق", tripDate: "2026-08-12", arrivalTime: "2026-08-12 22:30", departTime: "2026-08-12 22:00", departPlace: "مطار عدن الدولي" },
  },
  {
    id: "s15", serviceType: "umrah_regular", serviceNumber: "SRV-2026-00015",
    customerId: "c7", customerName: "يوسف إبراهيم الأهدل", handledByEmployeeId: "e3",
    status: "completed", price: 3200, paid: 3200, remaining: 0, currency: "SAR",
    paymentMethod: "cash",
    createdAt: daysAgo(60),
    details: { agency: "وكالة الأمانة للسياحة", entryDate: "2026-06-10", exitDate: "2026-06-20", daysLeft: 0, guarantorName: "محمد الأهدل", guarantorNo: "+967770998877", guarantorAddress: "حضرموت — المكلا", guaranteeType: "list_personal", visaStatus: "list_sent_customer" },
  },
  {
    id: "s16", serviceType: "umrah_regular", serviceNumber: "SRV-2026-00016",
    customerId: "c9", customerName: "محمد قاسم العولقي", handledByEmployeeId: "e4",
    status: "processing", price: 2800, paid: 1500, remaining: 1300, currency: "SAR",
    paymentMethod: "transfer", transferNo: "TRF-223344",
    createdAt: daysAgo(80),
    details: { agency: "وكالة البدر للحج والعمرة", entryDate: "2026-05-20", exitDate: "2026-05-30", daysLeft: 0, guarantorName: "قاسم العولقي", guarantorNo: "+967771223344", guarantorAddress: "عدن — خور مكسر", guaranteeType: "list_commercial", visaStatus: "list_sent_customer" },
  },
];

export const invoices: Invoice[] = services.slice(0, 12).map((s, i) => ({
  id: `inv${i + 1}`,
  invoiceNumber: genInvoiceNo(i + 1),
  customerId: s.customerId,
  customerName: s.customerName,
  serviceId: s.id,
  serviceType: s.serviceType,
  serviceNumber: s.serviceNumber,
  totalAmount: s.price,
  paidAmount: s.paid,
  remainingAmount: s.remaining,
  currency: s.currency,
  status: s.remaining === 0 ? "paid" : s.paid > 0 ? "partial" : "issued",
  issuedAt: s.createdAt,
  createdAt: s.createdAt,
}));

export const payments: Payment[] = [
  { id: "p1", paymentNumber: "PAY-2026-00001", customerId: "c1", customerName: "أحمد محمد الصبري", invoiceId: "inv1", invoiceNumber: "INV-2026-00001", amount: 3500, currency: "SAR", method: "transfer", transferNo: "TRF-998123", status: "approved", receivedAt: daysAgo(2), createdAt: daysAgo(2) },
  { id: "p2", paymentNumber: "PAY-2026-00002", customerId: "c2", customerName: "سالم عبدالله باوزير", invoiceId: "inv2", invoiceNumber: "INV-2026-00002", amount: 850, currency: "USD", method: "cash", status: "approved", receivedAt: daysAgo(1), createdAt: daysAgo(1) },
  { id: "p3", paymentNumber: "PAY-2026-00003", customerId: "c3", customerName: "خالد سعيد الحضرمي", invoiceId: "inv3", invoiceNumber: "INV-2026-00003", amount: 600, currency: "SAR", method: "wallet", transferNo: "WLT-445122", status: "approved", receivedAt: daysAgo(3), createdAt: daysAgo(3) },
  { id: "p4", paymentNumber: "PAY-2026-00004", customerId: "c4", customerName: "فاطمة علي المخلافي", invoiceId: "inv4", invoiceNumber: "INV-2026-00004", amount: 15000, currency: "YER", method: "cash", status: "approved", receivedAt: daysAgo(5), createdAt: daysAgo(5) },
  { id: "p5", paymentNumber: "PAY-2026-00005", customerId: "c5", customerName: "عبدالرحمن ياسين النوبي", invoiceId: "inv5", invoiceNumber: "INV-2026-00005", amount: 2200, currency: "SAR", method: "transfer", transferNo: "TRF-662340", status: "approved", receivedAt: daysAgo(7), createdAt: daysAgo(7) },
  { id: "p6", paymentNumber: "PAY-2026-00006", customerId: "c6", customerName: "منى حسن العمري", invoiceId: "inv6", invoiceNumber: "INV-2026-00006", amount: 3000, currency: "SAR", method: "cash", status: "approved", receivedAt: daysAgo(10), createdAt: daysAgo(10) },
];

export const expenses: Expense[] = [
  { id: "ex1", expenseNumber: "EXP-2026-00001", category: "إيجار المكتب", description: "إيجار شهري للمكتب الرئيسي", beneficiary: "مكتب العقار", amount: 1500, currency: "USD", method: "transfer", reference: "TRF-RENT-001", status: "approved", paidAt: daysAgo(1), createdAt: daysAgo(1), createdBy: "manager" },
  { id: "ex2", expenseNumber: "EXP-2026-00002", category: "رواتب الموظفين", description: "رواتب شهر أغسطس", beneficiary: "الموظفون", amount: 85000, currency: "YER", method: "cash", status: "approved", paidAt: daysAgo(0), createdAt: daysAgo(0), createdBy: "manager" },
  { id: "ex3", expenseNumber: "EXP-2026-00003", category: "إعلانات تسويقية", description: "حملة إعلانية على فيسبوك وإنستغرام", beneficiary: "ميتا للإعلانات", amount: 320, currency: "USD", method: "wallet", reference: "WLT-ADS-223", status: "pending", paidAt: daysAgo(2), createdAt: daysAgo(2), createdBy: "accountant" },
  { id: "ex4", expenseNumber: "EXP-2026-00004", category: "اتصالات وإنترنت", description: "فترة شهرية لخدمة الإنترنت", beneficiary: "YemenNet", amount: 12000, currency: "YER", method: "cash", status: "approved", paidAt: daysAgo(3), createdAt: daysAgo(3), createdBy: "accountant" },
  { id: "ex5", expenseNumber: "EXP-2026-00005", category: "أدوات مكتبية", description: "طباعة ومستلزمات", beneficiary: "مكتبة النور", amount: 250, currency: "SAR", method: "cash", status: "approved", paidAt: daysAgo(4), createdAt: daysAgo(4), createdBy: "accountant" },
];

export const auditLogs: AuditLog[] = [
  { id: "al1", occurredAt: daysAgo(0) + "+03:00", actorUsername: "manager", actorRole: "manager", action: "تسجيل دخول", moduleKey: "auth", entityType: "user", entityId: "u1", summary: "تسجيل دخول ناجح من نقر 197.250.x.x" },
  { id: "al2", occurredAt: daysAgo(0) + "+03:00", actorUsername: "booking", actorRole: "booking_officer", action: "إنشاء معاملة", moduleKey: "services", entityType: "service", entityId: "s10", summary: "إنشاء معاملة حج برامج للعميل ريم سامي الزبيري" },
  { id: "al3", occurredAt: daysAgo(1) + "+03:00", actorUsername: "accountant", actorRole: "accountant", action: "تسجيل دفعة", moduleKey: "payments", entityType: "payment", entityId: "p2", summary: "تسجيل دفعة بقيمة 850 دولار للعميل سالم باوزير" },
  { id: "al4", occurredAt: daysAgo(2) + "+03:00", actorUsername: "manager", actorRole: "manager", action: "تعديل حساب", moduleKey: "users", entityType: "user", entityId: "u3", summary: "تعديل صلاحيات المستخدم booking — منح صلاحية التصدير" },
  { id: "al5", occurredAt: daysAgo(3) + "+03:00", actorUsername: "booking", actorRole: "booking_officer", action: "تعديل معاملة", moduleKey: "services", entityType: "service", entityId: "s8", summary: "إلغاء معاملة تأشيرة عمل للعميل نورا الشميري" },
  { id: "al6", occurredAt: daysAgo(5) + "+03:00", actorUsername: "accountant", actorRole: "accountant", action: "إضافة مصروف", moduleKey: "expenses", entityType: "expense", entityId: "ex4", summary: "إضافة مصروف اتصالات بقيمة 12,000 ر.ي" },
  { id: "al7", occurredAt: daysAgo(7) + "+03:00", actorUsername: "manager", actorRole: "manager", action: "تعديل إعداد", moduleKey: "settings", entityType: "system_settings", summary: "تعديل سياسة الإلغاء الافتراضية" },
  { id: "al8", occurredAt: daysAgo(10) + "+03:00", actorUsername: "booking", actorRole: "booking_officer", action: "إنشاء معاملة", moduleKey: "services", entityType: "service", entityId: "s6", summary: "إنشاء معاملة عمرة برامج للعميل منى العمري" },
];

/** حساب الأيام المتبقية لتأشيرة العمرة (85 يوماً من تاريخ الدخول) */
export function computeVisaExpiry(): VisaExpiryRecord[] {
  const out: VisaExpiryRecord[] = [];
  for (const s of services) {
    if (s.serviceType === "umrah_regular" && s.details.entryDate) {
      const entry = new Date(s.details.entryDate as string);
      const expiry = new Date(entry);
      expiry.setDate(expiry.getDate() + 85);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const status = diff < 0 ? "expired" : diff <= 7 ? "urgent" : diff <= 30 ? "near" : "near";
      if (diff <= 30) {
        out.push({
          id: `ve_${s.id}`,
          serviceId: s.id,
          serviceNumber: s.serviceNumber,
          serviceType: s.serviceType,
          customerId: s.customerId,
          customerName: s.customerName,
          phone: customers.find((c) => c.id === s.customerId)?.phoneNumber,
          entryDate: s.details.entryDate as string,
          expiryDate: dateStr(expiry),
          daysRemaining: diff,
          visaKind: "عمرة عادية",
          status,
        });
      }
    }
  }
  return out.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export const visaExpiryRecords = computeVisaExpiry();

/** Service type → label key map */
export const serviceTypeLabels: Record<ServiceType, string> = {
  hajj_program: "nav_hajj_program",
  hajj_regular: "nav_hajj_regular",
  umrah_program: "nav_umrah_program",
  umrah_regular: "nav_umrah_regular",
  passport_attendance: "nav_passport_attendance",
  passport_without: "nav_passport_without",
  flight_ticket: "nav_flight_ticket",
  intl_bus: "nav_intl_bus",
  intl_car: "nav_intl_car",
  local_bus: "nav_local_bus",
  local_car: "nav_local_car",
  visa_medical: "nav_visa_medical",
  visa_tourist: "nav_visa_tourist",
  visa_work: "nav_visa_work",
  visa_visit: "nav_visa_visit",
  shipping: "nav_shipping",
  customs: "nav_customs",
  security_approval: "nav_security_approval",
  medical_report: "nav_medical_report",
  travel_insurance: "nav_travel_insurance",
  hotel_booking: "nav_hotel_booking",
};
