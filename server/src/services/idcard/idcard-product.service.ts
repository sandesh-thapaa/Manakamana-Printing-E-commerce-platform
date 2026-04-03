import prisma from "../../connect";
import { ApiError } from "../../utils/api-error";
import {
  calculateIdcardPricing,
  normalizeIdcardDiscount,
  IdcardPrintingSide,
} from "./idcard-pricing.service";

type IdcardProductPayload = {
  product_code: string;
  name: string;
  description?: string;
  image_url?: string;
  base_price: number;
  discount_type?: "percentage" | "fixed" | null;
  discount_value?: number;
  is_active?: boolean;
};

type IdcardProductEntity = Awaited<ReturnType<typeof prisma.idCardProduct.findFirstOrThrow>>;

const toNumber = (value: unknown) => Number(value ?? 0);

const buildPersistedIdcardProductData = (input: IdcardProductPayload) => {
  const normalizedDiscount = normalizeIdcardDiscount(
    input.discount_type ?? null,
    input.discount_value ?? 0
  );

  calculateIdcardPricing({
    basePrice: input.base_price,
    quantity: 1,
    discountType: normalizedDiscount.discount_type,
    discountValue: normalizedDiscount.discount_value,
  });

  return {
    product_code: input.product_code.trim(),
    name: input.name.trim(),
    description: input.description,
    image_url: input.image_url,
    base_price: input.base_price,
    discount_type: normalizedDiscount.discount_type,
    discount_value: normalizedDiscount.discount_value,
    is_active: input.is_active ?? true,
  };
};

const mapIdcardProduct = (
  product: IdcardProductEntity,
  quantity = 1,
  printingSide?: IdcardPrintingSide
) => {
  const pricing = calculateIdcardPricing({
    basePrice: toNumber(product.base_price),
    quantity,
    discountType: (product.discount_type as "percentage" | "fixed" | null) ?? null,
    discountValue: toNumber(product.discount_value),
    printingSide,
  });

  return {
    id: product.id,
    product_type: "ID_CARD" as const,
    product_code: product.product_code,
    name: product.name,
    description: product.description,
    image_url: product.image_url,
    is_active: product.is_active,
    base_price: pricing.base_unit_price,
    discount_type: pricing.discount_type,
    discount_value: pricing.discount_value,
    pricing,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
};

export const getIdcardProductEntityById = async (
  idcardProductId: string,
  options?: { onlyActive?: boolean }
) => {
  const product = await prisma.idCardProduct.findFirst({
    where: {
      id: idcardProductId,
      ...(options?.onlyActive ? { is_active: true } : {}),
    },
  });

  if (!product) {
    throw new ApiError("ID card product not found.", 404, "IDCARD_PRODUCT_NOT_FOUND");
  }

  return product;
};

export const createAdminIdcardProductService = async (input: IdcardProductPayload) => {
  const product = await prisma.idCardProduct.create({
    data: buildPersistedIdcardProductData(input),
  });

  return mapIdcardProduct(product);
};

export const listAdminIdcardProductsService = async () => {
  const products = await prisma.idCardProduct.findMany({
    orderBy: { created_at: "desc" },
  });

  return products.map((product) => mapIdcardProduct(product));
};

export const getAdminIdcardProductByIdService = async (idcardProductId: string) => {
  const product = await getIdcardProductEntityById(idcardProductId);
  return mapIdcardProduct(product);
};

export const updateAdminIdcardProductService = async (
  idcardProductId: string,
  input: Partial<IdcardProductPayload>
) => {
  const existingProduct = await getIdcardProductEntityById(idcardProductId);

  const mergedPayload = {
    product_code: input.product_code ?? existingProduct.product_code,
    name: input.name ?? existingProduct.name,
    description:
      input.description !== undefined ? input.description : existingProduct.description ?? undefined,
    image_url: input.image_url !== undefined ? input.image_url : existingProduct.image_url ?? undefined,
    base_price: input.base_price ?? toNumber(existingProduct.base_price),
    discount_type:
      input.discount_type !== undefined
        ? input.discount_type
        : ((existingProduct.discount_type as "percentage" | "fixed" | null) ?? null),
    discount_value:
      input.discount_value !== undefined ? input.discount_value : toNumber(existingProduct.discount_value),
    is_active: input.is_active ?? existingProduct.is_active,
  };

  const updatedProduct = await prisma.idCardProduct.update({
    where: { id: idcardProductId },
    data: buildPersistedIdcardProductData(mergedPayload),
  });

  return mapIdcardProduct(updatedProduct);
};

export const listClientIdcardProductsService = async () => {
  const products = await prisma.idCardProduct.findMany({
    where: { is_active: true },
    orderBy: { created_at: "desc" },
  });

  return products.map((product) => mapIdcardProduct(product));
};

export const getClientIdcardProductByIdService = async (idcardProductId: string) => {
  const product = await getIdcardProductEntityById(idcardProductId, { onlyActive: true });
  return mapIdcardProduct(product);
};

export const calculateIdcardPriceService = async (
  idcardProductId: string,
  quantity: number,
  printingSide?: IdcardPrintingSide
) => {
  const product = await getIdcardProductEntityById(idcardProductId, { onlyActive: true });
  const mappedProduct = mapIdcardProduct(product, quantity, printingSide);

  return {
    idcard_product_id: mappedProduct.id,
    product_code: mappedProduct.product_code,
    name: mappedProduct.name,
    image_url: mappedProduct.image_url,
    pricing: mappedProduct.pricing,
  };
};
