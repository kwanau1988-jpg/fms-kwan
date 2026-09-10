import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed Faculty News
  const newsCount = await prisma.newsArticle.count({ where: { tenantId: core.tenantId } });
  if (newsCount === 0) {
    await prisma.newsArticle.createMany({
      data: [
        {
          tenantId: core.tenantId,
          titleTh: "คณะวิทยาการจัดการ เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2569 (รอบ Portfolio)",
          titleEn: "Faculty of Management Science Open Admissions Academic Year 2026",
          slug: "admissions-2026-portfolio",
          summaryTh: "เปิดรับสมัครผู้สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลายเข้าศึกษาต่อในระดับปริญญาตรี 5 สาขาวิชา",
          summaryEn: "Undergraduate admissions now open for High School graduates across 5 degree tracks.",
          contentTh: "คณะวิทยาการจัดการ มุ่งเน้นการเรียนการสอนเชิงรุก (Active Learning) บูรณาการศาสตร์เทคโนโลยีและการบริหารธุรกิจ พร้อมทุนการศึกษาและโครงการแลกเปลี่ยนในต่างประเทศ สมัครได้ตั้งแต่วันนี้ผ่านระบบรับสมัครออนไลน์",
          contentEn: "The Faculty emphasizes active learning and technology integration in business studies with exchange opportunities worldwide.",
          category: "ACADEMIC",
          isPinned: true,
          status: "PUBLISHED",
          publishedAt: new Date(),
          viewCount: 142,
        },
        {
          tenantId: core.tenantId,
          titleTh: "ขอเชิญร่วมงานประชุมวิชาการระดับชาติ ด้านการจัดการ นวัตกรรม และความยั่งยืน",
          titleEn: "National Conference on Management, Innovation and Sustainability 2026",
          slug: "national-conference-2026",
          summaryTh: "เวทีนำเสนอผลงานวิจัยของคณาจารย์ นักวิจัย และนิสิตระดับบัณฑิตศึกษา",
          summaryEn: "Research presentation forum for scholars, faculty members, and graduate researchers.",
          contentTh: "งานประชุมวิชาการประจำปีเพื่อแลกเปลี่ยนองค์ความรู้ด้านเศรษฐกิจหมุนเวียน ธุรกิจดิจิทัล และการพัฒนาอย่างยั่งยืน เปิดรับบทความวิจัยถึงสิ้นเดือนนี้",
          contentEn: "Annual research conference promoting circular economy, digital enterprises, and ESG management.",
          category: "RESEARCH",
          isPinned: false,
          status: "PUBLISHED",
          publishedAt: new Date(),
          viewCount: 89,
        },
        {
          tenantId: core.tenantId,
          titleTh: "กิจกรรมเสริมทักษะ AI และ Data Analytics สำหรับนักบริหารยุคดิจิทัล",
          titleEn: "AI & Data Analytics Bootcamp for Modern Business Executives",
          slug: "ai-bootcamp-2026",
          summaryTh: "เวิร์กช็อปเข้มข้น 2 วันเต็ม ยกระดับทักษะการวิเคราะห์ข้อมูลและการใช้ GenAI",
          summaryEn: "2-Day Intensive Hands-on Workshop for Generative AI and Business Data Modeling.",
          contentTh: "โครงการบริการวิชาการแก่สังคม จัดขึ้นเพื่อพัฒนาศักยภาพผู้ประกอบการและนักศึกษาในการประยุกต์ใช้ปัญญาประดิษฐ์เพื่อการตัดสินใจทางธุรกิจ",
          contentEn: "Academic service workshop empowering professionals to leverage AI for data-driven management.",
          category: "ACTIVITY",
          isPinned: false,
          status: "PUBLISHED",
          publishedAt: new Date(),
          viewCount: 65,
        },
      ],
    });
  }

  // Seed Faculty Personnel
  const personnelCount = await prisma.personnelProfile.count({ where: { tenantId: core.tenantId } });
  if (personnelCount === 0) {
    await prisma.personnelProfile.createMany({
      data: [
        {
          tenantId: core.tenantId,
          academicTitle: "ศ.ดร.",
          firstNameTh: "สมชาย",
          lastNameTh: "บริหารเลิศ",
          firstNameEn: "Somchai",
          lastNameEn: "Borihanlert",
          departmentTh: "สำนักงานคณบดี",
          departmentEn: "Dean Office",
          positionTh: "คณบดีคณะวิทยาการจัดการ",
          positionEn: "Dean, Faculty of Management Science",
          email: "somchai.b@faculty.edu",
          phoneExt: "1101",
          roomNumber: "MS-401",
          displayOrder: 1,
          isActive: true,
        },
        {
          tenantId: core.tenantId,
          academicTitle: "รศ.ดร.",
          firstNameTh: "กานดา",
          lastNameTh: "บัญชีทอง",
          firstNameEn: "Kanda",
          lastNameEn: "Banchithong",
          departmentTh: "การบัญชี",
          departmentEn: "Accounting",
          positionTh: "รองคณบดีฝ่ายวิชาการ",
          positionEn: "Associate Dean for Academic Affairs",
          email: "kanda.b@faculty.edu",
          phoneExt: "1201",
          roomNumber: "MS-302",
          displayOrder: 2,
          isActive: true,
        },
        {
          tenantId: core.tenantId,
          academicTitle: "ผศ.ดร.",
          firstNameTh: "วิชัย",
          lastNameTh: "เศรษฐเสถียร",
          firstNameEn: "Wichai",
          lastNameEn: "Setthasathien",
          departmentTh: "เศรษฐศาสตร์",
          departmentEn: "Economics",
          positionTh: "หัวหน้าภาควิชาเศรษฐศาสตร์",
          positionEn: "Head, Department of Economics",
          email: "wichai.s@faculty.edu",
          phoneExt: "1301",
          roomNumber: "MS-305",
          displayOrder: 3,
          isActive: true,
        },
        {
          tenantId: core.tenantId,
          academicTitle: "ดร.",
          firstNameTh: "สุภาวดี",
          lastNameTh: "นวัตกรรม",
          firstNameEn: "Supawadee",
          lastNameEn: "Nawatkit",
          departmentTh: "บริหารธุรกิจ",
          departmentEn: "Business Administration",
          positionTh: "อาจารย์ประจำสาขาการตลาดดิจิทัล",
          positionEn: "Lecturer in Digital Marketing",
          email: "supawadee.n@faculty.edu",
          phoneExt: "1402",
          roomNumber: "MS-204",
          displayOrder: 4,
          isActive: true,
        },
      ],
    });
  }

  // Seed Faculty Curricula
  const curriculaCount = await prisma.curriculum.count({ where: { tenantId: core.tenantId } });
  if (curriculaCount === 0) {
    await prisma.curriculum.createMany({
      data: [
        {
          tenantId: core.tenantId,
          code: "B.B.A.-01",
          nameTh: "หลักสูตรบริหารธุรกิจบัณฑิต (สาขาวิชาการจัดการนวัตกรรมและเทคโนโลยีดิจิทัล)",
          nameEn: "Bachelor of Business Administration in Digital Innovation Management",
          degreeTh: "บธ.บ. (การจัดการนวัตกรรมและเทคโนโลยีดิจิทัล)",
          degreeEn: "B.B.A. (Digital Innovation Management)",
          degreeLevel: "BACHELOR",
          totalCredits: 128,
          tuitionFee: 120000,
          status: "OPEN",
        },
        {
          tenantId: core.tenantId,
          code: "B.Acc.-01",
          nameTh: "หลักสูตรบัญชีบัณฑิต (สาขาวิชาการบัญชีดิจิทัลและการเงินสมัยใหม่)",
          nameEn: "Bachelor of Accountancy in Digital Accounting & Modern Finance",
          degreeTh: "บช.บ. (การบัญชีดิจิทัลและการเงินสมัยใหม่)",
          degreeEn: "B.Acc. (Digital Accounting & Modern Finance)",
          degreeLevel: "BACHELOR",
          totalCredits: 132,
          tuitionFee: 125000,
          status: "OPEN",
        },
        {
          tenantId: core.tenantId,
          code: "M.B.A.-01",
          nameTh: "หลักสูตรบริหารธุรกิจมหาบัณฑิต (สำหรับผู้บริหารระดับสูงและผู้ประกอบการ)",
          nameEn: "Master of Business Administration for Senior Executives",
          degreeTh: "บธ.ม. (บริหารธุรกิจ)",
          degreeEn: "M.B.A. (Business Administration)",
          degreeLevel: "MASTER",
          totalCredits: 36,
          tuitionFee: 180000,
          status: "OPEN",
        },
      ],
    });
  }

  // Seed Resources (Facilities & Vehicles)
  const resourceCount = await prisma.resource.count({ where: { tenantId: core.tenantId } });
  if (resourceCount === 0) {
    await prisma.resource.createMany({
      data: [
        {
          tenantId: core.tenantId,
          type: "ROOM",
          nameTh: "ห้องประชุมทองกวาว (Smart Meeting Room 1)",
          nameEn: "Thong-Kao Smart Meeting Room 1",
          capacity: 45,
          locationOrPlate: "อาคาร 4 ชั้น 4 (MS-401)",
          isAvailable: true,
        },
        {
          tenantId: core.tenantId,
          type: "ROOM",
          nameTh: "ห้องประชุมสัมมนาไพฑูรย์ (Auditorium)",
          nameEn: "Phai-Toon Auditorium Hall",
          capacity: 200,
          locationOrPlate: "อาคาร 4 ชั้น 1 (MS-101)",
          isAvailable: true,
        },
        {
          tenantId: core.tenantId,
          type: "VEHICLE",
          nameTh: "รถตู้โดยสารปรับอากาศคณะ (Toyota Commuter)",
          nameEn: "Faculty Passenger Van (Toyota Commuter)",
          capacity: 12,
          locationOrPlate: "ทะเบียน 1กข-5678 กทม.",
          isAvailable: true,
        },
      ],
    });
  }

  // Seed Sample Courses for Curricula
  const curriculum = await prisma.curriculum.findFirst({ where: { tenantId: core.tenantId } });
  if (curriculum) {
    const courseCount = await prisma.course.count({ where: { tenantId: core.tenantId } });
    if (courseCount === 0) {
      await prisma.course.createMany({
        data: [
          {
            tenantId: core.tenantId,
            curriculumId: curriculum.id,
            code: "MGT-101",
            titleTh: "หลักการจัดการสมัยใหม่และภาวะผู้นำ",
            titleEn: "Principles of Modern Management & Leadership",
            credits: "3(3-0-6)",
            description: "ศึกษาแนวคิด ทฤษฎี กระบวนการจัดการในยุคดิจิทัล และภาวะผู้นำ",
          },
          {
            tenantId: core.tenantId,
            curriculumId: curriculum.id,
            code: "MKT-201",
            titleTh: "การตลาดดิจิทัลและพฤติกรรมผู้บริโภค",
            titleEn: "Digital Marketing & Consumer Behavior",
            credits: "3(3-0-6)",
            description: "กลยุทธ์การตลาดผ่านช่องทางดิจิทัล โซเชียลมีเดีย และการวิเคราะห์ข้อมูลผู้บริโภค",
          },
        ],
      });
    }
  }

  const adminUser = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  const staffUser = await prisma.user.findUnique({ where: { email: "staff@app.local" } });

  // Seed Classroom Sessions (Smart Attendance)
  const course = await prisma.course.findFirst({ where: { tenantId: core.tenantId } });
  if (course && adminUser) {
    const sessionCount = await prisma.classroomSession.count({ where: { tenantId: core.tenantId } });
    if (sessionCount === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const session = await prisma.classroomSession.create({
        data: {
          tenantId: core.tenantId,
          courseId: course.id,
          instructorId: adminUser.id,
          roomNumber: "MS-401 (Smart Classroom)",
          sessionDate: tomorrow,
          startTime: "09:00",
          endTime: "12:00",
          qrToken: "FMS2026",
          qrExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      if (staffUser) {
        await prisma.attendanceRecord.create({
          data: {
            tenantId: core.tenantId,
            sessionId: session.id,
            studentId: staffUser.id,
            status: "PRESENT",
            remark: "เช็คชื่อผ่าน Dynamic QR Code",
          },
        });
      }
    }
  }

  // Seed E-Document Request & Approvals
  if (staffUser && adminUser) {
    const docCount = await prisma.documentRequest.count({ where: { tenantId: core.tenantId } });
    if (docCount === 0) {
      const doc = await prisma.documentRequest.create({
        data: {
          tenantId: core.tenantId,
          docNumber: "DOC-2026-0001",
          title: "ขออนุมัติจัดโครงการพัฒนาทักษะดิจิทัลและ AI สำหรับคณาจารย์และเจ้าหน้าที่",
          docType: "PROJECT",
          requesterId: staffUser.id,
          currentStep: 1,
          status: "PENDING",
        },
      });

      await prisma.documentApproval.create({
        data: {
          requestId: doc.id,
          stepOrder: 1,
          approverId: adminUser.id,
          decision: "PENDING",
        },
      });
    }
  }

  // Seed Sample Reservations
  const sampleResource = await prisma.resource.findFirst({ where: { tenantId: core.tenantId } });
  if (sampleResource && staffUser) {
    const resCount = await prisma.reservation.count({ where: { tenantId: core.tenantId } });
    if (resCount === 0) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 3);
      nextWeek.setHours(9, 0, 0, 0);
      const nextWeekEnd = new Date(nextWeek);
      nextWeekEnd.setHours(12, 0, 0, 0);

      await prisma.reservation.create({
        data: {
          tenantId: core.tenantId,
          resourceId: sampleResource.id,
          userId: staffUser.id,
          title: "ประชุมคณะทำงานประกันคุณภาพการศึกษา ระดับคณะ",
          startTime: nextWeek,
          endTime: nextWeekEnd,
          attendeesCount: 15,
          contactPhone: "081-555-1234",
          status: "APPROVED",
          approvedById: adminUser?.id,
          approvedAt: new Date(),
        },
      });
    }
  }

  // Seed Payroll Period & Slips
  const periodCount = await prisma.payrollPeriod.count({ where: { tenantId: core.tenantId } });
  if (periodCount === 0 && adminUser) {
    const period = await prisma.payrollPeriod.create({
      data: {
        tenantId: core.tenantId,
        year: 2026,
        month: 9,
        isPublished: true,
      },
    });

    const crypto = await import("crypto");
    const secret = process.env.AUTH_SECRET || "fms_payroll_confidential_salt_key_2026";
    const key = crypto.createHash("sha256").update(secret).digest();

    const slipBreakdown = {
      baseSalary: 45000,
      academicAllowance: 11200,
      positionAllowance: 8000,
      specialAllowance: 3000,
      grossIncome: 67200,
      taxWithholding: 3360,
      socialSecurity: 750,
      providentFund: 2688,
      cooperatives: 2500,
      totalDeductions: 9298,
      netPayable: 57902,
    };

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(slipBreakdown), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    const encryptedPayload = `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;

    await prisma.payrollSlip.create({
      data: {
        tenantId: core.tenantId,
        periodId: period.id,
        userId: adminUser.id,
        encryptedPayload,
        netPayable: slipBreakdown.netPayable,
        bankAccountMasked: "xxx-x-xx889-0",
      },
    });
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
