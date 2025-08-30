"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Phone, Navigation, ExternalLink, Locate } from "lucide-react"

interface StaticMapViewProps {
  businesses: any[]
  onBusinessClick: (business: any) => void
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

export function StaticMapView({ businesses, onBusinessClick, onCall, onNavigate }: StaticMapViewProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)

  const locationData = JSON.parse(localStorage.getItem("busca-local-location") || "{}")
  const userLocation = locationData.coordinates
    ? {
        lat: locationData.coordinates.latitude,
        lng: locationData.coordinates.longitude,
      }
    : null

  const createStaticMapUrl = () => {
    if (!userLocation || businesses.length === 0) return null

    const baseUrl = "https://maps.googleapis.com/maps/api/staticmap"
    const params = new URLSearchParams({
      center: `${userLocation.lat},${userLocation.lng}`,
      zoom: "14",
      size: "800x400",
      maptype: "roadmap",
      style: "feature:all|element:geometry|color:0x212121",
      style: "feature:all|element:labels.text.fill|color:0x757575",
      style: "feature:water|element:geometry|color:0x000000",
      key: "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8",
    })

    // Agregar marcador del usuario
    params.append("markers", `color:blue|size:mid|${userLocation.lat},${userLocation.lng}`)

    // Agregar marcadores de negocios (máximo 10 para evitar URL muy larga)
    businesses.slice(0, 10).forEach((business, index) => {
      if (
        business.coordinates &&
        typeof business.coordinates.latitude === "number" &&
        typeof business.coordinates.longitude === "number"
      ) {
        params.append(
          "markers",
          `color:purple|label:${index + 1}|${business.coordinates.latitude},${business.coordinates.longitude}`,
        )
      }
    })

    return `${baseUrl}?${params.toString()}`
  }

  const staticMapUrl = createStaticMapUrl()

  const openInGoogleMaps = () => {
    if (!userLocation) return

    const url = `https://www.google.com/maps/search/restaurantes/@${userLocation.lat},${userLocation.lng},15z`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-gray-900 border-gray-700">
        <CardContent className="p-0">
          {staticMapUrl ? (
            <div className="relative">
              <img
                src={staticMapUrl || "/placeholder.svg"}
                alt="Mapa de ubicaciones"
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  console.log("[v0] Error cargando mapa estático, mostrando fallback")
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "flex"
                }}
              />

              {/* Fallback si el mapa estático falla */}
              <div className="hidden w-full h-96 bg-gradient-to-br from-gray-900 to-gray-800 flex-col items-center justify-center rounded-lg">
                <MapPin className="w-16 h-16 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Vista de Mapa</h3>
                <p className="text-gray-300 text-sm text-center mb-4">Mapa no disponible temporalmente</p>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={openInGoogleMaps}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir en Google Maps
                </Button>
              </div>

              {/* Overlay con información */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center space-x-2 text-white text-sm">
                  <Locate className="w-4 h-4 text-blue-400" />
                  <span>Tu ubicación</span>
                </div>
                <div className="flex items-center space-x-2 text-white text-sm mt-1">
                  <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>{businesses.length} negocios encontrados</span>
                </div>
              </div>

              {/* Botón para abrir en Google Maps */}
              <div className="absolute bottom-4 right-4">
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                  onClick={openInGoogleMaps}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver en Google Maps
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <MapPin className="w-16 h-16 mx-auto text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Vista de Mapa</h3>
                <p className="text-gray-300 text-sm">
                  {!userLocation ? "Ubicación no disponible" : "Cargando ubicaciones..."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de negocios con números correspondientes al mapa */}
      <div className="space-y-3">
        <h4 className="text-white font-semibold">Ubicaciones ({businesses.length})</h4>
        {businesses.slice(0, 10).map((business, index) => (
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
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCall(business.phone)
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
