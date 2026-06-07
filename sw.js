const CACHE = 'raaag-v4';
const SHELL = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // CDN fonts/scripts: cache then network
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com') || url.hostname.includes('cdnjs')) {
    e.respondWith(caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached =>
        cached || fetch(e.request).then(r => { if(r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => cached)
      )
    ));
    return;
  }

  // App shell: network first, fall back to cache
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { caches.open(CACHE).then(c => c.put(e.request, r.clone())); }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
