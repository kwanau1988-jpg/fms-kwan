# Schema & Data Model: ระบบจัดการหลักสูตรการศึกษา (Academic Curriculum & MKO 2 Management)

## 1. Prisma Data Model
```prisma
model Curriculum {
  id             String          @id @default(uuid())
  tenantId       String          @map("tenant_id")
  departmentId   String?         @map("department_id")
  code           String
  nameTh         String          @map("name_th")
  nameEn         String          @map("name_en")
  degreeTh       String          @map("degree_th")
  degreeEn       String          @map("degree_en")
  degreeLevel    DegreeLevel     @default(BACHELOR) @map("degree_level")
  totalCredits   Int             @map("total_credits")
  tuitionFee     Decimal?        @map("tuition_fee") @db.Decimal(12, 2)
  philosophy     String?
  objectives     Json?
  plos           Json?
  studyPlan      Json?           @map("study_plan")
  careerPaths    Json?           @map("career_paths")
  qualifications String?
  brochurePdfUrl String?         @map("brochure_pdf_url")
  status         OpenStatus      @default(OPEN)
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  department     Department?     @relation(fields: [departmentId], references: [id])
  courses        Course[]

  @@unique([tenantId, code])
  @@index([tenantId, status])
  @@map("curricula")
}
```

## 2. Data Attributes & Relationships
- ทุกตารางเชื่อมโยงกับ `Tenant` ผ่านฟิลด์ `tenantId`
- มีการสร้าง Index ที่ครอบคลุมคีย์การค้นหาหลักเพื่อประสิทธิภาพสูงสุด
- จัดเก็บ Timestamps (`createdAt`, `updatedAt`) ทุก Entity
