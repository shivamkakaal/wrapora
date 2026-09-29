"use client";

import { create } from "zustand";

export interface GiftShowcaseState {
  isOpen: boolean;
  openShowcase: () => void;
  closeShowcase: () => void;
  toggleShowcase: () => void;
}

export const useGiftShowcaseStore = create<GiftShowcaseState>()((set) => ({
  isOpen: false,
  openShowcase: () => set({ isOpen: true }),
  closeShowcase: () => set({ isOpen: false }),
  toggleShowcase: () => set((state) => ({ isOpen: !state.isOpen })),
}));
