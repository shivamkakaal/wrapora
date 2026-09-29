"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, ShoppingBag } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
          <WifiOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-playfair text-ink mb-2">You Are Currently Offline</h1>
        <p className="text-ink/60 text-sm mb-6 leading-relaxed">
          It looks like you’ve lost internet connectivity. You can still view previously loaded pages in our catalog, or reconnect to place orders and submit inquiries.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full brand-gradient text-white py-3 rounded-xl font-semibold text-sm shadow-royal hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Reconnecting
          </button>
          <Link
            href="/gifts"
            className="w-full block py-3 rounded-xl border border-gray-200 text-ink text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Browse Cached Gifts
          </Link>
        </div>

        <div className="text-xs text-ink/50 mt-6 space-y-1">
          <p>
            WRAPORA Support:{" "}
            <a href="tel:+917006506721" className="font-semibold text-ink hover:text-[#D91B60]">
              +91 70065 06721
            </a>{" "}
            ·{" "}
            <a href="tel:+919541223100" className="font-semibold text-ink hover:text-[#D91B60]">
              +91 95412 23100
            </a>
          </p>
          <p className="text-[11px] text-ink/40">
            shivamkakaal@gmail.com · abhu2680@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
