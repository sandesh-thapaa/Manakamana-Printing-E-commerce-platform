import prisma from "../../connect";
import { Decimal } from "@prisma/client/runtime/library";
import { getOrCreateWalletService } from "./wallet-account.service";

// ── CLIENT: Submit top-up request ──
export const submitTopupService = async (data: {
  clientId: string;
  submittedAmount: number;
  paymentMethod: "UPI" | "BANK_TRANSFER";
  transferReference?: string;
  note?: string;
  proofFilePath: string;
  proofFileName?: string;
  proofMimeType?: string;
  proofFileSize?: number;
}) => {
  const wallet = await getOrCreateWalletService(data.clientId);

  const request = await prisma.walletTopupRequest.create({
    data: {
      walletId: wallet.id,
      clientId: data.clientId,
      submittedAmount: data.submittedAmount,
      paymentMethod: data.paymentMethod,
      transferReference: data.transferReference,
      note: data.note,
      proofFilePath: data.proofFilePath,
      proofFileName: data.proofFileName,
      proofMimeType: data.proofMimeType,
      proofFileSize: data.proofFileSize,
      status: "PENDING_REVIEW",
    },
  });

  // Create admin notification
  await prisma.notification.create({
    data: {
      recipientRole: "ADMIN",
      recipientId: "all",
      type: "wallet_topup_submitted",
      title: "New wallet top-up request",
      message: `Client submitted a payment proof for NPR ${data.submittedAmount}`,
      referenceId: request.id,
    },
  });

  return request;
};

// ── CLIENT: Get my top-up requests ──
export const getClientTopupsService = async (params: {
  clientId: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const where: any = { clientId: params.clientId };
  if (params.status) where.status = params.status;

  const [items, total] = await Promise.all([
    prisma.walletTopupRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.walletTopupRequest.count({ where }),
  ]);

  return {
    items: items.map((i) => ({
      requestId: i.id,
      submittedAmount: Number(i.submittedAmount),
      approvedAmount: i.approvedAmount ? Number(i.approvedAmount) : null,
      paymentMethod: i.paymentMethod,
      status: i.status,
      submittedAt: i.createdAt,
      reviewedAt: i.reviewedAt,
      rejectionReason: i.rejectionReason,
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      totalItems: total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
};

// ── CLIENT: Get single top-up request ──
export const getClientTopupByIdService = async (requestId: string, clientId: string) => {
  return prisma.walletTopupRequest.findFirst({
    where: { id: requestId, clientId },
  });
};

// ── ADMIN: Get all top-up requests ──
export const getAdminTopupsService = async (params: {
  status?: string;
  clientId?: string;
  paymentMethod?: string;
  page: number;
  limit: number;
}) => {
  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.clientId) where.clientId = params.clientId;
  if (params.paymentMethod) where.paymentMethod = params.paymentMethod;

  const [items, total] = await Promise.all([
    prisma.walletTopupRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        client: { select: { id: true, business_name: true, phone_number: true } },
      },
    }),
    prisma.walletTopupRequest.count({ where }),
  ]);

  return {
    items: items.map((i) => ({
      requestId: i.id,
      client: i.client
        ? { id: i.client.id, name: i.client.business_name, phone: i.client.phone_number }
        : null,
      submittedAmount: Number(i.submittedAmount),
      paymentMethod: i.paymentMethod,
      status: i.status,
      submittedAt: i.createdAt,
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      totalItems: total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
};

// ── ADMIN: Get single top-up request detail ──
export const getAdminTopupByIdService = async (requestId: string) => {
  return prisma.walletTopupRequest.findUnique({
    where: { id: requestId },
    include: {
      client: { select: { id: true, business_name: true, phone_number: true } },
    },
  });
};

// ── ADMIN: Approve top-up request (ATOMIC) ──
export const approveTopupService = async (
  requestId: string,
  adminId: string,
  approvedAmount: number,
  note?: string
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch request and verify status
    const request = await tx.walletTopupRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new Error("Top-up request not found");
    if (request.status !== "PENDING_REVIEW") {
      throw new Error(`Request already ${request.status.toLowerCase()}`);
    }

    // 2. Get wallet and current balance
    const wallet = await tx.walletAccount.findUnique({
      where: { id: request.walletId },
    });
    if (!wallet) throw new Error("Wallet not found");

    const currentBalance = Number(wallet.availableBalance);
    const newBalance = currentBalance + approvedAmount;

    // 3. Create wallet credit transaction
    const txn = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        clientId: request.clientId,
        topupRequestId: request.id,
        type: "CREDIT",
        source: "TOPUP",
        sourceId: request.id,
        amount: approvedAmount,
        currency: wallet.currency,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: note || "Wallet top-up approved",
      },
    });

    // 4. Update wallet balance
    await tx.walletAccount.update({
      where: { id: wallet.id },
      data: { availableBalance: newBalance },
    });

    // 5. Update request status
    const updatedRequest = await tx.walletTopupRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        approvedAmount,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    // 6. Create client notification
    await tx.notification.create({
      data: {
        recipientRole: "CLIENT",
        recipientId: request.clientId,
        clientId: request.clientId,
        type: "wallet_topup_approved",
        title: "Wallet top-up approved",
        message: `Your wallet has been credited with NPR ${approvedAmount}`,
        referenceId: request.id,
      },
    });

    // 7. Audit log
    await tx.auditLog.create({
      data: {
        action: "TOPUP_APPROVED",
        entityId: requestId,
        entityType: "WalletTopupRequest",
        adminId,
        details: {
          submittedAmount: Number(request.submittedAmount),
          approvedAmount,
          previousBalance: currentBalance,
          newBalance,
        },
      },
    });

    return {
      request: updatedRequest,
      transaction: txn,
      newBalance,
    };
  });
};

// ── ADMIN: Reject top-up request ──
export const rejectTopupService = async (
  requestId: string,
  adminId: string,
  reason: string,
  reasonCode?: string
) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.walletTopupRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new Error("Top-up request not found");
    if (request.status !== "PENDING_REVIEW") {
      throw new Error(`Request already ${request.status.toLowerCase()}`);
    }

    const updatedRequest = await tx.walletTopupRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        rejectionCode: reasonCode,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    // Notify client
    await tx.notification.create({
      data: {
        recipientRole: "CLIENT",
        recipientId: request.clientId,
        clientId: request.clientId,
        type: "wallet_topup_rejected",
        title: "Wallet top-up rejected",
        message: `Your top-up request for NPR ${Number(request.submittedAmount)} was rejected: ${reason}`,
        referenceId: request.id,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        action: "TOPUP_REJECTED",
        entityId: requestId,
        entityType: "WalletTopupRequest",
        adminId,
        details: { reason, reasonCode },
      },
    });

    return updatedRequest;
  });
};
