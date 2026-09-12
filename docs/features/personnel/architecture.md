# Architecture & Flow: ระบบจัดการบุคลากร (Faculty Personnel & Directory Management)

## 1. โครงสร้างโฟลเดอร์ตาม Modular Monolith
```
src/features/personnel/
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
- **Admin Console:** `/personnel`
- **Public Portal:** `/portal/personnel`

## 3. สิทธิ์ระบบ (Permissions)
- กำหนดสิทธิ์: `personnel:read, personnel:manage`
- ลงทะเบียนใน `src/permissions.ts` และผูกกับบทบาทในระบบ
