"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Gift, ShoppingBag, Package } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const openDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  const cartCount = mounted ? totalItems : 0;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#1D042C]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] pb-safe"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            pathname === "/" ? "text-[#FF2E93] scale-105" : "text-white/60 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Home</span>
        </Link>

        {/* Gifts */}
        <Link
          href="/gifts"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            pathname.startsWith("/gifts") ? "text-[#FF2E93] scale-105" : "text-white/60 hover:text-white"
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Gifts</span>
        </Link>

        {/* Events */}
        <Link
          href="/events"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            pathname.startsWith("/events") ? "text-[#FF2E93] scale-105" : "text-white/60 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Events</span>
        </Link>

        {/* Orders (Requested) */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            pathname.startsWith("/account") ? "text-[#FF2E93] scale-105" : "text-white/60 hover:text-white"
          }`}
          aria-label="My Orders & Live Tracking"
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Orders</span>
        </Link>

        {/* Cart with live Badge */}
        <button
          type="button"
          onClick={openDrawer}
          className="relative flex flex-col items-center justify-center py-1 text-white/60 hover:text-white cursor-pointer active:scale-95 transition-transform"
          aria-label={`Open Cart (${cartCount} items)`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-white/90" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] flex items-center justify-center text-[9px] font-extrabold text-white bg-[#D91B60] rounded-full px-1 ring-1 ring-[#1D042C]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Cart</span>
        </button>
      </div>
    </nav>
  );
}
