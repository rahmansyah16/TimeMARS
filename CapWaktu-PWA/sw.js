/* CapWaktu service worker: keeps the app usable without signal.
   The cache version and file list are filled in by vite.config.js at build time. */
const CACHE = 'capwaktu-6df607a478';
const PRECACHE = ["./","./index.html","./assets/index-JF1z8cP9.js","./assets/barlow-condensed-latin-600-normal-BN11TKSn.woff2","./assets/barlow-condensed-latin-700-normal-B9NQhHK3.woff2","./assets/barlow-latin-500-normal-BRhHB0xN.woff2","./assets/barlow-latin-600-normal-DMnFtVx9.woff2","./assets/barlow-latin-700-normal-Bku5AOSK.woff2","./assets/barlow-latin-800-normal-B50OFIWa.woff2","./assets/bebas-neue-latin-400-normal-9mHNbWWO.woff2","./assets/montserrat-latin-wght-normal-l_AIctKy.woff2","./assets/oswald-latin-wght-normal-CzS3kehr.woff2","./assets/playfair-display-latin-wght-normal-BOwq7MWX.woff2","./assets/plus-jakarta-sans-latin-wght-normal-BD2oGHtS.woff2","./assets/roboto-condensed-latin-400-normal-BICmKrXV.woff2","./assets/roboto-condensed-latin-700-normal-DRbp0YnP.woff2","./assets/roboto-mono-latin-wght-normal-CZtBPCCa.woff2","./assets/saira-extra-condensed-latin-400-normal-ClYjhj9g.woff2","./assets/teko-latin-wght-normal-H1GeW4pj.woff2","./assets/style-B7QjRZEV.css","./icons/apple-touch-icon.png","./icons/favicon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./manifest.webmanifest"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('capwaktu-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // address lookups go straight to the network

  // pages: fresh copy when online, cached copy when the signal is slow or gone
  if (req.mode === 'navigate') {
    e.respondWith(Promise.race([
      fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); } return r; }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000))
    ]).catch(() => caches.match('./index.html').then((r) => r || fetch(req))));
    return;
  }

  // everything else: cache first
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return r;
  })));
});
