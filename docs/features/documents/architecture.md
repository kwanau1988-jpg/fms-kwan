# Architecture & Flow: ระบบบริหารจัดการและอนุมัติเอกสาร (E-Document Approval Workflow)

## 1. โครงสร้างโฟลเดอร์ตาม Modular Monolith
```
src/features/documents/
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
- **Admin Console:** `/documents`
- **Public Portal:** `N/A (Internal Staff Only)`

## 3. สิทธิ์ระบบ (Permissions)
- กำหนดสิทธิ์: `documents:read, documents:manage, documents:approve`
- ลงทะเบียนใน `src/permissions.ts` และผูกกับบทบาทในระบบ
