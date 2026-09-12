# AI Coding Instructions: ระบบแปลงแอปพลิเคชันเป็นโปรแกรมติดตั้ง Windows PC (Native Windows Desktop Packaging)

## 1. กฎเหล็กและข้อห้าม (Hard Rules)
- **ห้ามแก้ไขไฟล์นอกโมดูล:** แก้ไขเฉพาะภายใน `src/features/desktop/` หรือโฟลเดอร์ที่เกี่ยวข้องโดยตรง
- **ความปลอดภัยของสิทธิ์:** ใช้ `requirePermission(session, "system:native-desktop")` เสมอ
- **ห้ามรับ tenantId จาก Client:** ดึงจาก `ctx.tenantId` ของ Session ที่ตรวจสอบแล้วเท่านั้น
- **ห้ามฮาร์ดโค้ดข้อความ UI:** ต้องเรียกใช้ `t("key")` จาก `messages.ts` ทุกจุด

## 2. การใช้งานคอมโพเนนต์
- นำเข้าคอมโพเนนต์จาก `@/shared/components/liyon` เท่านั้น (DataTable, Dialog, Button, Input ฯลฯ)
- จัดการข้อผิดพลาดผ่าน `runAction` จาก `@/shared/lib/actions` เพื่อส่งคืนผลลัพธ์แบบ `ActionResult<T>`

## 3. การปฏิบัติตามสถาปัตยกรรม
- โค้ดภายในโมดูลต้องอยู่ใต้ `_internal/`
- เปิดเผยฟังก์ชันสู่ภายนอกผ่าน `index.ts`, `server.ts` และ `actions.ts` เท่านั้น
