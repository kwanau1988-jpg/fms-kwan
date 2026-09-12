-- AlterTable
ALTER TABLE "curricula" ADD COLUMN     "objectives" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "philosophy" TEXT,
ADD COLUMN     "plos" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "qualifications" TEXT;
