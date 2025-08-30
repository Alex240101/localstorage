"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Phone, Navigation, ExternalLink, Locate } from "lucide-react"

interface LocationMapViewProps {
  businesses: any[]
  onBusinessClick: (business: any) => void
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

export function LocationMapView({ businesses, onBusinessClick, onCall, onNavigate }: LocationMapViewProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)

  const locationData = JSON.parse(localStorage.getItem("busca-local-location") || "{}")
  const userLocation = locationData.coordinates
    ? {
        lat: locationData.coordinates.latitude,
        lng: locationData.coordinates.longitude,
      }
    : null

  console.log("[v0] 🗺️ Creando vista de ubicaciones con:", userLocation)
  console.log("[v0] 🏪 Negocios para mostrar:", businesses.length)

  const calculateBounds = () => {
    if (!userLocation || businesses.length === 0) return null

    let minLat = userLocation.lat
    let maxLat = userLocation.lat
    let minLng = userLocation.lng
    let maxLng = userLocation.lng

    businesses.forEach((business) => {
      if (business.coordinates && business.coordinates.latitude && business.coordinates.longitude) {
        const lat = business.coordinates.latitude
        const lng = business.coordinates.longitude
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
      }
    })

    return { minLat, maxLat, minLng, maxLng }
  }

  const getPositionInMap = (lat: number, lng: number) => {
    const bounds = calculateBounds()
    if (!bounds) return { x: 50, y: 50 }

    const { minLat, maxLat, minLng, maxLng } = bounds

    // Agregar padding para que los marcadores no estén en los bordes
    const padding = 0.1
    const latRange = maxLat - minLat || 0.01
    const lngRange = maxLng - minLng || 0.01

    const x = ((lng - minLng + padding * lngRange) / (lngRange + 2 * padding * lngRange)) * 100
    const y = ((maxLat - lat + padding * latRange) / (latRange + 2 * padding * latRange)) * 100

    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    }
  }

  const openFullMap = () => {
    if (!userLocation) return

    let url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}`

    // Agregar hasta 10 destinos (límite de Google Maps)
    const destinations = businesses
      .slice(0, 10)
      .map((business) => {
        if (business.coordinates && business.coordinates.latitude && business.coordinates.longitude) {
          return `${business.coordinates.latitude},${business.coordinates.longitude}`
        }
        return encodeURIComponent(business.address)
      })
      .join("/")

    if (destinations) {
      url += `/${destinations}`
    }

    window.open(url, "_blank")
  }

  const openBusinessInMaps = (business: any) => {
    if (business.coordinates && business.coordinates.latitude && business.coordinates.longitude) {
      const url = `https://www.google.com/maps/place/${business.coordinates.latitude},${business.coordinates.longitude}`
      window.open(url, "_blank")
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(business.name + " " + business.address)}`
      window.open(url, "_blank")
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-gray-900 border-gray-700">
        <CardContent className="p-0">
          {userLocation ? (
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden rounded-lg">
                {/* Grid de fondo para simular mapa */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-gray-600"></div>
                    ))}
                  </div>
                </div>

                {/* Marcador del usuario */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Tu ubicación
                    </div>
                  </div>
                </div>

                {/* Marcadores de negocios */}
                {businesses.map((business, index) => {
                  if (!business.coordinates || !business.coordinates.latitude || !business.coordinates.longitude) {
                    return null
                  }

                  const position = getPositionInMap(business.coordinates.latitude, business.coordinates.longitude)
                  const isSelected = selectedBusiness?.id === business.id

                  return (
                    <div
                      key={business.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                      onClick={() => {
                        setSelectedBusiness(business)
                        onBusinessClick(business)
                      }}
                    >
                      <div className="relative group">
                        <div
                          className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-110 ${
                            isSelected ? "bg-purple-500 scale-110" : "bg-red-500"
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {business.name}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Overlay con información */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 z-30">
                  <div className="flex items-center space-x-2 text-white text-sm">
                    <Locate className="w-4 h-4 text-blue-400" />
                    <span>Tu ubicación</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white text-sm mt-1">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{businesses.length} negocios cercanos</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="absolute bottom-4 right-4 flex space-x-2 z-30">
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                    onClick={openFullMap}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver en Google Maps
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <MapPin className="w-16 h-16 mx-auto text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Vista de Ubicaciones</h3>
                <p className="text-gray-300 text-sm">Activar ubicación GPS para ver el mapa de negocios</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de negocios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">Negocios encontrados ({businesses.length})</h4>
          <span className="text-xs text-green-400 flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Vista de ubicaciones activa
          </span>
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
                          openBusinessInMaps(business)
                        }}
                      >
                        <MapPin className="w-3 h-3" />
                      </Button>
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
