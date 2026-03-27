import { Request, Response } from "express";
import { getVariantPricingCombination, calculateOrderAmount, normalizeSelectedOptions } from "../../services/catalog/product-pricing.service";

// calculatePriceController: Public API to calculate the final price (with discounts) based on variant, options, and quantity
export const calculatePriceController = async (req: Request, res: Response) => {
  try {
    const variantId = req.params.variantId as string;
    const { quantity, options } = req.body;
    const selectedOptions = normalizeSelectedOptions(options);

    const pricingRow = await getVariantPricingCombination(variantId, selectedOptions);
    if (!pricingRow) {
      return res.status(404).json({ success: false, message: "Pricing not found for combination" });
    }

    const unitPrice = Number(pricingRow.price);
    const discount = pricingRow.discount_type && pricingRow.discount_value
      ? { type: pricingRow.discount_type as "percentage" | "fixed", value: Number(pricingRow.discount_value) }
      : undefined;

    const { totalAmount, discountAmount, finalAmount } = calculateOrderAmount(unitPrice, quantity, discount);

    res.status(200).json({
      success: true,
      data: {
        unitPrice,
        quantity,
        discountType: pricingRow.discount_type || null,
        discountValue: discount ? discount.value : 0,
        discountAmount,
        totalAmount,
        finalAmount,
        selectedOptions,
      }
    });

  } catch (error: any) {
    console.error("Calculate price error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
