import { Request, Response } from "express";
import { createOrderService, getMyOrdersService, getOrderByIdService, getAdminOrdersService, updateOrderStatusService } from "../services/order.service";
import { z } from "zod";

const createOrderSchema = z.object({
  orderName: z.string().min(2),
  serviceId: z.string().uuid(),
  quantity: z.number().int().positive(),
  specifications: z.any().optional(),
  designId: z.string().uuid().optional(),
});

export const createOrder = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id;
    const validated = createOrderSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ success: false, errors: validated.error.issues });
    }
    const order = await createOrderService({ ...validated.data, clientId });
    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id;
    const orders = await getMyOrdersService(clientId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatusService(orderId as string, status);
    res.status(200).json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
