/* Service worker AppVini — permet l'installation et le mode hors-ligne.
   Stratégie "réseau d'abord" : l'app se met toujours à jour quand il y a
   du réseau, et la dernière version connue s'affiche quand il n'y en a pas. */
const CACHE = 'appvini-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // On ne met en cache que les fichiers de l'app, jamais Supabase ni l'IA
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
