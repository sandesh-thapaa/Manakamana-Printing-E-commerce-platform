import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import { getMyDesignById, verifyDesignId } from "../../controller/design/approved-design.controller";

const router = Router();

// Client routes: View validated designs and verify public design codes
router.get("/my-designs/:designId", protect, restrictTo("CLIENT"), getMyDesignById);
router.post("/designs/verify", protect, restrictTo("CLIENT"), verifyDesignId);

export default router;
