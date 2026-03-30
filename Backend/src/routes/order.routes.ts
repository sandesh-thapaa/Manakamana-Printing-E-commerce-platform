import { Router } from "express";
import { createOrder, getMyOrders, updateOrderStatus } from "../controller/order.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const router = Router();

// Client routes
router.post("/", protect, restrictTo("CLIENT"), createOrder);
router.get("/my", protect, restrictTo("CLIENT"), getMyOrders);

// Admin routes
router.patch("/:orderId/status", protect, restrictTo("ADMIN"), updateOrderStatus);

export default router;
