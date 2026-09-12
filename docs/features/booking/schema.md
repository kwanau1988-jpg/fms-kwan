# Schema & Data Model: ระบบจองห้องประชุมและยานพาหนะ (Resource Reservation & Conflict Detection)

## 1. Prisma Data Model
```prisma
model Resource {
  id              String         @id @default(uuid())
  tenantId        String         @map("tenant_id")
  type            ResourceType
  nameTh          String         @map("name_th")
  nameEn          String         @map("name_en")
  capacity        Int
  locationOrPlate String         @map("location_or_plate")
  imageUrl        String?        @map("image_url")
  isAvailable     Boolean        @default(true) @map("is_available")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  reservations    Reservation[]

  @@map("resources")
}
```

## 2. Data Attributes & Relationships
- ทุกตารางเชื่อมโยงกับ `Tenant` ผ่านฟิลด์ `tenantId`
- มีการสร้าง Index ที่ครอบคลุมคีย์การค้นหาหลักเพื่อประสิทธิภาพสูงสุด
- จัดเก็บ Timestamps (`createdAt`, `updatedAt`) ทุก Entity
