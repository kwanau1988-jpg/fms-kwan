# Schema & Data Model: ระบบบริหารจัดการและอนุมัติเอกสาร (E-Document Approval Workflow)

## 1. Prisma Data Model
```prisma
model DocumentRequest {
  id           String            @id @default(uuid())
  tenantId     String            @map("tenant_id")
  docNumber    String            @map("doc_number")
  title        String
  docType      DocumentType      @map("doc_type")
  requesterId  String            @map("requester_id")
  currentStep  Int               @default(1) @map("current_step")
  status       DocStatus         @default(PENDING)
  attachment   String?
  createdAt    DateTime          @default(now()) @map("created_at")
  updatedAt    DateTime          @updatedAt @map("updated_at")

  tenant       Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  requester    User              @relation(fields: [requesterId], references: [id])
  approvals    DocumentApproval[]

  @@unique([tenantId, docNumber])
  @@index([tenantId, status, requesterId])
  @@map("document_requests")
}
```

## 2. Data Attributes & Relationships
- ทุกตารางเชื่อมโยงกับ `Tenant` ผ่านฟิลด์ `tenantId`
- มีการสร้าง Index ที่ครอบคลุมคีย์การค้นหาหลักเพื่อประสิทธิภาพสูงสุด
- จัดเก็บ Timestamps (`createdAt`, `updatedAt`) ทุก Entity
