import { NextResponse } from "next/server"

export async function GET() {
  const swContent = `// Service Worker para BuscaLocal PWA
const CACHE_NAME = "buscalocal-v1.0.0"
const STATIC_CACHE = "buscalocal-static-v1.0.0"
const DYNAMIC_CACHE = "buscalocal-dynamic-v1.0.0"

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
  "/offline.html",
]

// Recursos dinámicos que se cachean bajo demanda
const DYNAMIC_ASSETS = ["/api/search-businesses"]

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Error caching static assets:", error)
      }),
  )
})

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service Worker activated")
        return self.clients.claim()
      }),
  )
})

// Interceptar requests (estrategia Cache First para estáticos, Network First para dinámicos)
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return
  }

  // Estrategia para recursos estáticos (Cache First)
  if (
    STATIC_ASSETS.some((asset) => url.pathname === asset) ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("[SW] Serving from cache:", request.url)
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
          .catch(() => {
            // Fallback para páginas offline
            if (request.destination === "document") {
              return caches.match("/offline.html")
            }
          })
      }),
    )
    return
  }

  // Estrategia para API calls (Network First con cache fallback)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          console.log("[SW] Network failed, trying cache for:", request.url)
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Fallback response para APIs
            return new Response(
              JSON.stringify({
                error: "Sin conexión",
                message: "No hay conexión a internet. Mostrando datos guardados.",
                offline: true,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            )
          })
        }),
    )
    return
  }

  // Para todo lo demás, Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200 && request.method === "GET") {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          if (request.destination === "document") {
            return caches.match("/offline.html")
          }
        })
      }),
  )
})

// Manejo de notificaciones push (opcional)
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event)

  const options = {
    body: event.data ? event.data.text() : "Nueva notificación de BuscaLocal",
    icon: "/icon-192x192.png",
    badge: "/favicon-96x96.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver más",
        icon: "/icon-192x192.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("BuscaLocal", options))
})

// Manejo de clicks en notificaciones
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received:", event)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})

// Sincronización en background (opcional)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Aquí puedes sincronizar datos cuando vuelva la conexión
      console.log("[SW] Performing background sync"),
    )
  }
})`

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  })
}
