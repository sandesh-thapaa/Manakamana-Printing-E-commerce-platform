import { Router } from "express";
import { getTemplateCategories, getTemplates, getTemplateById } from "../controller/template.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const router = Router();

// Routes
// Note: as per spec, these endpoints are client-authenticated
router.get("/categories", protect, restrictTo("CLIENT"), getTemplateCategories);
router.get("/", protect, restrictTo("CLIENT"), getTemplates);
router.get("/:templateId", protect, restrictTo("CLIENT"), getTemplateById);

export default router;
