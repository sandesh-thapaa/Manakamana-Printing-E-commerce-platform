import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { createRegistrationRequest } from "../controller/admin.controller";
import { createRegistrationRequestSchema } from "../validators/registration.validators";

const router = Router();

router.post(
  "/register-request",
  validate(createRegistrationRequestSchema),
  createRegistrationRequest
);

export default router;
