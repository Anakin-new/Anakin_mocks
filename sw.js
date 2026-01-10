const cacheName = 'sayli-v2'; // Version badal diya hai
const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
  // Yahan sirf UI ki main files rakho, JS logic ko network se aane do
];

// Install: Assets ko cache mein dalna
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Activate: Purane cache ko delete karna (Zaruri hai!)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Strategy: Pehle Network se koshish karo, agar net nahi hai tab cache dekho
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});