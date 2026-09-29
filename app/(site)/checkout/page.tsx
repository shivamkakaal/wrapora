"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useCustomerStore, type SavedAddress } from "@/lib/store/customer";
import { formatPaiseToInr } from "@/lib/utils/format";
import {
  ShoppingBag,
  MapPin,
  Calendar,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Gift,
  Lock,
  ArrowRight,
  ChevronRight,
  Phone,
  User,
  Mail,
  BookmarkCheck,
  RotateCcw,
} from "lucide-react";

export const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "International / Outside India",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPaise, clearCart } = useCartStore();
  const {
    phone: loggedInPhone,
    name: loggedInName,
    email: loggedInEmail,
    savedAddress,
    isLoggedIn,
    setLogin,
    saveAddress,
  } = useCustomerStore();

  const subtotal = subtotalPaise();
  const deliveryFee = subtotal >= 250000 ? 0 : 15000;
  const total = subtotal + deliveryFee;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [stateError, setStateError] = useState("");

  // Address saving options
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [isEditingSavedAddress, setIsEditingSavedAddress] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    deliveryDate: "",
    giftMessage: "",
    paymentMethod: "upi_manual",
    honeypot: "",
  });

  // Automatically pre-fill contact & saved address from customer session
  useEffect(() => {
    if (loggedInPhone) {
      const cleanDigits = loggedInPhone.replace(/[^0-9]/g, "").slice(-10);
      setForm((f) => ({
        ...f,
        customerPhone: f.customerPhone || cleanDigits,
        customerName: f.customerName || loggedInName || "",
        customerEmail: f.customerEmail || loggedInEmail || "",
      }));
    }

    if (savedAddress) {
      setForm((f) => ({
        ...f,
        line1: f.line1 || savedAddress.line1 || "",
        line2: f.line2 || savedAddress.line2 || "",
        city: f.city || savedAddress.city || "",
        state: f.state || savedAddress.state || "",
        pincode: f.pincode || savedAddress.pincode || "",
        landmark: f.landmark || savedAddress.landmark || "",
      }));
    }
  }, [loggedInPhone, loggedInName, loggedInEmail, savedAddress]);

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (error) setError("");
  };

  const handlePhoneChange = (val: string) => {
    // Strictly numeric, maximum 10 digits (no over-exceeds)
    const digits = val.replace(/[^0-9]/g, "").slice(0, 10);
    setForm((f) => ({ ...f, customerPhone: digits }));

    if (digits.length === 10) {
      if (!/^[6-9]/.test(digits)) {
        setPhoneError("Indian mobile numbers typically start with 6, 7, 8, or 9");
      } else {
        setPhoneError("");
      }
    } else if (digits.length > 0 && digits.length < 10) {
      setPhoneError(`Exactly 10 digits required (${10 - digits.length} more needed)`);
    } else {
      setPhoneError("");
    }
  };

  const handlePincodeChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "").slice(0, 6);
    setForm((f) => ({ ...f, pincode: digits }));
    if (digits.length > 0 && digits.length < 6) {
      setPincodeError("Pincode should be 6 digits");
    } else {
      setPincodeError("");
    }
  };

  const handleResetAddress = () => {
    setForm((f) => ({
      ...f,
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    }));
    setIsEditingSavedAddress(true);
  };

  const handleUseSavedAddress = () => {
    if (savedAddress) {
      setForm((f) => ({
        ...f,
        line1: savedAddress.line1 || "",
        line2: savedAddress.line2 || "",
        city: savedAddress.city || "",
        state: savedAddress.state || "",
        pincode: savedAddress.pincode || "",
        landmark: savedAddress.landmark || "",
      }));
      setIsEditingSavedAddress(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center">
        <div className="w-20 h-20 rounded-full bg-purple-50 text-[#D91B60] flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-ink">Your Atelier Bag is Empty</h1>
        <p className="text-ink/60 mt-2 text-sm max-w-sm mx-auto">
          Explore our signature luxury hampers, handcrafted keepsakes, and personalized gifting boxes.
        </p>
        <Link
          href="/gifts"
          className="inline-flex items-center gap-2 mt-6 px-8 py-3 rounded-full text-white font-bold text-sm bg-gradient-to-r from-[#D91B60] to-[#FF2E93] hover:opacity-95 shadow-md shadow-[#D91B60]/20 transition-all hover:scale-105 cursor-pointer"
        >
          <span>Explore Luxury Gifts</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Strict Phone Validation (Exactly 10 digits, cannot under-exceed or over-exceed)
    const cleanPhone = form.customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length !== 10) {
      setPhoneError("Mobile number must be exactly 10 digits (e.g. 9876543210)");
      setError("Please provide a valid 10-digit mobile number before proceeding.");
      return;
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      setPhoneError("Mobile number must start with 6, 7, 8, or 9");
      setError("Please check your mobile number. It must start with 6, 7, 8, or 9.");
      return;
    }

    // 2. Strict State Selection Validation
    if (!form.state) {
      setStateError("Please select your State / Union Territory");
      setError("Please select your State or Union Territory from the dropdown.");
      return;
    }

    // 3. Strict Pincode Validation
    if (form.pincode.length < 5) {
      setPincodeError("Please enter a valid postal pincode");
      setError("Please enter a valid postal code/pincode.");
      return;
    }

    setLoading(true);

    try {
      const addressPayload: SavedAddress = {
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        landmark: form.landmark.trim() || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: form.customerEmail.trim() || undefined,
          shippingAddress: addressPayload,
          deliveryDate: form.deliveryDate || undefined,
          giftMessage: form.giftMessage.trim() || undefined,
          paymentMethod: form.paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            customizationNote: i.customizationNote || undefined,
          })),
          honeypot: form.honeypot,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error?.message || "Could not complete order. Please check details and try again.");
      } else {
        // Save address to client store so user never has to retype it!
        if (saveAddressToAccount) {
          saveAddress(addressPayload);
        }

        // Automatically sync customer login state so all future orders stay linked
        setLogin({
          phone: cleanPhone,
          name: form.customerName.trim(),
          email: form.customerEmail.trim() || null,
          savedAddress: saveAddressToAccount ? addressPayload : undefined,
        });

        clearCart();
        router.push(`/order/${data.data.orderId}?wa=${encodeURIComponent(data.data.whatsappLink)}`);
      }
    } catch {
      setError("Network or server connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF9] via-[#FAF5F8] to-white pt-24 sm:pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb / Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink/50 mb-3">
            <Link href="/cart" className="hover:text-[#D91B60] transition-colors flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#D91B60] font-bold">Secure Atelier Checkout</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-400">Order Placed</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-playfair text-[#250842]">
                Complete Your Luxury Order
              </h1>
              <p className="text-xs sm:text-sm text-ink/60 mt-1">
                Handcrafted packaging • Express doorstep delivery • Live order tracking
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Sections (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Bot Honeypot */}
              <div className="hidden">
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.honeypot}
                  onChange={(e) => update("honeypot", e.target.value)}
                />
              </div>

              {/* Global Error Alert */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{error}</div>
                </div>
              )}

              {/* International Shipping Notice */}
              <div className="bg-gradient-to-r from-pink-50/90 via-purple-50/60 to-white border border-pink-200/70 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-2xl bg-white border border-pink-100 flex items-center justify-center flex-shrink-0 text-lg shadow-xs">
                  🌍
                </div>
                <div className="text-xs text-[#250842] leading-relaxed">
                  <p className="font-bold text-[#D91B60] text-sm">
                    Worldwide Luxury Delivery Available
                  </p>
                  <p className="mt-0.5 text-ink/70">
                    We handcraft and courier our bespoke hampers pan-India and globally. For overseas courier tracking or express timelines, reach out directly at{" "}
                    <a
                      href="https://wa.me/917006506721?text=Hello%20WRAPORA!%20I%20have%20an%20international%20gifting%20query."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#D91B60] hover:underline"
                    >
                      +91 70065 06721
                    </a>.
                  </p>
                </div>
              </div>

              {/* SECTION 1: Contact Details */}
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-purple-100/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D91B60] to-[#FF2E93] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                      1
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-ink">Contact Details</h2>
                      <p className="text-[11px] text-ink/50">For live tracking alerts and order coordination</p>
                    </div>
                  </div>
                </div>

                {/* Logged in state banner */}
                {isLoggedIn && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/80 text-purple-900 border border-purple-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D91B60] flex-shrink-0" />
                      <span>
                        Ordering as <strong className="text-ink font-bold">+91 {loggedInPhone?.slice(-10)}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-purple-200">
                      Syncs to Account ✓
                    </span>
                  </div>
                )}

                <div className="space-y-4 pt-1">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-ink/80 mb-1.5">
                      Full Name <span className="text-[#D91B60]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={form.customerName}
                        onChange={(e) => update("customerName", e.target.value)}
                        placeholder="e.g. Shivam Kakaal"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number (Mandatory Exactly 10 Digits) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-ink/80">
                        Mobile Number (10 Digits) <span className="text-[#D91B60]">*</span>
                      </label>
                      <span className="text-[11px] font-mono">
                        {form.customerPhone.length === 10 ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            10/10 Digits Valid
                          </span>
                        ) : (
                          <span className={`${form.customerPhone.length > 0 ? "text-amber-700 bg-amber-50" : "text-gray-400"} px-2 py-0.5 rounded-full`}>
                            {form.customerPhone.length}/10 digits
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="relative">
                      {/* Flag & Country code prefix */}
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-ink/70 font-semibold text-xs border-r border-gray-200 pr-2.5 select-none pointer-events-none">
                        <span className="text-sm">🇮🇳</span>
                        <span>+91</span>
                      </div>

                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        maxLength={10}
                        value={form.customerPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className={`w-full pl-22 pr-12 py-3 rounded-2xl border ${
                          phoneError
                            ? "border-red-300 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-red-100"
                            : form.customerPhone.length === 10
                            ? "border-emerald-300 bg-emerald-50/10 focus:border-emerald-500"
                            : "border-gray-200 focus:border-[#D91B60] focus:ring-[#D91B60]/10"
                        } focus:ring-2 outline-none text-sm font-semibold tracking-wider font-mono transition-all`}
                      />

                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {form.customerPhone.length === 10 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Phone className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </div>

                    {phoneError ? (
                      <p className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-ink/50 mt-1">
                        WhatsApp active number recommended for instant delivery photos & packing updates.
                      </p>
                    )}
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-ink/80 mb-1.5">
                      Email Address <span className="text-ink/40 font-normal">(Optional for invoice)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => update("customerEmail", e.target.value)}
                        placeholder="e.g. shivam@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: Shipping Address & Saved Address Feature */}
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-purple-100/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D91B60] to-[#FF2E93] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                      2
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#D91B60]" />
                        <span>Delivery Address</span>
                      </h2>
                      <p className="text-[11px] text-ink/50">Where should our concierge deliver the hamper?</p>
                    </div>
                  </div>

                  {savedAddress && (
                    <button
                      type="button"
                      onClick={() => (isEditingSavedAddress ? handleUseSavedAddress() : setIsEditingSavedAddress(true))}
                      className="text-xs font-bold text-[#D91B60] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isEditingSavedAddress ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Use Saved Address</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Change Address</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Saved Address Preview Banner (If already saved and not in edit mode) */}
                {savedAddress && !isEditingSavedAddress && form.line1 && form.city && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/70 via-purple-50/40 to-white border border-pink-200/80 shadow-xs space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved Delivery Address Applied</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleResetAddress}
                        className="text-[11px] font-semibold text-royal hover:underline cursor-pointer"
                      >
                        + Ship to New Address
                      </button>
                    </div>

                    <div className="pt-1">
                      <p className="text-sm font-bold text-ink">
                        {form.line1} {form.line2 && `• ${form.line2}`}
                      </p>
                      <p className="text-xs text-ink/70 mt-0.5">
                        {form.city}, {form.state} - <strong className="font-mono">{form.pincode}</strong>
                        {form.landmark && ` (Landmark: ${form.landmark})`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Address Input Fields */}
                {(!savedAddress || isEditingSavedAddress) && (
                  <div className="space-y-4 pt-1 animate-fade-in">
                    {/* Address Line 1 */}
                    <div>
                      <label className="block text-xs font-bold text-ink/80 mb-1.5">
                        House / Flat No., Building & Street <span className="text-[#D91B60]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.line1}
                        onChange={(e) => update("line1", e.target.value)}
                        placeholder="e.g. Ward No. 4, Opposite Rose Garden, High Street"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-medium transition-all"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block text-xs font-bold text-ink/80 mb-1.5">
                        Area, Sector or Locality <span className="text-ink/40 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.line2}
                        onChange={(e) => update("line2", e.target.value)}
                        placeholder="e.g. Civil Lines, Near Clock Tower"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-medium transition-all"
                      />
                    </div>

                    {/* City, State & Pincode Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* City */}
                      <div>
                        <label className="block text-xs font-bold text-ink/80 mb-1.5">
                          City / Town <span className="text-[#D91B60]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                          placeholder="e.g. Kathua / Mumbai"
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-medium transition-all"
                        />
                      </div>

                      {/* State Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-ink/80 mb-1.5">
                          State / UT <span className="text-[#D91B60]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={form.state}
                            onChange={(e) => {
                              update("state", e.target.value);
                              setStateError("");
                            }}
                            className={`w-full px-3.5 py-3 rounded-2xl border ${
                              stateError
                                ? "border-red-300 bg-red-50/20 text-red-900"
                                : form.state
                                ? "border-[#D91B60]/60 bg-pink-50/10 text-ink"
                                : "border-gray-200 text-gray-500"
                            } focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-xs sm:text-sm font-semibold bg-white cursor-pointer transition-all appearance-none`}
                          >
                            <option value="" disabled>
                              Select State / UT *
                            </option>
                            {INDIAN_STATES_AND_UTS.map((st) => (
                              <option key={st} value={st} className="text-ink py-1">
                                {st}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </div>
                        </div>
                        {stateError && (
                          <p className="text-[11px] font-semibold text-red-600 mt-1">
                            {stateError}
                          </p>
                        )}
                      </div>

                      {/* Pincode (6 digits) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-ink/80">
                            Pincode <span className="text-[#D91B60]">*</span>
                          </label>
                          <span className="text-[10px] text-ink/40 font-mono">
                            {form.pincode.length}/6
                          </span>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          required
                          maxLength={6}
                          value={form.pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          placeholder="e.g. 184101"
                          className={`w-full px-4 py-3 rounded-2xl border ${
                            pincodeError ? "border-red-300" : "border-gray-200"
                          } focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-semibold font-mono tracking-wider transition-all`}
                        />
                        {pincodeError && (
                          <p className="text-[11px] font-semibold text-red-600 mt-1">
                            {pincodeError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Landmark */}
                    <div>
                      <label className="block text-xs font-bold text-ink/80 mb-1.5">
                        Landmark / Delivery Instructions <span className="text-ink/40 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.landmark}
                        onChange={(e) => update("landmark", e.target.value)}
                        placeholder="e.g. Near HDFC Bank ATM / Call recipient before delivery"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-medium transition-all"
                      />
                    </div>

                    {/* Save Address Checkbox (Requested Feature) */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D91B60] accent-[#D91B60] cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-ink">
                            Save this address for fast 1-click checkout on future orders
                          </p>
                          <p className="text-[11px] text-ink/50 mt-0.5">
                            You won&apos;t have to enter your address again next time you order.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 3: Bespoke Gift Message & Scheduled Delivery */}
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-purple-100/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D91B60] to-[#FF2E93] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                      3
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-[#D91B60]" />
                        <span>Gift Personalization & Schedule</span>
                      </h2>
                      <p className="text-[11px] text-ink/50">Complimentary calligraphy wax-sealed card included</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Preferred Delivery Date */}
                  <div>
                    <label className="block text-xs font-bold text-ink/80 mb-1.5">
                      Desired Delivery Date <span className="text-ink/40 font-normal">(Earliest delivery from atelier: {minDateStr})</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={form.deliveryDate}
                        onChange={(e) => update("deliveryDate", e.target.value)}
                        min={minDateStr}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-semibold text-ink transition-all"
                      />
                    </div>
                  </div>

                  {/* Gift Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-ink/80">
                        Personal Gift Note <span className="text-ink/40 font-normal">(Hand-penned by our atelier artist)</span>
                      </label>
                      <span className="text-[11px] text-ink/40 font-mono">
                        {form.giftMessage.length}/500
                      </span>
                    </div>
                    <textarea
                      value={form.giftMessage}
                      onChange={(e) => update("giftMessage", e.target.value)}
                      placeholder="Write your heartfelt message here... e.g. Happy Anniversary to the most special couple! Wishing you a lifetime of joy and sparkle."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-[#D91B60]/10 outline-none text-sm font-medium resize-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 4: Payment Method */}
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-purple-100/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D91B60] to-[#FF2E93] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                      4
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#D91B60]" />
                        <span>Payment Method</span>
                      </h2>
                      <p className="text-[11px] text-ink/50">Choose how you wish to settle this luxury order</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* UPI Concierge Option */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      form.paymentMethod === "upi_manual"
                        ? "border-[#D91B60] bg-pink-50/20 shadow-xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi_manual"
                      checked={form.paymentMethod === "upi_manual"}
                      onChange={(e) => update("paymentMethod", e.target.value)}
                      className="mt-1 accent-[#D91B60] w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">
                          UPI on Confirmation (WhatsApp Concierge)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D91B60] text-white uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                        Dedicated concierge confirms delivery slot, verifies custom note cards, and provides instant GPay / PhonePe / Paytm UPI QR.
                      </p>
                    </div>
                  </label>

                  {/* COD Option */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      form.paymentMethod === "cod"
                        ? "border-[#D91B60] bg-pink-50/20 shadow-xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === "cod"}
                      onChange={(e) => update("paymentMethod", e.target.value)}
                      className="mt-1 accent-[#D91B60] w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">Cash / UPI on Delivery</span>
                      </div>
                      <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                        Pay upon physical doorstep handover by our courier associate.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary & Sticky CTA (5 Cols) */}
            <aside className="lg:col-span-5">
              <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 border border-purple-100/90 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="text-base font-bold text-ink flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#D91B60]" />
                    <span>Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})</span>
                  </h2>
                  <Link
                    href="/cart"
                    className="text-xs font-semibold text-[#D91B60] hover:underline cursor-pointer"
                  >
                    Edit Cart
                  </Link>
                </div>

                {/* Items List */}
                <ul className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-purple-50 flex-shrink-0 border border-purple-100 relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-ink/30">
                            Gift
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-ink/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                          ×{item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-ink line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-ink/50 mt-0.5 font-mono">
                          {formatPaiseToInr(item.pricePaise)} each
                        </p>
                        {item.customizationNote && (
                          <p className="text-[10px] text-purple-700 italic truncate mt-0.5">
                            Note: {item.customizationNote}
                          </p>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-ink font-mono">
                        {formatPaiseToInr(item.pricePaise * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Cost Breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-ink/60">Hamper Subtotal</span>
                    <span className="font-semibold text-ink font-mono">{formatPaiseToInr(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-ink/60">Signature Atelier Velvet Box</span>
                    <span className="font-bold text-emerald-600 uppercase text-xs">Complimentary</span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-ink/60">Calligraphy Wax-Sealed Note</span>
                    <span className="font-bold text-emerald-600 uppercase text-xs">Included</span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-ink/60">Doorstep Delivery</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-xs">
                          Free Express
                        </span>
                      ) : (
                        <span className="font-semibold text-ink font-mono">{formatPaiseToInr(deliveryFee)}</span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-bold text-ink">Total Payable</span>
                      <p className="text-[10px] text-ink/40">Inclusive of all artisan craftsmanship & taxes</p>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-[#D91B60] font-mono">
                      {formatPaiseToInr(total)}
                    </span>
                  </div>
                </div>

                {/* Free Delivery Banner / Upsell */}
                {subtotal < 250000 && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Add <strong>{formatPaiseToInr(250000 - subtotal)}</strong> more to unlock <strong>FREE Express Delivery</strong>!
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base bg-gradient-to-r from-[#D91B60] via-[#FF2E93] to-[#D91B60] bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-lg shadow-[#D91B60]/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming & Securing Order...</span>
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Place Order • {formatPaiseToInr(total)}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                {/* Trust Badges Footer */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-ink/60 pt-1">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>100% Genuine Luxury</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <Truck className="w-3.5 h-3.5 text-[#D91B60] flex-shrink-0" />
                    <span>Insured Courier Handover</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
