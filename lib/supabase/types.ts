export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = "pending" | "confirmed" | "dispatched" | "completed" | "cancelled";
export type LeadStatus = "pending" | "contacted" | "confirmed" | "completed" | "cancelled";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type PaymentMethod = "cod" | "upi_manual" | "online";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type EventType =
  | "birthday"
  | "anniversary"
  | "intimate_gathering"
  | "baby_shower"
  | "corporate"
  | "other";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_smart: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_paise: number;
  compare_at_price_paise: number | null;
  sku: string | null;
  stock_status: StockStatus;
  stock_quantity: number | null;
  is_best_seller: boolean;
  is_customizable: boolean;
  is_active: boolean;
  images: string[];
  tags: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category?: Category | null;
}

export interface EventService {
  id: string;
  title: string;
  slug: string;
  type: "event_organization" | "decor_styling" | "gifting";
  summary: string | null;
  description: string | null;
  starting_price_paise: number | null;
  cover_image: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  event_type: EventType | null;
  event_service_id: string | null;
  width: number | null;
  height: number | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SiteContent {
  key: string;
  value: Json;
  updated_by: string | null;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: "top_bar" | "home_strip" | "shop_header";
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_title: string | null;
  avatar_url: string | null;
  rating: number;
  quote: string;
  event_type: EventType | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name_snapshot: string;
  unit_price_paise: number;
  quantity: number;
  customization_note: string | null;
  image_snapshot: string | null;
}

export interface OrderShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: OrderShippingAddress;
  delivery_date: string | null;
  gift_message: string | null;
  subtotal_paise: number;
  delivery_fee_paise: number;
  discount_paise: number;
  total_paise: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface EventLead {
  id: string;
  lead_number: string;
  full_name: string;
  phone: string;
  email: string | null;
  event_type: EventType;
  event_service_id: string | null;
  event_date: string;
  city: string;
  venue: string | null;
  guest_count: number | null;
  budget_range: string | null;
  message: string | null;
  preferred_contact: "whatsapp" | "call" | "email";
  status: LeadStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingItem {
  key: string;
  value: Json;
  updated_at: string;
}
