// Keeps the offline page and its logo. Games, pages and API answers are never cached here,
// so nobody sees old data. Change CACHE when offline.html or the logo files change.
const CACHE = "offline-v5";
const OFFLINE_URL = "/offline.html";
const ASSETS = ["/brand/wordmark-white.png", "/brand/wordmark-blue.png", "/icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          [OFFLINE_URL, ...ASSETS].map((url) => cache.add(new Request(url, { cache: "reload" }))),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Logo files used by the offline page: cache first, network as backup.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
    return;
  }

  // Only whole-page visits. A game inside an iframe is left alone.
  if (request.mode !== "navigate" || request.destination !== "document") return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return cached ?? Response.error();
    }),
  );
});
