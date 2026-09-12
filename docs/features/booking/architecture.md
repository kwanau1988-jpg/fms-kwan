# Architecture & Flow: ระบบจองห้องประชุมและยานพาหนะ (Resource Reservation & Conflict Detection)

## 1. โครงสร้างโฟลเดอร์ตาม Modular Monolith
```
src/features/booking/
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
- **Admin Console:** `/booking`
- **Public Portal:** `/portal/facilities`

## 3. สิทธิ์ระบบ (Permissions)
- กำหนดสิทธิ์: `booking:read, booking:manage, booking:approve`
- ลงทะเบียนใน `src/permissions.ts` และผูกกับบทบาทในระบบ
