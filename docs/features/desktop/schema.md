# Schema & Data Model: ระบบแปลงแอปพลิเคชันเป็นโปรแกรมติดตั้ง Windows PC (Native Windows Desktop Packaging)

## 1. Prisma Data Model
```prisma
// Native Windows Desktop Shell (Electron + Next.js Standalone Runner)
// Config stored in %APPDATA%/th.ac.fms.management/fms-desktop-config.json:
// {
//   "customServerUrl": "http://192.168.1.100:3010",
//   "bounds": { "x": 100, "y": 100, "width": 1440, "height": 900 }
// }
```

## 2. Data Attributes & Relationships
- ทุกตารางเชื่อมโยงกับ `Tenant` ผ่านฟิลด์ `tenantId`
- มีการสร้าง Index ที่ครอบคลุมคีย์การค้นหาหลักเพื่อประสิทธิภาพสูงสุด
- จัดเก็บ Timestamps (`createdAt`, `updatedAt`) ทุก Entity
