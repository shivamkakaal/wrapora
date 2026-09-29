"use client";

import { useState, useEffect } from "react";
import { X, User, Sparkles, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useCustomerStore } from "@/lib/store/customer";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomerAuthModalProps) {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const setLogin = useCustomerStore((s) => s.setLogin);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      setError(null);
      setSuccessMsg(null);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(val);
    if (error) setError(null);
  };

  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);

    if (cleanPhone.length < 8) {
      setError("Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sync login with server & record lead
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          name: fullName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Sign in failed. Please try again.");
      }

      // Update client session state
      const userPhone = data.customer?.phone || cleanPhone;
      const userName = data.customer?.name || fullName.trim() || null;

      setLogin({
        phone: userPhone,
        name: userName,
        email: data.customer?.email || null,
        savedAddress: data.customer?.savedAddress || null,
      });

      // Seamlessly bind push notifications to this newly registered customer
      if (typeof window !== "undefined" && "Notification" in window) {
        import("@/lib/utils/push").then(({ subscribeUserToPush }) => {
          subscribeUserToPush("customer", userPhone, userName || undefined).catch((e) =>
            console.warn("Push subscription on sign in warning:", e)
          );
        });
      }

      setSuccessMsg("Welcome to WRAPORA! You are now signed in.");

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-purple-100 animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-label="Customer Phone Sign In"
      >
        {/* Luxury Header */}
        <div className="relative bg-gradient-to-r from-[#200538] via-[#330856] to-[#D91B60] text-white p-6 sm:p-7 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-pink-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span>WRAPORA Client Concierge</span>
          </div>

          <h2 className="text-2xl font-bold font-playfair tracking-tight">
            Sign In with Mobile
          </h2>
          <p className="text-xs text-purple-100/80 mt-1">
            Access your live order tracking, complete order history, and bespoke concierge benefits.
          </p>
        </div>

        {/* Form Body (Direct 1-Step Phone Login, No OTP) */}
        <div className="p-6 sm:p-7">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleDirectSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mobile Number <span className="text-[#D91B60]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-gray-500 font-medium text-sm border-r border-gray-200 pr-2 pointer-events-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  autoFocus
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full pl-20 pr-4 py-3 rounded-xl border border-purple-100 focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60] outline-none text-base font-semibold tracking-wider bg-purple-50/20 text-ink"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Your orders and live tracking will be linked to this number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Your Full Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajat Sharma"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-purple-100 focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60] outline-none text-sm bg-purple-50/20 text-ink"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 8}
              className="w-full py-3.5 px-4 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#D91B60] to-[#FF2E93] hover:opacity-95 shadow-lg shadow-[#D91B60]/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant 1-step sign in with your mobile number</span>
            </div>
          </form>

          {/* Quick guest track order link */}
          <div className="text-center pt-5 border-t border-gray-100 mt-5">
            <span className="text-xs text-gray-500">
              Just want to check an order status?{" "}
            </span>
            <a
              href="/account"
              onClick={onClose}
              className="text-xs font-bold text-[#D91B60] hover:underline"
            >
              Track Order &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
