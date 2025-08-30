"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (typeof navigator !== "undefined") {
      // Detectar estado inicial
      setIsOnline(navigator.onLine)
    }

    const handleOnline = () => {
      console.log("[PWA] Connection restored")
      setIsOnline(true)
      setShowStatus(true)

      // Ocultar después de 3 segundos
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      console.log("[PWA] Connection lost")
      setIsOnline(false)
      setShowStatus(true)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  if (!isMounted || (!showStatus && isOnline)) return null

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        isOnline ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Conexión restaurada</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Sin conexión</span>
          </>
        )}
      </div>
    </div>
  )
}
