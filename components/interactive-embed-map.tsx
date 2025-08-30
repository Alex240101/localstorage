"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Phone, Navigation, ExternalLink } from "lucide-react"

interface InteractiveEmbedMapProps {
  businesses: any[]
  onBusinessClick: (business: any) => void
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

export function InteractiveEmbedMap({ businesses, onBusinessClick, onCall, onNavigate }: InteractiveEmbedMapProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const locationData = JSON.parse(localStorage.getItem("busca-local-location") || "{}")
  const userLocation = locationData.coordinates
    ? {
        lat: locationData.coordinates.latitude,
        lng: locationData.coordinates.longitude,
      }
    : null

  console.log("[v0] 🗺️ Creando mapa interactivo con ubicación:", userLocation)
  console.log("[v0] 🏪 Negocios para mostrar:", businesses.length)

  const createEmbedMapUrl = () => {
    if (!userLocation) return null

    const businessesWithCoords = businesses.filter(
      (b) => b.coordinates && b.coordinates.latitude && b.coordinates.longitude,
    )
    // Remover el .slice(0, 3) para mostrar TODOS los negocios

    if (businessesWithCoords.length > 0) {
      const baseUrl = "https://www.google.com/maps/embed/v1/view"

      // Calcular el centro del mapa basado en la ubicación del usuario y los negocios
      const allLats = [userLocation.lat, ...businessesWithCoords.map((b) => b.coordinates.latitude)]
      const allLngs = [userLocation.lng, ...businessesWithCoords.map((b) => b.coordinates.longitude)]

      const centerLat = allLats.reduce((a, b) => a + b, 0) / allLats.length
      const centerLng = allLngs.reduce((a, b) => a + b, 0) / allLngs.length

      const params = new URLSearchParams({
        key: "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8",
        center: `${centerLat},${centerLng}`,
        zoom: "14", // Zoom para ver todos los puntos
        maptype: "roadmap",
        language: "es",
        region: "PE",
      })

      return `${baseUrl}?${params.toString()}`
    } else {
      const baseUrl = "https://www.google.com/maps/embed/v1/place"
      const params = new URLSearchParams({
        key: "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8",
        q: `${userLocation.lat},${userLocation.lng}`,
        zoom: "15",
        maptype: "roadmap",
        language: "es",
        region: "PE",
      })

      return `${baseUrl}?${params.toString()}`
    }
  }

  const embedMapUrl = createEmbedMapUrl()

  const openFullMapWithAllBusinesses = () => {
    if (!userLocation) return

    const businessesWithCoords = businesses.filter(
      (b) => b.coordinates && b.coordinates.latitude && b.coordinates.longitude,
    )

    if (businessesWithCoords.length > 0) {
      // Crear URL con todos los negocios como marcadores
      const markers = businessesWithCoords
        .map(
          (business, index) =>
            `markers=color:red%7Clabel:${index + 1}%7C${business.coordinates.latitude},${business.coordinates.longitude}`,
        )
        .join("&")

      // Agregar marcador azul para la ubicación del usuario
      const userMarker = `markers=color:blue%7Clabel:TU%7C${userLocation.lat},${userLocation.lng}`

      // URL de Google Maps con todos los marcadores
      const url = `https://www.google.com/maps?${userMarker}&${markers}&zoom=14`
      window.open(url, "_blank")
    } else {
      // Fallback: búsqueda general en la ubicación del usuario
      const searchUrl = `https://www.google.com/maps/search/restaurantes+pollerías/@${userLocation.lat},${userLocation.lng},15z`
      window.open(searchUrl, "_blank")
    }
  }

  const openFullMap = () => {
    openFullMapWithAllBusinesses()
  }

  useEffect(() => {
    console.log("[v0] 🔄 Mapa embed URL generada:", embedMapUrl ? "✅ Disponible" : "❌ No disponible")
    if (embedMapUrl) {
      setMapLoaded(true)
    }
  }, [embedMapUrl])

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-gray-900 border-gray-700">
        <CardContent className="p-0">
          {embedMapUrl && userLocation ? (
            <div className="relative">
              <iframe
                src={embedMapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
                onLoad={() => {
                  console.log("[v0] ✅ Mapa interactivo cargado exitosamente")
                  setMapLoaded(true)
                }}
                onError={() => {
                  console.log("[v0] ❌ Error cargando mapa interactivo")
                }}
              />

              {/* Overlay con información */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 z-10">
                <div className="flex items-center space-x-2 text-white text-sm">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>TU (Tu ubicación)</span>
                </div>
                <div className="flex items-center space-x-2 text-white text-sm mt-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{businesses.length} negocios encontrados</span>
                </div>
                <div className="text-xs text-gray-300 mt-2">
                  Haz clic en "Ver todos los puntos" para ver todos los negocios marcados
                </div>
              </div>

              {/* Botones de acción */}
              <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/80 border-gray-600 text-white hover:bg-black/90 backdrop-blur-sm"
                  onClick={openFullMap}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Rutas
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                  onClick={openFullMap}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver todos los puntos
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <MapPin className="w-16 h-16 mx-auto text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Mapa Interactivo</h3>
                <p className="text-gray-300 text-sm">
                  {!userLocation ? "Activar ubicación GPS para ver el mapa" : "Cargando mapa interactivo..."}
                </p>
                {userLocation && (
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={openFullMap}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver en Google Maps
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de negocios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">Negocios encontrados ({businesses.length})</h4>
          {mapLoaded && (
            <span className="text-xs text-green-400 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Mapa interactivo activo
            </span>
          )}
        </div>

        {businesses.map((business, index) => (
          <Card
            key={business.id}
            className={`bg-gray-800 border-gray-700 cursor-pointer transition-all hover:bg-gray-750 ${
              selectedBusiness?.id === business.id ? "ring-2 ring-purple-500" : ""
            }`}
            onClick={() => {
              setSelectedBusiness(business)
              onBusinessClick(business)
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h5 className="font-semibold text-white">{business.name}</h5>
                    <p className="text-sm text-gray-400">{business.address}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white font-medium">{business.rating}</span>
                      </div>
                      <span className="text-purple-300 font-medium">{business.distance}</span>
                      {business.isOpen && <span className="text-green-400 text-xs font-medium">Abierto</span>}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCall(business.phone || "No disponible")
                        }}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigate(business.address)
                        }}
                      >
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
