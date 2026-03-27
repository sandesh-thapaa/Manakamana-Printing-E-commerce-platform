import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import * as adminController from "../../controller/admin/admin.controller";
import * as serviceController from "../../controller/printing-service.controller";
import * as publicCatalogController from "../../controller/catalog/public-catalog.controller";
import { createRegistrationRequestSchema } from "../../validators/registration.validator";

const router = Router();

// CLIENT SELF-REGISTRATION: Open endpoint for new clients to submit a registration request
router.post(
  "/register-request",
  validate(createRegistrationRequestSchema),
  adminController.createRegistrationRequest
);

// PRINTING SERVICES: Look up available printing services and their details
router.get("/services", serviceController.getServices);
router.get("/services/:serviceId", serviceController.getServiceById);

// PUBLIC CATALOG APIs: Publicly accessible catalog and price calculation logic
router.post("/variants/:variantId/calculate-price", publicCatalogController.calculatePriceController);

export default router;
