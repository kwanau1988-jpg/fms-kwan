# Architecture & Flow: ระบบจัดการหลักสูตรการศึกษา (Academic Curriculum & MKO 2 Management)

## 1. โครงสร้างโฟลเดอร์ตาม Modular Monolith
```
src/features/curriculum/
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
- **Admin Console:** `/curriculum`
- **Public Portal:** `/portal/curriculum`

## 3. สิทธิ์ระบบ (Permissions)
- กำหนดสิทธิ์: `curriculum:read, curriculum:manage`
- ลงทะเบียนใน `src/permissions.ts` และผูกกับบทบาทในระบบ
