"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  History,
  RefreshCw,
  ExternalLink,
  Gift,
  Truck,
  Calendar,
  Tag,
  ShieldCheck,
  Check,
} from "lucide-react";
import type { AnnouncementRecord } from "@/lib/db/local_store";
import { formatDate } from "@/lib/utils/format";

interface BroadcastStats {
  totalSubscribers: number;
  customerSubscribers: number;
  adminSubscribers: number;
}

const TEMPLATES = [
  {
    name: "Festive Sale (20% Off)",
    icon: Gift,
    title: "🎉 Festive Special: Flat 20% OFF on Luxury Hampers!",
    body: "Celebrate in style! Enjoy exclusive 20% savings on our handcrafted gift boxes and keepsakes.",
    url: "/gifts",
    audience: "all" as const,
  },
  {
    name: "New Collection Drop",
    icon: Sparkles,
    title: "✨ Just Launched: The Velvet Royal Hamper Collection",
    body: "Explore our brand new artisanal hampers designed for weddings, anniversaries, and grand celebrations.",
    url: "/gifts",
    audience: "all" as const,
  },
  {
    name: "Free Express Delivery",
    icon: Truck,
    title: "🚚 Limited Time: Free Express Delivery Across India",
    body: "Order your favorite celebration hampers today and enjoy complimentary priority delivery!",
    url: "/gifts",
    audience: "all" as const,
  },
  {
    name: "Event Planning Special",
    icon: Calendar,
    title: "💍 Planning a Dream Wedding or Birthday Celebration?",
    body: "Let WRAPORA curate spellbinding themed decor and bespoke gifting. Consult our concierge today!",
    url: "/events",
    audience: "all" as const,
  },
];

const EMOJI_LIST = ["🎉", "✨", "🎁", "🛍️", "🚚", "💍", "🌸", "⭐", "🔥", "❤️"];

export default function AnnouncementsManager() {
  const [stats, setStats] = useState<BroadcastStats>({
    totalSubscribers: 0,
    customerSubscribers: 0,
    adminSubscribers: 0,
  });
  const [history, setHistory] = useState<AnnouncementRecord[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/gifts");
  const [audience, setAudience] = useState<"all" | "customer" | "admin">("all");

  // Send State
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const fetchStatsAndHistory = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/broadcast", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setStats(data.stats || { totalSubscribers: 0, customerSubscribers: 0, adminSubscribers: 0 });
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load broadcast stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStatsAndHistory();
  }, []);

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setUrl(tpl.url);
    setAudience(tpl.audience);
    setStatusMessage(null);
  };

  const handleInsertEmoji = (emoji: string) => {
    setTitle((prev) => prev + " " + emoji);
  };

  const handleSendBroadcast = async () => {
    setConfirmModalOpen(false);
    if (!title.trim() || !body.trim()) {
      setStatusMessage({ type: "error", text: "Please enter both title and message." });
      return;
    }

    try {
      setIsSending(true);
      setStatusMessage(null);

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          url,
          audience,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setStatusMessage({
          type: "success",
          text: `Broadcast sent! Delivered to ${data.sent} device(s) (${data.failed} failed out of ${data.total} targets).`,
        });
        // Refresh history and stats
        fetchStatsAndHistory();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to broadcast notification.",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({ type: "error", text: error.message || "Network error while sending broadcast." });
    } finally {
      setIsSending(false);
    }
  };

  const targetCount =
    audience === "all"
      ? stats.totalSubscribers
      : audience === "customer"
      ? stats.customerSubscribers
      : stats.adminSubscribers;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 text-[#D91B60] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PWA & Web Push Notification Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-ink">
            Broadcast Announcements & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-1">
            Send instant notifications directly to smartphones and devices of users who installed the app or subscribed.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStatsAndHistory}
          disabled={loadingStats}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-ink/80 text-xs font-bold hover:bg-gray-50 transition-colors shadow-xs self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? "animate-spin" : ""}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Total Subscribed</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#D91B60] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-ink mt-3">{stats.totalSubscribers}</p>
          <p className="text-[11px] text-ink/50 mt-1">Registered push devices</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Customers / App Users</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-ink mt-3">{stats.customerSubscribers}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Storefront & PWA Clients</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Admin Devices</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#250842] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#D91B60]" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-ink mt-3">{stats.adminSubscribers}</p>
          <p className="text-[11px] text-ink/50 mt-1">Management staff alerts</p>
        </div>

        <div className="bg-gradient-to-br from-[#250842] to-[#3B0764] p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-pink-200 uppercase tracking-wider">Web-Push Engine</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-base font-bold text-white mt-3">VAPID Active</p>
          <p className="text-[11px] text-purple-200/80 mt-1">Ready to deliver push alerts</p>
        </div>
      </div>

      {/* Main Grid: Composer on Left, Live Smartphone Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Preset Templates */}
          <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#D91B60]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink/60">
                1-Click Preset Templates
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEMPLATES.map((tpl, i) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-3 rounded-2xl border border-gray-100 hover:border-pink-300 hover:bg-pink-50/40 text-left transition-all group cursor-pointer flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-[#D91B60] text-[#D91B60] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink leading-tight">{tpl.name}</p>
                      <p className="text-[11px] text-ink/50 line-clamp-1 mt-0.5">{tpl.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Composer */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Send className="w-4 h-4 text-[#D91B60]" />
              <span>Compose Announcement</span>
            </h2>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAudience("all")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    audience === "all"
                      ? "bg-[#250842] text-white border-[#250842] shadow-sm"
                      : "bg-gray-50 text-ink/70 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  All ({stats.totalSubscribers})
                </button>
                <button
                  type="button"
                  onClick={() => setAudience("customer")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    audience === "customer"
                      ? "bg-[#D91B60] text-white border-[#D91B60] shadow-sm"
                      : "bg-gray-50 text-ink/70 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Customers ({stats.customerSubscribers})
                </button>
                <button
                  type="button"
                  onClick={() => setAudience("admin")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    audience === "admin"
                      ? "bg-purple-900 text-white border-purple-900 shadow-sm"
                      : "bg-gray-50 text-ink/70 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Admins Test ({stats.adminSubscribers})
                </button>
              </div>
            </div>

            {/* Notification Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink/70 uppercase tracking-wider">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-ink/40 font-mono">{title.length}/60 chars</span>
              </div>
              <input
                type="text"
                maxLength={80}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🎉 Festive Sale: Flat 20% OFF on Luxury Hampers!"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-pink-100 outline-none text-sm font-semibold text-ink placeholder-gray-400"
              />
              {/* Quick Emojis */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-ink/40 mr-1">Quick Emojis:</span>
                {EMOJI_LIST.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => handleInsertEmoji(em)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-pink-100 text-sm flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Body / Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink/70 uppercase tracking-wider">
                  Notification Message (Body) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-ink/40 font-mono">{body.length}/160 chars</span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. Celebrate with your loved ones! Shop our handcrafted curated hampers with guaranteed timely delivery across India."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-pink-100 outline-none text-sm text-ink placeholder-gray-400 resize-none leading-relaxed"
              />
            </div>

            {/* Click Destination URL */}
            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1.5">
                On Click Open Page (URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/gifts or /events or custom link"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D91B60] focus:ring-2 focus:ring-pink-100 outline-none text-sm font-mono text-ink placeholder-gray-400"
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-ink/40">Quick Links:</span>
                {["/gifts", "/events", "/account", "/"].map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setUrl(path)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                      url === path
                        ? "bg-pink-100 text-[#D91B60] border-pink-200 font-bold"
                        : "bg-gray-50 text-ink/60 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Alert Message */}
            {statusMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Dispatch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={isSending || !title.trim() || !body.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D91B60] to-[#FF2E93] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to Active Devices...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Announcement to {targetCount} Device(s)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-ink/40 text-center mt-2">
                Instant delivery via Web Push protocol with vibration & notification banner
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Smartphone Lock-Screen Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Live Phone Notification Preview
            </span>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
              Real-Time Mockup
            </span>
          </div>

          {/* Smartphone Simulator */}
          <div className="bg-[#110520] p-4 sm:p-5 rounded-[40px] shadow-2xl border-4 border-gray-800 max-w-sm mx-auto relative overflow-hidden">
            {/* Phone Screen Wallpaper Gradient */}
            <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-[#2D0B5A] via-[#1A032F] to-[#0A0014] p-5 pt-8 min-h-[460px] flex flex-col justify-between text-white">
              {/* Phone Speaker Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#1A032F] -mr-16" />
              </div>

              {/* Lockscreen Header Clock */}
              <div className="text-center pt-6">
                <span className="text-xs font-medium text-purple-200">Tuesday, 29 September</span>
                <p className="text-5xl font-extralight tracking-tight text-white mt-1 font-sans">
                  09:41
                </p>
              </div>

              {/* Notification Card */}
              <div className="my-auto py-2">
                <div className="bg-white/95 backdrop-blur-xl text-ink rounded-2xl p-3.5 shadow-2xl border border-white/40 animate-fade-in">
                  {/* Notification App Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md overflow-hidden bg-white ring-1 ring-pink-500/30 flex-shrink-0">
                        <img
                          src="/images/wrapora-logo.png"
                          alt="WRAPORA"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-ink tracking-wide uppercase font-serif">
                        WRAPORA
                      </span>
                    </div>
                    <span className="text-[10px] text-ink/50 font-medium">now</span>
                  </div>

                  {/* Notification Title & Body */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink leading-tight">
                      {title.trim() || "🎉 Announcement Title Preview"}
                    </p>
                    <p className="text-[11px] text-ink/75 leading-relaxed">
                      {body.trim() ||
                        "Your announcement message will appear here on your client's mobile screen lockscreen or banner."}
                    </p>
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-ink/60">
                    <span className="font-mono text-[#D91B60] font-semibold flex items-center gap-1">
                      <span>Tap to open: {url || "/"}</span>
                    </span>
                    <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md">
                      Explore ✨
                    </span>
                  </div>
                </div>
              </div>

              {/* Lockscreen Bottom Icons */}
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="w-16 h-1 bg-white/40 rounded-full" />
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#D91B60]" />
            <h2 className="text-base font-bold text-ink">Broadcast History & Delivery Log</h2>
          </div>
          <span className="text-xs text-ink/50 font-medium">
            Total Broadcasts: {history.length}
          </span>
        </div>

        {history.length > 0 ? (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            {history.map((record) => (
              <div key={record.id} className="p-5 sm:p-6 hover:bg-gray-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-ink">{record.title}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          record.audience === "all"
                            ? "bg-purple-100 text-purple-800"
                            : record.audience === "customer"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {record.audience === "all"
                          ? "All Devices"
                          : record.audience === "customer"
                          ? "Customers"
                          : "Admins"}
                      </span>
                    </div>
                    <p className="text-xs text-ink/70 leading-relaxed max-w-2xl">{record.body}</p>
                    <p className="text-[11px] text-ink/40 mt-1 font-mono">
                      Link: <span className="text-[#D91B60]">{record.url || "/"}</span> • Sent on{" "}
                      {formatDate(record.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {record.sent_count}/{record.total_targets} Delivered
                        </span>
                      </span>
                      {record.failed_count > 0 && (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                          {record.failed_count} expired/unreachable
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle(record.title);
                        setBody(record.body);
                        setUrl(record.url || "/gifts");
                        setAudience(record.audience);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-ink/70 hover:text-ink hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Re-Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-ink/50 space-y-2">
            <Bell className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold">No announcements broadcasted yet.</p>
            <p className="text-xs text-ink/40">
              When you send your first notification, the delivery metrics and logs will show up here.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#D91B60] flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold font-playfair text-ink">
                Confirm Push Broadcast?
              </h3>
              <p className="text-xs text-ink/70 mt-1 leading-relaxed">
                You are about to send this push notification to{" "}
                <strong className="text-ink font-bold">
                  {targetCount} active device(s)
                </strong>
                . This will trigger a loud chime and alert notification banner on the users&apos;
                devices.
              </p>
            </div>

            <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 text-xs space-y-1">
              <p className="font-bold text-ink">{title}</p>
              <p className="text-ink/70 line-clamp-2">{body}</p>
              <p className="text-[10px] text-[#D91B60] font-mono mt-1">Target: {url}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-ink/70 font-semibold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="flex-1 py-2.5 rounded-xl bg-[#D91B60] hover:bg-[#c21453] text-white font-bold text-xs shadow-md shadow-pink-500/30 transition-all cursor-pointer"
              >
                Yes, Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
