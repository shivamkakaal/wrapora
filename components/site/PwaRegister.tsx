"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);

  useEffect(() => {
    // 1. Service Worker registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("Wrapoura: New app version available.");
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error("SW registration failed:", err);
        });
    }

    // 2. Check install dismissal memory (14 days)
    const dismissedUntil = localStorage.getItem("wrapoura_pwa_dismissed");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // 3. Track visit count
    const visitCount = Number(localStorage.getItem("wrapoura_visits") || "0") + 1;
    localStorage.setItem("wrapoura_visits", String(visitCount));

    // 4. iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone;

    if (isIosDevice && !isStandalone && visitCount >= 2) {
      setIsIos(true);
      setShowInstallBanner(true);
    }

    // 5. Android / Desktop Chrome beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (visitCount >= 2) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosSheet(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIosSheet(false);
    localStorage.setItem("wrapoura_pwa_dismissed", String(Date.now() + 14 * 24 * 60 * 60 * 1000));
  };

  if (!showInstallBanner && !showIosSheet) return null;

  return (
    <>
      {/* Floating Branded Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-royal border border-royal-100 flex items-center gap-3.5 animate-in slide-in-from-bottom duration-300">
          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-purple-100 bg-white">
            <img
              src="/images/wrapora-logo.png"
              alt="WRAPORA"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-ink truncate">Install WRAPORA App</p>
            <p className="text-[11px] text-ink/60 line-clamp-1">
              Fast, offline-ready luxury shopping & event consultation
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="brand-gradient text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-ink/40 hover:text-ink p-1 -mr-1 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIosSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-playfair font-bold text-lg text-ink">Install on iPhone</h3>
              <button onClick={() => setShowIosSheet(false)} className="text-ink/40 hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-ink/60">
              To install the WRAPORA App on your iOS device:
            </p>
            <ol className="text-xs text-ink/80 space-y-3 list-decimal list-inside bg-purple-50/50 p-4 rounded-xl border border-purple-100/60">
              <li className="flex items-center gap-2">
                Tap the <Share className="w-4 h-4 text-royal inline" /> Share icon in Safari’s bottom bar
              </li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
              <li>Tap <strong>Add</strong> in the top-right corner</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full brand-gradient text-white py-2.5 rounded-xl font-semibold text-xs shadow-royal"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
