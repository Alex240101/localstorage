"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LocationSetupProps {
  onLocationSet: (locationData: any) => void
}

export function LocationSetup({ onLocationSet }: LocationSetupProps) {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [geoLocation, setGeoLocation] = useState<GeolocationPosition | null>(null)
  const [locationDetected, setLocationDetected] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    handleGetLocation()
  }, [])

  const handleGetLocation = () => {
    setIsDetectingLocation(true)

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setIsDetectingLocation(false)
      toast({
        title: "Geolocalización no disponible",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setGeoLocation(position)
        setLocationDetected(true)

        console.log("[v0] GPS Activado - Coordenadas obtenidas:")
        console.log("[v0] Latitud:", position.coords.latitude)
        console.log("[v0] Longitud:", position.coords.longitude)
        console.log("[v0] Precisión:", position.coords.accuracy, "metros")

        const locationData = {
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          address: `Ubicación GPS detectada automáticamente`,
          timestamp: new Date().toISOString(),
          hasGPS: true,
        }

        toast({
          title: "Ubicación detectada",
          description: "GPS activado correctamente",
        })

        setTimeout(() => {
          onLocationSet(locationData)
        }, 1000)

        setIsDetectingLocation(false)
      },
      (error) => {
        setIsDetectingLocation(false)
        console.log("[v0] Error de GPS:", error.message)

        let errorMessage = "No se pudo obtener tu ubicación."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación en tu navegador."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible."
            break
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado para obtener la ubicación."
            break
        }

        toast({
          title: "Error de ubicación",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Detectando ubicación</CardTitle>
          <CardDescription>
            Detectando tu ubicación GPS automáticamente para mostrarte negocios cercanos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {!locationDetected ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2 text-primary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Detectando ubicación automáticamente...</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-transparent"
                  onClick={handleGetLocation}
                  disabled={isDetectingLocation}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Reintentar detección
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center text-green-600 space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ubicación detectada correctamente</span>
                </div>

                <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium">GPS activado</p>
                  <p>Ingresando al sistema...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
