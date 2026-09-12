# Schema & Data Model: ระบบจัดการบุคลากร (Faculty Personnel & Directory Management)

## 1. Prisma Data Model
```prisma
model PersonnelProfile {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  academicTitle String   @map("academic_title")
  firstNameTh   String   @map("first_name_th")
  lastNameTh    String   @map("last_name_th")
  firstNameEn   String   @map("first_name_en")
  lastNameEn    String   @map("last_name_en")
  departmentTh  String   @map("department_th")
  departmentEn  String   @map("department_en")
  positionTh    String   @map("position_th")
  positionEn    String   @map("position_en")
  email         String
  phoneExt      String?  @map("phone_ext")
  roomNumber    String?  @map("room_number")
  avatarUrl     String?  @map("avatar_url")
  displayOrder  Int      @default(0) @map("display_order")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, isActive, displayOrder])
  @@map("personnel_profiles")
}
```

## 2. Data Attributes & Relationships
- ทุกตารางเชื่อมโยงกับ `Tenant` ผ่านฟิลด์ `tenantId`
- มีการสร้าง Index ที่ครอบคลุมคีย์การค้นหาหลักเพื่อประสิทธิภาพสูงสุด
- จัดเก็บ Timestamps (`createdAt`, `updatedAt`) ทุก Entity
