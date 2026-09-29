import { createAdminClient } from "./admin";
import type {
  Category,
  Product,
  EventService,
  GalleryItem,
  Testimonial,
  Banner,
} from "./types";
import {
  getCategoriesLocal,
  getProductsLocal,
  getEventServicesLocal,
  getGalleryItemsLocal,
  getTestimonialsLocal,
  getSiteContentLocal,
} from "@/lib/db/local_store";

export async function getActiveCategories(): Promise<Category[]> {
  try {
    const local = getCategoriesLocal().filter((c) => c.is_active);
    if (local.length > 0) return local;

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) return data as Category[];
    return [];
  } catch {
    return getCategoriesLocal().filter((c) => c.is_active);
  }
}

export async function getAllCategories(): Promise<(Category & { product_count: number })[]> {
  try {
    const localCats = getCategoriesLocal();
    const localProds = getProductsLocal();

    const countMap: Record<string, number> = {};
    for (const p of localProds) {
      if (p.category_id) {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      }
    }

    if (localCats.length > 0) {
      return localCats.map((c) => ({
        ...c,
        product_count: countMap[c.id] || 0,
      }));
    }

    const supabase = createAdminClient();
    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("products").select("category_id"),
    ]);

    if (categoriesRes.data && categoriesRes.data.length > 0) {
      const supaCountMap: Record<string, number> = {};
      if (productsRes.data) {
        for (const p of productsRes.data) {
          if (p.category_id) {
            supaCountMap[p.category_id] = (supaCountMap[p.category_id] || 0) + 1;
          }
        }
      }
      return categoriesRes.data.map((c) => ({
        ...c,
        product_count: supaCountMap[c.id] || 0,
      })) as (Category & { product_count: number })[];
    }
    return [];
  } catch {
    const localCats = getCategoriesLocal();
    const localProds = getProductsLocal();
    const countMap: Record<string, number> = {};
    for (const p of localProds) {
      if (p.category_id) {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      }
    }
    return localCats.map((c) => ({
      ...c,
      product_count: countMap[c.id] || 0,
    }));
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  isBestSeller?: boolean;
  limit?: number;
}): Promise<Product[]> {
  try {
    let prods = getProductsLocal().filter((p) => p.is_active);

    if (options?.categorySlug) {
      const cats = getCategoriesLocal();
      const targetCat = cats.find((c) => c.slug === options.categorySlug);
      if (targetCat) {
        prods = prods.filter((p) => p.category_id === targetCat.id);
      }
    }

    if (options?.isBestSeller) {
      prods = prods.filter((p) => p.is_best_seller);
    }

    if (prods.length > 0) {
      return options?.limit ? prods.slice(0, options.limit) : prods;
    }

    const supabase = createAdminClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (options?.isBestSeller) {
      query = query.eq("is_best_seller", true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data } = await query;
    if (data && data.length > 0) return data as Product[];
    return [];
  } catch {
    return getProductsLocal().filter((p) => p.is_active);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const local = getProductsLocal().find((p) => p.slug === slug && p.is_active);
  if (local) return local;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (data) return data as Product;
    return null;
  } catch {
    return null;
  }
}

export async function getEventServices(): Promise<EventService[]> {
  const local = getEventServicesLocal().filter((s) => s.is_active);
  if (local.length > 0) return local;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("event_services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) return data as EventService[];
    return [];
  } catch {
    return [];
  }
}

export async function getGalleryItems(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<GalleryItem[]> {
  let local = getGalleryItemsLocal().filter((i) => i.is_active);
  if (options?.featuredOnly) {
    local = local.filter((i) => i.is_featured);
  }
  if (local.length > 0) {
    return options?.limit ? local.slice(0, options.limit) : local;
  }

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("gallery_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (options?.featuredOnly) {
      query = query.eq("is_featured", true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data } = await query;
    if (data && data.length > 0) return data as GalleryItem[];
    return [];
  } catch {
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const local = getTestimonialsLocal().filter((t) => t.is_active);
  if (local.length > 0) return local;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) return data as Testimonial[];
    return [];
  } catch {
    return [];
  }
}

export async function getSiteContent<T = Record<string, unknown>>(
  key: string
): Promise<T | null> {
  const local = getSiteContentLocal<T>(key);
  if (local) return local;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .single();

    if (data) return data.value as T;
    return null;
  } catch {
    return null;
  }
}

export async function getActiveBanners(
  placement: "top_bar" | "home_strip" | "shop_header"
): Promise<Banner[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .eq("placement", placement)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) return data as Banner[];
    return [];
  } catch {
    return [];
  }
}
