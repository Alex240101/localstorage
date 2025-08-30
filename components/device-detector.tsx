"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Monitor } from "lucide-react"

interface DeviceDetectorProps {
  children: React.ReactNode
}

export function DeviceDetector({ children }: DeviceDetectorProps) {
  const [isMobile, setIsMobile] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window === "undefined" || typeof navigator === "undefined") {
        setIsMobile(true)
        setIsLoading(false)
        return
      }

      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768

      setIsMobile(isMobileDevice || isSmallScreen)
      setIsLoading(false)
    }

    checkDevice()

    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkDevice)
      return () => window.removeEventListener("resize", checkDevice)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    )
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-card/95 border-border">
          <CardHeader className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">BuscaLocal</CardTitle>
            <CardDescription className="text-gray-400">
              Esta aplicación está diseñada exclusivamente para dispositivos móviles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-4 text-muted-foreground">
              <Monitor className="w-8 h-8 opacity-50" />
              <span className="text-2xl">→</span>
              <Smartphone className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-400">
              Para una mejor experiencia, por favor accede desde tu teléfono móvil o tablet
            </p>
            <Button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.reload()
                }
              }}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              Verificar nuevamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
