import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Product Management
// createProductService: Logic to add a new base product to the catalog
export const createProductService = async (data: any) => {
  return await prisma.product.create({ data });
};

// getAllProductsService: Fetches all products including their nested variants
export const getAllProductsService = async () => {
  return await prisma.product.findMany({
    include: { variants: true },
  });
};

// Variant Management
// createVariantService: Logic to persist a new style/version (variant) of a product
export const createVariantService = async (productId: string, data: any) => {
  return await prisma.productVariant.create({
    data: {
      product_id: productId,
      ...data,
    },
  });
};

// Option Group & Value Management
// createOptionGroupService: Groups related customization options for a variant
export const createOptionGroupService = async (variantId: string, data: any) => {
  return await prisma.optionGroup.create({
    data: {
      variant_id: variantId,
      ...data,
    },
  });
};

// createOptionValueService: Logic to add specific values (e.g., 'A4', 'Glossy') to an option group
export const createOptionValueService = async (groupId: string, data: any) => {
  return await prisma.optionValue.create({
    data: {
      group_id: groupId,
      ...data,
    },
  });
};

// Pricing Combination Management
// createVariantPricingService: Defines a specific price point for a combination of option values
export const createVariantPricingService = async (variantId: string, data: any) => {
  return await prisma.variantPricing.create({
    data: {
      variant_id: variantId,
      ...data,
    },
  });
};

// getVariantDetailsWithPricingInfo: Deep retrieval of a variant's full options and pricing matrix
export const getVariantDetailsWithPricingInfo = async (variantId: string) => {
  return await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      option_groups: {
        include: { values: true },
      },
      pricing: true,
    },
  });
};
