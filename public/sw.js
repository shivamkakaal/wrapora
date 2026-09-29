// WRAPORA PWA Service Worker
const CACHE_NAME = "wrapora-v2";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/images/wrapora-logo.png",
];

// Install: precache offline shell and core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache non-GET, admin routes, or API mutations
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Static assets & images: Stale-While-Revalidate / Cache-First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // HTML Navigation: Network-First with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match(OFFLINE_URL);
          return offlineFallback || Response.error();
        })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Push notifications listener
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const isAnnouncement = data.tag?.startsWith("announcement-");
    const title = data.title || (isAnnouncement ? "WRAPORA Special Announcement" : "WRAPORA Luxury Events & Gifting");
    const targetUrl = data.url || (isAnnouncement ? "/" : "/admin/orders");
    
    const options = {
      body: data.body || (isAnnouncement ? "Check out the latest updates and offers!" : "New order update received."),
      icon: data.icon || "/icons/icon-192.png",
      badge: data.badge || "/icons/icon-192.png",
      vibrate: [300, 100, 300, 100, 400],
      requireInteraction: true,
      renotify: true,
      tag: data.tag || `notification-${Date.now()}`,
      data: {
        url: targetUrl,
        timestamp: Date.now(),
        ...data.data,
      },
      actions: isAnnouncement
        ? [{ action: "explore", title: "✨ Explore Now" }]
        : [{ action: "view", title: "🛍️ View Order" }],
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Push notification error in sw:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
