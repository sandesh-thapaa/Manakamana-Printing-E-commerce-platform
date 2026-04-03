import { Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../../utils/api-error";
import {
  createIdcardProductSchema,
  idcardOrderIdParamSchema,
  idcardProductIdParamSchema,
  updateIdcardProductSchema,
} from "../../validators/idcard/idcard.validator";
import {
  createAdminIdcardProductService,
  getAdminIdcardProductByIdService,
  listAdminIdcardProductsService,
  updateAdminIdcardProductService,
} from "../../services/idcard/idcard-product.service";
import {
  getAdminIdcardOrderByIdService,
  listAdminIdcardOrdersService,
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

export const createIdcardProduct = async (req: Request, res: Response) => {
  try {
    const body = createIdcardProductSchema.parse(req.body);
    const data = await createAdminIdcardProductService(body);

    return res.status(201).json({
      success: true,
      message: "ID card product created successfully",
      data,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Create ID card product failed");
  }
};

export const listIdcardProducts = async (_req: Request, res: Response) => {
  try {
    const data = await listAdminIdcardProductsService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "List admin ID card products failed");
  }
};

export const getIdcardProductById = async (req: Request, res: Response) => {
  try {
    const params = idcardProductIdParamSchema.parse(req.params);
    const data = await getAdminIdcardProductByIdService(params.idcardProductId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "Get admin ID card product failed");
  }
};

export const updateIdcardProduct = async (req: Request, res: Response) => {
  try {
    const params = idcardProductIdParamSchema.parse(req.params);
    const body = updateIdcardProductSchema.parse(req.body);
    const data = await updateAdminIdcardProductService(params.idcardProductId, body);

    return res.status(200).json({
      success: true,
      message: "ID card product updated successfully",
      data,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Update ID card product failed");
  }
};

export const listIdcardOrders = async (_req: Request, res: Response) => {
  try {
    const data = await listAdminIdcardOrdersService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "List admin ID card orders failed");
  }
};

export const getIdcardOrderById = async (req: Request, res: Response) => {
  try {
    const params = idcardOrderIdParamSchema.parse(req.params);
    const data = await getAdminIdcardOrderByIdService(params.orderId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendErrorResponse(res, error, "Get admin ID card order failed");
  }
};
