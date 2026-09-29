"use client";

import { useEffect, useState } from "react";
import { Bell, Sparkles, CheckCircle2, AlertCircle, X, Gift, Truck } from "lucide-react";
import { useCustomerStore } from "@/lib/store/customer";
import { subscribeUserToPush } from "@/lib/utils/push";

export default function NotificationPrompt() {
  const { phone, name } = useCustomerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // If window not defined, return
    if (typeof window === "undefined") return;

    // If notifications are ALREADY granted, never show!
    if ("Notification" in window && Notification.permission === "granted") {
      return;
    }

    // Check if user dismissed it in this exact active session
    // (sessionStorage resets every time the app or tab is closed/reopened)
    const dismissedThisSession = sessionStorage.getItem("wrapoura_notif_session_dismissed");
    if (dismissedThisSession) {
      return;
    }

    // Show prompt 1 second after app open
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);

      const res = await subscribeUserToPush("customer", phone || undefined, name || undefined);

      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Awesome! You are now subscribed to WRAPORA VIP notifications.",
        });

        // Close and remove permanently after brief celebration
        setTimeout(() => {
          setIsOpen(false);
        }, 2200);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Could not enable notifications. Please check your browser settings.",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({
        type: "error",
        text: error.message || "Failed to enable notifications.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    // Only dismiss for this active session; will pop up again next time app opens until Yes is clicked
    sessionStorage.setItem("wrapoura_notif_session_dismissed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99995] pointer-events-none flex items-end sm:items-center justify-center p-3 sm:p-4">
      {/* Dim backdrop on mobile to draw focus */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={handleDismiss}
      />

      {/* Main Luxury Modal Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#200538] via-[#2A074A] to-[#160228] text-white rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-pink-500/30 pointer-events-auto animate-in slide-in-from-bottom-6 duration-300">
        {/* Glow behind modal */}
        <div className="absolute top-0 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D91B60] to-[#FF2E93] text-white flex items-center justify-center shadow-lg shadow-pink-500/30 flex-shrink-0">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10.5px] font-bold tracking-wide uppercase border border-pink-500/30 mb-1">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>VIP Notification Access</span>
            </div>
            <h3 className="font-playfair text-lg sm:text-xl font-bold text-white leading-tight">
              Stay in the Loop with WRAPORA
            </h3>
          </div>
        </div>

        <p className="text-xs text-white/75 leading-relaxed mb-4">
          Never miss an announcement! Turn on notifications to receive exclusive festive discounts,
          curated hamper drops, and live courier tracking.
        </p>

        {/* 2 Feature bullets */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/80">
            <Gift className="w-4 h-4 text-pink-400 flex-shrink-0" />
            <span className="truncate">Secret Festive Offers</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/80">
            <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">Live Dispatch Alerts</span>
          </div>
        </div>

        {/* Status / Error Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 mb-4 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-200 border border-amber-500/30"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span className="leading-snug">{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D91B60] via-[#FF2E93] to-[#D91B60] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-500/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>{loading ? "Activating..." : "Yes, Enable Notifications"}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
