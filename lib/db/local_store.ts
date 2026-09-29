import fs from "fs";
import path from "path";
import type {
  Category,
  Product,
  EventService,
  GalleryItem,
  Testimonial,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/supabase/types";

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  audience?: "admin" | "customer";
  created_at: string;
}

export interface SavedAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface CustomerRecord {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  total_orders: number;
  total_spent_paise: number;
  last_login_at: string;
  created_at: string;
  last_order_at?: string | null;
  notes?: string | null;
  city?: string | null;
  saved_address?: SavedAddress | null;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  url?: string;
  audience: "all" | "customer" | "admin";
  sent_count: number;
  failed_count: number;
  total_targets: number;
  created_at: string;
}

export interface LocalDbSchema {
  categories: Category[];
  products: Product[];
  event_services: EventService[];
  gallery_items: GalleryItem[];
  testimonials: Testimonial[];
  orders: Order[];
  customers?: CustomerRecord[];
  push_subscriptions: PushSubscriptionRecord[];
  announcements?: AnnouncementRecord[];
  site_content: Record<string, unknown>;
  settings: Record<string, unknown>;
}

const DB_PATH = path.join(process.cwd(), "data", "local_db.json");

export function normalizePhone(phone: string): string {
  let digits = (phone || "").replace(/[^0-9]/g, "");
  // If starts with Indian country code 91 and has more than 10 digits, strip 91
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }
  // If starts with 0 and has more than 10 digits, strip leading 0
  while (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }
  // If still longer than 10 digits, take the last 10 digits
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

export function getLocalDb(): LocalDbSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      return {
        categories: parsed.categories || [],
        products: parsed.products || [],
        event_services: parsed.event_services || [],
        gallery_items: parsed.gallery_items || [],
        testimonials: parsed.testimonials || [],
        orders: parsed.orders || [],
        customers: parsed.customers || [],
        push_subscriptions: parsed.push_subscriptions || [],
        announcements: parsed.announcements || [],
        site_content: parsed.site_content || {},
        settings: parsed.settings || {},
      };
    }
  } catch (e) {
    console.error("Error reading local_db.json:", e);
  }

  return {
    categories: [],
    products: [],
    event_services: [],
    gallery_items: [],
    testimonials: [],
    orders: [],
    customers: [],
    push_subscriptions: [],
    announcements: [],
    site_content: {},
    settings: {},
  };
}

export function writeLocalDb(db: LocalDbSchema): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing local_db.json:", e);
  }
}

// ----------------- CATEGORIES -----------------
export function getCategoriesLocal(): Category[] {
  const db = getLocalDb();
  return (db.categories || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function saveCategoryLocal(catInput: Partial<Category>): Category {
  const db = getLocalDb();
  const categories = db.categories || [];
  const now = new Date().toISOString();

  let savedCat: Category;
  const targetId = catInput.id || ("cat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7));

  const idx = categories.findIndex((c) => c.id === targetId);
  if (idx >= 0) {
    savedCat = {
      ...categories[idx],
      ...catInput,
      id: targetId,
      updated_at: now,
    } as Category;
    categories[idx] = savedCat;
  } else {
    savedCat = {
      name: "Untitled Category",
      slug: "cat-" + Date.now(),
      description: null,
      is_smart: false,
      sort_order: categories.length,
      is_active: true,
      created_at: now,
      updated_at: now,
      ...catInput,
      id: targetId,
    } as Category;
    categories.push(savedCat);
  }

  db.categories = categories;
  writeLocalDb(db);
  return savedCat;
}

export function deleteCategoryLocal(id: string): boolean {
  const db = getLocalDb();
  db.categories = (db.categories || []).filter((c) => c.id !== id);
  // Unlink from products
  if (db.products) {
    db.products = db.products.map((p) =>
      p.category_id === id ? { ...p, category_id: null } : p
    );
  }
  writeLocalDb(db);
  return true;
}

// ----------------- PRODUCTS -----------------
export function getProductsLocal(): Product[] {
  const db = getLocalDb();
  return (db.products || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function saveProductLocal(prodInput: Partial<Product>): Product {
  const db = getLocalDb();
  const products = db.products || [];
  const now = new Date().toISOString();

  let savedProd: Product;
  const targetId = prodInput.id || ("prod-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7));

  const idx = products.findIndex((p) => p.id === targetId);
  if (idx >= 0) {
    savedProd = {
      ...products[idx],
      ...prodInput,
      id: targetId,
      updated_at: now,
    } as Product;
    products[idx] = savedProd;
  } else {
    savedProd = {
      name: "Untitled Hamper",
      slug: "prod-" + Date.now(),
      category_id: null,
      short_description: null,
      description: null,
      price_paise: 0,
      compare_at_price_paise: null,
      sku: null,
      stock_status: "in_stock",
      stock_quantity: null,
      is_best_seller: false,
      is_customizable: false,
      is_active: true,
      images: [],
      tags: [],
      sort_order: products.length,
      created_at: now,
      updated_at: now,
      ...prodInput,
      id: targetId,
    } as Product;
    products.push(savedProd);
  }

  db.products = products;
  writeLocalDb(db);
  return savedProd;
}

export function deleteProductLocal(id: string): boolean {
  const db = getLocalDb();
  db.products = (db.products || []).filter((p) => p.id !== id);
  writeLocalDb(db);
  return true;
}

// ----------------- EVENT SERVICES -----------------
export function getEventServicesLocal(): EventService[] {
  const db = getLocalDb();
  return (db.event_services || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function saveEventServiceLocal(serviceInput: Partial<EventService>): EventService {
  const db = getLocalDb();
  const services = db.event_services || [];
  const now = new Date().toISOString();

  let savedService: EventService;
  const targetId = serviceInput.id || ("srv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7));

  const idx = services.findIndex((s) => s.id === targetId);
  if (idx >= 0) {
    savedService = {
      ...services[idx],
      ...serviceInput,
      id: targetId,
      updated_at: now,
    } as EventService;
    services[idx] = savedService;
  } else {
    savedService = {
      title: "Untitled Service",
      slug: "service-" + Date.now(),
      type: "event_organization",
      summary: null,
      description: null,
      starting_price_paise: null,
      cover_image: null,
      features: [],
      is_active: true,
      sort_order: services.length,
      created_at: now,
      updated_at: now,
      ...serviceInput,
      id: targetId,
    } as EventService;
    services.push(savedService);
  }

  db.event_services = services;
  writeLocalDb(db);
  return savedService;
}

export function deleteEventServiceLocal(id: string): boolean {
  const db = getLocalDb();
  db.event_services = (db.event_services || []).filter((s) => s.id !== id);
  writeLocalDb(db);
  return true;
}

// ----------------- GALLERY ITEMS -----------------
export function getGalleryItemsLocal(): GalleryItem[] {
  const db = getLocalDb();
  return (db.gallery_items || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function saveGalleryItemLocal(itemInput: Partial<GalleryItem>): GalleryItem {
  const db = getLocalDb();
  const items = db.gallery_items || [];
  const now = new Date().toISOString();

  let savedItem: GalleryItem;
  const targetId = itemInput.id || ("gal-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7));

  const idx = items.findIndex((i) => i.id === targetId);
  if (idx >= 0) {
    savedItem = {
      ...items[idx],
      ...itemInput,
      id: targetId,
    } as GalleryItem;
    items[idx] = savedItem;
  } else {
    savedItem = {
      image_url: "",
      title: null,
      caption: null,
      event_type: "birthday",
      event_service_id: null,
      width: 800,
      height: 600,
      is_featured: true,
      is_active: true,
      sort_order: items.length,
      created_at: now,
      ...itemInput,
      id: targetId,
    } as GalleryItem;
    items.unshift(savedItem);
  }

  db.gallery_items = items;
  writeLocalDb(db);
  return savedItem;
}

export function deleteGalleryItemLocal(id: string): boolean {
  const db = getLocalDb();
  db.gallery_items = (db.gallery_items || []).filter((i) => i.id !== id);
  writeLocalDb(db);
  return true;
}

// ----------------- TESTIMONIALS -----------------
export function getTestimonialsLocal(): Testimonial[] {
  const db = getLocalDb();
  return (db.testimonials || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function saveTestimonialLocal(testInput: Partial<Testimonial>): Testimonial {
  const db = getLocalDb();
  const list = db.testimonials || [];
  const now = new Date().toISOString();

  let savedItem: Testimonial;
  const targetId = testInput.id || ("test-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7));

  const idx = list.findIndex((t) => t.id === targetId);
  if (idx >= 0) {
    savedItem = {
      ...list[idx],
      ...testInput,
      id: targetId,
    } as Testimonial;
    list[idx] = savedItem;
  } else {
    savedItem = {
      customer_name: "Client",
      customer_title: null,
      avatar_url: null,
      rating: 5,
      quote: "",
      event_type: null,
      is_featured: true,
      is_active: true,
      sort_order: list.length,
      created_at: now,
      ...testInput,
      id: targetId,
    } as Testimonial;
    list.unshift(savedItem);
  }

  db.testimonials = list;
  writeLocalDb(db);
  return savedItem;
}

export function deleteTestimonialLocal(id: string): boolean {
  const db = getLocalDb();
  db.testimonials = (db.testimonials || []).filter((t) => t.id !== id);
  writeLocalDb(db);
  return true;
}

// ----------------- SITE CONTENT -----------------
export function getSiteContentLocal<T = unknown>(key: string): T | null {
  const db = getLocalDb();
  if (db.site_content && db.site_content[key] !== undefined) {
    return db.site_content[key] as T;
  }
  return null;
}

export function getAllSiteContentLocal(): Record<string, unknown> {
  const db = getLocalDb();
  return db.site_content || {};
}

export function saveSiteContentLocal(key: string, value: unknown): void {
  const db = getLocalDb();
  if (!db.site_content) db.site_content = {};
  db.site_content[key] = value;
  writeLocalDb(db);
}

// ----------------- ORDERS -----------------
export function getOrdersLocal(): Order[] {
  const db = getLocalDb();
  return (db.orders || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function saveOrderLocal(order: Order): Order {
  const db = getLocalDb();
  const orders = db.orders || [];
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...order };
  } else {
    orders.unshift(order);
  }
  db.orders = orders;
  writeLocalDb(db);
  return order;
}

export function updateOrderStatusLocal(
  orderId: string,
  updates: {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    admin_notes?: string;
  }
): Order | null {
  const db = getLocalDb();
  const orders = db.orders || [];
  const idx = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
  if (idx >= 0) {
    const updated: Order = {
      ...orders[idx],
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.payment_status ? { payment_status: updates.payment_status } : {}),
      ...(updates.admin_notes !== undefined ? { admin_notes: updates.admin_notes } : {}),
      updated_at: new Date().toISOString(),
    };
    orders[idx] = updated;
    db.orders = orders;
    writeLocalDb(db);
    return updated;
  }
  return null;
}

export function getOrderByIdLocal(idOrNumber: string): Order | null {
  const db = getLocalDb();
  const orders = db.orders || [];
  return orders.find((o) => o.id === idOrNumber || o.order_number === idOrNumber) || null;
}

// ----------------- PUSH SUBSCRIPTIONS -----------------
export function getPushSubscriptionsLocal(audience?: "admin" | "customer"): PushSubscriptionRecord[] {
  const db = getLocalDb();
  const subs = db.push_subscriptions || [];
  if (audience) {
    return subs.filter((s) => s.audience === audience);
  }
  return subs;
}

export function savePushSubscriptionLocal(sub: PushSubscriptionRecord): void {
  const db = getLocalDb();
  const subs = db.push_subscriptions || [];
  const idx = subs.findIndex((s) => s.endpoint === sub.endpoint);
  if (idx >= 0) {
    subs[idx] = { ...subs[idx], ...sub };
  } else {
    subs.push(sub);
  }
  db.push_subscriptions = subs;
  writeLocalDb(db);
}

export function deletePushSubscriptionLocal(endpoint: string): void {
  const db = getLocalDb();
  db.push_subscriptions = (db.push_subscriptions || []).filter((s) => s.endpoint !== endpoint);
  writeLocalDb(db);
}

// ----------------- ANNOUNCEMENTS & BROADCASTS -----------------
export function getAnnouncementsLocal(): AnnouncementRecord[] {
  const db = getLocalDb();
  return (db.announcements || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function saveAnnouncementLocal(record: AnnouncementRecord): AnnouncementRecord {
  const db = getLocalDb();
  const list = db.announcements || [];
  const idx = list.findIndex((a) => a.id === record.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...record };
  } else {
    list.unshift(record);
  }
  db.announcements = list;
  writeLocalDb(db);
  return record;
}

// ----------------- CUSTOMERS & LEADS -----------------
export function getCustomersLocal(): CustomerRecord[] {
  const db = getLocalDb();
  const customers = db.customers || [];
  const orders = db.orders || [];

  const customerMap = new Map<string, CustomerRecord>();
  for (const c of customers) {
    const norm = normalizePhone(c.phone);
    if (norm) {
      customerMap.set(norm, {
        ...c,
        total_orders: 0,
        total_spent_paise: 0,
      });
    }
  }

  // Merge and calculate authoritative totals from orders
  for (const o of orders) {
    const norm = normalizePhone(o.customer_phone);
    if (!norm) continue;

    const existing = customerMap.get(norm);
    if (existing) {
      existing.total_orders = (existing.total_orders || 0) + 1;
      existing.total_spent_paise = (existing.total_spent_paise || 0) + (o.total_paise || 0);
      if (!existing.last_order_at || new Date(o.created_at) > new Date(existing.last_order_at)) {
        existing.last_order_at = o.created_at;
      }
      if (!existing.name && o.customer_name) {
        existing.name = o.customer_name;
      }
      if (!existing.email && o.customer_email) {
        existing.email = o.customer_email;
      }
      if (!existing.city && o.shipping_address?.city) {
        existing.city = o.shipping_address.city;
      }
      if (o.shipping_address) {
        existing.saved_address = existing.saved_address || (o.shipping_address as any);
      }
    } else {
      const newCust: CustomerRecord = {
        id: `cust-${norm}`,
        phone: o.customer_phone,
        name: o.customer_name || null,
        email: o.customer_email || null,
        total_orders: 1,
        total_spent_paise: o.total_paise || 0,
        last_login_at: o.created_at,
        created_at: o.created_at,
        last_order_at: o.created_at,
        city: o.shipping_address?.city || null,
        saved_address: (o.shipping_address as any) || null,
      };
      customerMap.set(norm, newCust);
    }
  }

  const result = Array.from(customerMap.values());
  return result.sort(
    (a, b) => new Date(b.last_login_at || b.created_at).getTime() - new Date(a.last_login_at || a.created_at).getTime()
  );
}

export function saveCustomerLocal(custInput: Partial<CustomerRecord> & { phone: string }): CustomerRecord {
  const db = getLocalDb();
  const customers = db.customers || [];
  const norm = normalizePhone(custInput.phone);
  const now = new Date().toISOString();

  const idx = customers.findIndex((c) => normalizePhone(c.phone) === norm);
  let saved: CustomerRecord;

  if (idx >= 0) {
    saved = {
      ...customers[idx],
      ...custInput,
      phone: custInput.phone || customers[idx].phone,
      name: custInput.name !== undefined ? custInput.name : customers[idx].name,
      email: custInput.email !== undefined ? custInput.email : customers[idx].email,
      saved_address: custInput.saved_address !== undefined ? custInput.saved_address : customers[idx].saved_address,
      last_login_at: now,
    };
    customers[idx] = saved;
  } else {
    saved = {
      id: `cust-${Date.now()}-${norm}`,
      phone: custInput.phone,
      name: custInput.name || null,
      email: custInput.email || null,
      total_orders: custInput.total_orders || 0,
      total_spent_paise: custInput.total_spent_paise || 0,
      last_login_at: now,
      created_at: now,
      last_order_at: custInput.last_order_at || null,
      city: custInput.city || null,
      notes: custInput.notes || null,
      saved_address: custInput.saved_address || null,
    };
    customers.unshift(saved);
  }

  db.customers = customers;
  writeLocalDb(db);
  return saved;
}

export function getCustomerByPhoneLocal(phone: string): CustomerRecord | null {
  const norm = normalizePhone(phone);
  if (!norm) return null;
  const list = getCustomersLocal();
  return list.find((c) => normalizePhone(c.phone) === norm) || null;
}

export function getOrdersByPhoneLocal(phone: string): Order[] {
  const norm = normalizePhone(phone);
  if (!norm) return [];
  const db = getLocalDb();
  const orders = db.orders || [];
  return orders
    .filter((o) => {
      const oNorm = normalizePhone(o.customer_phone);
      if (oNorm === norm) return true;
      if (norm.length >= 8 && oNorm.length >= 8) {
        return norm.includes(oNorm) || oNorm.includes(norm);
      }
      return false;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
