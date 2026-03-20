import { Router } from "express";
import * as authController from "../controller/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", authController.loginClient);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);

export default router;