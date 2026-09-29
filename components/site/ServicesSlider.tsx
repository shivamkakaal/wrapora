"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface ServiceItem {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  badge?: string;
}

interface ServicesSliderProps {
  services: ServiceItem[];
}

export default function ServicesSlider({ services }: ServicesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const overflow = maxScroll > 8;

    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(maxScroll - scrollLeft > 8);

    if (maxScroll > 0) {
      const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    const timer1 = setTimeout(checkScroll, 60);
    const timer2 = setTimeout(checkScroll, 200);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [services]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = Math.max(200, scrollRef.current.clientWidth * 0.45);
    const scrollAmount = direction === "left" ? -step : step;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickFraction = Math.max(0, Math.min(1, clickX / rect.width));
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      scrollRef.current.scrollTo({
        left: clickFraction * maxScroll,
        behavior: "smooth",
      });
    }
  };

  // Slider thumb width & position calculations
  const thumbWidthPercent = hasOverflow
    ? Math.max(25, Math.min(50, Math.round((1 / services.length) * 160)))
    : 100;
  const thumbLeftPercent = hasOverflow
    ? scrollProgress * (100 - thumbWidthPercent)
    : 0;

  return (
    <div className="relative max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
      {/* Scrollable Track - Centered when fitting on laptop, smooth scroll when overflowing */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-3 px-3 sm:px-6 snap-x snap-mandatory ${
          hasOverflow ? "justify-start" : "justify-center"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {services.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex-shrink-0 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 snap-center w-24 sm:w-28 lg:w-32"
          >
            {/* 3D Round/Soft Icon Container */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl p-1 bg-white border border-purple-100 shadow-sm group-hover:shadow-xl group-hover:border-[#D91B60]/40 transition-all duration-300 flex items-center justify-center overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-108 transition-transform duration-300"
              />

              {item.badge && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-[#D91B60] text-white text-[8px] font-bold tracking-tight shadow">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <span className="mt-2.5 text-xs sm:text-sm lg:text-base font-bold text-[#1F1030] group-hover:text-[#D91B60] transition-colors text-center line-clamp-1">
              {item.title}
            </span>

            {/* Subtitle */}
            <span className="text-[10px] sm:text-[11px] text-ink/50 mt-0.5 text-center line-clamp-1 max-w-[120px]">
              {item.subtitle}
            </span>
          </Link>
        ))}
      </div>

      {/* Mini Interactive Slider Bar & Indicator Controls (ONLY rendered when content overflows/swiping is needed) */}
      {mounted && hasOverflow && (
        <div className="mt-4 flex flex-col items-center justify-center gap-1.5 animate-fade-in-up">
          <div className="inline-flex items-center justify-center gap-2.5 bg-purple-50/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-purple-100/80 shadow-xs">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-purple-200/70 text-[#250842] shadow-xs flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "hover:text-[#D91B60] hover:border-[#D91B60] hover:scale-108 active:scale-95 cursor-pointer opacity-100"
                  : "opacity-40 cursor-default"
              }`}
              aria-label="Previous services"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Slider Progress Bar Track */}
            <div
              onClick={handleTrackClick}
              className="relative w-28 sm:w-36 lg:w-44 h-2 bg-purple-200/60 hover:bg-purple-200 rounded-full cursor-pointer overflow-hidden transition-colors"
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Services carousel progress"
            >
              {/* Active Moving Slider Thumb */}
              <div
                className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#250842] via-[#D91B60] to-[#FF2E93] shadow-xs transition-all duration-150 ease-out"
                style={{
                  width: `${thumbWidthPercent}%`,
                  left: `${thumbLeftPercent}%`,
                }}
              />
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-purple-200/70 text-[#250842] shadow-xs flex items-center justify-center transition-all ${
                canScrollRight
                  ? "hover:text-[#D91B60] hover:border-[#D91B60] hover:scale-108 active:scale-95 cursor-pointer opacity-100"
                  : "opacity-40 cursor-default"
              }`}
              aria-label="Next services"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subtle helper caption */}
          <p className="text-[10px] sm:text-[11px] text-purple-900/45 font-medium flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#D91B60]" />
            <span>Slide to explore all services</span>
          </p>
        </div>
      )}
    </div>
  );
}
