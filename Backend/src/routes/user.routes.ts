import { Router } from "express";
import * as userController from "../controller/user.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validators/user.validator";

const router = Router();

router.get("/profile", protect, restrictTo("CLIENT"), userController.getProfile);
router.patch(
  "/profile",
  protect,
  restrictTo("CLIENT"),
  validate(updateProfileSchema),
  userController.updateProfile
);

export default router;
