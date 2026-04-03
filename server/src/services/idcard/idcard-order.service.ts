import { Prisma } from "@prisma/client";
import prisma from "../../connect";
import { ApiError } from "../../utils/api-error";
import { calculateIdcardPricing, IdcardPrintingSide } from "./idcard-pricing.service";
import { getIdcardProductEntityById } from "./idcard-product.service";

const idcardOrderInclude = {
  approvedDesign: {
    select: {
      id: true,
      designCode: true,
      status: true,
    },
  },
  walletTransaction: {
    select: {
      id: true,
      amount: true,
      currency: true,
      createdAt: true,
    },
  },
  idcard_detail: {
    include: {
      idcardProduct: true,
    },
  },
} satisfies Prisma.OrderInclude;

type IdcardOrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof idcardOrderInclude;
}>;

type CreateIdcardOrderInput = {
  userId: string;
  idcardProductId: string;
  quantity: number;
  printing_side: "single" | "double";
  orientation: "landscape" | "portrait";
  strap_color: string;
  strap_text: string;
  notes?: string;
};

const toNumber = (value: unknown) => Number(value ?? 0);

const mapIdcardOrder = (order: IdcardOrderWithRelations) => {
  if (!order.idcard_detail) {
    throw new ApiError("ID card order details are missing.", 500, "IDCARD_ORDER_DETAIL_MISSING");
  }

  const product = order.idcard_detail.idcardProduct;
  const printingSide = order.idcard_detail.printing_side.toLowerCase() as IdcardPrintingSide;

  const pricing = calculateIdcardPricing({
    basePrice: toNumber(product.base_price),
    quantity: order.quantity,
    discountType: (product.discount_type as "percentage" | "fixed" | null) ?? null,
    discountValue: toNumber(product.discount_value),
    printingSide: printingSide,
  });

  return {
    id: order.id,
    order_type: "ID_CARD" as const,
    quantity: order.quantity,
    unit_price: toNumber(order.unit_price),
    total_amount: toNumber(order.total_amount),
    discount_type: order.discount_type,
    discount_value: toNumber(order.discount_value),
    discount_amount: toNumber(order.discount_amount),
    final_amount: toNumber(order.final_amount),
    status: order.status,
    payment_status: order.payment_status,
    notes: order.notes,
    pricing_snapshot: order.pricing_snapshot,
    created_at: order.created_at,
    updated_at: order.updated_at,
    approved_design: order.approvedDesign,
    wallet_transaction: order.walletTransaction
      ? {
          ...order.walletTransaction,
          amount: toNumber(order.walletTransaction.amount),
        }
      : null,
    idcard_product: {
      id: product.id,
      product_code: product.product_code,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      base_price: toNumber(product.base_price),
      discount_type: product.discount_type,
      discount_value: toNumber(product.discount_value),
      pricing,
    },
    idcard_detail: {
      id: order.idcard_detail.id,
      printing_side: order.idcard_detail.printing_side.toLowerCase(),
      orientation: order.idcard_detail.orientation.toLowerCase(),
      strap_color: order.idcard_detail.strap_color,
      strap_text: order.idcard_detail.strap_text,
    },
  };
};

const getApprovedDesignIdForClient = async (
  tx: Prisma.TransactionClient,
  clientId: string,
  designCode?: string
) => {
  if (!designCode) {
    return null;
  }

  const approvedDesign = await tx.approvedDesign.findFirst({
    where: {
      designCode,
      clientId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (!approvedDesign) {
    throw new ApiError(
      "Invalid design code. Use an active approved design that belongs to your account.",
      400,
      "INVALID_DESIGN_CODE"
    );
  }

  return approvedDesign.id;
};

export const getIdcardOrderEntityByIdService = async (orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      idcard_detail: {
        isNot: null,
      },
    },
    include: idcardOrderInclude,
  });

  if (!order) {
    throw new ApiError("ID card order not found.", 404, "IDCARD_ORDER_NOT_FOUND");
  }

  return order;
};

export const createIdcardOrderService = async (input: CreateIdcardOrderInput) => {
  const product = await getIdcardProductEntityById(input.idcardProductId, { onlyActive: true });

  const pricing = calculateIdcardPricing({
    basePrice: toNumber(product.base_price),
    quantity: input.quantity,
    discountType: (product.discount_type as "percentage" | "fixed" | null) ?? null,
    discountValue: toNumber(product.discount_value),
    printingSide: input.printing_side,
  });

  const printingSide = input.printing_side === "double" ? "DOUBLE" : "SINGLE";
  const orientation = input.orientation === "portrait" ? "PORTRAIT" : "LANDSCAPE";

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        user_id: input.userId,
        quantity: input.quantity,
        unit_price: pricing.base_unit_price,
        total_amount: pricing.total_amount,
        discount_type: pricing.discount_type,
        discount_value: pricing.discount_value,
        discount_amount: pricing.total_discount_amount,
        final_amount: pricing.final_amount,
        notes: input.notes,
        pricing_snapshot: {
          order_type: "ID_CARD",
          idcard_product_id: product.id,
          product_code: product.product_code,
          product_name: product.name,
          quantity: input.quantity,
          base_unit_price: pricing.base_unit_price,
          discount_type: pricing.discount_type,
          discount_value: pricing.discount_value,
          discount_amount_per_unit: pricing.discount_amount_per_unit,
          total_discount_amount: pricing.total_discount_amount,
          final_unit_price: pricing.final_unit_price,
          total_amount: pricing.total_amount,
          final_amount: pricing.final_amount,
          printing_side: input.printing_side,
          orientation: input.orientation,
          strap_color: input.strap_color,
          strap_text: input.strap_text,
        },
        status: "ORDER_PLACED",
        payment_status: "PENDING",
      },
    });

    await tx.idCardOrderDetail.create({
      data: {
        order_id: createdOrder.id,
        idcard_product_id: product.id,
        printing_side: printingSide,
        orientation,
        strap_color: input.strap_color,
        strap_text: input.strap_text,
      },
    });

    return tx.order.findUniqueOrThrow({
      where: { id: createdOrder.id },
      include: idcardOrderInclude,
    });
  });

  return mapIdcardOrder(order);
};

export const listClientIdcardOrdersService = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      user_id: userId,
      idcard_detail: {
        isNot: null,
      },
    },
    include: idcardOrderInclude,
    orderBy: { created_at: "desc" },
  });

  return orders.map((order) => mapIdcardOrder(order));
};

export const listAdminIdcardOrdersService = async () => {
  const orders = await prisma.order.findMany({
    where: {
      idcard_detail: {
        isNot: null,
      },
    },
    include: {
      ...idcardOrderInclude,
      client: {
        select: {
          id: true,
          business_name: true,
          phone_number: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return orders.map((order) => ({
    ...mapIdcardOrder(order),
    client: order.client,
  }));
};

export const getClientIdcardOrderByIdService = async (orderId: string, userId: string) => {
  const order = await getIdcardOrderEntityByIdService(orderId);

  if (order.user_id !== userId) {
    throw new ApiError("ID card order not found.", 404, "IDCARD_ORDER_NOT_FOUND");
  }

  return mapIdcardOrder(order);
};

export const getAdminIdcardOrderByIdService = async (orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      idcard_detail: {
        isNot: null,
      },
    },
    include: {
      ...idcardOrderInclude,
      client: {
        select: {
          id: true,
          business_name: true,
          phone_number: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError("ID card order not found.", 404, "IDCARD_ORDER_NOT_FOUND");
  }

  return {
    ...mapIdcardOrder(order),
    client: order.client,
  };
};
