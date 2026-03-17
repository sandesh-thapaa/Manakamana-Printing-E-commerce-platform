import { Router } from "express";
import { validate } from "../middleware/validate.middleware";

import {
  loginUser,
  logoutUser,
  getCurrentUser
} from "../controller/auth.controller";

import { loginSchema } from "../validators/auth.validators";

import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", validate(loginSchema), loginUser);

router.post("/logout", protect, logoutUser);

router.get("/me", protect, getCurrentUser);

export default router;