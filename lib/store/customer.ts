"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface CustomerSession {
  phone: string | null;
  name: string | null;
  email?: string | null;
  savedAddress?: SavedAddress | null;
  isLoggedIn: boolean;
  lastLoginAt: string | null;
}

interface CustomerState extends CustomerSession {
  setLogin: (data: {
    phone: string;
    name?: string | null;
    email?: string | null;
    savedAddress?: SavedAddress | null;
  }) => void;
  saveAddress: (address: SavedAddress) => void;
  clearSavedAddress: () => void;
  updateProfile: (data: { name?: string | null; email?: string | null }) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      phone: null,
      name: null,
      email: null,
      savedAddress: null,
      isLoggedIn: false,
      lastLoginAt: null,

      setLogin: ({ phone, name, email, savedAddress }) =>
        set((state) => ({
          phone: phone.trim(),
          name: name !== undefined ? (name ? name.trim() : null) : state.name,
          email: email !== undefined ? (email ? email.trim() : null) : state.email,
          savedAddress: savedAddress !== undefined ? savedAddress : state.savedAddress,
          isLoggedIn: true,
          lastLoginAt: new Date().toISOString(),
        })),

      saveAddress: (address) =>
        set({
          savedAddress: address,
        }),

      clearSavedAddress: () =>
        set({
          savedAddress: null,
        }),

      updateProfile: ({ name, email }) =>
        set((state) => ({
          ...state,
          name: name !== undefined ? (name ? name.trim() : null) : state.name,
          email: email !== undefined ? (email ? email.trim() : null) : state.email,
        })),

      logout: () =>
        set({
          phone: null,
          name: null,
          email: null,
          savedAddress: null,
          isLoggedIn: false,
          lastLoginAt: null,
        }),
    }),
    {
      name: "wrapoura_customer_session",
    }
  )
);
