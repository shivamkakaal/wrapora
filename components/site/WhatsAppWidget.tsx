"use client";

import { usePathname } from "next/navigation";

export default function WhatsAppWidget() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  const phoneNumber = "917006506721";
  const defaultMessage =
    "Hello WRAPORA Concierge, I would like to inquire about your luxury event planning and curated gifting services! ✨";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="WhatsApp Concierge"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3.5 sm:bottom-8 sm:right-8 z-40 sm:z-[99999] pointer-events-auto select-none"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_8px_25px_rgba(37,211,102,0.55)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.75)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-2 ring-white/40"
        aria-label="Chat with WRAPORA on WhatsApp: +91 70065 06721"
      >
        {/* Subtle Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10" />

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.74C7 10.98 7.9 12.18 8.03 12.35C8.15 12.52 9.78 15.02 12.27 16.1C12.86 16.36 13.32 16.51 13.68 16.63C14.28 16.82 14.82 16.79 15.25 16.73C15.73 16.66 16.73 16.12 16.94 15.53C17.15 14.94 17.15 14.43 17.09 14.33C17.03 14.23 16.86 14.17 16.61 14.04C16.36 13.92 15.13 13.31 14.9 13.23C14.67 13.15 14.51 13.11 14.34 13.36C14.18 13.61 13.71 14.17 13.56 14.33C13.42 14.5 13.27 14.52 13.02 14.39C12.77 14.27 11.97 14.01 11.02 13.16C10.28 12.5 9.78 11.69 9.63 11.44C9.49 11.19 9.61 11.06 9.74 10.93C9.85 10.82 9.99 10.64 10.12 10.49C10.24 10.34 10.28 10.23 10.36 10.06C10.45 9.9 10.4 9.75 10.34 9.63C10.28 9.5 9.79 8.3 9.59 7.8C9.39 7.32 9.18 7.39 9.03 7.38C8.88 7.37 8.71 7.33 8.53 7.33Z" />
        </svg>

        {/* Hover Tooltip (Desktop only) */}
        <span className="hidden sm:block absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-gray-900/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg backdrop-blur-sm">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}
