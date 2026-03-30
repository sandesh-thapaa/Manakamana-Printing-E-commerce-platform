import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import { createPaymentDetails } from "../../controller/wallet/payment-details.controller";
import { getAdminTopupRequests, getAdminTopupRequestById, approveTopupRequest, rejectTopupRequest } from "../../controller/wallet/topup-request.controller";
import { getAdminTransactions } from "../../controller/wallet/wallet-transaction.controller";
import { getAdminNotifications, markAdminNotificationRead, getAdminClientWalletSummary } from "../../controller/wallet/wallet-notification.controller";

const router = Router();

// All admin wallet routes require ADMIN auth
router.use(protect, restrictTo("ADMIN"));

// Payment details management
router.post("/payment-details", createPaymentDetails);

// Top-up request management
router.get("/topup-requests", getAdminTopupRequests);
router.get("/topup-requests/:requestId", getAdminTopupRequestById);
router.post("/topup-requests/:requestId/approve", approveTopupRequest);
router.patch("/topup-requests/:requestId/reject", rejectTopupRequest);

// Transaction log
router.get("/transactions", getAdminTransactions);

// Notifications
router.get("/notifications", getAdminNotifications);
router.patch("/notifications/:notificationId/read", markAdminNotificationRead);

// Client wallet summary
router.get("/clients/:clientId", getAdminClientWalletSummary);

export default router;
