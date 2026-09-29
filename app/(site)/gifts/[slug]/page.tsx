import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/supabase/queries";
import { formatPaiseToInr } from "@/lib/utils/format";
import AddToCartButton from "@/components/site/AddToCartButton";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found | WRAPORA" };
  return {
    title: `${product.name} | WRAPORA Gifts`,
    description: product.short_description || product.description || "Luxury gift hamper from WRAPORA.",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = (await getProducts({ limit: 4 })).filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-24 md:pb-16">
      {/* Breadcrumb */}
      <Link
        href="/gifts"
        className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-royal transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gifts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-royal-50">
            <img
              src={product.images?.[0] || "https://placehold.co/600x600/FAF5FF/6B21A8?text=Gift"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-royal-50 border border-royal-100">
                  <img src={img} alt={`${product.name} image ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.is_best_seller && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-magenta-50 text-magenta text-xs font-bold rounded-full mb-3">
              ★ Best Seller
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold font-playfair text-ink">{product.name}</h1>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-royal">{formatPaiseToInr(product.price_paise)}</span>
            {product.compare_at_price_paise && product.compare_at_price_paise > product.price_paise && (
              <>
                <span className="text-lg text-ink/40 line-through">{formatPaiseToInr(product.compare_at_price_paise)}</span>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Save {formatPaiseToInr(product.compare_at_price_paise - product.price_paise)}
                </span>
              </>
            )}
          </div>

          {product.short_description && (
            <p className="mt-4 text-ink/70 text-lg leading-relaxed">{product.short_description}</p>
          )}

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              product.stock_status === "in_stock" ? "bg-green-500" :
              product.stock_status === "low_stock" ? "bg-amber-500" : "bg-red-500"
            }`} />
            <span className="text-sm text-ink/60">
              {product.stock_status === "in_stock" ? "In Stock" :
               product.stock_status === "low_stock" ? "Limited Stock — Order Soon" : "Out of Stock"}
            </span>
          </div>

          {/* Add to cart */}
          <div className="mt-8">
            <AddToCartButton product={product} size="md" />
          </div>

          {/* Worldwide Delivery Highlight */}
          <div className="mt-6 p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3 shadow-xs">
            <span className="text-2xl flex-shrink-0">🌍</span>
            <div className="text-xs text-[#250842]">
              <span className="font-bold block">Worldwide Delivery on all Hampers</span>
              <span className="text-ink/60">Safe, temperature-controlled & shockproof luxury packaging dispatched worldwide.</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-10 border-t border-royal-100/50 pt-8">
              <h2 className="text-lg font-semibold font-playfair text-ink mb-3">About This Hamper</h2>
              <p className="text-ink/70 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-royal-50 text-royal text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold font-playfair text-ink mb-8">You Might Also Love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/gifts/${rp.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-royal-100/50 hover:border-royal-200 shadow-sm hover:shadow-royal transition-all hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={rp.images?.[0] || ""} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-ink text-sm line-clamp-1">{rp.name}</h3>
                  <p className="text-royal font-bold mt-1">{formatPaiseToInr(rp.price_paise)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add To Cart Floating Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-purple-100 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-xs text-ink/50 block">Price</span>
          <span className="text-lg font-extrabold text-[#250842]">
            {formatPaiseToInr(product.price_paise)}
          </span>
        </div>
        <div>
          <AddToCartButton product={product} size="md" />
        </div>
      </div>
    </div>
  );
}
