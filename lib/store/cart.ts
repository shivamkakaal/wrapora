"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  pricePaise: number;
  quantity: number;
  customizationNote?: string;
  isCustomizable?: boolean;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }, openDrawer?: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNote: (productId: string, note: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  totalItems: () => number;
  subtotalPaise: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item, openDrawer = false) => {
        const { items } = get();
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), 10) }
                : i
            ),
            isDrawerOpen: openDrawer ? true : get().isDrawerOpen,
          });
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
            isDrawerOpen: openDrawer ? true : get().isDrawerOpen,
          });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, 10) } : i
          ),
        });
      },

      updateNote: (productId, note) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, customizationNote: note } : i
          ),
        }),

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set({ isDrawerOpen: !get().isDrawerOpen }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalPaise: () =>
        get().items.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0),
    }),
    {
      name: "wrapoura-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
