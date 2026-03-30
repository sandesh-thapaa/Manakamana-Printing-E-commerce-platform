import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createOrderService = async (data: {
  clientId: string;
  orderName: string;
  serviceId: string;
  quantity: number;
  specifications?: any;
  designId?: string;
}) => {
  return await prisma.order.create({
    data: {
      orderName: data.orderName,
      clientId: data.clientId,
      serviceId: data.serviceId,
      quantity: data.quantity,
      specifications: data.specifications,
      designId: data.designId,
      status: "ORDER_PLACED",
    },
    include: {
      service: { select: { name: true } },
      design: { select: { designCode: true } },
    }
  });
};

export const getMyOrdersService = async (clientId: string) => {
  return await prisma.order.findMany({
    where: { clientId },
    include: {
      service: { select: { name: true } },
      design: { select: { designCode: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getOrderByIdService = async (orderId: string, clientId: string) => {
  return await prisma.order.findFirst({
    where: { id: orderId, clientId },
    include: {
      service: { select: { name: true, basePrice: true } },
      design: { select: { designCode: true } },
    },
  });
};

export const getAdminOrdersService = async (filters: { status?: any; clientId?: string } = {}) => {
  return await prisma.order.findMany({
    where: filters,
    include: {
      client: { select: { business_name: true, phone_number: true } },
      service: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateOrderStatusService = async (orderId: string, status: any) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};
