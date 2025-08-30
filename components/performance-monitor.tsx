"use client"

import { useEffect } from "react"

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitorear Web Vitals
    if (typeof window !== "undefined" && "performance" in window) {
      // Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            console.log("[PWA] LCP:", entry.startTime)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ["largest-contentful-paint"] })
      } catch (e) {
        // Fallback para navegadores que no soportan LCP
        console.log("[PWA] LCP monitoring not supported")
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log("[PWA] FID:", entry.processingStart - entry.startTime)
        }
      })

      try {
        fidObserver.observe({ entryTypes: ["first-input"] })
      } catch (e) {
        console.log("[PWA] FID monitoring not supported")
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        console.log("[PWA] CLS:", clsValue)
      })

      try {
        clsObserver.observe({ entryTypes: ["layout-shift"] })
      } catch (e) {
        console.log("[PWA] CLS monitoring not supported")
      }

      // Monitorear memoria (si está disponible)
      if ("memory" in performance) {
        const memoryInfo = (performance as any).memory
        console.log("[PWA] Memory usage:", {
          used: Math.round(memoryInfo.usedJSHeapSize / 1048576) + " MB",
          total: Math.round(memoryInfo.totalJSHeapSize / 1048576) + " MB",
          limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576) + " MB",
        })
      }

      return () => {
        observer.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }, [])

  return null // Este componente no renderiza nada
}
