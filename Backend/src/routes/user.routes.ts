import { Router } from "express";
import * as userController from "../controller/user.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", protect, restrictTo("CLIENT"), userController.getProfile);
router.patch("/profile", protect, restrictTo("CLIENT"), userController.updateProfile);

export default router;
