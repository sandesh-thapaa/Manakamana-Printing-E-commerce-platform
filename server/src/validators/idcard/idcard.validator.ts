import { z } from "zod";

const uuidMessage = "Must be a valid UUID.";

const discountTypeSchema = z.enum(["percentage", "fixed"]);

const optionalTrimmedString = (fieldName: string, maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().max(maxLength, `${fieldName} must be at most ${maxLength} characters.`).optional()
  );

const refineDiscount = (
  value: {
    base_price?: number;
    discount_type?: "percentage" | "fixed" | null;
    discount_value?: number;
  },
  ctx: z.RefinementCtx
) => {
  const discountType = value.discount_type ?? null;
  const discountValue = value.discount_value ?? 0;
  const basePrice = value.base_price;

  if (!discountType && discountValue > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discount_value"],
      message: "discount_value requires discount_type.",
    });
  }

  if (discountType === "percentage" && discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discount_value"],
      message: "Percentage discount cannot exceed 100.",
    });
  }

  if (
    discountType === "fixed" &&
    typeof basePrice === "number" &&
    discountValue > basePrice
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discount_value"],
      message: "Fixed discount cannot exceed the base price.",
    });
  }
};

const idcardProductBodyShape = {
  product_code: z.string().trim().min(1, "product_code is required.").max(30),
  name: z.string().trim().min(1, "name is required.").max(150),
  description: optionalTrimmedString("description", 3000),
  image_url: z
    .preprocess(
      (value) => {
        if (typeof value !== "string") {
          return value;
        }

        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      },
      z.string().url("image_url must be a valid URL.").optional()
    ),
  base_price: z.coerce.number().positive("base_price must be greater than 0."),
  discount_type: discountTypeSchema.optional().nullable(),
  discount_value: z.coerce
    .number()
    .min(0, "discount_value must be greater than or equal to 0.")
    .optional(),
  is_active: z.boolean().optional(),
};

export const idcardProductIdParamSchema = z.object({
  idcardProductId: z.string().uuid(uuidMessage),
});

export const createIdcardProductSchema = z
  .object(idcardProductBodyShape)
  .strict()
  .superRefine(refineDiscount);

export const updateIdcardProductSchema = z
  .object({
    product_code: z.string().trim().min(1).max(30).optional(),
    name: z.string().trim().min(1).max(150).optional(),
    description: optionalTrimmedString("description", 3000),
    image_url: z
      .preprocess(
        (value) => {
          if (typeof value !== "string") {
            return value;
          }

          const trimmed = value.trim();
          return trimmed.length === 0 ? undefined : trimmed;
        },
        z.string().url("image_url must be a valid URL.").optional()
      )
      .optional(),
    base_price: z.coerce.number().positive("base_price must be greater than 0.").optional(),
    discount_type: discountTypeSchema.optional().nullable(),
    discount_value: z.coerce
      .number()
      .min(0, "discount_value must be greater than or equal to 0.")
      .optional(),
    is_active: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field must be provided for update.",
      });
      return;
    }

    refineDiscount(
      {
        base_price: value.base_price,
        discount_type: value.discount_type,
        discount_value: value.discount_value,
      },
      ctx
    );
  });

export const calculateIdcardPriceSchema = z
  .object({
    quantity: z.coerce
      .number()
      .int("quantity must be an integer.")
      .positive("quantity must be greater than 0."),
    printing_side: z.enum(["single", "double"]).optional(),
  })
  .strict();

export const createIdcardOrderSchema = z
  .object({
    idcardProductId: z.string().uuid("idcardProductId must be a valid UUID."),
    quantity: z.coerce
      .number()
      .int("quantity must be an integer.")
      .positive("quantity must be greater than 0."),
    printing_side: z.enum(["single", "double"]),
    orientation: z.enum(["landscape", "portrait"]),
    strap_color: z.string().trim().min(1, "strap_color is required.").max(80),
    strap_text: z.string().trim().min(1, "strap_text is required.").max(150),
    notes: optionalTrimmedString("notes", 1000),
  })
  .strict();

export const idcardOrderIdParamSchema = z.object({
  orderId: z.string().uuid(uuidMessage),
});
