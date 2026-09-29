import React from "react";

export interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
}

export default function RaporaLogo({
  className = "",
  variant = "light",
  size = "md",
  showWordmark = true,
}: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-[#1F1030]";
  const subtextColor = variant === "light" ? "text-pink-200/90" : "text-[#D91B60]";

  const emblemSize =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-11 h-11 sm:w-13 sm:h-13"
      : size === "xl"
      ? "w-16 h-16 sm:w-20 sm:h-20"
      : "w-9 h-9 sm:w-10 sm:h-10";

  const mainTextSize =
    size === "sm"
      ? "text-lg"
      : size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "xl"
      ? "text-3xl sm:text-4xl"
      : "text-xl sm:text-2xl";

  const subTextSize =
    size === "sm"
      ? "text-[7.5px]"
      : size === "lg"
      ? "text-[9px] sm:text-[10px]"
      : size === "xl"
      ? "text-xs"
      : "text-[8px] sm:text-[8.5px]";

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official Circular Logo Emblem */}
      <div
        className={`relative ${emblemSize} rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-pink-500/30 bg-white`}
      >
        <img
          src="/images/wrapora-logo.png"
          alt="WRAPORA — Wrapped With Love"
          className="w-full h-full object-cover scale-[1.02]"
          draggable={false}
        />
      </div>

      {/* Brand Wordmark with Tagline */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`font-serif font-black ${mainTextSize} tracking-[0.14em] uppercase ${textColor} drop-shadow-xs`}
            style={{ letterSpacing: "0.14em" }}
          >
            WRAPORA
          </span>
          <span
            className={`font-sans font-bold ${subTextSize} tracking-[0.24em] uppercase ${subtextColor} mt-1`}
            style={{ letterSpacing: "0.24em" }}
          >
            Wrapped With Love
          </span>
        </div>
      )}
    </div>
  );
}

export { RaporaLogo as WraporaLogo };
