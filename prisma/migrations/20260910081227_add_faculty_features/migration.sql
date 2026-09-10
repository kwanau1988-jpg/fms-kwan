-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ACADEMIC', 'ACTIVITY', 'RESEARCH', 'GENERAL');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORAL', 'SHORT_COURSE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ROOM', 'VEHICLE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'EXCUSED');

-- CreateTable
CREATE TABLE "sample_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sample_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "summary_th" TEXT,
    "summary_en" TEXT,
    "content_th" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL DEFAULT 'GENERAL',
    "cover_image_url" VARCHAR(500),
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "academic_title" VARCHAR(50),
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "department_th" VARCHAR(150) NOT NULL,
    "department_en" VARCHAR(150) NOT NULL,
    "position_th" VARCHAR(150) NOT NULL,
    "position_en" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_ext" VARCHAR(50),
    "room_number" VARCHAR(50),
    "expertise" JSONB NOT NULL DEFAULT '[]',
    "education" JSONB NOT NULL DEFAULT '[]',
    "publications" JSONB NOT NULL DEFAULT '[]',
    "avatar_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "personnel_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curricula" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree_th" VARCHAR(255) NOT NULL,
    "degree_en" VARCHAR(255) NOT NULL,
    "degree_level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "studyPlan" JSONB NOT NULL DEFAULT '[]',
    "total_credits" INTEGER NOT NULL DEFAULT 0,
    "tuition_fee" DECIMAL(10,2),
    "careerPaths" JSONB NOT NULL DEFAULT '[]',
    "brochure_pdf_url" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "credits" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "doc_number" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "doc_type" VARCHAR(100) NOT NULL,
    "requester_id" UUID NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "attachment_urls" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_approvals" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,
    "approver_id" UUID NOT NULL,
    "decision" "ApprovalDecision" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "action_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'ROOM',
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "location_or_plate" VARCHAR(255) NOT NULL,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "image_url" VARCHAR(500),
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "attendees_count" INTEGER NOT NULL DEFAULT 1,
    "contact_phone" VARCHAR(50),
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "reject_reason" TEXT,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "instructor_id" UUID NOT NULL,
    "room_number" VARCHAR(50),
    "session_date" DATE NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "qr_token" VARCHAR(255),
    "qr_expires_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "classroom_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(64),
    "remark" VARCHAR(255),

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_slips" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "period_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "encrypted_payload" TEXT NOT NULL,
    "net_payable" DECIMAL(12,2) NOT NULL,
    "bank_account_masked" VARCHAR(50),
    "downloaded_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payroll_slips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sample_items_tenant_id_idx" ON "sample_items"("tenant_id");

-- CreateIndex
CREATE INDEX "news_articles_tenant_id_status_published_at_idx" ON "news_articles"("tenant_id", "status", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_tenant_id_slug_key" ON "news_articles"("tenant_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_profiles_user_id_key" ON "personnel_profiles"("user_id");

-- CreateIndex
CREATE INDEX "personnel_profiles_tenant_id_department_th_idx" ON "personnel_profiles"("tenant_id", "department_th");

-- CreateIndex
CREATE INDEX "personnel_profiles_tenant_id_display_order_idx" ON "personnel_profiles"("tenant_id", "display_order");

-- CreateIndex
CREATE INDEX "curricula_tenant_id_degree_level_idx" ON "curricula"("tenant_id", "degree_level");

-- CreateIndex
CREATE UNIQUE INDEX "curricula_tenant_id_code_key" ON "curricula"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_curriculum_id_code_key" ON "courses"("curriculum_id", "code");

-- CreateIndex
CREATE INDEX "document_requests_tenant_id_status_idx" ON "document_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "document_requests_requester_id_idx" ON "document_requests"("requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_requests_tenant_id_doc_number_key" ON "document_requests"("tenant_id", "doc_number");

-- CreateIndex
CREATE INDEX "document_approvals_request_id_step_order_idx" ON "document_approvals"("request_id", "step_order");

-- CreateIndex
CREATE INDEX "resources_tenant_id_type_idx" ON "resources"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "reservations_tenant_id_resource_id_start_time_end_time_idx" ON "reservations"("tenant_id", "resource_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "classroom_sessions_tenant_id_course_id_idx" ON "classroom_sessions"("tenant_id", "course_id");

-- CreateIndex
CREATE INDEX "attendance_records_tenant_id_student_id_idx" ON "attendance_records"("tenant_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_session_id_student_id_key" ON "attendance_records"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_periods_tenant_id_year_month_key" ON "payroll_periods"("tenant_id", "year", "month");

-- CreateIndex
CREATE INDEX "payroll_slips_tenant_id_user_id_idx" ON "payroll_slips"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_slips_period_id_user_id_key" ON "payroll_slips"("period_id", "user_id");

-- AddForeignKey
ALTER TABLE "sample_items" ADD CONSTRAINT "sample_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_profiles" ADD CONSTRAINT "personnel_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_profiles" ADD CONSTRAINT "personnel_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "document_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_sessions" ADD CONSTRAINT "classroom_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "classroom_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_slips" ADD CONSTRAINT "payroll_slips_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_slips" ADD CONSTRAINT "payroll_slips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
