import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import * as adminController from "../controller/admin.controller";
import { createRegistrationRequestSchema } from "../validators/registration.validators";

const router = Router();

// CLIENT SELF-REGISTRATION
router.post(
  "/register-request",
  validate(createRegistrationRequestSchema),
  adminController.createRegistrationRequest
);

export default router;
