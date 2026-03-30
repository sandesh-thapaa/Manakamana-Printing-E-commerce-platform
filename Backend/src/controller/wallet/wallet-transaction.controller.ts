import { Request, Response } from "express";
import { getClientTransactionsService, getAdminTransactionsService, deductForOrderService } from "../../services/wallet/wallet-transaction.service";
import { transactionQuerySchema, adminTransactionQuerySchema, confirmWalletPaymentSchema } from "../../validators/wallet.validator";

// ── CLIENT: Get wallet transactions ──
export const getWalletTransactions = async (req: Request, res: Response) => {
  try {
    const validated = transactionQuerySchema.safeParse(req.query);
    if (!validated.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: validated.error.issues });
    }

    const clientId = (req as any).user.id;
    const data = await getClientTransactionsService({
      clientId,
      type: validated.data.type,
      source: validated.data.source,
      page: validated.data.page,
      limit: validated.data.limit,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── ADMIN: Get all transactions ──
export const getAdminTransactions = async (req: Request, res: Response) => {
  try {
    const validated = adminTransactionQuerySchema.safeParse(req.query);
    if (!validated.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: validated.error.issues });
    }

    const data = await getAdminTransactionsService({
      clientId: validated.data.clientId,
      type: validated.data.type,
      source: validated.data.source,
      dateFrom: validated.data.dateFrom,
      dateTo: validated.data.dateTo,
      page: validated.data.page,
      limit: validated.data.limit,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching admin transactions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── CLIENT: Confirm wallet payment for order ──
export const confirmWalletPayment = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;
    const clientId = (req as any).user.id;

    const validated = confirmWalletPaymentSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: validated.error.issues });
    }

    const result = await deductForOrderService(orderId, clientId);

    res.status(200).json({
      success: true,
      message: "Wallet payment applied successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error confirming wallet payment:", error);
    res.status(400).json({ success: false, message: error.message || "Wallet payment failed" });
  }
};
