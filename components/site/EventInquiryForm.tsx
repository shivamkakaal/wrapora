"use client";

import { useState } from "react";
import { Send, CheckCircle, MessageCircle } from "lucide-react";
import type { EventService } from "@/lib/supabase/types";

const eventTypes = [
  { value: "birthday", label: "Birthday Celebration" },
  { value: "anniversary", label: "Anniversary" },
  { value: "intimate_gathering", label: "Intimate Gathering" },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "corporate", label: "Corporate Event" },
  { value: "other", label: "Other" },
];

const budgetOptions = ["<25k", "25-50k", "50k-1L", "1L+"];

const serviceCities = ["Jammu", "Delhi NCR", "Chandigarh", "Mumbai", "Jaipur", "Other"];

export default function EventInquiryForm({ services }: { services: EventService[] }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ leadNumber: string; whatsappLink: string } | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    eventType: "",
    eventServiceId: "",
    eventDate: "",
    city: "",
    venue: "",
    guestCount: "",
    budgetRange: "",
    message: "",
    preferredContact: "whatsapp",
    honeypot: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guestCount: form.guestCount ? parseInt(form.guestCount) : null,
          eventServiceId: form.eventServiceId || null,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error?.message || "Something went wrong.");
      } else {
        setSuccess({ leadNumber: data.data.leadNumber, whatsappLink: data.data.whatsappLink });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-green-200 shadow-sm">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold font-playfair text-ink">Inquiry Received!</h3>
        <p className="mt-2 text-ink/60">
          Your lead number is <span className="font-bold text-royal">{success.leadNumber}</span>.
          Our concierge team will contact you within 24 hours.
        </p>
        <a
          href={success.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp Now
        </a>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl p-8 md:p-10 border border-royal-100/50 shadow-sm">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${s <= step ? "brand-gradient" : "bg-gray-200"}`} />
            <p className={`text-xs mt-1.5 ${s <= step ? "text-royal font-medium" : "text-ink/40"}`}>
              {s === 1 ? "About You" : s === 2 ? "Event Details" : "Final Details"}
            </p>
          </div>
        ))}
      </div>

      {/* Honeypot */}
      <div className="hidden"><input type="text" value={form.honeypot} onChange={(e) => update("honeypot", e.target.value)} /></div>

      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

      {/* Step 1: About You */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Full Name *</label>
            <input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="e.g., Priya Sharma" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Phone Number *</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="10-digit mobile number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email (optional)</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none transition-all text-sm" />
          </div>
          <button onClick={() => setStep(2)} disabled={!form.fullName || !form.phone} className="w-full brand-gradient text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-all shadow-royal">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Event Details */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Event Type *</label>
            <select value={form.eventType} onChange={(e) => update("eventType", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm bg-white">
              <option value="">Select event type</option>
              {eventTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Preferred Service</label>
              <select value={form.eventServiceId} onChange={(e) => update("eventServiceId", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm bg-white">
                <option value="">Select a service (optional)</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Event Date *</label>
            <input type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} min={minDateStr} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">City / Location *</label>
            <select value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm bg-white">
              <option value="">Select city</option>
              {serviceCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-medium text-ink/60 hover:bg-gray-50 transition-colors">Back</button>
            <button onClick={() => setStep(3)} disabled={!form.eventType || !form.eventDate || !form.city} className="flex-1 brand-gradient text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-all shadow-royal">Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Final Details */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Guest Count</label>
              <input type="number" value={form.guestCount} onChange={(e) => update("guestCount", e.target.value)} placeholder="e.g., 50" min="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Budget Range</label>
              <select value={form.budgetRange} onChange={(e) => update("budgetRange", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm bg-white">
                <option value="">Select budget</option>
                {budgetOptions.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Venue (optional)</label>
            <input type="text" value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Venue name or address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Message (optional)</label>
            <textarea value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us about your dream celebration..." rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-medium text-ink/60 hover:bg-gray-50 transition-colors">Back</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 brand-gradient text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-all shadow-royal flex items-center justify-center gap-2">
              {loading ? <span className="animate-pulse-soft">Submitting...</span> : <><Send className="w-4 h-4" />Submit Inquiry</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
