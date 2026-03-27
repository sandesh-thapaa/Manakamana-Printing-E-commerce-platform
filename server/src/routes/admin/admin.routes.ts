import { Router } from "express";
import * as adminController from "../../controller/admin/admin.controller";
import * as authController from "../../controller/auth/auth.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import * as designSubmissionController from "../../controller/design/design-submission.controller";
import * as approvedDesignController from "../../controller/design/approved-design.controller";
import * as serviceController from "../../controller/printing-service.controller";
import * as adminProductController from "../../controller/catalog/admin-product.controller";
import * as productOrderController from "../../controller/orders/product-order.controller";
import { validate } from "../../middleware/validate.middleware";
// Legacy validators removed

const router = Router();

// ADMIN AUTH: Specialized authentication routes for administrative access
router.post("/auth/login", authController.loginAdmin);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", protect, restrictTo("ADMIN"), authController.getMe);

// REGISTRATION REQUESTS: Manage incoming client registration and approval/rejection workflows
router.get("/registration-requests", protect, restrictTo("ADMIN"), adminController.getRegistrationRequests);
router.get("/registration-requests/:request_id", protect, restrictTo("ADMIN"), adminController.getRegistrationRequestById);
router.post("/registration-requests/:request_id/approve", protect, restrictTo("ADMIN"), adminController.approveRegistrationRequest);
router.patch("/registration-requests/:request_id/reject", protect, restrictTo("ADMIN"), adminController.rejectRegistrationRequest);

// CLIENTS: View and manage approved client profiles
router.get("/clients", protect, restrictTo("ADMIN"), adminController.getClients);
router.get("/clients/:id", protect, restrictTo("ADMIN"), adminController.getClientById);

// DESIGN SUBMISSIONS: Review, approve, or reject custom designs submitted by clients
router.get("/design-submissions", protect, restrictTo("ADMIN"), designSubmissionController.getAdminSubmissions);
router.get("/design-submissions/:submissionId", protect, restrictTo("ADMIN"), designSubmissionController.getAdminSubmissionById);
router.post("/design-submissions/:submissionId/approve", protect, restrictTo("ADMIN"), designSubmissionController.approveSubmission);
router.patch("/design-submissions/:submissionId/reject", protect, restrictTo("ADMIN"), designSubmissionController.rejectSubmission);

// APPROVED DESIGNS: Manage the repository of designs that have passed review
router.get("/designs", protect, restrictTo("ADMIN"), approvedDesignController.getAdminDesigns);
router.get("/designs/:designId", protect, restrictTo("ADMIN"), approvedDesignController.getAdminDesignById);
router.patch("/designs/:designId/archive", protect, restrictTo("ADMIN"), approvedDesignController.archiveDesign);

import * as templateController from "../../controller/design/template.controller";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// TEMPLATES: Manage design templates and categories for client use
router.post("/templates/categories", protect, restrictTo("ADMIN"), templateController.createTemplateCategory);
router.post("/templates", protect, restrictTo("ADMIN"), upload.single("file"), templateController.createTemplate);

// PRINTING SERVICES MANAGEMENT: Add new general printing services to the public list
router.post("/services", protect, restrictTo("ADMIN"), serviceController.createService);

// UNIVERSAL PRODUCT & PRICING MANAGEMENT: Complex multi-tier catalog management (Products -> Variants -> Options -> Pricing)
router.post("/products", protect, restrictTo("ADMIN"), adminProductController.createProduct);
router.get("/products", protect, restrictTo("ADMIN"), adminProductController.getAllProducts);
router.post("/products/:productId/variants", protect, restrictTo("ADMIN"), adminProductController.createVariant);
router.post("/variants/:variantId/option-groups", protect, restrictTo("ADMIN"), adminProductController.createOptionGroup);
router.post("/groups/:groupId/option-values", protect, restrictTo("ADMIN"), adminProductController.createOptionValue);
router.post("/variants/:variantId/pricing", protect, restrictTo("ADMIN"), adminProductController.createVariantPricing);
router.get("/variants/:variantId/full-details", protect, restrictTo("ADMIN"), adminProductController.getVariantFullDetails);

// ORDERS MANAGEMENT: Overview and status updates for all client orders
router.get("/orders", protect, restrictTo("ADMIN"), productOrderController.getAdminOrders);
router.patch("/orders/:orderId/status", protect, restrictTo("ADMIN"), productOrderController.updateOrderStatus);
router.get("/orders/:orderId", protect, restrictTo("ADMIN"), productOrderController.getOrderDetails);

export default router;