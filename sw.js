// Service worker mínimo: solo lo necesario para que Android permita instalar
// la app y usarla como share target. No cachea nada más.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercepta específicamente el POST que WhatsApp/Android manda cuando
  // alguien comparte una foto o PDF a esta app.
  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target.html')) {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const archivo = formData.get('factura');

      if (archivo) {
        const cache = await caches.open('share-target-v1');
        await cache.put('/archivo-compartido', new Response(archivo, {
          headers: { 'Content-Type': archivo.type, 'X-Nombre': archivo.name }
        }));
      }

      return Response.redirect('./index.html?compartido=1', 303);
    })());
  }
});
