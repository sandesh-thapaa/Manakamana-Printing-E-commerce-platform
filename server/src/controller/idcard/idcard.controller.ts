import { Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../../utils/api-error";
import {
  calculateIdcardPriceSchema,
  createIdcardOrderSchema,
  idcardOrderIdParamSchema,
  idcardProductIdParamSchema,
} from "../../validators/idcard/idcard.validator";
import {
  calculateIdcardPriceService,
  getClientIdcardProductByIdService,
  listClientIdcardProductsService,
} from "../../services/idcard/idcard-product.service";
import {
  createIdcardOrderService,
  getClientIdcardOrderByIdService,
  listClientIdcardOrdersService,
} from "../../services/idcard/idcard-order.service";

const sendErrorResponse = (res: Response, error: unknown, context: string) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: error.issues.map((issue) => issue.message).join(", "),
      },
    });
  }

  console.error(`${context}:`, error);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
};

export const listIdcardProducts = async (_req: Request, res: Response) => {
  try {
    const data = await listClientIdcardProductsService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "List ID card products failed");
  }
};

export const getIdcardProductById = async (req: Request, res: Response) => {
  try {
    const params = idcardProductIdParamSchema.parse(req.params);
    const data = await getClientIdcardProductByIdService(params.idcardProductId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "Get ID card product failed");
  }
};

export const calculateIdcardPrice = async (req: Request, res: Response) => {
  try {
    const params = idcardProductIdParamSchema.parse(req.params);
    const body = calculateIdcardPriceSchema.parse(req.body);
    const data = await calculateIdcardPriceService(
      params.idcardProductId,
      body.quantity,
      body.printing_side
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "Calculate ID card price failed");
  }
};

export const createIdcardOrder = async (req: Request, res: Response) => {
  try {
    const body = createIdcardOrderSchema.parse(req.body);
    const userId = (req as any).user.id;

    const data = await createIdcardOrderService({
      userId,
      ...body,
    });

    return res.status(201).json({
      success: true,
      message: "ID card order placed successfully",
      data,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Create ID card order failed");
  }
};

export const getMyIdcardOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data = await listClientIdcardOrdersService(userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "Get client ID card orders failed");
  }
};

export const getMyIdcardOrderById = async (req: Request, res: Response) => {
  try {
    const params = idcardOrderIdParamSchema.parse(req.params);
    const userId = (req as any).user.id;
    const data = await getClientIdcardOrderByIdService(params.orderId, userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "Get client ID card order failed");
  }
};
