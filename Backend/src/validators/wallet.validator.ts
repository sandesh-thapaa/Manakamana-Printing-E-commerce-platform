import { z } from "zod";

// -- Top-up request --
export const submitTopupSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["UPI", "BANK_TRANSFER"]),
  transferReference: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
});

// -- Approve top-up --
export const approveTopupSchema = z.object({
  approvedAmount: z.coerce.number().positive("Approved amount must be greater than 0"),
  note: z.string().max(500).optional(),
});

// -- Reject top-up --
export const rejectTopupSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required").max(1000),
  reasonCode: z.enum(["INVALID_PROOF", "AMOUNT_MISMATCH", "PAYMENT_NOT_FOUND", "DUPLICATE_REQUEST"]).optional(),
});

// -- Company payment details --
export const createPaymentDetailsSchema = z.object({
  companyName: z.string().min(1),
  bankName: z.string().min(1),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  branch: z.string().optional(),
  upiId: z.string().optional(),
  qrImageUrl: z.string().optional(),
  note: z.string().max(500).optional(),
  isActive: z.boolean().optional().default(true),
});

// -- Validate checkout --
export const validateCheckoutSchema = z.object({
  orderAmount: z.coerce.number().positive("Order amount must be greater than 0"),
});

// -- Confirm wallet payment --
export const confirmWalletPaymentSchema = z.object({
  useWallet: z.boolean().refine((v) => v === true, { message: "useWallet must be true" }),
});

// -- Query schemas --
export const topupQuerySchema = z.object({
  status: z.enum(["PENDING_REVIEW", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const adminTopupQuerySchema = z.object({
  status: z.enum(["PENDING_REVIEW", "APPROVED", "REJECTED"]).optional(),
  clientId: z.string().optional(),
  paymentMethod: z.enum(["UPI", "BANK_TRANSFER"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const transactionQuerySchema = z.object({
  type: z.enum(["CREDIT", "DEBIT"]).optional(),
  source: z.enum(["TOPUP", "ORDER", "REFUND", "ADJUSTMENT"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const adminTransactionQuerySchema = z.object({
  clientId: z.string().optional(),
  type: z.enum(["CREDIT", "DEBIT"]).optional(),
  source: z.enum(["TOPUP", "ORDER", "REFUND", "ADJUSTMENT"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const notificationQuerySchema = z.object({
  isRead: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});
