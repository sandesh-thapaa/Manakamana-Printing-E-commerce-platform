import { Request, Response } from "express";
import * as orderService from "../../services/orders/product-order.service";

// createProductOrder: Handles the placement of a new order by a client
export const createProductOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const order = await orderService.createProductOrderService({
      userId,
      ...req.body
    });
    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Internal server error" });
  }
};

// getMyOrders: List all orders belonging to the currently logged-in client
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orders = await orderService.getClientOrdersService(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// getAdminOrders: Admin-only view to fetch all orders in the system
export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrdersService();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// getOrderDetails: Fetches comprehensive info for a specific order (accessible by owner or admin)
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderDetailsService(orderId as string);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// updateOrderStatus: Admin-only function to transition an order through different processing states
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatusService(orderId as string, status);
    res.status(200).json({ success: true, message: "Order status updated successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
