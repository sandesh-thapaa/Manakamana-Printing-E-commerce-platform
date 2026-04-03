import { Router } from "express";
import * as orderController from "../../controller/orders/product-order.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router();
import { confirmWalletPayment } from "../../controller/wallet/wallet-transaction.controller";

// CLIENT ROUTES: Manage the complete order lifecycle from placement and tracking to final payment confirmation
router.post(
  "/",
  protect,
  restrictTo("CLIENT"),
  orderController.createProductOrder
);

router.get(
  "/",
  protect,
  restrictTo("CLIENT"),
  orderController.getMyOrders
);

router.get(
  "/:orderId",
  protect,
  restrictTo("CLIENT"),
  orderController.getOrderDetails
);

router.post(
  "/:orderId/confirm-wallet-payment",
  protect,
  restrictTo("CLIENT"),
  confirmWalletPayment
);

export default router;
