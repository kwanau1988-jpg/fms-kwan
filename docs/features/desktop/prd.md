# PRD: ระบบแปลงแอปพลิเคชันเป็นโปรแกรมติดตั้ง Windows PC (Native Windows Desktop Packaging)

## 1. วัตถุประสงค์ (Objective)
แพ็กเกจระบบ Next.js เป็นโปรแกรมติดตั้ง Windows (.exe NSIS Installer และ Portable .exe) มีระบบสลับเซิร์ฟเวอร์ Dual-Mode, GUI Modal สำหรับ Ping เช็คความเร็วเครือข่าย และถาดระบบ System Tray ออกแบบตามมาตรฐาน Modular Monolith และสอดคล้องกับระเบียบราชการของสถาบันอุดมศึกษา

## 2. กลุ่มผู้ใช้งาน (User Personas & Roles)
- **Guest / นักศึกษา / บุคคลภายนอก:** เข้าชมข้อมูลผ่าน Public Portal
- **อาจารย์ / เจ้าหน้าที่ (Staff):** เข้าใช้งานและจัดการข้อมูลตามขอบเขตงาน
- **ผู้บริหาร / ผู้อนุมัติ (Approver):** ตรวจสอบ พิจารณา และอนุมัติรายการ
- **ผู้ดูแลระบบ (Admin / Super Admin):** มีสิทธิ์ควบคุมและตั้งค่าระบบทั้งหมด

## 3. Functional Requirements
- รองรับการทำงานแบบ Multi-tenancy กำกับด้วย `tenantId` ในทุกตาราง
- รองรับการแสดงผล 2 ภาษา (ภาษาไทย และ ภาษาอังกฤษ)
- ระบบค้นหา คัดกรอง และแบ่งหน้า (Pagination) แบบ Real-time
- บันทึกประวัติการเปลี่ยนแปลง (Audit Log) ในทุกขั้นตอนการกลายพันธุ์ข้อมูล (Mutation)

## 4. Acceptance Criteria
- ผ่านการตรวจสอบความถูกต้องด้วย Zod Schema พร้อมแจ้งเตือนแบบ Localized
- หน้าจอ UI ตอบสนองรวดเร็ว ใช้ดีไซน์ซิสเต็ม Liyon Design System
- ผ่านการทดสอบระดับ Unit Test และ Integration Test 100%
