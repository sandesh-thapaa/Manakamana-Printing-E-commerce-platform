/*
  Warnings:

  - The `role` column on the `admin_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `normalized_phone_number` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `normalized_phone_number` on the `registration_requests` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the `designs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `registration_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `templates` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DesignSubmissionStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovedDesignStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "designs" DROP CONSTRAINT "designs_clientId_fkey";

-- DropForeignKey
ALTER TABLE "designs" DROP CONSTRAINT "designs_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_designId_fkey";

-- DropIndex
DROP INDEX "clients_normalized_phone_number_key";

-- DropIndex
DROP INDEX "registration_requests_normalized_phone_number_key";

-- AlterTable
ALTER TABLE "admin_users" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "normalized_phone_number";

-- AlterTable
ALTER TABLE "registration_requests" DROP COLUMN "normalized_phone_number";

-- AlterTable
ALTER TABLE "templates" DROP COLUMN "category",
DROP COLUMN "name",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "designs";

-- DropEnum
DROP TYPE "AdminRole";

-- DropEnum
DROP TYPE "DesignStatus";

-- CreateTable
CREATE TABLE "template_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_submissions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT,
    "title" TEXT,
    "notes" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "DesignSubmissionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "feedbackMessage" TEXT,
    "approvedDesignId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy_id" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "design_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approved_designs" (
    "id" TEXT NOT NULL,
    "designCode" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "previewUrl" TEXT,
    "approvedFileUrl" TEXT NOT NULL,
    "status" "ApprovedDesignStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedBy_id" TEXT,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy_id" TEXT,
    "archivedAt" TIMESTAMP(3),
    "archiveReason" TEXT,

    CONSTRAINT "approved_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "adminId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "template_categories_slug_key" ON "template_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "design_submissions_approvedDesignId_key" ON "design_submissions"("approvedDesignId");

-- CreateIndex
CREATE UNIQUE INDEX "approved_designs_designCode_key" ON "approved_designs"("designCode");

-- CreateIndex
CREATE UNIQUE INDEX "approved_designs_submissionId_key" ON "approved_designs"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_phone_number_key" ON "clients"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "registration_requests_phone_number_key" ON "registration_requests"("phone_number");

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "template_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_submissions" ADD CONSTRAINT "design_submissions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_submissions" ADD CONSTRAINT "design_submissions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_submissions" ADD CONSTRAINT "design_submissions_reviewedBy_id_fkey" FOREIGN KEY ("reviewedBy_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approved_designs" ADD CONSTRAINT "approved_designs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approved_designs" ADD CONSTRAINT "approved_designs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "design_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approved_designs" ADD CONSTRAINT "approved_designs_approvedBy_id_fkey" FOREIGN KEY ("approvedBy_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approved_designs" ADD CONSTRAINT "approved_designs_archivedBy_id_fkey" FOREIGN KEY ("archivedBy_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_designId_fkey" FOREIGN KEY ("designId") REFERENCES "approved_designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
