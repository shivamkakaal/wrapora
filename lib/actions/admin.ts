"use server";

import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // graceful fallback
  }
}
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  OrderStatus,
  PaymentStatus,
  LeadStatus,
  Product,
  Category,
  EventService,
  GalleryItem,
  Testimonial,
} from "@/lib/supabase/types";
import type { ProductInput } from "@/lib/validators/products";
import {
  saveCategoryLocal,
  deleteCategoryLocal,
  saveProductLocal,
  deleteProductLocal,
  saveEventServiceLocal,
  deleteEventServiceLocal,
  saveGalleryItemLocal,
  deleteGalleryItemLocal,
  saveTestimonialLocal,
  deleteTestimonialLocal,
  saveSiteContentLocal,
  getAllSiteContentLocal,
  updateOrderStatusLocal,
} from "@/lib/db/local_store";

export interface AdminActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ==========================================
// 1. ORDERS MANAGEMENT
// ==========================================

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  adminNotes?: string
): Promise<AdminActionResult> {
  const now = new Date().toISOString();
  let updatedOrder: any = null;

  // 1. Update local store first so local orders are always consistent and never lost
  try {
    const localRes = updateOrderStatusLocal(orderId, {
      status,
      payment_status: paymentStatus,
      admin_notes: adminNotes,
    });
    if (localRes) {
      updatedOrder = localRes;
    }
  } catch (localErr) {
    console.warn("Local store update order status warning:", localErr);
  }

  // 2. Update Supabase
  try {
    const supabase = createAdminClient();
    const updates: Record<string, unknown> = {
      status,
      updated_at: now,
    };
    if (paymentStatus) updates.payment_status = paymentStatus;
    if (typeof adminNotes === "string") updates.admin_notes = adminNotes;

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (!error && data) {
      updatedOrder = data;
    }
  } catch (err: unknown) {
    console.warn("Supabase updateOrderStatus warning:", err);
  }

  safeRevalidatePath("/admin/orders");
  safeRevalidatePath(`/admin/orders/${orderId}`);
  safeRevalidatePath("/account");

  if (updatedOrder) {
    return { ok: true, data: updatedOrder };
  }

  return { ok: true, data: { id: orderId, status } };
}

// ==========================================
// 2. EVENT LEADS MANAGEMENT
// ==========================================

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  adminNotes?: string
): Promise<AdminActionResult> {
  try {
    const supabase = createAdminClient();

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof adminNotes === "string") updates.admin_notes = adminNotes;

    const { data, error } = await supabase
      .from("event_leads")
      .update(updates)
      .eq("id", leadId)
      .select()
      .single();

    if (error) throw error;

    safeRevalidatePath("/admin/leads");
    safeRevalidatePath(`/admin/leads/${leadId}`);
    return { ok: true, data };
  } catch (err: unknown) {
    const error = err as Error;
    return { ok: false, error: error.message };
  }
}

// ==========================================
// 3. PRODUCTS CRUD
// ==========================================

export async function saveProduct(
  productInput: ProductInput,
  productId?: string
): Promise<AdminActionResult<Product>> {
  const payload = {
    name: productInput.name,
    slug: productInput.slug,
    category_id: productInput.categoryId || null,
    short_description: productInput.shortDescription || null,
    description: productInput.description || null,
    price_paise: productInput.pricePaise,
    compare_at_price_paise: productInput.compareAtPricePaise || null,
    sku: productInput.sku || null,
    stock_status: productInput.stockStatus,
    stock_quantity: productInput.stockQuantity || null,
    is_best_seller: productInput.isBestSeller,
    is_customizable: productInput.isCustomizable,
    is_active: productInput.isActive,
    images: productInput.images,
    tags: productInput.tags,
    sort_order: productInput.sortOrder,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createAdminClient();
    let result;
    if (productId) {
      result = await supabase
        .from("products")
        .update(payload)
        .eq("id", productId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();
    }

    if (!result.error && result.data) {
      saveProductLocal(result.data as Product);
      safeRevalidatePath("/gifts");
      safeRevalidatePath(`/gifts/${productInput.slug}`);
      safeRevalidatePath("/admin/products");
      safeRevalidatePath("/");
      return { ok: true, data: result.data as Product };
    }
  } catch (err) {
    console.warn("Supabase product save failed, falling back to local store:", err);
  }

  // Resilient fallback to local store
  const saved = saveProductLocal({
    id: productId,
    ...payload,
  });

  safeRevalidatePath("/gifts");
  safeRevalidatePath(`/gifts/${productInput.slug}`);
  safeRevalidatePath("/admin/products");
  safeRevalidatePath("/");
  return { ok: true, data: saved };
}

export async function deleteProduct(productId: string): Promise<AdminActionResult<void>> {
  try {
    const supabase = createAdminClient();
    await supabase.from("products").delete().eq("id", productId);
  } catch (err) {
    console.warn("Supabase deleteProduct error:", err);
  }

  deleteProductLocal(productId);

  safeRevalidatePath("/gifts");
  safeRevalidatePath("/admin/products");
  safeRevalidatePath("/");
  return { ok: true };
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean
): Promise<AdminActionResult<Product>> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("products")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", productId);
  } catch (err) {
    console.warn("Supabase toggleProductActive error:", err);
  }

  const saved = saveProductLocal({ id: productId, is_active: isActive });
  safeRevalidatePath("/gifts");
  safeRevalidatePath("/admin/products");
  return { ok: true, data: saved };
}

// ==========================================
// 4. CATEGORIES CRUD
// ==========================================

export async function saveCategory(categoryInput: {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  is_smart?: boolean;
  sort_order?: number;
  is_active?: boolean;
}): Promise<AdminActionResult<Category>> {
  const cleanSlug = (categoryInput.slug || categoryInput.name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const payload = {
    name: categoryInput.name.trim(),
    slug: cleanSlug,
    description: categoryInput.description?.trim() || null,
    is_smart: categoryInput.is_smart ?? false,
    sort_order: Number(categoryInput.sort_order ?? 0),
    is_active: categoryInput.is_active ?? true,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createAdminClient();
    let result;
    if (categoryInput.id) {
      result = await supabase
        .from("categories")
        .update(payload)
        .eq("id", categoryInput.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("categories")
        .insert(payload)
        .select()
        .single();
    }

    if (!result.error && result.data) {
      saveCategoryLocal(result.data as Category);
      safeRevalidatePath("/gifts");
      safeRevalidatePath("/admin/categories");
      safeRevalidatePath("/admin/products");
      safeRevalidatePath("/");
      return { ok: true, data: result.data as Category };
    }
  } catch (err) {
    console.warn("Supabase saveCategory failed, falling back to local store:", err);
  }

  // Resilient fallback to local store
  const saved = saveCategoryLocal({
    id: categoryInput.id,
    ...payload,
  });

  safeRevalidatePath("/gifts");
  safeRevalidatePath("/admin/categories");
  safeRevalidatePath("/admin/products");
  safeRevalidatePath("/");
  return { ok: true, data: saved };
}

export async function deleteCategory(categoryId: string): Promise<AdminActionResult<void>> {
  try {
    const supabase = createAdminClient();
    await supabase.from("products").update({ category_id: null }).eq("category_id", categoryId);
    await supabase.from("product_categories").delete().eq("category_id", categoryId);
    await supabase.from("categories").delete().eq("id", categoryId);
  } catch (err) {
    console.warn("Supabase deleteCategory error:", err);
  }

  deleteCategoryLocal(categoryId);

  safeRevalidatePath("/gifts");
  safeRevalidatePath("/admin/categories");
  safeRevalidatePath("/admin/products");
  safeRevalidatePath("/");
  return { ok: true };
}

export async function toggleCategoryActive(
  categoryId: string,
  isActive: boolean
): Promise<AdminActionResult<Category>> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("categories")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", categoryId);
  } catch (err) {
    console.warn("Supabase toggleCategoryActive error:", err);
  }

  const saved = saveCategoryLocal({ id: categoryId, is_active: isActive });
  safeRevalidatePath("/gifts");
  safeRevalidatePath("/admin/categories");
  safeRevalidatePath("/admin/products");
  return { ok: true, data: saved };
}

// ==========================================
// 5. CMS CONTENT & HERO EDITOR
// ==========================================

export async function saveSiteContent(
  key: string,
  value: unknown
): Promise<AdminActionResult<unknown>> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("site_content")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn("Supabase saveSiteContent error:", err);
  }

  saveSiteContentLocal(key, value);

  safeRevalidatePath("/");
  safeRevalidatePath("/admin/content");
  return { ok: true, data: value };
}

export async function getAllSiteContent(): Promise<Record<string, unknown>> {
  const localContent = getAllSiteContentLocal();
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("site_content").select("key, value");
    if (data && data.length > 0) {
      const map: Record<string, unknown> = { ...localContent };
      data.forEach((row) => {
        map[row.key] = row.value;
      });
      return map;
    }
  } catch (err) {
    console.warn("Supabase getAllSiteContent error:", err);
  }
  return localContent;
}

// ==========================================
// 6. EVENT SERVICES CRUD
// ==========================================

export async function saveEventService(
  serviceInput: Record<string, unknown>,
  serviceId?: string
): Promise<AdminActionResult<EventService>> {
  try {
    const supabase = createAdminClient();
    let result;
    if (serviceId) {
      result = await supabase
        .from("event_services")
        .update({ ...serviceInput, updated_at: new Date().toISOString() })
        .eq("id", serviceId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("event_services")
        .insert(serviceInput)
        .select()
        .single();
    }

    if (!result.error && result.data) {
      saveEventServiceLocal(result.data as EventService);
      safeRevalidatePath("/events");
      safeRevalidatePath("/admin/events");
      safeRevalidatePath("/");
      return { ok: true, data: result.data as EventService };
    }
  } catch (err) {
    console.warn("Supabase saveEventService error:", err);
  }

  const saved = saveEventServiceLocal({
    id: serviceId,
    ...serviceInput,
  } as any);

  safeRevalidatePath("/events");
  safeRevalidatePath("/admin/events");
  safeRevalidatePath("/");
  return { ok: true, data: saved };
}

export async function deleteEventService(serviceId: string): Promise<AdminActionResult<void>> {
  try {
    const supabase = createAdminClient();
    await supabase.from("event_services").delete().eq("id", serviceId);
  } catch (err) {
    console.warn("Supabase deleteEventService error:", err);
  }

  deleteEventServiceLocal(serviceId);

  safeRevalidatePath("/events");
  safeRevalidatePath("/admin/events");
  safeRevalidatePath("/");
  return { ok: true };
}

// ==========================================
// 7. GALLERY CRUD
// ==========================================

export async function saveGalleryItem(
  galleryInput: Record<string, unknown>,
  itemId?: string
): Promise<AdminActionResult<GalleryItem>> {
  try {
    const supabase = createAdminClient();
    let result;
    if (itemId) {
      result = await supabase.from("gallery_items").update(galleryInput).eq("id", itemId).select().single();
    } else {
      result = await supabase.from("gallery_items").insert(galleryInput).select().single();
    }
    if (!result.error && result.data) {
      saveGalleryItemLocal(result.data as GalleryItem);
      safeRevalidatePath("/gallery");
      safeRevalidatePath("/admin/gallery");
      safeRevalidatePath("/");
      return { ok: true, data: result.data as GalleryItem };
    }
  } catch (err) {
    console.warn("Supabase saveGalleryItem error:", err);
  }

  const saved = saveGalleryItemLocal({
    id: itemId,
    ...galleryInput,
  } as any);

  safeRevalidatePath("/gallery");
  safeRevalidatePath("/admin/gallery");
  safeRevalidatePath("/");
  return { ok: true, data: saved };
}

export async function deleteGalleryItem(itemId: string): Promise<AdminActionResult<void>> {
  try {
    const supabase = createAdminClient();
    await supabase.from("gallery_items").delete().eq("id", itemId);
  } catch (err) {
    console.warn("Supabase deleteGalleryItem error:", err);
  }

  deleteGalleryItemLocal(itemId);

  safeRevalidatePath("/gallery");
  safeRevalidatePath("/admin/gallery");
  safeRevalidatePath("/");
  return { ok: true };
}

// ==========================================
// 8. TESTIMONIALS CRUD
// ==========================================

export async function saveTestimonial(
  testimonialInput: Record<string, unknown>,
  testimonialId?: string
): Promise<AdminActionResult<Testimonial>> {
  try {
    const supabase = createAdminClient();
    let result;
    if (testimonialId) {
      result = await supabase.from("testimonials").update(testimonialInput).eq("id", testimonialId).select().single();
    } else {
      result = await supabase.from("testimonials").insert(testimonialInput).select().single();
    }
    if (!result.error && result.data) {
      saveTestimonialLocal(result.data as Testimonial);
      safeRevalidatePath("/");
      safeRevalidatePath("/admin/testimonials");
      return { ok: true, data: result.data as Testimonial };
    }
  } catch (err) {
    console.warn("Supabase saveTestimonial error:", err);
  }

  const saved = saveTestimonialLocal({
    id: testimonialId,
    ...testimonialInput,
  } as any);

  safeRevalidatePath("/");
  safeRevalidatePath("/admin/testimonials");
  return { ok: true, data: saved };
}

export async function deleteTestimonial(testimonialId: string): Promise<AdminActionResult<void>> {
  try {
    const supabase = createAdminClient();
    await supabase.from("testimonials").delete().eq("id", testimonialId);
  } catch (err) {
    console.warn("Supabase deleteTestimonial error:", err);
  }

  deleteTestimonialLocal(testimonialId);

  safeRevalidatePath("/");
  safeRevalidatePath("/admin/testimonials");
  return { ok: true };
}

// ==========================================
// 9. GLOBAL SETTINGS
// ==========================================

export async function saveSetting(key: string, value: unknown): Promise<AdminActionResult<unknown>> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn("Supabase saveSetting error:", err);
  }

  safeRevalidatePath("/admin/settings");
  safeRevalidatePath("/");
  return { ok: true, data: value };
}

// ==========================================
// 10. ASSET UPLOAD FOR CMS & HOMEPAGE
// ==========================================

export async function uploadAdminAsset(formData: FormData): Promise<AdminActionResult<string>> {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `home-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    let bucket = "banners";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      bucket = "products";
      const { error: fallbackError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (fallbackError) {
        throw new Error(uploadError.message || fallbackError.message);
      }
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { ok: true, data: urlData.publicUrl };
  } catch (err: unknown) {
    const error = err as Error;
    return { ok: false, error: error.message };
  }
}
