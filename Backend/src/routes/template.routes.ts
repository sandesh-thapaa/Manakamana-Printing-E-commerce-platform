import { Router } from "express";
import { getTemplateCategories, getTemplates, getTemplateById, createTemplateCategory, createTemplate } from "../controller/template.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const router = Router();

// Client Routes
router.get("/categories", protect, restrictTo("CLIENT"), getTemplateCategories);
router.get("/", protect, restrictTo("CLIENT"), getTemplates);
router.get("/:templateId", protect, restrictTo("CLIENT"), getTemplateById);

// Admin Routes
router.post("/categories", protect, restrictTo("ADMIN"), createTemplateCategory);
router.post("/", protect, restrictTo("ADMIN"), upload.single("file"), createTemplate);

export default router;
