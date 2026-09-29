"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { useGiftShowcaseStore } from "@/lib/store/gift-showcase";
import { useCartStore } from "@/lib/store/cart";
import { formatPaiseToInr } from "@/lib/utils/format";

// Luxury signature gift hampers featured in the showcase
const SHOWCASE_HAMPERS = [
  {
    id: "hamp-1",
    name: "The Royal Moët & Praline Atelier Chest",
    slug: "royal-celebration-chest",
    short_description: "Moët & Chandon rosé champagne, Godiva celebration pralines, pastel macarons & calligraphy card.",
    price_paise: 449900,
    compare_at_price_paise: 599900,
    image: "/images/hero-gifts-sticker.png",
    badge: "Most Loved",
  },
  {
    id: "hamp-2",
    name: "Golden Velvet Celebration Hamper",
    slug: "golden-velvet-gourmet-hamper",
    short_description: "Artisanal gold-leaf truffles, gourmet treats, Himalayan roast nuts & satin bow.",
    price_paise: 299900,
    compare_at_price_paise: 389900,
    image: "/images/hero-celebration.jpg",
    badge: "Bestseller",
  },
  {
    id: "hamp-3",
    name: "Enchanted Bloom & Scent Keepsake",
    slug: "enchanted-bloom-scent-atelier",
    short_description: "Blush preserved roses, aromatic luxury soy candle, organic bath salts & gourmet sweets.",
    price_paise: 349900,
    compare_at_price_paise: 429900,
    image: "/images/service-gifting.jpg",
    badge: "Handcrafted",
  },
  {
    id: "hamp-4",
    name: "Velvet Mocha & Cedarwood Duo",
    slug: "velvet-mocha-cedarwood-duo",
    short_description: "Single-origin roast coffee, french press, cedarwood candle & artisan leather coasters.",
    price_paise: 389900,
    compare_at_price_paise: 429900,
    image: "/images/service-decor.jpg",
    badge: "Limited Edition",
  },
];

export default function GiftShowcaseDrawer() {
  const isOpen = useGiftShowcaseStore((s) => s.isOpen);
  const closeShowcase = useGiftShowcaseStore((s) => s.closeShowcase);
  const openShowcase = useGiftShowcaseStore((s) => s.openShowcase);

  const [addedId, setAddedId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  // Fallback window event listener for maximum reliability
  useEffect(() => {
    const handleCustomOpen = () => {
      openShowcase();
    };
    window.addEventListener("rapora:open-gift-showcase", handleCustomOpen);

    return () => {
      window.removeEventListener("rapora:open-gift-showcase", handleCustomOpen);
    };
  }, [openShowcase]);

  // Lock body scroll and handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeShowcase();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeShowcase]);

  if (!isOpen) return null;

  const handleQuickAdd = (product: typeof SHOWCASE_HAMPERS[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      pricePaise: product.price_paise,
      isCustomizable: true,
    });

    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  };

  const handleScrollToGiftsSection = () => {
    closeShowcase();
    setTimeout(() => {
      const section = document.getElementById("curated-gifts");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300 cursor-pointer"
        onClick={closeShowcase}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside
        className="relative w-full max-w-lg bg-[#FAF5FF] z-[100000] shadow-2xl flex flex-col h-full animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="WRAPORA Curated Gift Hampers"
      >
        {/* Header with Royal Purple Velvet Gradient */}
        <div className="relative bg-gradient-to-r from-[#200538] via-[#330856] to-[#D91B60] text-white p-6 overflow-hidden flex-shrink-0">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-pink-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-pink-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-spin" />
                <span>WRAPORA Atelier Gifting</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-tight">
                Curated Gift Hampers
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/85 mt-1 max-w-sm leading-relaxed">
                Handcrafted celebration boxes with premium champagnes, artisanal treats, and bespoke keepsakes.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={closeShowcase}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:rotate-90 flex-shrink-0 cursor-pointer"
              aria-label="Close gift collection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hampers Showcase List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {SHOWCASE_HAMPERS.map((hamper) => {
            const isAdded = addedId === hamper.id;

            return (
              <div
                key={hamper.id}
                className="group bg-white rounded-2xl p-3.5 sm:p-4 border border-purple-100 hover:border-pink-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-3.5 items-center sm:items-stretch"
              >
                {/* Image */}
                <div className="relative w-full sm:w-28 h-32 sm:h-28 rounded-xl overflow-hidden bg-purple-50 flex-shrink-0 flex items-center justify-center p-1">
                  <img
                    src={hamper.image}
                    alt={hamper.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#D91B60] text-white text-[9px] font-bold rounded-full shadow">
                    {hamper.badge}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between w-full">
                  <div>
                    <h3 className="font-bold text-[#1F1030] group-hover:text-[#D91B60] transition-colors text-sm sm:text-base line-clamp-1">
                      {hamper.name}
                    </h3>
                    <p className="text-xs text-ink/60 mt-1 line-clamp-2 leading-relaxed">
                      {hamper.short_description}
                    </p>
                  </div>

                  {/* Price & Add */}
                  <div className="pt-3 mt-2 border-t border-purple-50 flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-[#250842]">
                        {formatPaiseToInr(hamper.price_paise)}
                      </span>
                      {hamper.compare_at_price_paise && (
                        <span className="text-xs text-ink/40 line-through">
                          {formatPaiseToInr(hamper.compare_at_price_paise)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/gifts/${hamper.slug}`}
                        onClick={closeShowcase}
                        className="text-xs text-purple-700 hover:text-[#D91B60] font-semibold px-2 py-1"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => handleQuickAdd(hamper)}
                        className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-[#D91B60] hover:bg-[#c21453] text-white hover:scale-105 active:scale-95 shadow-[#D91B60]/30"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added!
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-purple-100 flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Link
            href="/gifts"
            onClick={closeShowcase}
            className="flex-1 py-3 px-4 rounded-full text-center text-xs sm:text-sm font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-lg shadow-[#D91B60]/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>Browse Full Gift Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleScrollToGiftsSection}
            className="py-3 px-4 rounded-full text-center text-xs sm:text-sm font-bold text-[#250842] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            View on Page
          </button>
        </div>
      </aside>
    </div>
  );
}
