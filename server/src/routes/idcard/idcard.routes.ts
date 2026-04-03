import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import * as idcardController from "../../controller/idcard/idcard.controller";

const router = Router();

router.get(
  "/products",
  protect,
  restrictTo("CLIENT"),
  idcardController.listIdcardProducts
);

router.get(
  "/products/:idcardProductId",
  protect,
  restrictTo("CLIENT"),
  idcardController.getIdcardProductById
);

router.post(
  "/products/:idcardProductId/price",
  protect,
  restrictTo("CLIENT"),
  idcardController.calculateIdcardPrice
);

router.post(
  "/orders",
  protect,
  restrictTo("CLIENT"),
  idcardController.createIdcardOrder
);

router.get(
  "/orders",
  protect,
  restrictTo("CLIENT"),
  idcardController.getMyIdcardOrders
);

router.get(
  "/orders/:orderId",
  protect,
  restrictTo("CLIENT"),
  idcardController.getMyIdcardOrderById
);

export default router;
