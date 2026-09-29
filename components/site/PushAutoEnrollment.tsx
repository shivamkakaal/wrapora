"use client";

import { useEffect, useRef } from "react";
import { useCustomerStore } from "@/lib/store/customer";
import { subscribeUserToPush } from "@/lib/utils/push";

/**
 * PushAutoEnrollment:
 * Silently ensures that whenever a user with granted notification permission
 * (or a registered customer with a phone number) visits WRAPORA, their device's
 * push subscription token is seamlessly bound and registered in Supabase.
 */
export default function PushAutoEnrollment() {
  const { phone, name, isLoggedIn } = useCustomerStore();
  const syncedRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Only auto-enroll if the browser already granted permission
    if (Notification.permission !== "granted") return;

    const syncKey = `${phone || "guest"}-${name || ""}`;
    if (syncedRef.current === syncKey) return;

    // Small delay to let page mount smoothly
    const timer = setTimeout(() => {
      subscribeUserToPush("customer", phone || undefined, name || undefined)
        .then((res) => {
          if (res.success) {
            syncedRef.current = syncKey;
          }
        })
        .catch((err) => {
          console.warn("Silent push auto-enrollment notice:", err);
        });
    }, 1500);

    return () => clearTimeout(timer);
  }, [phone, name, isLoggedIn]);

  return null;
}
