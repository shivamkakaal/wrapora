"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/supabase/types";

export default function AddToCartButton({
  product,
  size = "md",
}: {
  product: Product;
  size?: "sm" | "md";
}) {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOutOfStock = product.stock_status === "out_of_stock";
  const cartItem = mounted ? items.find((i) => i.productId === product.id) : null;
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || "",
        pricePaise: product.price_paise,
        isCustomizable: product.is_customizable,
      },
      false // Do not auto-open drawer, keep user on product card
    );
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity <= 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, Math.min(quantity + 1, 10));
  };

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-1.5 bg-gray-200 text-gray-500 rounded-full font-medium cursor-not-allowed ${
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
        }`}
      >
        Sold Out
      </button>
    );
  }

  // When product is in cart, show interactive quantity controller right on the card (+1, +2, etc.)
  if (quantity > 0) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`inline-flex items-center justify-between rounded-full bg-gradient-to-r from-[#200538] to-[#D91B60] text-white shadow-md border border-pink-400/30 transition-all select-none animate-scale-up ${
          size === "sm" ? "h-8 px-2 gap-2 text-xs" : "h-10 px-3 gap-3 text-sm"
        }`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 active:scale-90 text-white transition-all cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </button>

        <span className="font-extrabold font-mono text-white min-w-[16px] text-center">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 active:scale-90 text-white transition-all cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </button>
      </div>
    );
  }

  // Default state: Add to Cart button
  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex items-center gap-1.5 brand-gradient text-white rounded-full font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm hover:shadow-royal cursor-pointer select-none ${
        size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
      }`}
    >
      <ShoppingBag className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      <span>Add to Cart</span>
    </button>
  );
}
