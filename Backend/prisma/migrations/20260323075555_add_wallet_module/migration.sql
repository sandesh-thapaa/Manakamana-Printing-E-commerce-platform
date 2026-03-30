/*
  Warnings:

  - A unique constraint covering the columns `[walletTransactionId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recipientId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientRole` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WalletTopupStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WalletTxnType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletTxnSource" AS ENUM ('TOPUP', 'ORDER', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "NotificationRecipientRole" AS ENUM ('CLIENT', 'ADMIN');

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_clientId_fkey";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "recipientId" TEXT NOT NULL,
ADD COLUMN     "recipientRole" "NotificationRecipientRole" NOT NULL,
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
ADD COLUMN     "totalAmount" DECIMAL(12,2),
ADD COLUMN     "walletTransactionId" TEXT;

-- CreateTable
CREATE TABLE "company_payment_details" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branch" TEXT,
    "upiId" TEXT,
    "qrImageUrl" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_accounts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "availableBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_topup_requests" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "submittedAmount" DECIMAL(12,2) NOT NULL,
    "approvedAmount" DECIMAL(12,2),
    "paymentMethod" "PaymentMethod" NOT NULL,
    "transferReference" TEXT,
    "note" TEXT,
    "proofFilePath" TEXT NOT NULL,
    "proofFileName" TEXT,
    "proofMimeType" TEXT,
    "proofFileSize" INTEGER,
    "status" "WalletTopupStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejectionReason" TEXT,
    "rejectionCode" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_topup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "topupRequestId" TEXT,
    "type" "WalletTxnType" NOT NULL,
    "source" "WalletTxnSource" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "balanceBefore" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_payment_details_isActive_idx" ON "company_payment_details"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_accounts_clientId_key" ON "wallet_accounts"("clientId");

-- CreateIndex
CREATE INDEX "wallet_accounts_clientId_idx" ON "wallet_accounts"("clientId");

-- CreateIndex
CREATE INDEX "wallet_topup_requests_walletId_idx" ON "wallet_topup_requests"("walletId");

-- CreateIndex
CREATE INDEX "wallet_topup_requests_clientId_idx" ON "wallet_topup_requests"("clientId");

-- CreateIndex
CREATE INDEX "wallet_topup_requests_status_idx" ON "wallet_topup_requests"("status");

-- CreateIndex
CREATE INDEX "wallet_topup_requests_createdAt_idx" ON "wallet_topup_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_topupRequestId_key" ON "wallet_transactions"("topupRequestId");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_idx" ON "wallet_transactions"("walletId");

-- CreateIndex
CREATE INDEX "wallet_transactions_clientId_idx" ON "wallet_transactions"("clientId");

-- CreateIndex
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "wallet_transactions_source_idx" ON "wallet_transactions"("source");

-- CreateIndex
CREATE INDEX "wallet_transactions_sourceId_idx" ON "wallet_transactions"("sourceId");

-- CreateIndex
CREATE INDEX "wallet_transactions_createdAt_idx" ON "wallet_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_recipientRole_recipientId_idx" ON "notifications"("recipientRole", "recipientId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_walletTransactionId_key" ON "orders"("walletTransactionId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "wallet_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_payment_details" ADD CONSTRAINT "company_payment_details_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_accounts" ADD CONSTRAINT "wallet_accounts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_topup_requests" ADD CONSTRAINT "wallet_topup_requests_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_topup_requests" ADD CONSTRAINT "wallet_topup_requests_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_topup_requests" ADD CONSTRAINT "wallet_topup_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_topupRequestId_fkey" FOREIGN KEY ("topupRequestId") REFERENCES "wallet_topup_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
