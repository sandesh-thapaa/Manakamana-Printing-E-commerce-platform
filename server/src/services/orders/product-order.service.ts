import { PrismaClient } from "@prisma/client";
import { resolveCombinationPrice, calculateOrderAmount } from "../catalog/product-pricing.service";

const prisma = new PrismaClient();

// createProductOrderService: Core logic for placing a new order, resolving pricing and saving configurations
export const createProductOrderService = async (data: {
  userId: string;
  variantId: string;
  quantity: number;
  options: {
    holder_type?: string;
    paper_quality?: string;
    page_color?: string;
    binding?: string;
    // Map of group labels/names for configurations
    configDetails?: Array<{
      groupName: string;
      groupLabel: string;
      selectedCode: string;
      selectedLabel: string;
    }>;
  };
  discount?: {
    type: "percentage" | "fixed";
    value: number;
  };
  notes?: string;
  designId?: string;
}) => {
  const { userId, variantId, quantity, options, discount, notes, designId } = data;

  // 1. Resolve Unit Price
  const resolvedPrice = await resolveCombinationPrice(variantId, options);
  if (!resolvedPrice) {
    throw new Error("Invalid combination of options for this product variant.");
  }

  const unitPrice = Number(resolvedPrice);

  // 2. Calculate Amounts
  const { totalAmount, discountAmount, finalAmount } = calculateOrderAmount(
    unitPrice,
    quantity,
    discount
  );

  // 3. Prepare Pricing Snapshot
  const pricingSnapshot = {
    pricing: {
      holder_type: options.holder_type,
      paper_quality: options.paper_quality,
      page_color: options.page_color,
      binding: options.binding,
    },
    base_total: totalAmount,
    discount: discount ? {
      type: discount.type,
      value: discount.value,
      amount: discountAmount
    } : null,
    final_total: finalAmount
  };

  // 4. Create Order and Configurations in a transaction
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        user_id: userId,
        variant_id: variantId,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        discount_type: discount?.type || null,
        discount_value: discount?.value || 0,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        notes: notes,
        designId: designId,
        pricing_snapshot: pricingSnapshot as any,
        status: "ORDER_PLACED",
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
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      variant: {
        include: {
          product: true,
        },
      },
      configurations: true,
    },
  });
};

// getClientOrdersService: Lists all orders placed by a specific client
export const getClientOrdersService = async (userId: string) => {
  return await prisma.order.findMany({
    where: { user_id: userId },
    include: {
      variant: {
        select: {
          variant_name: true,
          product: { select: { name: true } }
        }
      }
    },
    orderBy: { created_at: "desc" },
  });
};

// getAllOrdersService: Provides an administrative overview of every order in the system
export const getAllOrdersService = async () => {
  return await prisma.order.findMany({
    include: {
      client: { select: { business_name: true, phone_number: true } },
      variant: {
        select: {
          variant_name: true,
          product: { select: { name: true } }
        }
      }
    },
    orderBy: { created_at: "desc" },
  });
};

// updateOrderStatusService: Logic to transition an order status (e.g., from PLACED to PROCESSING)
export const updateOrderStatusService = async (orderId: string, status: string) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any, updated_at: new Date() },
  });
};
