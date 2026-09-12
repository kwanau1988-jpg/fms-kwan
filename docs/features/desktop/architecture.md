# Architecture & Flow: ระบบแปลงแอปพลิเคชันเป็นโปรแกรมติดตั้ง Windows PC (Native Windows Desktop Packaging)

## 1. โครงสร้างโฟลเดอร์ตาม Modular Monolith
```
src/features/desktop/
├── _internal/
│   ├── actions.ts          # Server Actions ภายใน
│   ├── services.ts         # Pure Business Logic & Database Queries
│   ├── validations.ts      # Zod Schemas & Types
│   └── ...
├── index.ts                # Client-safe exports
├── server.ts               # Server Components data queries
├── actions.ts              # Public Server Actions
├── messages.ts             # คำแปลภาษาไทยและภาษาอังกฤษ
└── permissions.ts          # รายการ Permissions ประจำโมดูล
```

## 2. Route Mapping
- **Admin Console:** `All Admin Modules in Native Window`
- **Public Portal:** `Public Portal in Native Window`

## 3. สิทธิ์ระบบ (Permissions)
- กำหนดสิทธิ์: `system:native-desktop`
- ลงทะเบียนใน `src/permissions.ts` และผูกกับบทบาทในระบบ
