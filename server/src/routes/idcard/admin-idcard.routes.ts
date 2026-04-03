import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import * as adminIdcardController from "../../controller/idcard/admin-idcard.controller";

const router = Router();

router.use(protect, restrictTo("ADMIN"));

router.post("/products", adminIdcardController.createIdcardProduct);
router.get("/products", adminIdcardController.listIdcardProducts);
router.get("/products/:idcardProductId", adminIdcardController.getIdcardProductById);
router.patch("/products/:idcardProductId", adminIdcardController.updateIdcardProduct);

router.get("/orders", adminIdcardController.listIdcardOrders);
router.get("/orders/:orderId", adminIdcardController.getIdcardOrderById);

export default router;
