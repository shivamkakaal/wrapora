"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Sparkles, X, ShoppingBag, ArrowRight, Check, Plus, Minus } from "lucide-react";
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

// Celebration burst particles config for click effect
const BURST_PARTICLES = [
  { id: 1, char: "✨", tx: "0px", ty: "-110px", rot: "25deg", color: "#FDE047", size: "text-2xl" },
  { id: 2, char: "🎉", tx: "90px", ty: "-85px", rot: "45deg", color: "#F472B6", size: "text-xl" },
  { id: 3, char: "⭐", tx: "120px", ty: "-10px", rot: "15deg", color: "#FBBF24", size: "text-2xl" },
  { id: 4, char: "✨", tx: "95px", ty: "75px", rot: "-30deg", color: "#E879F9", size: "text-lg" },
  { id: 5, char: "💫", tx: "20px", ty: "110px", rot: "60deg", color: "#FDE047", size: "text-xl" },
  { id: 6, char: "✨", tx: "-85px", ty: "95px", rot: "-45deg", color: "#F472B6", size: "text-2xl" },
  { id: 7, char: "⭐", tx: "-120px", ty: "15px", rot: "30deg", color: "#FBBF24", size: "text-xl" },
  { id: 8, char: "🎉", tx: "-90px", ty: "-80px", rot: "-20deg", color: "#E879F9", size: "text-2xl" },
  { id: 9, char: "✦", tx: "-30px", ty: "-120px", rot: "10deg", color: "#FDE047", size: "text-lg" },
  { id: 10, char: "💖", tx: "55px", ty: "-45px", rot: "80deg", color: "#EC4899", size: "text-xl" },
  { id: 11, char: "✧", tx: "-55px", ty: "-45px", rot: "-80deg", color: "#FBBF24", size: "text-xl" },
  { id: 12, char: "🎁", tx: "0px", ty: "-70px", rot: "0deg", color: "#D91B60", size: "text-xl" },
];

export interface ShowcaseHamper {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  price_paise: number;
  compare_at_price_paise?: number;
  image: string;
  badge?: string;
}

export interface HeroGiftCardProps {
  stickerImage?: string;
  stickerAlt?: string;
  drawerTitle?: string;
  drawerTagline?: string;
  drawerDescription?: string;
  hampers?: ShowcaseHamper[];
}

export default function HeroGiftCard({
  stickerImage = "/images/hero-gifts-sticker.png",
  stickerAlt = "WRAPORA Luxury Celebration Gift Hamper",
  drawerTitle = "Curated Gift Hampers",
  drawerTagline = "WRAPORA Atelier Gifting",
  drawerDescription = "Handcrafted celebration boxes with premium champagnes, artisanal treats, and bespoke keepsakes.",
  hampers = SHOWCASE_HAMPERS,
}: HeroGiftCardProps) {
  const displayHampers = hampers && hampers.length > 0 ? hampers : SHOWCASE_HAMPERS;
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [isPopping, setIsPopping] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
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
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger juicy spring bounce and particle explosion
    setIsPopping(true);
    setShowBurst(true);
    setBurstKey((k) => k + 1);

    // Open showcase drawer smoothly after the pop animation starts
    setTimeout(() => {
      setIsOpen(true);
    }, 180);

    // End sticker bounce after 600ms
    setTimeout(() => {
      setIsPopping(false);
    }, 600);

    // Reset particles after animation finishes
    setTimeout(() => {
      setShowBurst(false);
    }, 900);
  };

  const handleQuickAdd = (product: ShowcaseHamper) => {
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
    setIsOpen(false);
    setTimeout(() => {
      const section = document.getElementById("curated-gifts");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  return (
    <>
      {/* ===================================================================== */}
      {/* 1. PURE GIFTS STICKER WITH HOVER SHINE & CELEBRATION CLICK ANIMATION  */}
      {/* ===================================================================== */}
      <div className="relative flex items-center justify-center select-none py-2 lg:py-0">
        {/* Soft Ambient Magenta/Gold Glow Aura behind sticker */}
        <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-[#D91B60]/45 via-[#9333EA]/35 to-amber-300/30 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 animate-pulse-soft" />

        {/* Shockwave expanding ring on click */}
        {showBurst && (
          <div
            key={`shock-${burstKey}`}
            className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border-2 border-pink-400 bg-gradient-to-tr from-pink-500/25 via-amber-300/20 to-purple-500/25 animate-shockwave pointer-events-none z-30"
          />
        )}

        {/* Celebration Particles Burst on click */}
        {showBurst && (
          <div
            key={`burst-${burstKey}`}
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-40"
          >
            {BURST_PARTICLES.map((p) => (
              <span
                key={p.id}
                className={`absolute font-bold select-none drop-shadow-md ${p.size}`}
                style={{
                  color: p.color,
                  // @ts-expect-error custom CSS variable for dynamic burst trajectory
                  "--tx": p.tx,
                  "--ty": p.ty,
                  "--rot": p.rot,
                  animation: "particle-burst 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                {p.char}
              </span>
            ))}
          </div>
        )}

        {/* Interactive Native Button Container */}
        <button
          type="button"
          onClick={handleOpen}
          className={`group relative cursor-pointer border-0 bg-transparent p-0 outline-none focus:outline-none z-30 transition-transform duration-300 ${
            isPopping
              ? "animate-sticker-bounce"
              : "hover:scale-105 active:scale-95 animate-float-gentle"
          }`}
          aria-label="Open curated gift hampers collection"
        >
          {/* Shine Sweep Overlay masked inside the sticker bounds */}
          <div className="relative overflow-hidden rounded-3xl">
            {/* The Pure Gifts Sticker */}
            <img
              src={stickerImage}
              alt={stickerAlt}
              className="w-64 sm:w-80 md:w-96 lg:w-[410px] xl:w-[450px] max-w-[82vw] h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] group-hover:drop-shadow-[0_25px_50px_rgba(217,27,96,0.7)] transition-all duration-500 pointer-events-none"
              draggable={false}
            />

            {/* Holographic / Metallic Light Beam Shine Sweep on Hover */}
            <div className="pointer-events-none absolute -inset-full w-[300%] h-[300%] bg-gradient-to-r from-transparent via-white/50 to-transparent -rotate-45 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-20" />
          </div>

          {/* Twinkling Sparkle Micro-animations on Hover */}
          <Sparkles className="absolute -top-3 -right-2 w-7 h-7 text-amber-300 opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 animate-sparkle-spin pointer-events-none drop-shadow-md" />
          <Sparkles className="absolute bottom-8 -left-4 w-6 h-6 text-pink-300 opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 animate-sparkle-spin pointer-events-none drop-shadow-md" />
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. PORTAL-BASED ANIMATED GIFT SHOWCASE DRAWER                         */}
      {/* ===================================================================== */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex justify-end">
          {/* Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300 cursor-pointer animate-fade-in-up"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <aside
            className="relative w-full max-w-lg bg-[#FAF5FF] z-[1000000] shadow-2xl flex flex-col h-full animate-drawer-spring overflow-hidden"
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
                    <span>{drawerTagline}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-tight">
                    {drawerTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-100/85 mt-1 max-w-sm leading-relaxed">
                    {drawerDescription}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:rotate-90 flex-shrink-0 cursor-pointer"
                  aria-label="Close gift collection"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hampers Showcase List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {displayHampers.map((hamper, idx) => {
                const cartItem = mounted ? items.find((i) => i.productId === hamper.id) : null;
                const qty = cartItem?.quantity || 0;

                return (
                  <div
                    key={hamper.id}
                    style={{
                      animationDelay: `${idx * 75 + 120}ms`,
                    }}
                    className="group bg-white rounded-2xl p-3.5 sm:p-4 border border-purple-100 hover:border-pink-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-3.5 items-center sm:items-stretch animate-card-cascade"
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
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-purple-700 hover:text-[#D91B60] font-semibold px-2 py-1"
                          >
                            Details
                          </Link>

                          {qty > 0 ? (
                            <div className="inline-flex items-center justify-between rounded-full bg-gradient-to-r from-[#200538] to-[#D91B60] text-white shadow-sm border border-pink-400/30 h-7 px-2 gap-2 text-xs select-none">
                              <button
                                type="button"
                                onClick={() => {
                                  if (qty <= 1) {
                                    removeItem(hamper.id);
                                  } else {
                                    updateQuantity(hamper.id, qty - 1);
                                  }
                                }}
                                className="w-4 h-4 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-extrabold font-mono text-white min-w-[14px] text-center">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(hamper.id, Math.min(qty + 1, 10))}
                                className="w-4 h-4 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickAdd(hamper)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer bg-[#D91B60] hover:bg-[#c21453] text-white hover:scale-105 active:scale-95 shadow-[#D91B60]/30"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" /> Add
                            </button>
                          )}
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
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 px-4 rounded-full text-center text-xs sm:text-sm font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-lg shadow-[#D91B60]/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Browse Full Gift Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleScrollToGiftsSection}
                className="py-3 px-4 rounded-full text-center text-xs sm:text-sm font-bold text-[#250842] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                View on Page
              </button>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
