/*
  Warnings:

  - You are about to drop the column `previewUrl` on the `approved_designs` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `registration_requests` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by_id` on the `registration_requests` table. All the data in the column will be lost.
  - You are about to drop the column `credentials_sent_at` on the `registration_requests` table. All the data in the column will be lost.
  - You are about to drop the column `credentials_sent_by_id` on the `registration_requests` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_at` on the `registration_requests` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_by_id` on the `registration_requests` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `templates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "registration_requests" DROP CONSTRAINT "registration_requests_approved_by_id_fkey";

-- DropForeignKey
ALTER TABLE "registration_requests" DROP CONSTRAINT "registration_requests_credentials_sent_by_id_fkey";

-- DropForeignKey
ALTER TABLE "registration_requests" DROP CONSTRAINT "registration_requests_rejected_by_id_fkey";

-- AlterTable
ALTER TABLE "approved_designs" DROP COLUMN "previewUrl";

-- AlterTable
ALTER TABLE "registration_requests" DROP COLUMN "approved_at",
DROP COLUMN "approved_by_id",
DROP COLUMN "credentials_sent_at",
DROP COLUMN "credentials_sent_by_id",
DROP COLUMN "rejected_at",
DROP COLUMN "rejected_by_id";

-- AlterTable
ALTER TABLE "templates" DROP COLUMN "previewUrl";
