import { Router } from "express";
import * as adminController from "../controller/admin.controller";
import * as authController from "../controller/auth.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const router = Router();

// ADMIN AUTH
router.post("/auth/login", authController.loginAdmin);
router.get("/auth/me", protect, restrictTo("ADMIN", "SUPER_ADMIN"), authController.getMe);

// REGISTRATION REQUESTS
router.get("/registration-requests", protect, restrictTo("ADMIN", "SUPER_ADMIN"), adminController.getRegistrationRequests);
router.get("/registration-requests/:request_id", protect, restrictTo("ADMIN", "SUPER_ADMIN"), adminController.getRegistrationRequestById);
router.post("/registration-requests/:request_id/approve", protect, restrictTo("ADMIN", "SUPER_ADMIN"), adminController.approveRegistrationRequest);
router.patch("/registration-requests/:request_id/reject", protect, restrictTo("ADMIN", "SUPER_ADMIN"), adminController.rejectRegistrationRequest);
router.patch("/registration-requests/:request_id/credentials-sent", protect, restrictTo("ADMIN", "SUPER_ADMIN"), adminController.markCredentialsSent);

// CLIENTS
router.get("/clients", protect, restrictTo("ADMIN", "SUPER_ADMIN"), adminController.getClients);
router.get("/clients/:id", protect, restrictTo("ADMIN", "SUPER_ADMIN"), adminController.getClientById);

export default router;