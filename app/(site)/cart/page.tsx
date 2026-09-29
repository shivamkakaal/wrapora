"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPaiseToInr } from "@/lib/utils/format";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateNote, subtotalPaise } = useCartStore();
  const subtotal = subtotalPaise();
  const deliveryFeePaise = subtotal > 200000 || subtotal === 0 ? 0 : 15000;
  const totalPaise = subtotal + deliveryFeePaise;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-magenta-50 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-magenta" />
        </div>
        <h1 className="text-3xl font-bold font-playfair text-ink mb-3">Your Cart is Empty</h1>
        <p className="text-ink/60 max-w-md mb-8 text-sm">
          Discover our curated collection of luxury gift hampers, bespoke artisanal sets, and celebratory keepsakes.
        </p>
        <Link
          href="/gifts"
          className="brand-gradient text-white px-8 py-3.5 rounded-full font-semibold text-sm shadow-royal hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          Explore Gift Atelier <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-ink">Shopping Bag</h1>
          <p className="text-xs sm:text-sm text-ink/50 mt-1">
            Review your chosen bespoke hampers and luxury gifts ({items.length} unique item{items.length > 1 ? "s" : ""})
          </p>
        </div>
        <Link
          href="/gifts"
          className="text-xs sm:text-sm font-medium text-royal hover:text-magenta transition-colors"
        >
          ← Continue Browsing
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-ink/30">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/gifts/${item.slug}`}
                    className="font-semibold text-ink hover:text-royal transition-colors text-base line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm font-bold text-royal mt-0.5">
                    {formatPaiseToInr(item.pricePaise)}
                  </p>
                  {item.isCustomizable && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Add personalization note (optional)"
                        value={item.customizationNote || ""}
                        onChange={(e) => updateNote(item.productId, e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 w-full max-w-xs focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Controls */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:pl-6 border-gray-100">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                    className="p-1.5 text-ink/60 hover:text-ink disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium text-ink min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1.5 text-ink/60 hover:text-ink"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[5rem]">
                  <p className="font-bold text-ink text-sm">
                    {formatPaiseToInr(item.pricePaise * item.quantity)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-ink/30 hover:text-red-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold font-playfair text-ink mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
              <div className="flex justify-between text-ink/70">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{formatPaiseToInr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Standard Luxury Delivery</span>
                <span className="font-medium text-ink">
                  {deliveryFeePaise === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    formatPaiseToInr(deliveryFeePaise)
                  )}
                </span>
              </div>
              {deliveryFeePaise > 0 && (
                <p className="text-[11px] text-magenta font-medium bg-magenta-50/60 p-2 rounded-lg">
                  Add {formatPaiseToInr(200000 - subtotal)} more to qualify for Free White-Glove Delivery.
                </p>
              )}
            </div>

            <div className="flex justify-between text-base font-bold text-ink mb-6">
              <span>Estimated Total</span>
              <span className="text-royal text-lg">{formatPaiseToInr(totalPaise)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full brand-gradient text-white py-3.5 rounded-xl font-semibold text-sm shadow-royal hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-4"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 pt-2 text-xs text-ink/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-royal flex-shrink-0" />
                <span>100% Handcrafted & Securely Packaged</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-magenta flex-shrink-0" />
                <span>Complimentary Hand-written Calligraphy Note</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
