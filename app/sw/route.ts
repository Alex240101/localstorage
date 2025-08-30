export async function GET() {
  const swCode = `
const CACHE_NAME = 'buscalocal-v1.0.0'
const STATIC_CACHE = 'buscalocal-static-v1.0.0'
const DYNAMIC_CACHE = 'buscalocal-dynamic-v1.0.0'

// Recursos para cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/offline.html'
]

// URLs de API para cachear con estrategia Network First
const API_URLS = [
  '/api/search-businesses'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS)
      }),
      self.skipWaiting()
    ])
  )
})

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Estrategia Cache First para recursos estáticos
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      request.destination === 'image' || 
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          const responseClone = fetchResponse.clone()
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, responseClone)
          })
          return fetchResponse
        })
      }).catch(() => {
        // Fallback para navegación offline
        if (request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
    )
    return
  }

  // Estrategia Network First para APIs
  if (API_URLS.some(apiUrl => url.pathname.startsWith(apiUrl))) {
    event.respondWith(
      fetch(request).then(response => {
        const responseClone = response.clone()
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, responseClone)
        })
        return response
      }).catch(() => {
        return caches.match(request)
      })
    )
    return
  }

  // Estrategia Network First para navegación
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline.html')
      })
    )
    return
  }

  // Para todo lo demás, intentar red primero, luego cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})

// Manejar notificaciones push (opcional)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'BuscaLocal', {
        body: data.body || 'Nueva notificación',
        icon: '/apple-touch-icon.png',
        badge: '/favicon-96x96.png',
        tag: 'buscalocal-notification',
        requireInteraction: false,
        actions: [
          {
            action: 'open',
            title: 'Abrir App'
          },
          {
            action: 'close',
            title: 'Cerrar'
          }
        ]
      })
    )
  }
})

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('[SW] Service Worker loaded successfully')
`

  return new Response(swCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
