export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush(
  audience: "customer" | "admin" = "customer",
  customerPhone?: string,
  customerName?: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  // 1. Verify Browser Environment
  if (typeof window === "undefined") {
    return { success: false, error: "Window is not available" };
  }

  // 2. Check Secure Context (HTTPS or localhost)
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]";

  if (!window.isSecureContext && !isLocalhost) {
    return {
      success: false,
      error:
        "Push notifications require HTTPS or localhost. If you are opening on a local IP (e.g. 192.168.x.x), please open via http://localhost:3000 instead.",
    };
  }

  // 3. Check Notification & Service Worker support
  if (!("Notification" in window)) {
    return {
      success: false,
      error:
        "Notifications are not supported by this browser. On iPhone/iPad, please tap Share → 'Add to Home Screen' and open the installed app.",
    };
  }

  if (!("serviceWorker" in navigator)) {
    return {
      success: false,
      error: "Service Workers are not supported on this browser or connection.",
    };
  }

  // 4. Check existing permission status
  if (Notification.permission === "denied") {
    return {
      success: false,
      error:
        "Notifications are blocked in your browser settings. Please click the lock/settings icon in the address bar and allow Notifications for this site.",
    };
  }

  try {
    // 5. Request Permission directly from user gesture
    let permission: NotificationPermission;
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = await new Promise<NotificationPermission>((resolve) => {
        Notification.requestPermission((p) => resolve(p));
      });
    }

    if (permission !== "granted") {
      return {
        success: false,
        error: "Notification permission was not granted.",
      };
    }

    // 6. Fetch VAPID public key
    const keyRes = await fetch("/api/push/subscribe", { cache: "no-store" });
    const keyData = await keyRes.json();
    if (!keyData.publicKey) {
      return { success: false, error: "VAPID public key is not configured on server." };
    }

    // 7. Register Service Worker first, then await ready
    let reg: ServiceWorkerRegistration;
    try {
      reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
    } catch (swErr) {
      console.error("SW registration error:", swErr);
      return {
        success: false,
        error: "Failed to register Service Worker: " + (swErr as Error).message,
      };
    }

    // 8. Get or create Push Subscription
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const convertedKey = urlBase64ToUint8Array(keyData.publicKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    }

    // 9. Persist Subscription to Server
    const saveRes = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        audience,
        customerPhone: customerPhone || undefined,
        customerName: customerName || undefined,
      }),
    });

    if (saveRes.ok) {
      return { success: true, message: "Notifications successfully enabled!" };
    } else {
      const errJson = await saveRes.json().catch(() => ({}));
      return { success: false, error: errJson.error || "Failed to save subscription on server." };
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Push subscription error:", error);
    return { success: false, error: error.message || "Failed to enable push notifications." };
  }
}
