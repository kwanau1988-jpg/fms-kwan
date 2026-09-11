# FMS Faculty Web Platform — เว็บไซต์และระบบสารสนเทศคณะวิทยาการจัดการ

ระบบเว็บแอปพลิเคชันและสารสนเทศระดับองค์กรสำหรับคณะวิทยาการจัดการ สร้างด้วยสถาปัตยกรรม **Modular Monolith** บน **Next.js 16 (App Router) + React 19 + Prisma 6 + PostgreSQL + Tailwind CSS 4 (Liyon Design System)** รองรับสองภาษา (ไทย/อังกฤษ) และ Multi-tenancy เต็มรูปแบบ

---

## 🏛️ สถาปัตยกรรมและส่วนประกอบของระบบ (Platform Architecture)

ระบบประกอบด้วย 2 ส่วนการทำงานหลัก:

### 1. Public Portal (หน้าบ้านสำหรับประชาชน นักศึกษา และผู้สนใจ)
- **หน้าหลักคณะ (`/portal`):** แบนเนอร์อัตลักษณ์ สรุปข่าวประชาสัมพันธ์ล่าสุด ทางลัดสู่บริการ และสถิติคณะ
- **ข่าวสาร/ประชาสัมพันธ์ (`/portal/news` & `/portal/news/[slug]`):** ข่าวสาร กิจกรรม คัดกรองตามหมวดหมู่ พร้อมรูปภาพและแท็ก
- **ทำเนียบบุคลากร (`/portal/personnel`):** รายนามคณาจารย์และเจ้าหน้าที่ คัดกรองตามภาควิชา/ตำแหน่ง ข้อมูลติดต่อและงานวิจัย
- **หลักสูตรการศึกษา (`/portal/curriculum`):** รายละเอียดหลักสูตรปริญญาตรี ปริญญาโท ปริญญาเอก แผนการเรียน และหน่วยกิต
- **สิ่งอำนวยความสะดวก (`/portal/facilities`):** ข้อมูลห้องบรรยาย ห้องปฏิบัติการคอมพิวเตอร์ และอุปกรณ์พร้อมให้บริการ
- **สแกนเช็กชื่อเข้างาน/เรียน (`/portal/attendance/scan`):** จุดสแกน QR Code สำหรับอาจารย์ บุคลากร และนักศึกษา

### 2. Admin Console (หลังบ้านสำหรับเจ้าหน้าที่และผู้บริหาร)
- 📊 **Executive Dashboard (`/dashboard`):** ภาพรวมสถิติ ข้อมูลการใช้งาน และกิจกรรมล่าสุด
- 📰 **ระบบจัดการข่าวสาร (`/news`):** สร้าง/แก้ไข/ลบข่าว จัดการสถานะเผยแพร่และภาพประกอบ
- 👥 **ระบบทำเนียบบุคลากร (`/personnel`):** บันทึกประวัติบุคลากร ตำแหน่งทางวิชาการ ความเชี่ยวชาญ
- 🎓 **ระบบจัดการหลักสูตร (`/curriculum`):** บริหารจัดการโครงสร้างหลักสูตร แผนการศึกษา และสถานะการเปิดรับ
- 🏢 **ระบบจองห้องและทรัพยากร (`/booking`):** ระบบตรวจสอบการชนของเวลาแบบ Real-time (Collision Detection) และพิจารณาอนุมัติ
- ⏱️ **ระบบเช็กชื่อและ Dynamic QR (`/attendance`):** สร้าง Dynamic Anti-Spoof QR Token อายุ 15 นาที และบันทึกประวัติการสแกน
- 💰 **ระบบสลิปเงินเดือนอิเล็กทรอนิกส์ (`/payroll`):** ประมวลผลเงินเดือน, เข้ารหัสข้อมูลด้วย AES-256-GCM, และหน้าสำหรับบุคลากรดูสลิปของตนเอง (`/me/payroll`)
- 📑 **ระบบเสนอเซ็นและคำร้อง (`/documents`):** ส่งคำร้อง, มอบหมายผู้อนุมัติแบบเป็นลำดับขั้น, และพิจารณาลงนาม
- 🔐 **ระบบผู้ใช้ บทบาท และสิทธิ์ (`/users`, `/users/roles`):** การควบคุมการเข้าถึงตามบทบาท (RBAC) และบันทึก Audit Logs

---

## ⚡️ เริ่มต้นใช้งาน (Quick Start)

1. **เลือก Node 22 และติดตั้ง dependencies:**
   ```bash
   nvm use
   npm install
   ```

2. **สั่งตั้งค่าอัตโนมัติ (สร้าง .env + migrate + seed):**
   ```bash
   npm run setup
   ```

3. **เริ่ม Dev Server:**
   ```bash
   npm run dev
   ```
   - **Public Portal:** http://localhost:3010/portal
   - **Admin Console:** http://localhost:3010
   - **บัญชีทดสอบตั้งต้น:**
     - ผู้ดูแลระบบ: `admin@app.local` / `Passw0rd!vibe`
     - เจ้าหน้าที่การเงิน: `finance@app.local` / `Passw0rd!vibe`
     - เจ้าหน้าที่ทั่วไป: `staff@app.local` / `Passw0rd!vibe`
     - อาจารย์: `staff1@app.local` / `Passw0rd!vibe`

---

## 🧪 การทดสอบและการรับประกันคุณภาพ (Quality Verification)

ระบบผ่านการทดสอบอัตโนมัติครบ 100% ตามมาตรฐานสถาปัตยกรรม:
- **Type-Check:** `npm run type-check` (0 errors)
- **Linter:** `npm run lint` (0 errors, 0 warnings)
- **Boundary Verification:** `npm run deps:check` (0 violations)
- **Unit Tests:** `npm run test` (168 tests, 34 test suites)
- **Integration Tests:** `npm run test:integration` (57 tests, 9 test suites)
- **Production Build:** `npm run build` (Next.js 16 Production Output)
- **Full Quality Suite:** `npm run check`

---

## คำสั่งสำคัญในโปรเจกต์

- `npm run dev` — รันแอปในโหมดพัฒนาที่พอร์ต 3010
- `npm run check` — ตรวจสอบ type-check (ทั้งแอปและเทสต์) + lint + ตรวจ dependency cruiser + unit/integration tests
  > [!NOTE]
  > การรัน integration test จะมีการ TRUNCATE ตารางเพื่อทดสอบ ดังนั้นหลังรันเสร็จ ให้สั่ง `npm run db:seed` ใหม่ก่อนใช้งานต่อ
- `npm run test` — รันเฉพาะ Unit tests ด้วย Vitest
- `npm run test:integration` — รัน Integration tests
- `npm run test:e2e` — รัน End-to-End tests ด้วย Playwright
- `npm run db:seed` — สร้างผู้ใช้ตัวอย่าง 5 บัญชีและบทบาทตั้งต้น
- `npm run sync:liyon` — ดึงไฟล์สไตล์ล่าสุดจาก Liyon Theme

---

## โครงสร้างสถาปัตยกรรม (Modular Monolith)

โปรเจกต์จัดโครงสร้างแบบแบ่งตามโดเมนธุรกิจ (Feature-driven):

```
src/
├── app/                      # Next.js App Router (เฉพาะ Routing & Layout)
│   ├── (admin)/              # หน้าหลังบ้านที่มี Sidebar/Navbar
│   ├── (auth)/               # หน้าล็อกอินและกู้คืนรหัสผ่าน
│   └── api/                  # API Route Handlers (เช่น NextAuth)
├── features/                 # โดเมนธุรกิจหลัก
│   ├── identity/             # ระบบผู้ใช้ บทบาท และสิทธิ์ (ตัวอย่าง Feature ที่สมบูรณ์)
│   │   ├── index.ts          # Public types & Client-safe helper
│   │   ├── server.ts         # Public server functions สำหรับ Feature อื่นเรียกใช้
│   │   ├── actions.ts        # Server Actions ที่ UI เรียกใช้
│   │   ├── messages.ts       # พจนานุกรมข้อความสองภาษา (TH/EN)
│   │   ├── permissions.ts    # ทะเบียนสิทธิ์ของ Feature นี้
│   │   └── _internal/        # โค้ดภายใน (ห้าม Feature อื่น import ตรง ๆ)
│   └── <your-feature>/       # โฟลเดอร์ฟีเจอร์ใหม่ที่นักเรียนสร้าง
├── shared/                   # โค้ด ส่วนประกอบ และ Utility ที่ใช้ร่วมกันทั้งหมด
│   ├── components/liyon/     # UI Components ของระบบดีไซน์ Liyon
│   └── lib/                  # ฟังก์ชันช่วยเหลือ เช่น i18n, formatting, date
├── i18n/                     # จุดรวมพจนานุกรมสองภาษาของทุก Feature
└── permissions.ts            # จุดรวม Permission Registry ทั้งหมดของระบบ
```

---

## คู่มือสำหรับนักเรียน: การสร้าง Feature ใหม่ด้วย Vibe Coding

เมื่อต้องการสร้างฟีเจอร์ใหม่ ให้แจ้ง AI Assistant (Claude Code, Cursor, Antigravity) โดยทำตามขั้นตอนสถาปัตยกรรมดังนี้:

### ขั้นตอนที่ 1: เพิ่ม Data Model ใน Prisma
1. เปิดไฟล์ `prisma/schema.prisma` และเพิ่ม Model ใหม่
2. **กติกา:** ทุกตารางธุรกิจต้องมีฟิลด์ `tenantId String @map("tenant_id") @db.Uuid`
3. รันคำสั่ง migration:
   ```bash
   npm run db:migrate:dev -- --name add_<feature_name>
   ```

### ขั้นตอนที่ 2: สร้าง Feature โฟลเดอร์ `src/features/<name>/`
สร้างไฟล์มาตรฐานของ Feature:
- `index.ts`: export เฉพาะ types และ helper ปลอดภัยสำหรับ Client
- `server.ts`: export ฟังก์ชันสำหรับ Server Components
- `actions.ts`: export Server Actions (รับ input ด้วย Zod และครอบด้วย `runAction`)
- `permissions.ts`: ประกาศสิทธิ์ที่เกี่ยวข้อง เช่น `<feature>:read`, `<feature>:create`
- `messages.ts`: ประกาศข้อความแปลสองภาษา `{ key: { th: "...", en: "..." } }`
- โฟลเดอร์ `_internal/`: วาง Business Logic และ Services

### ขั้นตอนที่ 3: เชื่อมต่อระบบกลาง
1. **ลงทะเบียนสิทธิ์:** นำสิทธิ์จาก `src/features/<name>/permissions.ts` ไปรวมใน `src/permissions.ts`
2. **ลงทะเบียนข้อความสองภาษา:** นำ `messages` ไปรวมใน `src/i18n/index.ts`
3. **ตรวจสอบความถูกต้อง:** รัน `npm test src/i18n/index.test.ts` เพื่อเช็กว่าคีย์ภาษาครบทั้ง TH/EN

### ขั้นตอนที่ 4: สร้างหน้า UI ใน `src/app/(admin)/<name>/`
1. วาง Page ใน `src/app/(admin)/<name>/page.tsx`
2. แสดงข้อความผ่าน `t("key")` เสมอ ห้าม hardcode ข้อความตรงๆ
3. ใช้งาน UI Components จาก `@/shared/components/liyon`
4. เรียกใช้ Server Actions ผ่าน hooks หรือ form action

### ขั้นตอนที่ 5: ตรวจสอบความถูกต้อง
รันคำสั่งตรวจสอบมาตรฐาน:
```bash
npm run check
```
หากผ่านทุกข้อ แสดงว่าฟีเจอร์ใหม่ปฏิบัติตามมาตรฐานสถาปัตยกรรมอย่างสมบูรณ์แบบ!
