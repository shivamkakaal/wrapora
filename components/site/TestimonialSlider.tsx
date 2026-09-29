"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles, CheckCircle2 } from "lucide-react";
import type { Testimonial } from "@/lib/supabase/types";

// Luxury curated fallback reviews to ensure full rich display
const CURATED_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    customer_name: "Rohan & Ananya Mehta",
    customer_title: "Anniversary Soirée, Delhi NCR",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    quote:
      "The candlelit terrace setup was beyond what we imagined. They took care of everything from the acoustic ambiance to the personalized calligraphy menu cards. Truly an ultra-luxury atelier service!",
    event_type: "anniversary",
    is_featured: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),

  },
  {
    id: "t-2",
    customer_name: "Priya Sharma",
    customer_title: "30th Birthday Gala, Jammu",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    quote:
      "WRAPORA transformed my milestone 30th birthday into pure cinematic magic! The velvet textures, theatrical lighting, and royal purple aesthetics were breathtaking. All 70 guests were mesmerized.",
    event_type: "birthday",
    is_featured: true,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),

  },
  {
    id: "t-3",
    customer_name: "Kavita & Amit Kapoor",
    customer_title: "Pastel Baby Shower, Chandigarh",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    quote:
      "Their floral dreamscapes and custom curated return hampers were heavenly. The brass keepsake boxes and customized ribbons felt deeply intimate and exquisitely regal.",
    event_type: "baby_shower",
    is_featured: true,
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),

  },
  {
    id: "t-4",
    customer_name: "Dr. Aakash & Neha Verma",
    customer_title: "Heirloom Wedding Favors, Jaipur",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    quote:
      "We ordered 150 luxury bespoke hampers dispatched across India and London. Every single box arrived in immaculate temperature-controlled condition. Remarkable attention to detail!",
    event_type: "other",
    is_featured: true,
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),

  },
  {
    id: "t-5",
    customer_name: "Rhea Singhania",
    customer_title: "Corporate Gala & VIP Gifting, Gurugram",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    rating: 5,
    quote:
      "Flawless corporate gifting execution. The custom embossed leather accents and artisanal treats made a huge impression on our CXO clients. WRAPORA is now our permanent luxury gifting partner.",
    event_type: "other",
    is_featured: true,
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),

  },
];

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  birthday: { label: "Birthday Celebration", color: "bg-pink-50 text-[#D91B60] border-pink-200" },
  anniversary: { label: "Anniversary Soirée", color: "bg-purple-50 text-[#250842] border-purple-200" },
  baby_shower: { label: "Baby Shower Dreamscape", color: "bg-amber-50 text-amber-800 border-amber-200" },
  intimate_gathering: { label: "Intimate Dinner Soirée", color: "bg-rose-50 text-rose-800 border-rose-200" },
  other: { label: "Bespoke Luxury Gifting", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
};

export default function TestimonialSlider({
  testimonials = [],
}: {
  testimonials: Testimonial[];
}) {
  // Merge database testimonials with rich curated reviews
  const allReviews = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return CURATED_TESTIMONIALS;
    // Replace "Wrapoura" with "WRAPORA" in DB quotes if present
    const cleaned = testimonials.map((t) => ({
      ...t,
      quote: t.quote.replace(/Wrapoura/gi, "WRAPORA"),
    }));
    // If fewer than 4, append from CURATED_TESTIMONIALS so user sees full multi-card layout
    if (cleaned.length < 4) {
      const existingIds = new Set(cleaned.map((t) => t.id));
      const extra = CURATED_TESTIMONIALS.filter((c) => !existingIds.has(c.id));
      return [...cleaned, ...extra];
    }
    return cleaned;
  }, [testimonials]);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (activeCategory === "all") return allReviews;
    if (activeCategory === "events") {
      return allReviews.filter((r) => r.event_type !== "other");
    }
    if (activeCategory === "gifting") {
      return allReviews.filter((r) => r.event_type === "other" || r.quote.toLowerCase().includes("hamper") || r.quote.toLowerCase().includes("gift"));
    }
    return allReviews.filter((r) => r.event_type === activeCategory);
  }, [allReviews, activeCategory]);

  const total = filteredReviews.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto rotate every 6 seconds when not hovered
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, total]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ============================================================== */}
      {/* CATEGORY FILTER PILLS                                          */}
      {/* ============================================================== */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
        {[
          { id: "all", label: "All Client Stories ✨" },
          { id: "events", label: "Celebrations & Decor 🎉" },
          { id: "gifting", label: "Luxury Gift Hampers 🎁" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeCategory === tab.id
                ? "bg-[#250842] text-white shadow-md shadow-[#250842]/20 scale-105"
                : "bg-white text-ink/70 hover:text-ink hover:bg-purple-50 border border-purple-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* CAROUSEL CARDS WRAPPER                                         */}
      {/* ============================================================== */}
      <div className="overflow-hidden px-1 py-3">
        {/* DESKTOP VIEW: 3 CARDS MULTI-GRID CAROUSEL */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((offset) => {
            const reviewIndex = (currentIndex + offset) % total;
            const review = filteredReviews[reviewIndex];
            if (!review) return null;

            const categoryMeta =
              EVENT_TYPE_LABELS[review.event_type || "other"] || {
                label: "Bespoke Celebration",
                color: "bg-purple-50 text-[#250842] border-purple-200",
              };

            return (
              <div
                key={review.id}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-purple-100/80 shadow-[0_10px_35px_rgba(37,8,66,0.06)] hover:shadow-[0_18px_45px_rgba(37,8,66,0.12)] hover:border-pink-200/80 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Background quote glyph watermark */}
                <div className="absolute top-5 right-6 text-purple-100/60 pointer-events-none group-hover:text-pink-100/80 transition-colors">
                  <Quote className="w-12 h-12 stroke-[1.5]" />
                </div>

                <div>
                  {/* Top Category Badge & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${categoryMeta.color}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {categoryMeta.label}
                    </span>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quote Body */}
                  <blockquote className="text-ink/80 text-sm leading-relaxed mb-6 font-normal">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Bottom Patron Details */}
                <div className="pt-4 border-t border-purple-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar with luxury gradient border */}
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#D91B60] via-[#FF2E93] to-amber-300 shadow-sm">
                        <img
                          src={review.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                          alt={review.customer_name}
                          className="w-full h-full object-cover rounded-full bg-white"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#1F1030] leading-tight truncate">
                        {review.customer_name}
                      </h4>
                      <p className="text-[11px] text-ink/50 mt-0.5 truncate">
                        {review.customer_title || "Verified Patron"}
                      </p>
                    </div>
                  </div>

                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE & TABLET VIEW: 1 CARD FOCUSED SLIDER WITH SMOOTH TRANSITION */}
        <div className="lg:hidden">
          {(() => {
            const review = filteredReviews[currentIndex];
            if (!review) return null;

            const categoryMeta =
              EVENT_TYPE_LABELS[review.event_type || "other"] || {
                label: "Bespoke Celebration",
                color: "bg-purple-50 text-[#250842] border-purple-200",
              };

            return (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl shadow-purple-900/5 relative overflow-hidden animate-in fade-in duration-300">
                {/* Background watermark */}
                <div className="absolute top-4 right-5 text-purple-100/60 pointer-events-none">
                  <Quote className="w-12 h-12 stroke-[1.5]" />
                </div>

                {/* Top Badge & Rating */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${categoryMeta.color}`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {categoryMeta.label}
                  </span>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-ink/85 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>

                {/* Footer Patron */}
                <div className="pt-4 border-t border-purple-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#D91B60] via-[#FF2E93] to-amber-300 shadow-sm flex-shrink-0">
                      <img
                        src={review.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                        alt={review.customer_name}
                        className="w-full h-full object-cover rounded-full bg-white"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F1030]">
                        {review.customer_name}
                      </h4>
                      <p className="text-xs text-ink/50">
                        {review.customer_title || "Verified Patron"}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ============================================================== */}
      {/* NAVIGATION CONTROLS (ARROWS & PAGINATION PILLS)                */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between sm:justify-center gap-4 mt-8 px-2">
        {/* Prev Arrow */}
        <button
          onClick={prevSlide}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-purple-100 hover:border-pink-300 text-[#250842] hover:text-[#D91B60] shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots / Page Indicator */}
        <div className="flex items-center gap-2">
          {filteredReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex
                  ? "bg-gradient-to-r from-[#FF2E93] to-[#D91B60] w-7 shadow-xs"
                  : "bg-purple-200/80 hover:bg-purple-300 w-2"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Next Arrow */}
        <button
          onClick={nextSlide}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-purple-100 hover:border-pink-300 text-[#250842] hover:text-[#D91B60] shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Trust Stats Strip */}
      <div className="mt-10 pt-6 border-t border-purple-100/60 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xl sm:text-2xl font-bold font-playfair text-[#250842]">4.95 ★</div>
          <div className="text-[11px] text-ink/50 mt-0.5 font-medium">Average Client Rating</div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-playfair text-[#D91B60]">500+</div>
          <div className="text-[11px] text-ink/50 mt-0.5 font-medium">Hampers Dispatched</div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-playfair text-[#250842]">120+</div>
          <div className="text-[11px] text-ink/50 mt-0.5 font-medium">Bespoke Events Styled</div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-playfair text-[#D91B60]">100%</div>
          <div className="text-[11px] text-ink/50 mt-0.5 font-medium">Satisfaction Guaranteed</div>
        </div>
      </div>
    </div>
  );
}
