import { Router } from "express";
import {
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from "../controller/admin.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const router = Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo("ADMIN"));

router.get("/registration-requests", getRegistrationRequests);

router.get(
  "/registration-requests/:request_id",
  getRegistrationRequestById
);

router.post(
  "/registration-requests/:request_id/approve",
  approveRegistrationRequest
);

router.patch(
  "/registration-requests/:request_id/reject",
  rejectRegistrationRequest
);

export default router;