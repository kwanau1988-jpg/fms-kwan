# Implementation Plan: ระบบบริหารจัดการและอนุมัติเอกสาร (E-Document Approval Workflow)

- [x] **Step 1: Data Model & Database Migration**
  - ออกแบบและลงทะเบียนโมเดลใน Prisma Schema
  - รัน Migration และสร้าง Entity สำหรับ Multi-tenancy
- [x] **Step 2: Internal Services & Validations**
  - กำหนด Zod Schema พร้อม Localized Error Messages
  - พัฒนา Services สำหรับ Query และ Mutation ข้อมูล
- [x] **Step 3: Server Actions & Module Boundaries**
  - ห่อหุ้มด้วย `runAction` และตรวจสอบ RBAC Permissions
  - ส่งออก Public API ผ่าน `index.ts`, `server.ts`, `actions.ts`
- [x] **Step 4: UI Development (Admin & Portal)**
  - พัฒนาหน้าจอจัดการหลังบ้านด้วย Liyon Design System
  - พัฒนาหน้าแสดงผลสู่สาธารณะบน Public Portal
- [x] **Step 5: Testing & Quality Verification**
  - เขียนและรัน Unit Tests / Integration Tests
  - ตรวจสอบความถูกต้องผ่าน `npm run check` 100%
