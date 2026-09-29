import { z } from "zod";

// Validates phone numbers (standard 10-digit Indian or international format)
const phoneRegex = /^(?:\+?\d{1,4}[ -]?)?[6-9]\d{9}$|^\+?[1-9]\d{6,14}$/;

export const CartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Max quantity per item is 50"),
  customizationNote: z.string().max(500, "Note too long").optional().nullable(),
});

export const ShippingAddressSchema = z.object({
  line1: z.string().min(3, "House / Flat number and street are required"),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional().nullable(),
  pincode: z.string().min(3, "Pincode / Postal code must be at least 3 characters").max(12, "Postal code too long"),
  landmark: z.string().optional().nullable(),
});

export const CheckoutOrderSchema = z.object({
  customerName: z.string().min(2, "Please enter your full name"),
  customerPhone: z.string().regex(phoneRegex, "Please enter a valid contact phone number"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  shippingAddress: ShippingAddressSchema,
  deliveryDate: z.string().optional().nullable(),
  giftMessage: z.string().max(500, "Gift message cannot exceed 500 characters").optional().nullable(),
  paymentMethod: z.enum(["cod", "upi_manual", "online"]).default("upi_manual"),
  items: z.array(CartItemSchema).min(1, "Cart cannot be empty"),
  // Honeypot field for anti-bot spam protection
  honeypot: z.string().max(0, "Bot detected").optional().default(""),
});

export type CheckoutOrderInput = z.infer<typeof CheckoutOrderSchema>;
export type CartItemInput = z.infer<typeof CartItemSchema>;
