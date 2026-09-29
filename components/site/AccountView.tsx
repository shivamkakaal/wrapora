"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Phone,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Sparkles,
  LogOut,
  LogIn,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  HeartHandshake,
  Bell,
} from "lucide-react";
import { useCustomerStore } from "@/lib/store/customer";
import CustomerAuthModal from "./CustomerAuthModal";
import type { Order } from "@/lib/supabase/types";
import { formatPaiseToInr, formatDate } from "@/lib/utils/format";
import { subscribeUserToPush } from "@/lib/utils/push";

export default function AccountView() {
  const { phone: loggedInPhone, name: loggedInName, savedAddress, isLoggedIn, logout } = useCustomerStore();
  const [mounted, setMounted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pushActive, setPushActive] = useState(false);
  const [pushEnabling, setPushEnabling] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Manual lookup state (for guest or checking another number)
  const [lookupPhone, setLookupPhone] = useState("");
  const [activePhone, setActivePhone] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const initialAutoExpandedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushActive(Notification.permission === "granted");
    }
  }, []);

  const handleTogglePush = async () => {
    try {
      setPushEnabling(true);
      setPushStatus(null);
      const res = await subscribeUserToPush("customer");
      if (res.success) {
        setPushActive(true);
        setPushStatus({
          type: "success",
          text: "Push Notifications are now Active on this device! ✓",
        });
      } else {
        setPushStatus({
          type: "error",
          text: res.error || "Could not enable notifications.",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setPushStatus({
        type: "error",
        text: error.message || "Failed to enable notifications.",
      });
    } finally {
      setPushEnabling(false);
    }
  };

  // When loggedInPhone changes or mounts, auto-fetch orders
  useEffect(() => {
    if (mounted && isLoggedIn && loggedInPhone) {
      setActivePhone(loggedInPhone);
      fetchOrders(loggedInPhone);
    }
  }, [mounted, isLoggedIn, loggedInPhone]);

  // Real-time polling effect: polls for latest delivery progress every 2.5 seconds
  useEffect(() => {
    if (!activePhone) return;

    const intervalId = setInterval(() => {
      fetchOrders(activePhone, true);
    }, 2500);

    const handleFocus = () => {
      fetchOrders(activePhone, true);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [activePhone]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const fetchOrders = async (phoneToQuery: string, isSilent = false) => {
    const cleanPhone = phoneToQuery.replace(/[^0-9]/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 8) return;

    if (!isSilent) {
      setLoading(true);
      setSearched(true);
    }

    try {
      const res = await fetch(`/api/customer/orders?phone=${cleanPhone}&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.orders)) {
        // Smart state update: avoid unnecessary re-renders during background polling if orders data hasn't changed
        setOrders((prev) => {
          const isDifferent =
            prev.length !== data.orders.length ||
            data.orders.some((newO: Order, idx: number) => {
              const oldO = prev[idx];
              return (
                !oldO ||
                oldO.id !== newO.id ||
                oldO.status !== newO.status ||
                oldO.payment_status !== newO.payment_status ||
                oldO.updated_at !== newO.updated_at
              );
            });
          return isDifferent ? data.orders : prev;
        });

        // Only auto-expand the first order on INITIAL load, NEVER during background polling!
        if (!initialAutoExpandedRef.current && data.orders.length > 0) {
          initialAutoExpandedRef.current = true;
          setExpandedOrders({ [data.orders[0].id]: true });
        }
      } else if (!isSilent) {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
      if (!isSilent) setOrders([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupPhone.replace(/[^0-9]/g, "").slice(-10);
    if (clean.length < 8) return;
    initialAutoExpandedRef.current = false;
    setExpandedOrders({});
    setActivePhone(clean);
    fetchOrders(clean);
  };

  const getOrderStatusStep = (status: Order["status"] | string): number => {
    switch (status) {
      case "pending":
        return 1;
      case "confirmed":
        return 2;
      case "dispatched":
      case "out_for_delivery":
        return 3;
      case "completed":
        return 4;
      case "cancelled":
        return -1;
      default:
        return 1;
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#D91B60] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#250842] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D91B60]" />
            <span>WRAPORA Client Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair text-ink">
            My Account & Orders
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Track live deliveries, view order history, and access concierge support.
          </p>
        </div>

        {/* User Status Badge & Actions */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-purple-100 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D91B60] to-[#FF2E93] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {(loggedInName || loggedInPhone || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-ink leading-tight">
                {loggedInName || "Valued Client"}
              </p>
              <p className="text-[11px] text-ink/60 font-mono">
                +91 {loggedInPhone?.slice(-10)}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                setActivePhone(null);
                setOrders([]);
                setSearched(false);
                setExpandedOrders({});
                initialAutoExpandedRef.current = false;
              }}
              title="Sign Out"
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#D91B60] to-[#FF2E93] hover:opacity-95 shadow-md shadow-[#D91B60]/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Phone</span>
            </button>
          </div>
        )}
      </div>

      {/* Saved Delivery Address Card */}
      {isLoggedIn && savedAddress && (
        <div className="mb-6 p-4 rounded-3xl bg-white border border-purple-100 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pink-50 text-[#D91B60] flex items-center justify-center flex-shrink-0 mt-0.5 border border-pink-100">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-ink">Saved Delivery Address</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Auto-Fill Ready ✓
                </span>
              </div>
              <p className="text-xs text-ink/70 mt-1">
                {savedAddress.line1}
                {savedAddress.line2 ? `, ${savedAddress.line2}` : ""} • {savedAddress.city},{" "}
                {savedAddress.state} - <strong className="font-mono font-bold">{savedAddress.pincode}</strong>
                {savedAddress.landmark ? ` (Landmark: ${savedAddress.landmark})` : ""}
              </p>
            </div>
          </div>
          <Link
            href="/checkout"
            className="text-xs font-bold text-[#D91B60] hover:underline flex-shrink-0 hidden sm:inline"
          >
            Use on Checkout →
          </Link>
        </div>
      )}

      {/* Push Notification Status & Opt-in Card */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                pushActive
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-pink-50 text-[#D91B60] border border-pink-100"
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-ink">VIP Announcements & Alerts</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    pushActive
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-amber-700 bg-amber-50 border-amber-200"
                  }`}
                >
                  {pushActive ? "Notifications Active ✓" : "Not Enabled"}
                </span>
              </div>
              <p className="text-xs text-ink/70 mt-0.5">
                Get instant updates on festive offers, curated gift drops & live delivery progress.
              </p>
            </div>
          </div>

          {!pushActive && (
            <button
              type="button"
              onClick={handleTogglePush}
              disabled={pushEnabling}
              className="self-start sm:self-auto px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#D91B60] to-[#FF2E93] hover:opacity-95 shadow-xs transition-all cursor-pointer disabled:opacity-50 flex-shrink-0 flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{pushEnabling ? "Activating Alerts..." : "Enable Push Alerts"}</span>
            </button>
          )}
        </div>

        {pushStatus && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              pushStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-amber-50 text-amber-900 border border-amber-200"
            }`}
          >
            {pushStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            )}
            <span className="leading-snug">{pushStatus.text}</span>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="space-y-8">
        {/* Simple Order Tracker Bar (Always visible or easy for guest) */}
        {!isLoggedIn && (
          <div className="bg-gradient-to-br from-[#250842] to-[#3B0764] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-pink-200 mb-3">
                <Truck className="w-3.5 h-3.5 text-pink-300" />
                <span>Simple 1-Step Tracking</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-playfair mb-2">
                Track Any Order Instantly
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/80 mb-5 leading-relaxed">
                Enter the mobile number used during checkout to view live status, dispatch timeline, and items.
              </p>

              <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/70 text-xs font-medium border-r border-white/20 pr-2.5">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-20 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF2E93] text-sm font-semibold tracking-wide"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || lookupPhone.length < 8}
                  className="px-6 py-3 rounded-2xl bg-[#D91B60] hover:bg-[#c21453] text-white font-bold text-xs shadow-lg shadow-[#D91B60]/40 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Finding...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Find My Orders</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-[11px] text-purple-200/70 pt-2 border-t border-white/10">
                <span>Have an account?</span>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="text-pink-300 font-semibold hover:underline"
                >
                  Sign in with phone for auto-tracking &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
            <div className="animate-spin w-8 h-8 border-3 border-[#D91B60] border-t-transparent rounded-full mx-auto" />
            <p className="text-sm font-semibold text-ink">Retrieving orders for +91 {activePhone}...</p>
          </div>
        )}

        {/* Orders List Section */}
        {!loading && (
          <div>
            {orders.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#D91B60]" />
                    <span>Your Orders ({orders.length})</span>
                  </h2>
                  <span className="text-xs text-ink/50">
                    Showing orders for <strong className="text-ink">+91 {activePhone?.slice(-10)}</strong>
                  </span>
                </div>

                {orders.map((order) => {
                  const step = getOrderStatusStep(order.status);
                  const isExpanded = Boolean(expandedOrders[order.id]);
                  const businessPhone = "917006506721";
                  const waMessage = encodeURIComponent(
                    `Hello WRAPORA Concierge! I would like an update on my Order #${order.order_number || order.id}. Customer: ${order.customer_name} (+91 ${order.customer_phone}).`
                  );
                  const waTrackUrl = `https://wa.me/${businessPhone}?text=${waMessage}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-purple-100/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Order Card Top Bar */}
                      <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-50/40 via-pink-50/20 to-transparent border-b border-gray-100">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-base sm:text-lg text-ink font-mono">
                                #{order.order_number}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                                  order.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : order.status === "dispatched"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : order.status === "confirmed"
                                    ? "bg-purple-100 text-purple-800"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {order.status === "completed"
                                  ? "Delivered"
                                  : order.status === "dispatched"
                                  ? "Dispatched & On the Way"
                                  : order.status === "confirmed"
                                  ? "Confirmed & Crafting"
                                  : order.status === "cancelled"
                                  ? "Cancelled"
                                  : "Order Received"}
                              </span>
                            </div>
                            <p className="text-xs text-ink/50 mt-1 flex items-center gap-2">
                              <span>Placed on {formatDate(order.created_at)}</span>
                              {order.delivery_date && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#D91B60] font-semibold flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Expected: {formatDate(order.delivery_date)}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={waTrackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#25D366]/30"
                            >
                              <span>Track on WhatsApp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => toggleOrderDetails(order.id)}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-ink/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                            >
                              <span className="hidden sm:inline">{isExpanded ? "Hide Details" : "Order Details"}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-ink/60" /> : <ChevronDown className="w-4 h-4 text-ink/60" />}
                            </button>
                          </div>
                        </div>

                        {/* Visual 4-Step Tracker Progress */}
                        {order.status !== "cancelled" ? (
                          <div className="mt-6 pt-5 border-t border-gray-100/80">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40">
                                Delivery Progress
                              </p>
                              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span>Live Delivery Tracker</span>
                              </span>
                            </div>

                            <div className="relative">
                              {/* Background Connecting Line */}
                              <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-gray-200 -z-0 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#D91B60] via-[#FF2E93] to-emerald-500 transition-all duration-700 rounded-full"
                                  style={{
                                    width:
                                      step === 1 ? "0%" :
                                      step === 2 ? "33%" :
                                      step === 3 ? "66%" :
                                      step >= 4 ? "100%" : "0%",
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-4 gap-2 relative z-10">
                                {/* Step 1: Placed */}
                                <div className="flex flex-col items-center text-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                      step >= 1
                                        ? "bg-[#D91B60] text-white shadow-sm ring-4 ring-pink-100 scale-105"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <span className="text-[11px] font-bold text-ink mt-2">Placed</span>
                                  <span className="text-[10px] text-ink/50 hidden sm:inline">Order Registered</span>
                                </div>

                                {/* Step 2: Confirmed */}
                                <div className="flex flex-col items-center text-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                      step >= 2
                                        ? "bg-[#D91B60] text-white shadow-sm ring-4 ring-pink-100 scale-105"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[11px] font-bold mt-2 ${step >= 2 ? "text-[#D91B60]" : "text-ink/60"}`}>
                                    Confirmed
                                  </span>
                                  <span className="text-[10px] text-ink/50 hidden sm:inline">Crafting & Styling</span>
                                </div>

                                {/* Step 3: Out for Delivery */}
                                <div className="flex flex-col items-center text-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                      step >= 3
                                        ? "bg-[#D91B60] text-white shadow-sm ring-4 ring-pink-100 scale-105"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    <Truck className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[11px] font-bold mt-2 ${step >= 3 ? "text-[#D91B60]" : "text-ink/60"}`}>
                                    Dispatched
                                  </span>
                                  <span className="text-[10px] text-ink/50 hidden sm:inline">Out for Delivery</span>
                                </div>

                                {/* Step 4: Delivered */}
                                <div className="flex flex-col items-center text-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                      step >= 4
                                        ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100 scale-105"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[11px] font-bold mt-2 ${step >= 4 ? "text-emerald-700" : "text-ink/60"}`}>
                                    Delivered
                                  </span>
                                  <span className="text-[10px] text-ink/50 hidden sm:inline">Celebration Complete</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span>This order was cancelled. Contact our concierge if you have questions.</span>
                          </div>
                        )}
                      </div>

                      {/* Expandable Order Details */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 space-y-5 animate-fade-in">
                          {/* Items List */}
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">
                              Items Ordered ({order.order_items?.length || 0})
                            </h3>
                            <div className="divide-y divide-gray-100">
                              {(order.order_items || []).map((item, idx) => (
                                <div key={item.id || idx} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                                  {item.image_snapshot ? (
                                    <img
                                      src={item.image_snapshot}
                                      alt={item.name_snapshot}
                                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                                      <ShoppingBag className="w-6 h-6 text-[#D91B60]" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-ink truncate">
                                      {item.name_snapshot}
                                    </p>
                                    <p className="text-xs text-ink/50">
                                      Qty: {item.quantity} × {formatPaiseToInr(item.unit_price_paise)}
                                    </p>
                                    {item.customization_note && (
                                      <p className="text-[11px] text-[#D91B60] italic mt-0.5">
                                        Custom note: &ldquo;{item.customization_note}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-sm text-ink">
                                      {formatPaiseToInr(item.unit_price_paise * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Address & Payment Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                              <p className="font-bold text-ink flex items-center gap-1.5 mb-1 text-ink/70">
                                <MapPin className="w-3.5 h-3.5 text-[#D91B60]" />
                                <span>Delivery Address</span>
                              </p>
                              <p className="text-ink font-semibold">{order.customer_name}</p>
                              <p className="text-ink/60">{order.shipping_address?.line1}</p>
                              <p className="text-ink/60">
                                {order.shipping_address?.city}, {order.shipping_address?.state || "India"} - {order.shipping_address?.pincode}
                              </p>
                              <p className="text-ink/60 mt-1 font-mono">📞 +91 {order.customer_phone}</p>
                            </div>

                            <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 space-y-1.5">
                              <p className="font-bold text-ink/70 mb-1">Payment Summary</p>
                              <div className="flex justify-between text-ink/60">
                                <span>Subtotal</span>
                                <span>{formatPaiseToInr(order.subtotal_paise)}</span>
                              </div>
                              <div className="flex justify-between text-ink/60">
                                <span>Delivery</span>
                                <span>{order.delivery_fee_paise === 0 ? "FREE" : formatPaiseToInr(order.delivery_fee_paise)}</span>
                              </div>
                              <div className="flex justify-between font-extrabold text-sm text-ink pt-1.5 border-t border-gray-200">
                                <span>Total Paid</span>
                                <span className="text-[#D91B60]">{formatPaiseToInr(order.total_paise)}</span>
                              </div>
                              <p className="text-[10px] text-ink/40 uppercase tracking-wider pt-0.5">
                                Mode: {order.payment_method.toUpperCase()} • Status: {order.payment_status.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : searched ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-purple-100 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-50 text-[#D91B60] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-playfair text-ink">No Orders Found</h3>
                <p className="text-xs sm:text-sm text-ink/60 max-w-md mx-auto leading-relaxed">
                  We couldn&apos;t find any orders placed under <strong>+91 {activePhone}</strong>. If you used a different number during checkout, please try searching with that number.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/gifts"
                    className="px-6 py-3 rounded-full text-xs font-bold text-white bg-[#D91B60] hover:bg-[#c21453] shadow-md shadow-[#D91B60]/30 transition-all hover:scale-105"
                  >
                    Browse Luxury Gifts
                  </Link>
                  <a
                    href="https://wa.me/917006506721?text=Hello%20WRAPORA%2C%20I%20need%20help%20finding%20my%20order!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full text-xs font-bold text-ink bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    Chat with Concierge
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Quick Links & Concierge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link
            href="/gifts"
            className="flex items-center gap-4 bg-white rounded-3xl p-6 border border-purple-100/70 hover:border-[#D91B60]/40 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <ShoppingBag className="w-6 h-6 text-[#D91B60]" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-sm">Browse Curated Hampers</h3>
              <p className="text-xs text-ink/50 mt-0.5">Explore exquisite celebration boxes & keepsakes</p>
            </div>
          </Link>

          <a
            href="https://wa.me/917006506721?text=Hello%20WRAPORA%20Concierge%2C%20I%20have%20an%20inquiry%20regarding%20my%20account%20or%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white rounded-3xl p-6 border border-purple-100/70 hover:border-[#25D366]/40 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <HeartHandshake className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-sm">24/7 Client Concierge</h3>
              <p className="text-xs text-ink/50 mt-0.5">Instant assistance on WhatsApp (+91 70065 06721)</p>
            </div>
          </a>
        </div>
      </div>

      {/* Customer Phone Auth Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          // Handled automatically via Zustand store listener
        }}
      />
    </div>
  );
}
