"use client";

import { useState } from "react";
import { saveSetting } from "@/lib/actions/admin";
import { Settings, Save, Check, Phone, Truck, MapPin, Sliders, Bell } from "lucide-react";

interface SettingsManagerProps {
  initialSettings: Record<string, unknown>;
}

export default function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    (initialSettings["whatsapp"] as { number?: string })?.number || "+917006506721"
  );

  const deliveryData = (initialSettings["delivery"] as {
    flat_fee?: number;
    free_threshold?: number;
  }) || { flat_fee: 150, free_threshold: 2000 };

  const [flatFee, setFlatFee] = useState<number>(deliveryData.flat_fee ?? 150);
  const [freeThreshold, setFreeThreshold] = useState<number>(deliveryData.free_threshold ?? 2000);

  const citiesData = (initialSettings["service_cities"] as { cities?: string[] })?.cities || [
    "Jammu",
    "Delhi NCR",
    "Chandigarh",
    "Mumbai",
    "Jaipur",
  ];
  const [citiesText, setCitiesText] = useState<string>(citiesData.join(", "));

  const flagsData = (initialSettings["feature_flags"] as {
    razorpay_enabled?: boolean;
    push_optin_enabled?: boolean;
  }) || { razorpay_enabled: false, push_optin_enabled: true };

  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean>(flagsData.razorpay_enabled ?? false);
  const [pushOptinEnabled, setPushOptinEnabled] = useState<boolean>(flagsData.push_optin_enabled ?? true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const cities = citiesText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await Promise.all([
        saveSetting("whatsapp", { number: whatsappNumber }),
        saveSetting("delivery", { flat_fee: flatFee, free_threshold: freeThreshold }),
        saveSetting("service_cities", { cities }),
        saveSetting("feature_flags", {
          razorpay_enabled: razorpayEnabled,
          push_optin_enabled: pushOptinEnabled,
        }),
      ]);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-ink">Store Settings</h1>
          <p className="text-xs text-ink/50 mt-1">Configure delivery rules, service cities, and feature toggles</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="brand-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-royal hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {success ? (
            <>
              <Check className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Delivery Rules */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-royal border-b border-gray-100 pb-3">
          <Truck className="w-4 h-4" />
          <h2 className="text-sm font-bold text-ink">Luxury Delivery & Shipping Rules</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">
              Standard Delivery Fee (₹)
            </label>
            <input
              type="number"
              min="0"
              value={flatFee}
              onChange={(e) => setFlatFee(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
            />
            <p className="text-[11px] text-ink/40 mt-1">Flat rate charged per gift order</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">
              Free Delivery Order Threshold (₹)
            </label>
            <input
              type="number"
              min="0"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
            />
            <p className="text-[11px] text-ink/40 mt-1">Orders at or above this amount receive free shipping</p>
          </div>
        </div>
      </div>

      {/* Service Cities */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-magenta border-b border-gray-100 pb-3">
          <MapPin className="w-4 h-4" />
          <h2 className="text-sm font-bold text-ink">Event Service Cities</h2>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1">
            Active Cities (Comma-separated)
          </label>
          <input
            type="text"
            value={citiesText}
            onChange={(e) => setCitiesText(e.target.value)}
            placeholder="Jammu, Delhi NCR, Chandigarh, Mumbai, Jaipur"
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
          />
          <p className="text-[11px] text-ink/40 mt-1">
            Displayed in consultation form dropdown on /events page.
          </p>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-royal border-b border-gray-100 pb-3">
          <Sliders className="w-4 h-4" />
          <h2 className="text-sm font-bold text-ink">Feature Flags & Roadmap</h2>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={pushOptinEnabled}
              onChange={(e) => setPushOptinEnabled(e.target.checked)}
              className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
            />
            <div>
              <p className="text-xs font-semibold text-ink">PWA Install & Notification Prompts</p>
              <p className="text-[11px] text-ink/50">Display install banner to returning visitors</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={razorpayEnabled}
              onChange={(e) => setRazorpayEnabled(e.target.checked)}
              className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
            />
            <div>
              <p className="text-xs font-semibold text-ink">Online Payment Gateway (Razorpay)</p>
              <p className="text-[11px] text-ink/50">
                Phase 2 feature flag. When disabled, checkout uses UPI / WhatsApp Confirmation.
              </p>
            </div>
          </label>
        </div>
      </div>
    </form>
  );
}
