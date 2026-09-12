# Architecture & Flow: ระบบจัดการข่าวสารประชาสัมพันธ์ (Faculty News & Announcement Management)

## 1. โครงสร้างโฟลเดอร์ตาม Modular Monolith
```
src/features/news/
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
- **Admin Console:** `/news`
- **Public Portal:** `/portal/news`

## 3. สิทธิ์ระบบ (Permissions)
- กำหนดสิทธิ์: `news:read, news:manage`
- ลงทะเบียนใน `src/permissions.ts` และผูกกับบทบาทในระบบ
