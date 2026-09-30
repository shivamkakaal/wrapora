"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, Share, X, Sparkles, Smartphone, ShieldCheck, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Global reference so multiple components share the same deferred prompt
let cachedDeferredPrompt: BeforeInstallPromptEvent | null = null;

interface AdminPwaProps {
  variant?: "pill" | "sidebar-card" | "floating-only";
  className?: string;
}

export default function AdminPwaManager({ variant = "floating-only", className = "" }: AdminPwaProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(cachedDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if running in standalone mode (already installed as PWA)
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(Boolean(checkStandalone));

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    // 3. Register service worker if not already registered
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
        console.warn("Admin SW register notice:", err);
      });
    }

    // 4. Custom event to trigger iOS modal from any button
    const handleOpenIosModal = () => setShowIosModal(true);
    window.addEventListener("wrapoura-admin-open-ios-modal", handleOpenIosModal);

    // If already standalone, do not show banners
    if (checkStandalone) {
      return () => {
        window.removeEventListener("wrapoura-admin-open-ios-modal", handleOpenIosModal);
      };
    }

    // 5. Check dismissal memory (7 days) for the floating banner
    const dismissedUntil = localStorage.getItem("wrapoura_admin_pwa_dismissed");
    const isDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();

    // 6. iOS device: show banner after brief delay if not dismissed
    if (isIosDevice && !isDismissed && variant === "floating-only") {
      const timer = setTimeout(() => setShowInstallBanner(true), 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("wrapoura-admin-open-ios-modal", handleOpenIosModal);
      };
    }

    // 7. Chrome / Edge / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      cachedDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed && variant === "floating-only") {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 8. App installed listener
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowInstallBanner(false);
      cachedDeferredPrompt = null;
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("wrapoura-admin-open-ios-modal", handleOpenIosModal);
    };
  }, [variant]);

  const handleInstallClick = useCallback(async () => {
    if (isIos) {
      if (variant === "floating-only") {
        setShowIosModal(true);
      } else {
        window.dispatchEvent(new Event("wrapoura-admin-open-ios-modal"));
      }
      return;
    }

    const activePrompt = deferredPrompt || cachedDeferredPrompt;

    if (!activePrompt) {
      alert(
        "To install WRAPORA Admin, tap your browser's menu (⋮ or Share) and select 'Install WRAPORA Admin' or 'Add to Home Screen'."
      );
      return;
    }

    await activePrompt.prompt();
    const choice = await activePrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowInstallBanner(false);
      setIsStandalone(true);
    }
    cachedDeferredPrompt = null;
    setDeferredPrompt(null);
  }, [deferredPrompt, isIos, variant]);

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem("wrapoura_admin_pwa_dismissed", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  // --- Variant 1: Sidebar Card ---
  if (variant === "sidebar-card") {
    return (
      <div
        className={`p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-purple-950/60 border border-amber-400/25 text-white ${className}`}
      >
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-amber-400/40 bg-[#1F0838] flex-shrink-0">
            <img
              src="/icons/admin-icon-192.png"
              alt="WRAPORA Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-200 truncate">WRAPORA Admin</span>
              <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
            </div>
            <p className="text-[10px] text-white/60">Standalone Executive PWA</p>
          </div>
        </div>

        {isStandalone ? (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>App Installed & Active</span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-[#D91B60] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-amber-200" />
            <span>Install Admin App</span>
          </button>
        )}
      </div>
    );
  }

  // --- Variant 2: Compact Header Pill ---
  if (variant === "pill") {
    if (isStandalone) {
      // In standalone PWA mode, keep the header clean and uncluttered
      return null;
    }

    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-pink-500/20 hover:from-amber-500/30 hover:to-pink-500/30 text-amber-200 border border-amber-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${className}`}
        title="Install WRAPORA Admin as a standalone app"
      >
        <Download className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>
    );
  }

  // --- Variant 3: Default Floating Overlays (Banner + iOS Sheet + Installation Success) ---
  return (
    <>
      {/* Floating Bottom Card */}
      {showInstallBanner && !isStandalone && (
        <aside
          role="complementary"
          aria-label="Install WRAPORA Admin App"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[99990] bg-[#18042B] text-white rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-amber-500/40 animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-amber-400/40 bg-[#1F0838] flex-shrink-0">
              <img
                src="/icons/admin-icon-192.png"
                alt="WRAPORA Admin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Official Admin App
                </span>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="p-1 text-white/40 hover:text-white rounded-lg -mr-1 cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">Install WRAPORA Admin</h4>
              <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
                1-tap home screen access, order push alerts & full-screen executive dashboard.
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-[#D91B60] hover:brightness-105 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install to Home Screen</span>
            </button>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Later
            </button>
          </div>
        </aside>
      )}

      {/* Installed Confirmation Toast */}
      {installedSuccess && (
        <div className="fixed top-6 right-6 z-[99999] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-3 animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <div>
            <p className="text-xs font-bold">Admin App Installed!</p>
            <p className="text-[11px] text-emerald-100">You can now launch WRAPORA Admin from your Home Screen or Dock.</p>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1F0838] text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-pink-500/30 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-400/40 bg-[#18042B]">
                  <img src="/icons/admin-icon-192.png" alt="Admin" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-base text-white">Install on iPhone / iPad</h3>
                  <p className="text-[10px] text-amber-300 uppercase tracking-widest font-semibold">WRAPORA Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              Install the <strong>WRAPORA Admin Console</strong> to your iOS Home Screen for instant launch and order push notifications:
            </p>

            <ol className="text-xs text-white/90 space-y-3 list-decimal list-inside bg-white/5 p-4 rounded-2xl border border-white/10">
              <li className="leading-snug">
                Tap the <Share className="w-4 h-4 text-pink-400 inline mx-1" /> <strong>Share</strong> button in Safari's bottom toolbar.
              </li>
              <li className="leading-snug">
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </li>
              <li className="leading-snug">
                Tap <strong>Add</strong> in the top-right corner to complete setup.
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D91B60] to-[#FF2E93] text-white font-bold text-xs shadow-lg shadow-pink-500/30 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
