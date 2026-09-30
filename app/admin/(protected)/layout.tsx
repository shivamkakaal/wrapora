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
} from "lucide-react";
import { logoutAdmin } from "@/lib/actions/auth";
import AdminNotificationCenter from "@/components/admin/AdminNotificationCenter";
import AdminPwaManager from "@/components/admin/AdminPwaManager";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/announcements", label: "Broadcast & Alerts", icon: BellRing },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers & Leads", icon: Users },
  { href: "/admin/leads", label: "Event Inquiries", icon: Calendar },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/content", label: "Homepage & Content", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[99990] md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-[#1F0838] text-white z-[99995] flex flex-col h-full shadow-2xl animate-slide-in-left">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-pink-500/30">
                  <img src="/images/wrapora-logo.png" alt="WRAPORA" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-white text-base font-serif uppercase tracking-wider">WRAPORA Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                        ? "bg-[#D91B60] text-white shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10 space-y-3">
              <AdminPwaManager variant="sidebar-card" />
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 w-full transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </form>
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="block text-center text-xs text-white/50 hover:text-white mt-2"
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
        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <AdminPwaManager variant="sidebar-card" />
          <form action={logoutAdmin}>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all w-full cursor-pointer">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
          <Link href="/" className="block text-xs text-white/40 text-center hover:text-white/60">
            ← Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header with Hamburger */}
        <header className="md:hidden bg-[#200538] text-white p-3 px-4 flex items-center justify-between shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 -ml-1 cursor-pointer"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white ring-1 ring-pink-500/30 flex-shrink-0">
              <img src="/images/wrapora-logo.png" alt="WRAPORA" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold font-serif uppercase tracking-wider">WRAPORA</span>
          </div>

          <div className="flex items-center gap-2">
            <AdminPwaManager variant="pill" />
            <Link
              href="/"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
            >
              Store →
            </Link>
          </div>
        </header>

        {/* Mobile Horizontal Quick Nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1 p-2 bg-white border-b sticky top-[52px] z-20 shadow-xs">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all ${
                  isActive ? "bg-[#250842] text-white shadow-xs" : "text-ink/65 hover:text-ink bg-gray-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Page Inner Container */}
        <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto">
          <AdminNotificationCenter />
          <AdminPwaManager variant="floating-only" />
          {children}
        </div>
      </main>
    </div>
  );
}
