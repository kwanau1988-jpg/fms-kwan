# Schema & Data Model: ระบบจัดการข่าวสารประชาสัมพันธ์ (Faculty News & Announcement Management)

## 1. Prisma Data Model
```prisma
model NewsArticle {
  id          String       @id @default(uuid())
  tenantId    String       @map("tenant_id")
  titleTh     String       @map("title_th")
  titleEn     String       @map("title_en")
  slug        String
  summaryTh   String       @map("summary_th")
  summaryEn   String       @map("summary_en")
  contentTh   String       @map("content_th")
  contentEn   String       @map("content_en")
  category    NewsCategory @default(GENERAL)
  coverImage  String?      @map("cover_image")
  isPinned    Boolean      @default(false) @map("is_pinned")
  status      NewsStatus   @default(DRAFT)
  viewCount   Int          @default(0) @map("view_count")
  publishedAt DateTime?    @map("published_at")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, slug])
  @@index([tenantId, status, publishedAt])
  @@map("news_articles")
}
```

## 2. Data Attributes & Relationships
- ทุกตารางเชื่อมโยงกับ `Tenant` ผ่านฟิลด์ `tenantId`
- มีการสร้าง Index ที่ครอบคลุมคีย์การค้นหาหลักเพื่อประสิทธิภาพสูงสุด
- จัดเก็บ Timestamps (`createdAt`, `updatedAt`) ทุก Entity
