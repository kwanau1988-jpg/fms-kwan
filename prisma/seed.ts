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

  // Seed Faculty Departments
  let deptBa = await prisma.department.findFirst({ where: { tenantId: core.tenantId, code: "DEPT-BA" } });
  if (!deptBa) {
    deptBa = await prisma.department.create({
      data: {
        tenantId: core.tenantId,
        code: "DEPT-BA",
        nameTh: "ภาควิชาบริหารธุรกิจ",
        nameEn: "Department of Business Administration",
        description: "จัดการเรียนการสอนด้านการจัดการ การตลาดดิจิทัล และผู้ประกอบการสมัยใหม่",
        headName: "ผศ.ดร. ภาณุวัฒน์ กิจการค้า",
        email: "ba.dept@faculty.edu",
        phone: "044-123456 ต่อ 1400",
        officeRoom: "อาคาร 2 ชั้น 4 (MS-240)",
        displayOrder: 1,
        isActive: true,
      },
    });
  }

  let deptAcc = await prisma.department.findFirst({ where: { tenantId: core.tenantId, code: "DEPT-ACC" } });
  if (!deptAcc) {
    deptAcc = await prisma.department.create({
      data: {
        tenantId: core.tenantId,
        code: "DEPT-ACC",
        nameTh: "ภาควิชาการบัญชีและการเงิน",
        nameEn: "Department of Accounting and Finance",
        description: "ผลิตบัณฑิตนักบัญชีดิจิทัล ผู้ตรวจสอบบัญชี และผู้เชี่ยวชาญการเงินสมัยใหม่",
        headName: "รศ.ดร. กานดา บัญชีทอง",
        email: "acc.dept@faculty.edu",
        phone: "044-123456 ต่อ 1200",
        officeRoom: "อาคาร 2 ชั้น 3 (MS-230)",
        displayOrder: 2,
        isActive: true,
      },
    });
  }

  let deptEcon = await prisma.department.findFirst({ where: { tenantId: core.tenantId, code: "DEPT-ECON" } });
  if (!deptEcon) {
    deptEcon = await prisma.department.create({
      data: {
        tenantId: core.tenantId,
        code: "DEPT-ECON",
        nameTh: "ภาควิชาเศรษฐศาสตร์",
        nameEn: "Department of Economics",
        description: "ศึกษาและวิจัยด้านเศรษฐศาสตร์ธุรกิจ เศรษฐศาสตร์การพัฒนา และเศรษฐกิจดิจิทัล",
        headName: "ผศ.ดร. วิชัย เศรษฐเสถียร",
        email: "econ.dept@faculty.edu",
        phone: "044-123456 ต่อ 1300",
        officeRoom: "อาคาร 2 ชั้น 3 (MS-235)",
        displayOrder: 3,
        isActive: true,
      },
    });
  }

  let deptDean = await prisma.department.findFirst({ where: { tenantId: core.tenantId, code: "DEPT-DEAN" } });
  if (!deptDean) {
    deptDean = await prisma.department.create({
      data: {
        tenantId: core.tenantId,
        code: "DEPT-DEAN",
        nameTh: "สำนักงานคณบดีและบริการวิชาการ",
        nameEn: "Dean's Office & Academic Services",
        description: "บริหารงานวิชาการ พัฒนานักศึกษา บริการสนับสนุน และงานวิจัย",
        headName: "ศ.ดร. สมชาย บริหารเลิศ",
        email: "dean.office@faculty.edu",
        phone: "044-123456 ต่อ 1100",
        officeRoom: "อาคาร 1 ชั้น 1 (MS-101)",
        displayOrder: 4,
        isActive: true,
      },
    });
  }

  let deptBuddhist = await prisma.department.findFirst({ where: { tenantId: core.tenantId, code: "DEPT-BUDDHIST" } });
  if (!deptBuddhist) {
    deptBuddhist = await prisma.department.create({
      data: {
        tenantId: core.tenantId,
        code: "DEPT-BUDDHIST",
        nameTh: "ภาควิชาพระพุทธศาสนา",
        nameEn: "Department of Buddhist Studies",
        description: "จัดการศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ ผลิตบัณฑิตให้มีความรู้ดี มีศีลธรรม นำสังคมสู่สันติสุข",
        headName: "ผศ.ดร. พระมหาวีระชาติ ธีรสิทฺโธ (เพ็งแจ่ม)",
        email: "buddhist.dept@faculty.edu",
        phone: "045-123456",
        officeRoom: "อาคารเรียนรวมและบริการวิชาการ วิทยาเขตอุบลราชธานี",
        displayOrder: 5,
        isActive: true,
      },
    });
  }

  // Seed Faculty Curricula
  const curriculaCount = await prisma.curriculum.count({ where: { tenantId: core.tenantId } });
  if (curriculaCount === 0) {
    await prisma.curriculum.createMany({
      data: [
        {
          tenantId: core.tenantId,
          departmentId: deptBa.id,
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
          departmentId: deptAcc.id,
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
          departmentId: deptBa.id,
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
  } else {
    // อัปเดตผูก departmentId ให้กับหลักสูตรเดิมที่ยังไม่มีภาควิชา
    await prisma.curriculum.updateMany({
      where: { tenantId: core.tenantId, code: "B.B.A.-01", departmentId: null },
      data: { departmentId: deptBa.id },
    });
    await prisma.curriculum.updateMany({
      where: { tenantId: core.tenantId, code: "B.Acc.-01", departmentId: null },
      data: { departmentId: deptAcc.id },
    });
    await prisma.curriculum.updateMany({
      where: { tenantId: core.tenantId, code: "M.B.A.-01", departmentId: null },
      data: { departmentId: deptBa.id },
    });
  }

  // Seed / Update MKO 2 Buddhist Studies Curriculum
  const currBuddhist = await prisma.curriculum.findFirst({ where: { tenantId: core.tenantId, code: "B.A.-BUDDHIST-70" } });
  const buddhistData = {
    tenantId: core.tenantId,
    departmentId: deptBuddhist.id,
    code: "B.A.-BUDDHIST-70",
    nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (๔ ปี) (หลักสูตรปรับปรุง พ.ศ. ๒๕๗๐)",
    nameEn: "Bachelor of Arts Program in Buddhist Studies (Revised B.E. 2570)",
    degreeTh: "พุทธศาสตรบัณฑิต (พระพุทธศาสนา) [พธ.บ.]",
    degreeEn: "Bachelor of Arts (Buddhist Studies) [B.A.]",
    degreeLevel: "BACHELOR" as const,
    totalCredits: 132,
    tuitionFee: 32000,
    philosophy: "จัดการศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ ผลิตบัณฑิตให้มีความรู้ดี มีศีลธรรม นำสังคมสู่สันติสุข",
    objectives: [
      "เพื่อผลิตบัณฑิตมีความรอบรู้ในหลักพระพุทธศาสนาและศาสตร์ที่เกี่ยวข้องสามารถประยุกต์องค์ความรู้กับศาสตร์สมัยใหม่ได้อย่างเหมาะสม",
      "เพื่อผลิตบัณฑิตให้มีทักษะการถ่ายทอดหลักพุทธธรรมกับศาสตร์สมัยใหม่ เพื่อการเผยแผ่และการแก้ไขปัญหาสังคมในยุคปัจจุบันได้",
      "เพื่อผลิตบัณฑิตสามารถปฏิบัติตนตามหลักคุณธรรม จริยธรรม ยึดมั่นในหลักพระพุทธศาสนา มีความรับผิดชอบต่อสังคม และเป็นแบบอย่างที่ดีในการดำเนินชีวิต",
      "เพื่อผลิตบัณฑิตให้มีภาวะผู้นำ สามารถทำงานร่วมกับผู้อื่นและปฏิบัติงานเป็นทีมได้อย่างเหมาะสมพร้อมทั้งมีทักษะการเรียนรู้ตลอดชีวิตและสามารถปรับตัวต่อการเปลี่ยนแปลงของสังคมในศตวรรษที่ ๒๑",
      "เพื่อผลิตบัณฑิตสามารถใช้เทคโนโลยีดิจิทัล สารสนเทศ พุทธนวัตกรรม เพื่อการสื่อสารการเผยแผ่พระพุทธศาสนา การจัดการศึกษา และการบริหารองค์กรได้อย่างเหมาะสม",
    ],
    plos: [
      {
        code: "PLO 1",
        descTh: "มีความรอบรู้ในหลักพระพุทธศาสนาและศาสตร์ที่เกี่ยวข้อง สามารถประยุกต์องค์ความรู้กับศาสตร์สมัยใหม่ได้อย่างเหมาะสม",
        descEn: "Demonstrate deep knowledge in Buddhist principles and related disciplines, integrating with modern sciences.",
      },
      {
        code: "PLO 2",
        descTh: "มีทักษะการถ่ายทอดหลักพุทธธรรมกับศาสตร์สมัยใหม่ เพื่อการเผยแผ่และการแก้ไขปัญหาสังคมในยุคปัจจุบันได้",
        descEn: "Possess communication skills to convey Buddhist teachings with modern methods for propagation and societal problem-solving.",
      },
      {
        code: "PLO 3",
        descTh: "สามารถปฏิบัติตนตามหลักคุณธรรม จริยธรรม ยึดมั่นในหลักพระพุทธศาสนา มีความรับผิดชอบต่อสังคม และเป็นแบบอย่างที่ดีในการดำเนินชีวิต",
        descEn: "Adhere to moral and ethical principles rooted in Buddhism, uphold social responsibility, and serve as role models.",
      },
      {
        code: "PLO 4",
        descTh: "มีภาวะผู้นำ สามารถทำงานร่วมกับผู้อื่นและปฏิบัติงานเป็นทีมได้อย่างเหมาะสม พร้อมทั้งมีทักษะการเรียนรู้ตลอดชีวิตและสามารถปรับตัวต่อการเปลี่ยนแปลงของสังคมในศตวรรษที่ ๒๑",
        descEn: "Exhibit leadership, teamwork, lifelong learning capabilities, and adaptability to 21st-century societal transformations.",
      },
      {
        code: "PLO 5",
        descTh: "สามารถใช้เทคโนโลยีดิจิทัล สารสนเทศ พุทธนวัตกรรม เพื่อการสื่อสาร การเผยแผ่พระพุทธศาสนา การจัดการศึกษา และการบริหารองค์กรได้อย่างเหมาะสม",
        descEn: "Utilize digital technologies, information systems, and Buddhist innovations for communication, education, and administration.",
      },
    ],
    studyPlan: [
      {
        categoryTh: "๑) หมวดวิชาศึกษาทั่วไป (ไม่น้อยกว่า ๒๔ หน่วยกิต)",
        categoryEn: "General Education Courses (Min. 24 Credits)",
        credits: 24,
        description: "วิชาบังคับ ๑๘ หน่วยกิต (มนุษย์กับสังคม, กฎหมายทั่วไป, คอมพิวเตอร์และดิจิทัล, อังกฤษเพื่อการสื่อสาร, ปรัชญาเบื้องต้น, สถิติวิจัย) + วิชาเลือก ๖ หน่วยกิต",
      },
      {
        categoryTh: "๒) หมวดวิชาเฉพาะ (ไม่น้อยกว่า ๑๐๒ หน่วยกิต)",
        categoryEn: "Major Courses (Min. 102 Credits)",
        credits: 102,
        description: "กลุ่มพระพุทธศาสนา ๓๐ หน่วยกิต (พระไตรปิฎก, บาลี, กรรมฐาน ๑-๔) + วิชาแกน ๓๓ หน่วยกิต (หลักพุทธธรรม, ปรัชญาเถรวาท, ธรรมบท, ชาดก, มหายาน) + วิชาเฉพาะด้าน ๓๓ หน่วยกิต + วิชาเลือก ๖ หน่วยกิต",
      },
      {
        categoryTh: "๓) หมวดวิชาเลือกเสรี (ไม่น้อยกว่า ๖ หน่วยกิต)",
        categoryEn: "Free Elective Courses (Min. 6 Credits)",
        credits: 6,
        description: "เลือกศึกษาในรายวิชาที่เปิดสอนในระดับปริญญาตรีของมหาวิทยาลัยตามความถนัดและความสนใจ",
      },
    ],
    careerPaths: [
      "นักวิชาการศาสนา / เจ้าหน้าที่ศาสนพิธี (สำนักงานพระพุทธศาสนาแห่งชาติ และกระทรวงวัฒนธรรม)",
      "อนุศาสนาจารย์ (กองทัพบก กองทัพเรือ กองทัพอากาศ และสำนักงานตำรวจแห่งชาติ)",
      "นักจัดกระบวนการเรียนรู้และสมาธิบำบัด (Mindfulness & Meditation Facilitator)",
      "นักเยียวยาจิตใจและผู้ดูแลสุขภาวะทางจิตวิญญาณ (Spiritual Caregiver ในโรงพยาบาลและ Palliative Care)",
      "นักสร้างสรรค์เนื้อหาทางศาสนา ศิลปวัฒนธรรม (Religious & Cultural Content Creator)",
      "ผู้นำเที่ยวและผู้จัดการการท่องเที่ยวเชิงจิตวิญญาณและพุทธศิลป์ (Spiritual & Cultural Tourism Specialist)",
      "นักวิชาการพัฒนาสังคม / นักสังคมสงเคราะห์ในหน่วยงานรัฐและองค์กรพัฒนาเอกชน (NGOs)",
      "เจ้าหน้าที่ฝ่ายพัฒนาทรัพยากรมนุษย์ (HRD) และส่งเสริมจริยธรรมองค์กร (CSR)",
      "พระธรรมทูต (ทั้งในและต่างประเทศ) / พระวิปัสสนาจารย์ / นักวิจัยด้านพุทธศาสน์ศึกษา",
    ],
    qualifications: "๑. พระภิกษุ/สามเณร และคฤหัสถ์ สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.๖) หรือเทียบเท่า ๒. เป็นไปตามข้อบังคับมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ว่าด้วยการศึกษาระดับปริญญาตรี พ.ศ. ๒๕๖๖ ๓. หรือผ่านการคัดเลือกตามเกณฑ์ของสำนักงานปลัดกระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)",
    brochurePdfUrl: "/documents/mko2-buddhist-studies-2570.pdf",
    status: "OPEN",
  };

  if (!currBuddhist) {
    await prisma.curriculum.create({ data: buddhistData });
  } else {
    await prisma.curriculum.update({ where: { id: currBuddhist.id }, data: buddhistData });
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
