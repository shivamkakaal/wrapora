"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  ShoppingBag,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { formatPaiseToInr, formatDate } from "@/lib/utils/format";

export interface CustomerLeadData {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  total_orders: number;
  total_spent_paise: number;
  last_login_at: string;
  created_at: string;
  last_order_at?: string | null;
  city?: string | null;
  inquiriesCount?: number;
  inquiries?: any[];
  ordersCount?: number;
  latestOrder?: any;
}

interface CustomersManagerProps {
  initialCustomers: CustomerLeadData[];
}

export default function CustomersManager({ initialCustomers }: CustomersManagerProps) {
  const [customers, setCustomers] = useState<CustomerLeadData[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "buyers" | "leads">("all");
  const [expandedCustId, setExpandedCustId] = useState<string | null>(null);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      // Tab filter
      if (filterTab === "buyers" && (cust.total_orders || 0) === 0) return false;
      if (filterTab === "leads" && (cust.total_orders || 0) > 0) return false;

      // Text search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const phoneMatch = (cust.phone || "").toLowerCase().includes(q);
      const nameMatch = (cust.name || "").toLowerCase().includes(q);
      const cityMatch = (cust.city || "").toLowerCase().includes(q);
      return phoneMatch || nameMatch || cityMatch;
    });
  }, [customers, filterTab, search]);

  // Aggregate Stats
  const totalCustomers = customers.length;
  const totalBuyers = customers.filter((c) => (c.total_orders || 0) > 0).length;
  const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);
  const totalRevenuePaise = customers.reduce((sum, c) => sum + (c.total_spent_paise || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">
            Registered Customers & Leads
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Real-time directory of all clients who logged in via phone, placed orders, or submitted event inquiries.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#250842] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#D91B60]" />
            </div>
            <div>
              <p className="text-xs text-ink/60">Total Clients</p>
              <p className="text-xl sm:text-2xl font-extrabold text-ink">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#D91B60] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-ink/60">Active Buyers</p>
              <p className="text-xl sm:text-2xl font-extrabold text-ink">{totalBuyers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-ink/60">Total Orders</p>
              <p className="text-xl sm:text-2xl font-extrabold text-ink">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-ink/60">Client Spend</p>
              <p className="text-xl sm:text-2xl font-extrabold text-ink">{formatPaiseToInr(totalRevenuePaise)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by phone, name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60] outline-none text-xs text-ink"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterTab("all")}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === "all"
                ? "bg-white text-ink shadow-xs"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            All Clients ({customers.length})
          </button>
          <button
            onClick={() => setFilterTab("buyers")}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === "buyers"
                ? "bg-white text-[#D91B60] shadow-xs"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Buyers ({totalBuyers})
          </button>
          <button
            onClick={() => setFilterTab("leads")}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === "leads"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Phone Leads ({customers.length - totalBuyers})
          </button>
        </div>
      </div>

      {/* Customers List View */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-ink/50 uppercase tracking-wider font-semibold">
                <th className="px-5 py-3.5">Customer & Phone</th>
                <th className="px-5 py-3.5">Lead / Client Type</th>
                <th className="px-5 py-3.5">Orders & Spend</th>
                <th className="px-5 py-3.5">Event Inquiries</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">Quick Contact Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((cust) => {
                const isBuyer = (cust.total_orders || 0) > 0;
                const cleanPhone = cust.phone.replace(/[^0-9]/g, "").slice(-10);
                const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Hello ${cust.name || "Client"}! Greetings from WRAPORA Luxury Gifting & Events Atelier.`
                )}`;

                return (
                  <tr key={cust.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#250842] to-[#D91B60] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {(cust.name || cust.phone)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink">{cust.name || "Phone Lead"}</p>
                          <div className="flex items-center gap-2 text-ink/60 font-mono text-xs mt-0.5">
                            <span>📞 +91 {cleanPhone}</span>
                            {cust.city && <span className="text-ink/40">• {cust.city}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {isBuyer ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 text-[#D91B60] font-bold text-[11px]">
                          <ShoppingBag className="w-3 h-3" />
                          <span>Active Buyer ({cust.total_orders})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-[#250842] font-semibold text-[11px]">
                          <Users className="w-3 h-3 text-[#D91B60]" />
                          <span>Phone Sign-In Lead</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-extrabold text-sm text-ink">
                          {formatPaiseToInr(cust.total_spent_paise || 0)}
                        </p>
                        <p className="text-[11px] text-ink/50">
                          {cust.total_orders || 0} order{cust.total_orders === 1 ? "" : "s"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {(cust.inquiriesCount || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>{cust.inquiriesCount} Inquir{cust.inquiriesCount === 1 ? "y" : "ies"}</span>
                        </span>
                      ) : (
                        <span className="text-ink/30 text-[11px]">No inquiries</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-ink/70 font-medium">{formatDate(cust.last_login_at || cust.created_at)}</p>
                      <p className="text-[10px] text-ink/40">Joined {formatDate(cust.created_at)}</p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp Button */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold transition-all flex items-center gap-1"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-[11px]">WhatsApp</span>
                        </a>

                        {/* Call Button */}
                        <a
                          href={`tel:+91${cleanPhone}`}
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#250842] transition-colors"
                          title="Call Client"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        {/* View Orders Link */}
                        {isBuyer && (
                          <Link
                            href="/admin/orders"
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-ink/70 transition-colors"
                            title="View Orders"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< MD) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredCustomers.map((cust) => {
            const isBuyer = (cust.total_orders || 0) > 0;
            const cleanPhone = cust.phone.replace(/[^0-9]/g, "").slice(-10);
            const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
              `Hello ${cust.name || "Client"}! Greetings from WRAPORA Luxury Gifting & Events Atelier.`
            )}`;
            const isExpanded = expandedCustId === cust.id;

            return (
              <div key={cust.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#250842] to-[#D91B60] text-white flex items-center justify-center font-bold text-xs">
                      {(cust.name || cust.phone)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">{cust.name || "Phone Lead"}</p>
                      <p className="text-xs text-ink/60 font-mono">📞 +91 {cleanPhone}</p>
                    </div>
                  </div>

                  {isBuyer ? (
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#D91B60] font-bold text-[10px]">
                      Buyer
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#250842] font-semibold text-[10px]">
                      Lead
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] text-ink/40 uppercase font-semibold">Total Orders</span>
                    <p className="font-bold text-ink">{cust.total_orders || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink/40 uppercase font-semibold">Total Spent</span>
                    <p className="font-extrabold text-[#D91B60]">{formatPaiseToInr(cust.total_spent_paise || 0)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-ink/50">
                    Active: {formatDate(cust.last_login_at || cust.created_at)}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 text-[#128C7E] font-bold text-xs flex items-center gap-1 border border-[#25D366]/30"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:+91${cleanPhone}`}
                      className="p-1.5 rounded-xl bg-purple-50 text-[#250842]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-ink">No customer leads found</p>
            <p className="text-xs text-ink/50">Try clearing your search query or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
