import { ApiError } from "../../utils/api-error";

export type IdcardDiscountType = "percentage" | "fixed" | null;
export type IdcardPrintingSide = "single" | "double" | null;
export const DOUBLE_SIDE_ADDITIONAL_COST = 40;

type CalculateIdcardPricingInput = {
  basePrice: number;
  quantity: number;
  discountType: IdcardDiscountType;
  discountValue: number;
  printingSide?: IdcardPrintingSide;
};

const roundCurrency = (value: number) => Number(value.toFixed(2));

export const normalizeIdcardDiscount = (
  discountType?: string | null,
  discountValue?: number | null
) => {
  const normalizedDiscountType: IdcardDiscountType =
    discountType === "percentage" || discountType === "fixed" ? discountType : null;
  const normalizedDiscountValue = Number(discountValue ?? 0);

  if (!normalizedDiscountType || normalizedDiscountValue <= 0) {
    return {
      discount_type: null as IdcardDiscountType,
      discount_value: 0,
    };
  }

  return {
    discount_type: normalizedDiscountType,
    discount_value: normalizedDiscountValue,
  };
};

export const calculateIdcardPricing = ({
  basePrice,
  quantity,
  discountType,
  discountValue,
  printingSide,
}: CalculateIdcardPricingInput) => {
  if (quantity <= 0) {
    throw new ApiError("Quantity must be greater than 0.", 400, "INVALID_QUANTITY");
  }

  if (basePrice <= 0) {
    throw new ApiError("Base price must be greater than 0.", 400, "INVALID_BASE_PRICE");
  }

  // Handle printing side adjustment (+40 for double)
  const adjustedBasePrice =
    printingSide === "double" ? basePrice + DOUBLE_SIDE_ADDITIONAL_COST : basePrice;

  let discountAmountPerUnit = 0;

  if (discountType === "percentage") {
    if (discountValue > 100) {
      throw new ApiError(
        "Percentage discount cannot exceed 100.",
        400,
        "INVALID_PERCENTAGE_DISCOUNT"
      );
    }

    discountAmountPerUnit = adjustedBasePrice * (discountValue / 100);
  } else if (discountType === "fixed") {
    if (discountValue > adjustedBasePrice) {
      throw new ApiError(
        "Fixed discount cannot exceed the adjusted base price.",
        400,
        "INVALID_FIXED_DISCOUNT"
      );
    }

    discountAmountPerUnit = discountValue;
  }

  const finalUnitPrice = Math.max(0, adjustedBasePrice - discountAmountPerUnit);
  const totalAmount = adjustedBasePrice * quantity;
  const totalDiscountAmount = discountAmountPerUnit * quantity;
  const finalAmount = Math.max(0, totalAmount - totalDiscountAmount);

  return {
    quantity,
    printing_side: printingSide ?? "single",
    base_unit_price: roundCurrency(adjustedBasePrice),
    discount_type: discountType,
    discount_value: roundCurrency(discountValue),
    discount_amount_per_unit: roundCurrency(discountAmountPerUnit),
    total_discount_amount: roundCurrency(totalDiscountAmount),
    final_unit_price: roundCurrency(finalUnitPrice),
    total_amount: roundCurrency(totalAmount),
    final_amount: roundCurrency(finalAmount),
  };
};
