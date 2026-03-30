import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import * as adminController from "../controller/admin.controller";
import * as serviceController from "../controller/printing-service.controller";
import { createRegistrationRequestSchema } from "../validators/registration.validator";

const router = Router();

// CLIENT SELF-REGISTRATION
router.post(
  "/register-request",
  validate(createRegistrationRequestSchema),
  adminController.createRegistrationRequest
);

// PRINTING SERVICES
router.get("/services", serviceController.getServices);
router.get("/services/:serviceId", serviceController.getServiceById);

export default router;
