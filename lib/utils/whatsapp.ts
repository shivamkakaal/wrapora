import { formatPaiseToInr } from "./format";
import type { Order, EventLead } from "../supabase/types";

export function cleanPhoneNumber(phone: string): string {
  // Strips non-digit chars except leading plus
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    // If 10 digits, assume India (+91)
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }
  } else {
    cleaned = cleaned.substring(1); // remove + for wa.me URL
  }
  return cleaned;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const number = cleanPhoneNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function createOrderWhatsAppLink(order: Order, businessNumber: string): string {
  const lines = [
    `*✨ WRAPORA Order Confirmation ✨*`,
    `Order Number: *${order.order_number}*`,
    `Customer: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Total: *${formatPaiseToInr(order.total_paise)}*`,
    `Payment Method: ${order.payment_method === "upi_manual" ? "UPI on Confirmation" : order.payment_method.toUpperCase()}`,
    `Delivery City: ${order.shipping_address.city} (${order.shipping_address.pincode})`,
  ];

  if (order.delivery_date) {
    lines.push(`Requested Date: ${order.delivery_date}`);
  }

  if (order.order_items && order.order_items.length > 0) {
    lines.push(`\n*Items:*`);
    order.order_items.forEach((item) => {
      lines.push(`• ${item.name_snapshot} × ${item.quantity}`);
      if (item.customization_note) {
        lines.push(`  _Note: ${item.customization_note}_`);
      }
    });
  }

  lines.push(`\nHi WRAPORA Team, please confirm my order!`);

  return buildWhatsAppUrl(businessNumber, lines.join("\n"));
}

export function createLeadWhatsAppLink(lead: EventLead, businessNumber: string): string {
  const lines = [
    `*✨ WRAPORA Event Consultation Inquiry ✨*`,
    `Lead ID: *${lead.lead_number}*`,
    `Name: ${lead.full_name}`,
    `Event Type: *${lead.event_type.replace(/_/g, " ").toUpperCase()}*`,
    `Event Date: ${lead.event_date}`,
    `City: ${lead.city}`,
  ];

  if (lead.guest_count) {
    lines.push(`Estimated Guests: ${lead.guest_count}`);
  }
  if (lead.budget_range) {
    lines.push(`Budget: ${lead.budget_range}`);
  }
  if (lead.venue) {
    lines.push(`Venue: ${lead.venue}`);
  }
  if (lead.message) {
    lines.push(`\n*Notes:* ${lead.message}`);
  }

  lines.push(`\nHello WRAPORA Concierge, I would like to discuss my celebration!`);

  return buildWhatsAppUrl(businessNumber, lines.join("\n"));
}

export function createProductInquiryWhatsAppLink(
  productName: string,
  productUrl: string,
  businessNumber: string
): string {
  const message = `Hi WRAPORA Team, I'm interested in ordering *"${productName}"*.\nProduct link: ${productUrl}\nCould you share customization details?`;
  return buildWhatsAppUrl(businessNumber, message);
}
