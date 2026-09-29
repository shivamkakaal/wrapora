"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  Home,
  Gift,
  Image as ImageIcon,
  Package,
  Calendar,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useCustomerStore } from "@/lib/store/customer";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import RaporaLogo from "./RaporaLogo";
import CustomerAuthModal from "./CustomerAuthModal";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Sparkles },
  { href: "/gifts", label: "Gifts", icon: Gift },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/account", label: "Account", icon: Package },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const customerPhone = useCustomerStore((s) => s.phone);
  const customerName = useCustomerStore((s) => s.name);
  const customerIsLoggedIn = useCustomerStore((s) => s.isLoggedIn);
  const customerLogout = useCustomerStore((s) => s.logout);

  const totalItems = useCartStore((s) => s.totalItems());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? totalItems : 0;

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    customerLogout();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setMobileMenuOpen(false);
    window.location.reload();
  };

  if (pathname.startsWith("/admin")) return null;

  const isAuthenticated = mounted && (customerIsLoggedIn || !!user);
  const userDisplayName =
    customerName ||
    (customerPhone ? `+91 ${customerPhone.slice(-10)}` : null) ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Client";

  return (
    <>
      {/* Accessibility skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-magenta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#250842]/95 backdrop-blur-md shadow-xl shadow-black/20"
            : "bg-[#250842]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ============================================================== */}
          {/* DESKTOP NAVBAR (MD & LG)                                       */}
          {/* ============================================================== */}
          <div className="hidden md:flex items-center justify-between h-20">
            {/* Left: Brand Logo */}
            <Link
              href="/"
              className="flex items-center transition-transform hover:scale-[1.02]"
              aria-label="WRAPORA Home"
            >
              <RaporaLogo size="lg" variant="light" />
            </Link>

            {/* Center: Floating Pill Navigation */}
            <nav className="flex items-center bg-white/5 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10 shadow-inner">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-[#D91B60] text-white shadow-lg shadow-[#D91B60]/40 scale-[1.03]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Cart, Profile & Quick Action */}
            <div className="flex items-center gap-3">
              {/* User Profile / Auth Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15"
                    title="My Account"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D91B60] to-[#FF2E93] flex items-center justify-center text-[10px] font-bold">
                      {userDisplayName[0].toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{userDisplayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-white/70 hover:text-pink-300 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-pink-300" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Shopping Cart Button */}
              <button
                onClick={openDrawer}
                className="relative p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={`Cart with ${cartCount} items`}
              >
                <ShoppingBag className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-bold text-white bg-[#D91B60] rounded-full px-1 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Consultation CTA */}
              <Link
                href="/events#inquire"
                className="hidden lg:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FF2E93] to-[#D91B60] hover:opacity-95 shadow-md shadow-[#D91B60]/30 transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5" /> Book Consultation
              </Link>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MOBILE NAVBAR (< MD)                                           */}
          {/* ============================================================== */}
          <div className="md:hidden">
            {/* Top Bar with Hamburger, Logo & Cart */}
            <div className="flex items-center justify-between h-14 relative">
              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-1 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>

              {/* Center Brand Logo */}
              <Link
                href="/"
                className="flex items-center justify-center transition-transform active:scale-95"
                aria-label="WRAPORA Home"
              >
                <RaporaLogo size="md" variant="light" />
              </Link>

              {/* Right: Cart Button */}
              <div className="flex items-center justify-end">
                <button
                  onClick={openDrawer}
                  className="relative p-2 text-white/90 cursor-pointer"
                  aria-label={`Cart with ${cartCount} items`}
                >
                  <ShoppingBag className="w-5 h-5 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-[#D91B60] rounded-full px-1">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Horizontal Nav Pills below logo */}
            <nav className="flex items-center justify-center pb-2 pt-0.5">
              <div
                className="flex items-center justify-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-1 max-w-full [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? "bg-[#D91B60] text-white shadow-md shadow-[#D91B60]/40"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MOBILE SLIDE-IN DRAWER (HAMBURGER MENU)                        */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99990] md:hidden">
          {/* Dark Blur Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <aside
            className="relative w-[85%] max-w-sm bg-gradient-to-b from-[#1E0535] via-[#250842] to-[#170329] text-white z-[99995] shadow-2xl flex flex-col h-full animate-slide-in-left overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Header: Logo & Close */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <RaporaLogo size="md" variant="light" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ========================================================== */}
            {/* PROFILE / ACCOUNT SECTION                                  */}
            {/* ========================================================== */}
            <div className="p-5 border-b border-white/10 bg-white/5">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D91B60] via-[#FF2E93] to-amber-300 p-0.5 shadow-md">
                      <div className="w-full h-full rounded-full bg-[#200538] flex items-center justify-center text-white font-bold text-lg">
                        {userDisplayName[0].toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 bg-white/10 px-2 py-0.5 rounded-full inline-block mb-1">
                        Atelier Member
                      </span>
                      <h3 className="font-bold text-white text-sm leading-tight max-w-[160px] truncate">
                        {userDisplayName}
                      </h3>
                      <p className="text-[11px] text-purple-200/70 truncate max-w-[160px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-[#D91B60] transition-colors"
                    title="View Account"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80">
                      <User className="w-5 h-5 text-pink-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Welcome, Guest</h3>
                      <p className="text-xs text-purple-200/70">
                        Sign in for personalized gifting & bookings
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#FF2E93] to-[#D91B60] shadow-md shadow-[#D91B60]/30 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Create Account</span>
                  </button>
                </div>
              )}
            </div>

            {/* ========================================================== */}
            {/* MAIN NAVIGATION LINKS                                      */}
            {/* ========================================================== */}
            <div className="p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 px-3 py-1 block">
                Explore WRAPORA
              </span>
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#D91B60] text-white shadow-lg shadow-[#D91B60]/30 font-bold"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : "text-pink-300"
                        }`}
                      />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}
            </div>

            {/* ========================================================== */}
            {/* ATELIER ACTIONS & CONCIERGE                                */}
            {/* ========================================================== */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 px-3 py-1 block">
                Concierge & Booking
              </span>
              <Link
                href="/events#inquire"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-pink-300" />
                  <span>Book Event Consultation</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>

              <a
                href="https://wa.me/917006506721?text=Hello%20WRAPORA%2C%20I%20would%20like%20to%20inquire%20about%20your%20luxury%20services!"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-[#25D366]/20 border border-[#25D366]/30 text-green-300 hover:bg-[#25D366]/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp: +91 70065 06721</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </a>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-1.5">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-[11px] uppercase tracking-wider">
                  <span>Helpline & Concierge</span>
                </div>
                <div className="flex flex-col gap-1 text-[11px] text-white/70">
                  <a href="tel:+917006506721" className="hover:text-white flex items-center gap-1.5">
                    📞 +91 70065 06721
                  </a>
                  <a href="tel:+919541223100" className="hover:text-white flex items-center gap-1.5">
                    📞 +91 95412 23100
                  </a>
                  <a href="mailto:shivamkakaal@gmail.com" className="hover:text-white flex items-center gap-1.5 break-all">
                    ✉️ shivamkakaal@gmail.com
                  </a>
                  <a href="mailto:abhu2680@gmail.com" className="hover:text-white flex items-center gap-1.5 break-all">
                    ✉️ abhu2680@gmail.com
                  </a>
                </div>
                <p className="text-[10px] text-pink-200/70 pt-1 border-t border-white/10">
                  🌍 Worldwide Shipping on all Gift Hampers
                </p>
              </div>
            </div>

            {/* ========================================================== */}
            {/* BOTTOM AUTH (LOGIN / LOGOUT) SECTION                       */}
            {/* ========================================================== */}
            <div className="mt-auto p-4 border-t border-white/10 bg-[#160226]">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs text-red-300 hover:text-white bg-red-900/20 hover:bg-red-600/40 border border-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({userDisplayName})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-pink-300" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Customer Auth Modal (Sign In / Register) */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          const supabase = createClient();
          supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
          });
        }}
      />
    </>
  );
}
