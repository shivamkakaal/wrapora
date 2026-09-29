"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPaiseToInr } from "@/lib/utils/format";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, totalItems, subtotalPaise } =
    useCartStore();

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const count = totalItems();
  const subtotal = subtotalPaise();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full w-full max-w-full sm:max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold font-playfair text-ink flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-royal" />
            Your Cart
            {count > 0 && (
              <span className="text-xs font-normal text-white bg-magenta rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </h2>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-royal-50 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-royal-300" />
              </div>
              <p className="text-ink/60 font-medium">Your cart is empty</p>
              <Link
                href="/gifts"
                onClick={closeDrawer}
                className="brand-gradient text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Explore Gifts
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 p-3 rounded-2xl bg-cream border border-royal-100/50 group"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/gifts/${item.slug}`}
                      onClick={closeDrawer}
                      className="text-sm font-semibold text-ink hover:text-royal transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold text-royal mt-0.5">
                      {formatPaiseToInr(item.pricePaise)}
                    </p>

                    {item.customizationNote && (
                      <p className="text-xs text-ink/50 mt-0.5 italic line-clamp-1">
                        &quot;{item.customizationNote}&quot;
                      </p>
                    )}

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="ml-auto text-sm font-bold text-ink/80">
                        {formatPaiseToInr(item.pricePaise * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-4 sm:px-6 py-4 pb-safe space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/60">Subtotal</span>
              <span className="text-lg font-bold text-ink">{formatPaiseToInr(subtotal)}</span>
            </div>
            <p className="text-xs text-ink/40">Delivery calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full brand-gradient text-white text-center py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity shadow-royal"
            >
              Checkout • {formatPaiseToInr(subtotal)}
            </Link>
            <button
              onClick={closeDrawer}
              className="block w-full text-center py-2 text-sm text-ink/60 hover:text-royal transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
