const CACHE_NAME = "sojournx-shell-v1";
const APP_SHELL_ASSETS = ["/", "/manifest.webmanifest", "/sojournx-logo.png"];

const offlineFallbackResponse = async () => {
  const cachedRoot = await caches.match("/");
  if (cachedRoot) {
    return cachedRoot;
  }

  return new Response("SojournX is offline right now. Please reconnect and try again.", {
    status: 503,
    statusText: "Service Unavailable",
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => offlineFallbackResponse()));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) {
            return networkResponse;
          }

          const responseForCache = networkResponse.clone();
          void caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseForCache))
            .catch(() => undefined);
          return networkResponse;
        })
        .catch(() => offlineFallbackResponse());
    })
  );
});
