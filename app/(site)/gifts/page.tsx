import Link from "next/link";
import { getActiveCategories, getProducts } from "@/lib/supabase/queries";
import { formatPaiseToInr } from "@/lib/utils/format";
import AddToCartButton from "@/components/site/AddToCartButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Store | WRAPORA — Curated Luxury Hampers",
  description: "Shop handcrafted luxury gift hampers for birthdays, anniversaries, weddings & celebrations. Worldwide shipping available.",
};

export const revalidate = 60;

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getProducts(),
  ]);

  const activeCategory = params.category || "all";
  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => {
        const cat = categories.find((c) => c.slug === activeCategory);
        return cat && p.category_id === cat.id;
      });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 sm:pb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#D91B60] text-xs font-bold border border-pink-200 mb-3 shadow-xs">
          <span>🌍 Worldwide Shipping on All Luxury Hampers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair text-ink">
          Curated <span className="brand-gradient-text">Gift Hampers</span>
        </h1>
        <p className="mt-2 text-ink/60 max-w-xl mx-auto text-sm sm:text-base">
          Each hamper is handcrafted with premium artisanal goods, luxury keepsakes, and exquisite presentation.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        <Link
          href="/gifts"
          className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === "all"
              ? "brand-gradient text-white shadow-royal"
              : "bg-white text-ink/70 border border-royal-100 hover:border-royal-200 hover:text-royal"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/gifts?category=${cat.slug}`}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.slug
                ? "brand-gradient text-white shadow-royal"
                : "bg-white text-ink/70 border border-royal-100 hover:border-royal-200 hover:text-royal"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink/50 text-lg">No products found in this category.</p>
          <Link href="/gifts" className="text-royal font-medium mt-2 inline-block hover:text-magenta">
            View all gifts →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden border border-royal-100/50 hover:border-royal-200 shadow-sm hover:shadow-royal transition-all duration-300 hover:-translate-y-1"
            >
              <Link href={`/gifts/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                <img
                  src={product.images?.[0] || "https://placehold.co/400x300/FAF5FF/6B21A8?text=Gift"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {product.is_best_seller && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-magenta text-white text-xs font-bold rounded-full">
                    ★ Best Seller
                  </span>
                )}
                {product.stock_status === "low_stock" && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    Low Stock
                  </span>
                )}
                {product.stock_status === "out_of_stock" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white/90 text-ink px-4 py-2 rounded-full text-sm font-bold">Sold Out</span>
                  </div>
                )}
              </Link>
              <div className="p-5">
                <Link href={`/gifts/${product.slug}`}>
                  <h3 className="font-semibold text-ink group-hover:text-royal transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-ink/50 mt-1 line-clamp-2">{product.short_description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-royal">{formatPaiseToInr(product.price_paise)}</span>
                    {product.compare_at_price_paise && product.compare_at_price_paise > product.price_paise && (
                      <span className="text-sm text-ink/40 line-through">{formatPaiseToInr(product.compare_at_price_paise)}</span>
                    )}
                  </div>
                  <AddToCartButton product={product} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
