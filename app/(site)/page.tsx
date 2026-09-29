import Link from "next/link";
import { ArrowRight, Star, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { getProducts, getEventServices, getGalleryItems, getTestimonials, getSiteContent } from "@/lib/supabase/queries";
import { formatPaiseToInr } from "@/lib/utils/format";
import AddToCartButton from "@/components/site/AddToCartButton";
import TestimonialSlider from "@/components/site/TestimonialSlider";
import HeroGiftCard from "@/components/site/HeroGiftCard";
import ServicesSlider, { ServiceItem } from "@/components/site/ServicesSlider";

export const revalidate = 60;

export default async function HomePage() {
  const [
    heroContent,
    servicesContent,
    hampersSectionContent,
    stickerDrawerContent,
    products,
    services,
    gallery,
    testimonials,
  ] = await Promise.all([
    getSiteContent<{
      headline?: string;
      tagline_badge?: string;
      subheadline?: string;
      background_image?: string;
      background_color?: string;
      sticker_image?: string;
      sticker_alt?: string;
      cta_primary?: { label: string; href: string };
      cta_secondary?: { label: string; href: string };
      trust_items?: Array<{ label: string }>;
    }>("hero"),
    getSiteContent<{
      title?: string;
      items?: ServiceItem[];
    }>("services_showcase"),
    getSiteContent<{
      title?: string;
      subtitle?: string;
      view_all_label?: string;
      view_all_href?: string;
    }>("hampers_section"),
    getSiteContent<{
      title?: string;
      tagline?: string;
      description?: string;
      items?: Array<{
        id: string;
        name: string;
        slug: string;
        short_description: string;
        price_paise: number;
        compare_at_price_paise?: number;
        image: string;
        badge?: string;
      }>;
    }>("hero_sticker_drawer"),
    getProducts({ limit: 6 }),
    getEventServices(),
    getGalleryItems({ featuredOnly: true, limit: 8 }),
    getTestimonials(),
  ]);

  const heroSubheadline =
    heroContent?.subheadline ||
    "Premium event planning, stunning decorations, and handpicked gifts for your special celebrations.";

  // Signature Services Showcase fallback
  const defaultServicesShowcase: ServiceItem[] = [
    {
      title: "Event Planning",
      subtitle: "Bespoke Themes & Coordination",
      image: "/images/service-planning.jpg",
      href: "/events",
    },
    {
      title: "Decor",
      subtitle: "Floral Arches & Fairy Lights",
      image: "/images/service-decor.jpg",
      href: "/events",
    },
    {
      title: "Gifting",
      subtitle: "Artisanal Hampers & Keepsakes",
      image: "/images/service-gifting.jpg",
      href: "/gifts",
    },
    {
      title: "Custom Cakes",
      subtitle: "Designer Tiered & Fondant Bakes",
      image: "/images/service-cake.jpg",
      href: "/events#inquire",
      badge: "Popular",
    },
    {
      title: "Photography",
      subtitle: "Cinematic Keepsakes & Stills",
      image: "/images/service-photo.jpg",
      href: "/gallery",
    },
  ];

  const servicesShowcase =
    servicesContent?.items && servicesContent.items.length > 0
      ? servicesContent.items
      : defaultServicesShowcase;

  const trustBadges =
    heroContent?.trust_items && heroContent.trust_items.length > 0
      ? heroContent.trust_items
      : [
          { label: "Worldwide Gift Shipping 🌍" },
          { label: "White-Glove Setup" },
          { label: "100% Bespoke Decor" },
        ];

  return (
    <div className="bg-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: FULL-BLEED BACKGROUND IMAGE WITH LUXURY GRADIENT OVERLAY */}
      {/* ========================================================================= */}
      <section
        className="relative min-h-[75vh] lg:min-h-[80vh] flex flex-col justify-between overflow-hidden"
        style={{ backgroundColor: heroContent?.background_color || "#200538" }}
      >
        {/* Full-Bleed Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroContent?.background_image || "/images/hero-celebration.jpg"}
            alt={heroContent?.headline || "WRAPORA Luxury Celebration and Decor"}
            className="w-full h-full object-cover object-center scale-[1.02]"
          />
          {/* Deep Royal Purple Gradient Overlays for Opulence & Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E0535]/95 via-[#250842]/85 to-[#1E0535]/70 lg:to-[#1E0535]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#250842]/95 via-transparent to-[#250842]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#D91B60]/25 via-transparent to-black/40" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 sm:pt-28 lg:pt-30 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-pink-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#FF2E93]" />
                <span>{heroContent?.tagline_badge || "Ultra-Luxury Event Styling & Curated Atelier"}</span>
              </div>

              {/* Grand Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-playfair text-white leading-[1.15] tracking-tight drop-shadow-lg break-words">
                {heroContent?.headline || "Making Every\nMoment Magical\nwith WRAPORA"}
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base lg:text-lg text-purple-100/90 leading-relaxed font-sans max-w-xl drop-shadow">
                {heroSubheadline}
              </p>

              {/* Dual CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href={heroContent?.cta_primary?.href || "/events#inquire"}
                  className="w-full sm:w-auto px-7 sm:px-9 py-3.5 rounded-full text-xs sm:text-sm lg:text-base font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-xl shadow-[#D91B60]/40 transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 text-center"
                >
                  {heroContent?.cta_primary?.label || "Plan Your Event"} <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={heroContent?.cta_secondary?.href || "/gifts"}
                  className="w-full sm:w-auto px-7 sm:px-9 py-3.5 rounded-full text-xs sm:text-sm lg:text-base font-bold text-white bg-[#380E65]/90 hover:bg-[#471280] backdrop-blur-md border border-white/30 hover:border-white/60 shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center text-center"
                >
                  {heroContent?.cta_secondary?.label || "Explore Gifts"}
                </Link>
              </div>

              {/* Micro Trust Indicators */}
              <div className="pt-5 sm:pt-6 border-t border-white/15 grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-8 text-xs sm:text-sm text-purple-200/90 font-medium">
                {trustBadges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    {idx === 0 ? (
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ) : idx === 1 ? (
                      <ShieldCheck className="w-4 h-4 text-pink-300" />
                    ) : (
                      <HeartHandshake className="w-4 h-4 text-pink-300" />
                    )}
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Luxury Gifts Sticker with Hover Shine & Animated Drawer */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end pt-2 lg:pt-0">
              <HeroGiftCard
                stickerImage={heroContent?.sticker_image || "/images/hero-gifts-sticker.png"}
                stickerAlt={heroContent?.sticker_alt || "WRAPORA Luxury Celebration Gift Hamper"}
                drawerTitle={stickerDrawerContent?.title}
                drawerTagline={stickerDrawerContent?.tagline}
                drawerDescription={stickerDrawerContent?.description}
                hampers={stickerDrawerContent?.items}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SIGNATURE CURVED WHITE WAVE TRANSITION INTO WHITE CONTENT                 */}
        {/* ========================================================================= */}
        <div className="relative z-10 w-full overflow-hidden leading-none -mt-2">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-8 sm:h-12 lg:h-14 preserve-3d"
            preserveAspectRatio="none"
          >
            <path
              d="M0,35 C360,110 1080,110 1440,35 L1440,120 L0,120 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. "OUR SERVICES" SECTION (SMOOTH HORIZONTAL SLIDE SCROLL)                 */}
      {/* ========================================================================= */}
      <section className="bg-white pt-2 sm:pt-3 pb-3 sm:pb-5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-playfair text-[#1F1030] tracking-tight mb-2 sm:mb-3">
            {servicesContent?.title || "Our Services"}
          </h2>

          {/* Smooth Slide-Scroll Carousel for easy browsing of all services */}
          <ServicesSlider services={servicesShowcase} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CURATED GIFT STORE HIGHLIGHTS                                          */}
      {/* ========================================================================= */}
      <section id="curated-gifts" className="pt-3 sm:pt-5 pb-8 sm:pb-12 bg-white border-t border-purple-50/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold font-playfair text-[#1F1030]">
                  {hampersSectionContent?.title || "Curated Gift Hampers"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-[#D91B60] text-[11px] font-bold border border-pink-200/70 shadow-xs">
                  🌍 Worldwide Shipping
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-ink/60 max-w-lg">
                {hampersSectionContent?.subtitle || "Handcrafted luxury keepsakes with gourmet delights, fine fragrances, and bespoke calligraphy cards. Delivered worldwide."}
              </p>
            </div>
            <Link
              href={hampersSectionContent?.view_all_href || "/gifts"}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D91B60] hover:underline"
            >
              {hampersSectionContent?.view_all_label || "Explore Full Collection"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <Link href={`/gifts/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-purple-50">
                    <img
                      src={product.images?.[0] || "/images/service-gifting.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.is_best_seller && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-[#D91B60] text-white text-[11px] font-bold rounded-full shadow-md">
                        ★ Best Seller
                      </span>
                    )}
                    {product.stock_status === "out_of_stock" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-ink px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-5">
                    <Link href={`/gifts/${product.slug}`}>
                      <h3 className="font-bold text-[#1F1030] group-hover:text-[#D91B60] transition-colors text-base line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-ink/60 mt-1 line-clamp-2">
                      {product.short_description || "Handcrafted artisanal luxury hamper."}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1 flex items-center justify-between border-t border-purple-50/60 mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-bold text-[#250842]">
                      {formatPaiseToInr(product.price_paise)}
                    </span>
                    {product.compare_at_price_paise && product.compare_at_price_paise > product.price_paise && (
                      <span className="text-xs text-ink/40 line-through">
                        {formatPaiseToInr(product.compare_at_price_paise)}
                      </span>
                    )}
                  </div>
                  <AddToCartButton product={product} size="sm" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/gifts"
              className="inline-flex items-center gap-1.5 bg-[#D91B60] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md"
            >
              Browse All Gifts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EVENT STYLING & EXPERIENCES                                            */}
      {/* ========================================================================= */}
      {services.length > 0 && (
        <section className="pt-6 sm:pt-8 pb-10 sm:pb-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D91B60]">
                Bespoke Experiences
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-playfair text-[#1F1030] mt-1">
                Signature Celebrations
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-ink/60">
                From milestone birthdays to lavish anniversary soirées, we style and orchestrate every detail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {services.slice(0, 3).map((svc) => (
                <div
                  key={svc.id}
                  className="group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={svc.cover_image || "/images/hero-celebration.jpg"}
                    alt={svc.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250842] via-[#250842]/40 to-transparent" />
                  <div className="absolute bottom-0 p-5 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 bg-white/10 backdrop-blur-sm px-2.5 py-0.5 rounded-full mb-2 inline-block">
                      {svc.type.replace(/_/g, " ")}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-playfair">{svc.title}</h3>
                    <p className="text-white/80 text-xs mt-1 line-clamp-2">{svc.summary}</p>
                    {svc.starting_price_paise && (
                      <p className="text-pink-300 text-xs font-bold mt-1.5">
                        Starting from {formatPaiseToInr(svc.starting_price_paise)}
                      </p>
                    )}
                    <Link
                      href={`/events#inquire`}
                      className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-white hover:text-pink-300 transition-colors"
                    >
                      Enquire for Date <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. PORTFOLIO GALLERY SHOWCASE                                             */}
      {/* ========================================================================= */}
      {gallery.length > 0 && (
        <section className="pt-8 sm:pt-10 pb-10 sm:pb-12 bg-[#FAF5FF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-7 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D91B60]">
                  Visual Chronicles
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-playfair text-[#1F1030] mt-1">
                  Enchanted Memories
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-ink/60">
                  A glimpse into our recent celebrations, floral canopies, and bespoke setups.
                </p>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D91B60] hover:underline"
              >
                View Full Gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.image_url}
                    alt={item.title || "WRAPORA Gallery"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-xs font-semibold line-clamp-1">
                      {item.title || "Magical Celebration"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. VERIFIED CLIENT TESTIMONIALS                                           */}
      {/* ========================================================================= */}
      {/* 6. VERIFIED CLIENT TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="pt-10 sm:pt-12 pb-12 sm:pb-16 bg-gradient-to-b from-white via-[#FAF5FF]/70 to-white relative overflow-hidden border-t border-purple-50/60">
          {/* Ambient background glows */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-purple-200/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-pink-200/25 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 text-[#D91B60] text-xs font-bold border border-pink-200/80 mb-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" /> Client Stories & Reviews
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-playfair text-[#1F1030] mt-1">
                Moments of Delight &amp; <span className="brand-gradient-text">Celebration</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink/65 max-w-xl mx-auto">
                From intimate candlelit soirées to handcrafted luxury hampers, discover why patrons cherish WRAPORA for their most memorable milestones.
              </p>
            </div>

            <TestimonialSlider testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 7. BOTTOM CONCIERGE CALL-TO-ACTION                                       */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-14 bg-gradient-to-r from-[#250842] via-[#330856] to-[#250842] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D91B60]/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-playfair leading-tight">
            Ready to Plan Your Magical Celebration?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-purple-100/80 leading-relaxed max-w-xl mx-auto">
            Reach out to our creative atelier concierge. We bring extraordinary elegance and unforgettable joy to your big day.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/events#inquire"
              className="bg-[#D91B60] text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-[#D91B60]/40 hover:bg-[#c21453] transition-all hover:scale-105"
            >
              Book Creative Consultation
            </Link>
            <Link
              href="/gifts"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-full font-bold text-sm transition-all"
            >
              Order Luxury Hampers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
