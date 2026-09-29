import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  categoryId: z.string().uuid().optional().nullable().or(z.literal("")),
  shortDescription: z.string().max(300).optional().nullable(),
  description: z.string().optional().nullable(),
  pricePaise: z.number().int().min(0, "Price must be non-negative"),
  compareAtPricePaise: z.number().int().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]).default("in_stock"),
  stockQuantity: z.number().int().min(0).optional().nullable(),
  isBestSeller: z.boolean().default(false),
  isCustomizable: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
});

export type ProductInput = z.infer<typeof ProductSchema>;
