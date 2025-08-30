"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (typeof window !== "undefined") {
      setIsDismissed(!!sessionStorage.getItem("pwa-install-dismissed"))

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered:", registration)

            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("[PWA] New version available")
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.log("[PWA] Service Worker registration failed, trying fallback:", error)
            navigator.serviceWorker
              .register("/api/sw.js")
              .then((registration) => {
                console.log("[PWA] Service Worker registered via API route:", registration)
              })
              .catch((fallbackError) => {
                console.error("[PWA] Both service worker registrations failed:", fallbackError)
              })
          })
      }

      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)

        setTimeout(() => {
          if (!isInstalled) {
            setShowInstallPrompt(true)
          }
        }, 3000)
      }

      const handleAppInstalled = () => {
        console.log("[PWA] App installed")
        setIsInstalled(true)
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.addEventListener("appinstalled", handleAppInstalled)

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.removeEventListener("appinstalled", handleAppInstalled)
      }
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      console.log("[PWA] User choice:", outcome)

      if (outcome === "accepted") {
        setIsInstalled(true)
      }

      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error("[PWA] Install prompt error:", error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setIsDismissed(true)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa-install-dismissed", "true")
    }
  }

  if (!isMounted) {
    return null
  }

  if (isInstalled || isDismissed) {
    return null
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm">Instalar BuscaLocal</h3>
            <p className="text-gray-400 text-xs mt-1">Accede más rápido desde tu pantalla de inicio</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white text-xs px-3 py-1.5 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>

          <button onClick={handleDismiss} className="flex-shrink-0 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
