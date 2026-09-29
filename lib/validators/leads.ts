import { z } from "zod";

const indianPhoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const EventLeadSchema = z.object({
  fullName: z.string().min(2, "Please enter your name"),
  phone: z.string().regex(indianPhoneRegex, "Please enter a valid 10-digit Indian phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  eventType: z.enum([
    "birthday",
    "anniversary",
    "intimate_gathering",
    "baby_shower",
    "corporate",
    "other",
  ]),
  eventServiceId: z.string().uuid().optional().nullable().or(z.literal("")),
  eventDate: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Event date must be today or in the future"),
  city: z.string().min(2, "Please select or enter your city"),
  venue: z.string().max(200).optional().nullable(),
  guestCount: z.coerce.number().int().min(1).max(5000).optional().nullable(),
  budgetRange: z.string().optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
  preferredContact: z.enum(["whatsapp", "call", "email"]).default("whatsapp"),
  honeypot: z.string().max(0, "Bot detected").optional().default(""),
});

export type EventLeadInput = z.infer<typeof EventLeadSchema>;
