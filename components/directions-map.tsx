"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Car, PersonStanding, Bike, Clock, MapPin, Navigation } from "lucide-react"

interface DirectionsMapProps {
  business: any
  userLocation: { latitude: number; longitude: number }
  onBack: () => void
}

export function DirectionsMap({ business, userLocation, onBack }: DirectionsMapProps) {
  const [selectedMode, setSelectedMode] = useState<"driving" | "walking" | "bicycling">("driving")
  const [mapLoaded, setMapLoaded] = useState(false)

  const transportModes = [
    {
      id: "driving" as const,
      label: "Carro",
      icon: Car,
      color: "bg-blue-500",
      time: "8-12 min",
      distance: business.distance,
    },
    {
      id: "walking" as const,
      label: "A pie",
      icon: PersonStanding,
      color: "bg-green-500",
      time: "15-25 min",
      distance: business.distance,
    },
    {
      id: "bicycling" as const,
      label: "Bicicleta",
      icon: Bike,
      color: "bg-orange-500",
      time: "5-10 min",
      distance: business.distance,
    },
  ]

  const createDirectionsUrl = (mode: string) => {
    const origin = `${userLocation.latitude},${userLocation.longitude}`
    const destination = business.coordinates
      ? `${business.coordinates.latitude},${business.coordinates.longitude}`
      : encodeURIComponent(business.address)

    const baseUrl = "https://www.google.com/maps/embed/v1/directions"
    const params = new URLSearchParams({
      key: "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8",
      origin: origin,
      destination: destination,
      mode: mode,
      language: "es",
      region: "PE",
    })

    return `${baseUrl}?${params.toString()}`
  }

  const openInGoogleMaps = () => {
    const origin = `${userLocation.latitude},${userLocation.longitude}`
    const destination = business.coordinates
      ? `${business.coordinates.latitude},${business.coordinates.longitude}`
      : encodeURIComponent(business.address)

    const url = `https://www.google.com/maps/dir/${origin}/${destination}/@${userLocation.latitude},${userLocation.longitude},15z/data=!3m1!4b1!4m2!4m1!3e${selectedMode === "driving" ? "0" : selectedMode === "walking" ? "2" : "1"}`
    window.open(url, "_blank")
  }

  useEffect(() => {
    setMapLoaded(true)
  }, [selectedMode])

  return (
    <div className="space-y-4">
      {/* Header con información del negocio */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button
              size="sm"
              onClick={openInGoogleMaps}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Abrir en Maps
            </Button>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-lg">{business.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {business.address}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Opciones de transporte */}
      <div className="grid grid-cols-3 gap-2">
        {transportModes.map((mode) => {
          const Icon = mode.icon
          const isSelected = selectedMode === mode.id

          return (
            <Button
              key={mode.id}
              variant={isSelected ? "default" : "outline"}
              className={`flex flex-col items-center p-4 h-auto space-y-2 ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              }`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{mode.label}</div>
                <div className="text-xs opacity-75">{mode.time}</div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Información de la ruta seleccionada */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${transportModes.find((m) => m.id === selectedMode)?.color}`}></div>
              <div>
                <div className="font-medium">{transportModes.find((m) => m.id === selectedMode)?.label}</div>
                <div className="text-sm text-muted-foreground">
                  {business.distance} • {transportModes.find((m) => m.id === selectedMode)?.time}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Clock className="w-3 h-3 mr-1" />
              Tiempo estimado
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Mapa interactivo con direcciones */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="relative">
          {mapLoaded ? (
            <iframe
              src={createDirectionsUrl(selectedMode)}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
              title={`Direcciones a ${business.name}`}
            />
          ) : (
            <div className="h-96 bg-muted flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Cargando direcciones...</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
