import prisma from "../../connect";
import { getOrCreateWalletService } from "./wallet-account.service";

// ── CLIENT: Get wallet transactions ──
export const getClientTransactionsService = async (params: {
  clientId: string;
  type?: string;
  source?: string;
  page: number;
  limit: number;
}) => {
  const where: any = { clientId: params.clientId };
  if (params.type) where.type = params.type;
  if (params.source) where.source = params.source;

  const [items, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return {
    items: items.map((i) => ({
      transactionId: i.id,
      type: i.type,
      source: i.source,
      sourceId: i.sourceId,
      amount: Number(i.amount),
      currency: i.currency,
      balanceBefore: Number(i.balanceBefore),
      balanceAfter: Number(i.balanceAfter),
      description: i.description,
      createdAt: i.createdAt,
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      totalItems: total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
};

// ── ADMIN: Get all transactions ──
export const getAdminTransactionsService = async (params: {
  clientId?: string;
  type?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}) => {
  const where: any = {};
  if (params.clientId) where.clientId = params.clientId;
  if (params.type) where.type = params.type;
  if (params.source) where.source = params.source;
  if (params.dateFrom || params.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
    if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
  }

  const [items, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        client: { select: { id: true, business_name: true } },
      },
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return {
    items: items.map((i) => ({
      transactionId: i.id,
      client: i.client ? { id: i.client.id, name: i.client.business_name } : null,
      type: i.type,
      source: i.source,
      sourceId: i.sourceId,
      amount: Number(i.amount),
      currency: i.currency,
      balanceBefore: Number(i.balanceBefore),
      balanceAfter: Number(i.balanceAfter),
      description: i.description,
      createdAt: i.createdAt,
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      totalItems: total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
};

// ── Deduct wallet for order (ATOMIC) ──
export const deductForOrderService = async (orderId: string, clientId: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch order
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (order.clientId !== clientId) throw new Error("Order does not belong to you");
    if (order.paymentStatus === "paid") throw new Error("Order already paid");
    if (!order.totalAmount) throw new Error("Order total amount not set");

    const orderAmount = Number(order.totalAmount);

    // 2. Get wallet with lock
    const wallet = await tx.walletAccount.findUnique({
      where: { clientId },
    });
    if (!wallet) throw new Error("Wallet not found. Please top up first.");

    const currentBalance = Number(wallet.availableBalance);
    if (currentBalance < orderAmount) {
      throw new Error(`Insufficient wallet balance. Available: NPR ${currentBalance}, Required: NPR ${orderAmount}`);
    }

    const newBalance = currentBalance - orderAmount;

    // 3. Create debit transaction
    const txn = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        clientId,
        type: "DEBIT",
        source: "ORDER",
        sourceId: orderId,
        amount: orderAmount,
        currency: wallet.currency,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: `Payment for order ${order.orderName}`,
      },
    });

    // 4. Update wallet balance
    await tx.walletAccount.update({
      where: { id: wallet.id },
      data: { availableBalance: newBalance },
    });

    // 5. Update order payment status
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        walletTransactionId: txn.id,
      },
    });

    // 6. Create notification
    await tx.notification.create({
      data: {
        recipientRole: "CLIENT",
        recipientId: clientId,
        clientId,
        type: "wallet_debited_for_order",
        title: "Wallet payment applied",
        message: `NPR ${orderAmount} deducted from wallet for order ${order.orderName}`,
        referenceId: orderId,
      },
    });

    return {
      orderId,
      walletTransactionId: txn.id,
      deductedAmount: orderAmount,
      newWalletBalance: newBalance,
    };
  });
};
