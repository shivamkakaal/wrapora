"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Palette,
  Calendar,
  Image as ImageIcon,
  Star,
  Settings as SettingsIcon,
  LogOut,
  Tag,
  Menu,
  X,
  BellRing,
  MoreHorizontal,
} from "lucide-react";
import { logoutAdmin } from "@/lib/actions/auth";
import AdminNotificationCenter from "@/components/admin/AdminNotificationCenter";
import AdminPwaManager from "@/components/admin/AdminPwaManager";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers & Leads", icon: Users },
  { href: "/admin/announcements", label: "Broadcast & Alerts", icon: BellRing },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/leads", label: "Event Inquiries", icon: Calendar },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/content", label: "Homepage & Content", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

// Bottom navigation primary items for mobile phones
const bottomTabItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Clients", icon: Users },
  { href: "/admin/announcements", label: "Broadcast", icon: BellRing },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden w-full">
      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[99990] md:hidden">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] bg-[#1F0838] text-white z-[99995] flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-pink-500/30 flex-shrink-0">
                  <img src="/images/wrapora-logo.png" alt="WRAPORA" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm font-serif uppercase tracking-wider block">WRAPORA Admin</span>
                  <span className="text-[10px] text-pink-300 font-medium">Executive Console</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-pink-600 to-[#D91B60] text-white shadow-sm font-bold"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-3 bg-[#18042B]">
              <AdminPwaManager variant="sidebar-card" />
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 w-full transition-all border border-rose-500/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </form>
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="block text-center text-xs text-white/50 hover:text-white transition-colors"
              >
                ← Back to Storefront
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#1F0838] text-white flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-pink-500/40 bg-white flex-shrink-0">
              <img
                src="/images/wrapora-logo.png"
                alt="WRAPORA"
                className="w-full h-full object-cover scale-105"
              />
            </div>
            <div>
              <span className="text-xl font-extrabold font-serif tracking-wider uppercase block text-white leading-none">
                WRAPORA
              </span>
              <p className="text-pink-200/70 text-[9.5px] uppercase tracking-widest font-semibold mt-1">
                Admin Console
              </p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-xs font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <AdminPwaManager variant="sidebar-card" />
          <form action={logoutAdmin}>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all w-full cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
          <Link href="/" className="block text-xs text-white/40 text-center hover:text-white/60">
            ← Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Mobile Header with Hamburger */}
        <header className="md:hidden bg-[#1F0838] text-white p-3 px-4 flex items-center justify-between shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 -ml-1 cursor-pointer flex-shrink-0"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white ring-1 ring-pink-500/30 flex-shrink-0">
              <img src="/images/wrapora-logo.png" alt="WRAPORA" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold font-serif uppercase tracking-wider block text-white leading-none truncate">
                WRAPORA
              </span>
              <span className="text-[9px] text-pink-300 font-semibold tracking-wider uppercase">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <AdminPwaManager variant="pill" />
            <Link
              href="/"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Store →
            </Link>
          </div>
        </header>

        {/* Mobile Horizontal Quick Nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1.5 p-2 bg-white border-b sticky top-[52px] z-20 shadow-2xs no-scrollbar overscroll-x-contain">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all ${
                  isActive
                    ? "bg-[#1F0838] text-white shadow-xs"
                    : "text-ink/65 hover:text-ink bg-gray-50 border border-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Page Inner Container */}
        <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto w-full min-w-0 pb-28 md:pb-8 flex-1">
          <AdminNotificationCenter />
          <AdminPwaManager variant="floating-only" />
          {children}
        </div>

        {/* Mobile App-Style Bottom Tab Bar */}
        <nav
          role="navigation"
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#18042B]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.5)] safe-area-bottom"
        >
          {bottomTabItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "text-pink-400 font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-pink-400 scale-110" : ""}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-400" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* More / Menu Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <MoreHorizontal className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
