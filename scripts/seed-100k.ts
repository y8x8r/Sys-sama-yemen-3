import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = ["محمد", "أحمد", "علي", "ياسر", "صالح", "هشام", "بشار", "عبدالله", "فاطمة", "عبير", "مريم", "سارة", "عصام", "عمار"];
const middleNames = ["محمد", "علي", "عبدالرحمن", "صالح", "قاسم", "عبدالله", "حسين", "يحيى", "نبيل"];
const lastNames = ["سناح", "الشرعبي", "الهمداني", "الخولاني", "الحاشدي", "الريمي", "الصنعاني", "الآنسي", "المقطري", "السنيدار"];
const prefixes = ["77", "73", "71", "70", "78"];
const sources = ["فيسبوك", "توصية صديق", "إعلان ممول", "زيارة مكتب", "واتساب", "تيك توك"];

function generateCustomers(count: number, startIndex: number) {
  const customers = [];
  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const mName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const phoneBase = Math.floor(1000000 + Math.random() * 9000000); 

    customers.push({
      fullName: `${fName} ${mName} ${lName}`,
      customerNumber: `CUST-${Date.now().toString().slice(-4)}-${startIndex + i}`,
      phoneNumber: `${prefix}${phoneBase}`,
      passportNumber: Math.random() > 0.3 ? `0${Math.floor(10000000 + Math.random() * 90000000)}` : null,
      nationalId: Math.random() > 0.5 ? `0101${Math.floor(1000000 + Math.random() * 9000000)}` : null,
      cardNumber: Math.random() > 0.8 ? `CARD-${Math.floor(1000 + Math.random() * 9000)}` : null,
      referralSource: sources[Math.floor(Math.random() * sources.length)],
      isActive: true,
    });
  }
  return customers;
}

async function main() {
  const TOTAL_RECORDS = 100000;
  // التخفيض إلى 500 لضمان نجاح الرفع للسحابة دون انقطاع الاتصال
  const BATCH_SIZE = 500; 
  
  console.log(`بدء حقن ${TOTAL_RECORDS} عميل في قاعدة البيانات السحابية...`);

  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const batch = generateCustomers(BATCH_SIZE, i);
    
    await prisma.customer.createMany({
      data: batch,
      skipDuplicates: true,
    });
    
    console.log(`تم رفع ${i + BATCH_SIZE} عميل بنجاح...`);
  }

  console.log("تمت العملية بنجاح! افتح موقعك الآن لفحص العملاء.");
}

main()
  .catch((e) => {
    console.error("حدث خطأ أثناء رفع البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });