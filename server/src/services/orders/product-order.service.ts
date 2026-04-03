import prisma from "../../connect";
import { getVariantPricingCombination, calculateOrderAmount, normalizeSelectedOptions } from "../catalog/product-pricing.service";

const ORDER_STATUS_FLOW: Record<string, string | null> = {
  ORDER_PLACED: "ORDER_ACCEPTED",
  ORDER_ACCEPTED: "ORDER_PROCESSING",
  ORDER_PROCESSING: "ORDER_DISPATCHED",
  ORDER_DISPATCHED: "ORDER_DELIVERED",
  ORDER_DELIVERED: null,
};

const addOrderPresentationFields = <T extends {
  variant?: { variant_name?: string | null; product?: { name?: string | null } | null } | null;
  idcard_detail?: { idcardProduct?: { name?: string | null } | null } | null;
}>(order: T) => ({
  ...order,
  order_type: order.idcard_detail ? "ID_CARD" : "CATALOG",
  product_name: order.idcard_detail?.idcardProduct?.name ?? order.variant?.product?.name ?? null,
  variant_name: order.variant?.variant_name ?? null,
});

// createProductOrderService: Core logic for placing a new order, resolving pricing and saving configurations
export const createProductOrderService = async (data: {
  userId: string;
  variantId: string;
  quantity: number;
  options: Record<string, unknown> & {
    configDetails?: Array<{
      groupName: string;
      groupLabel: string;
      selectedCode: string;
      selectedLabel: string;
    }>;
  };
  notes?: string;
  designCode?: string;
}) => {
  const { userId, variantId, quantity, options, notes, designCode } = data;
  const selectedOptions = normalizeSelectedOptions(options);

  const pricingRow = await getVariantPricingCombination(variantId, selectedOptions);
  if (!pricingRow) {
    throw new Error("Invalid combination of options for this product variant.");
  }

  const unitPrice = Number(pricingRow.price);
  const pricingDiscount =
    pricingRow.discount_type && Number(pricingRow.discount_value) > 0
      ? {
          type: pricingRow.discount_type as "percentage" | "fixed",
          value: Number(pricingRow.discount_value),
        }
      : undefined;

  const { totalAmount, discountAmount, finalAmount } = calculateOrderAmount(
    unitPrice,
    quantity,
    pricingDiscount
  );

  const pricingSnapshot = {
    pricingRowId: pricingRow.id,
    pricing: selectedOptions,
    unit_price: unitPrice,
    base_total: totalAmount,
    discount: pricingDiscount
      ? {
          type: pricingDiscount.type,
          value: pricingDiscount.value,
          amount: discountAmount,
        }
      : null,
    final_total: finalAmount,
    designCode: designCode || null,
  };

  return await prisma.$transaction(async (tx) => {
    let approvedDesignId: string | null = null;

    if (designCode) {
      const approvedDesign = await tx.approvedDesign.findFirst({
        where: {
          designCode,
          clientId: userId,
          status: "ACTIVE",
        },
      });

      if (!approvedDesign) {
        throw new Error("Invalid design code. Please use an active approved design code belonging to your account.");
      }

      approvedDesignId = approvedDesign.id;
    }

    const order = await tx.order.create({
      data: {
        user_id: userId,
        variant_id: variantId,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        discount_type: pricingDiscount?.type || null,
        discount_value: pricingDiscount?.value || 0,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        notes: notes,
        designId: approvedDesignId,
        pricing_snapshot: pricingSnapshot as any,
        status: "ORDER_PLACED",
        payment_status: "PENDING",
      },
    });

    if (options.configDetails && options.configDetails.length > 0) {
      await tx.orderConfiguration.createMany({
        data: options.configDetails.map((config) => ({
          order_id: order.id,
          group_name: config.groupName,
          group_label: config.groupLabel,
          selected_code: config.selectedCode,
          selected_label: config.selectedLabel,
        })),
      });
    }

    return order;
  });
};

// getOrderDetailsService: Retrieves full details of a specific order including variant and config info
export const getOrderDetailsService = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      approvedDesign: {
        select: {
          id: true,
          designCode: true,
          status: true,
        },
      },
      variant: {
        include: {
          product: true,
        },
      },
      idcard_detail: {
        include: {
          idcardProduct: true,
        },
      },
      configurations: true,
    },
  });

  return order ? addOrderPresentationFields(order) : null;
};

// getClientOrdersService: Lists all orders placed by a specific client
export const getClientOrdersService = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { user_id: userId },
    include: {
      approvedDesign: {
        select: {
          designCode: true,
        },
      },
      variant: {
        select: {
          variant_name: true,
          product: { select: { name: true } }
        }
      },
      idcard_detail: {
        include: {
          idcardProduct: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return orders.map((order) => addOrderPresentationFields(order));
};

// getAllOrdersService: Provides an administrative overview of every order in the system
export const getAllOrdersService = async () => {
  const orders = await prisma.order.findMany({
    include: {
      client: { select: { business_name: true, phone_number: true } },
      approvedDesign: {
        select: {
          designCode: true,
        },
      },
      variant: {
        select: {
          variant_name: true,
          product: { select: { name: true } }
        }
      },
      idcard_detail: {
        include: {
          idcardProduct: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return orders.map((order) => addOrderPresentationFields(order));
};

// updateOrderStatusService: Logic to transition an order status (e.g., from PLACED to PROCESSING)
export const updateOrderStatusService = async (orderId: string, status: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (!Object.prototype.hasOwnProperty.call(ORDER_STATUS_FLOW, status)) {
    throw new Error("Unsupported order status");
  }

  if (order.status === status) {
    return order;
  }

  const allowedNextStatus = ORDER_STATUS_FLOW[order.status];
  if (allowedNextStatus !== status) {
    throw new Error(
      `Invalid status transition. Allowed next status from ${order.status} is ${allowedNextStatus ?? "none"}.`
    );
  }

  if (status === "ORDER_ACCEPTED" && order.payment_status !== "PAID") {
    throw new Error("Only paid orders can be accepted for processing.");
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any, updated_at: new Date() },
  });
};
