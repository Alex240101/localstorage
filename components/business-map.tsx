"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Phone, Navigation, AlertCircle, Settings } from "lucide-react"

interface BusinessMapProps {
  businesses: any[]
  onBusinessClick: (business: any) => void
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

const isGoogleMapsLoading = false
let googleMapsPromise: Promise<any> | null = null

export function BusinessMap({ businesses, onBusinessClick, onCall, onNavigate }: BusinessMapProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error" | "unavailable">("loading")
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log("[v0] === INICIANDO DIAGNÓSTICO DEL MAPA ===")

        console.log("[v0] Checking map container ref...")
        if (!mapContainerRef.current) {
          console.log("[v0] ERROR: Map container ref is null, retrying in 100ms...")
          setTimeout(initializeMap, 100)
          return
        }
        console.log("[v0] ✅ Map container ref is available:", mapContainerRef.current)

        let apiKey = localStorage.getItem("busca-local-maps-api-key")
        if (!apiKey) {
          console.log("[v0] Setting default API key...")
          apiKey = "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8"
          localStorage.setItem("busca-local-maps-api-key", apiKey)
        }
        console.log("[v0] Using API key:", apiKey.substring(0, 20) + "...")

        const locationData = JSON.parse(localStorage.getItem("busca-local-location") || "{}")
        if (!locationData.coordinates) {
          console.log("[v0] ERROR: No GPS coordinates available")
          setMapStatus("unavailable")
          return
        }

        const userLocation = {
          lat: locationData.coordinates.latitude,
          lng: locationData.coordinates.longitude,
        }
        console.log("[v0] ✅ User location:", userLocation)

        const loadGoogleMaps = () => {
          if (window.google && window.google.maps) {
            console.log("[v0] Google Maps API already available")
            return Promise.resolve(window.google.maps)
          }

          if (googleMapsPromise) {
            console.log("[v0] Using existing Google Maps promise")
            return googleMapsPromise
          }

          console.log("[v0] Loading Google Maps API...")
          googleMapsPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
            script.async = true
            script.defer = true

            script.onload = () => {
              console.log("[v0] ✅ Google Maps API loaded successfully!")
              resolve(window.google.maps)
            }

            script.onerror = (error) => {
              console.error("[v0] ❌ Error loading Google Maps API:", error)
              googleMapsPromise = null
              reject(error)
            }

            document.head.appendChild(script)
          })

          return googleMapsPromise
        }

        await loadGoogleMaps()
        console.log("[v0] Creating Google Map instance...")

        const googleMap = new window.google.maps.Map(mapContainerRef.current, {
          center: userLocation,
          zoom: 15,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#212121" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
            { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
            { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
          ],
        })

        console.log("[v0] ✅ Map created successfully!")

        new window.google.maps.Marker({
          position: userLocation,
          map: googleMap,
          title: "Tu ubicación",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4F46E5",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        })

        const businessMarkers = businesses.map((business, index) => {
          const marker = new window.google.maps.Marker({
            position: { lat: business.coordinates.lat, lng: business.coordinates.lng },
            map: googleMap,
            title: business.name,
            label: {
              text: (index + 1).toString(),
              color: "white",
              fontWeight: "bold",
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: "#8B5CF6",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
          })

          marker.addListener("click", () => {
            setSelectedBusiness(business)
            onBusinessClick(business)
          })

          return marker
        })

        setMap(googleMap)
        setMarkers(businessMarkers)
        setMapStatus("ready")

        console.log("[v0] ✅ MAPA INICIALIZADO CORRECTAMENTE!")
        console.log("[v0] - Marcadores de negocios:", businessMarkers.length)
        console.log("[v0] === ÉXITO TOTAL ===")
      } catch (error) {
        console.error("[v0] ❌ ERROR FATAL:", error)
        setMapStatus("error")
      }
    }

    if (businesses.length > 0) {
      console.log("[v0] Businesses available, initializing map...")
      const timer = setTimeout(initializeMap, 200)
      return () => clearTimeout(timer)
    }
  }, [businesses, onBusinessClick])

  const handleConfigureMaps = () => {
    console.log("[v0] Configure Maps clicked - opening configuration")
  }

  if (mapStatus === "ready") {
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <div ref={mapContainerRef} className="w-full h-96"></div>
          </CardContent>
        </Card>

        {selectedBusiness && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-white">{selectedBusiness.name}</h4>
                    <p className="text-sm text-gray-400">{selectedBusiness.address}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-medium">{selectedBusiness.rating}</span>
                    </div>
                    <span className="text-purple-300 font-medium">{selectedBusiness.distance}</span>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => onCall(selectedBusiness.phone)}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Llamar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => onNavigate(selectedBusiness.address)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Ir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="h-64 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="relative">
              <MapPin className="w-16 h-16 mx-auto text-purple-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Vista de Mapa</h3>
              <p className="text-gray-300 text-sm">
                {mapStatus === "loading" && "Cargando mapa interactivo..."}
                {mapStatus === "error" && "Error al cargar el mapa - Revisa la consola"}
                {mapStatus === "unavailable" && "Mapa interactivo no disponible"}
              </p>
              <p className="text-gray-400 text-xs">
                {mapStatus === "error" && "Verifica tu API key y permisos en Google Cloud Console"}
                {mapStatus === "loading" && "Inicializando contenedor del mapa..."}
                {mapStatus === "unavailable" && "Configure Google Maps API key para habilitar el mapa interactivo"}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-purple-500 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                onClick={handleConfigureMaps}
              >
                <Settings className="w-3 h-3 mr-1" />
                Configurar Maps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Ubicaciones ({businesses.length})</h3>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Vista Lista
          </Badge>
        </div>

        <div className="space-y-3">
          {businesses.map((business, index) => (
            <Card
              key={business.id}
              className={`cursor-pointer transition-all duration-200 bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-purple-500/50 ${
                selectedBusiness?.id === business.id ? "ring-2 ring-purple-500 bg-gray-800" : ""
              }`}
              onClick={() => {
                setSelectedBusiness(business)
                onBusinessClick(business)
                console.log("[v0] Selected business:", business.name)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h4 className="font-semibold text-white truncate">{business.name}</h4>
                      <p className="text-sm text-gray-400 truncate">{business.address}</p>
                    </div>

                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white font-medium">{business.rating}</span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-purple-300 font-medium">{business.distance}</span>
                      <span className="text-gray-500">•</span>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {business.category}
                      </Badge>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCall(business.phone)
                          console.log("[v0] Calling:", business.phone)
                        }}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Llamar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigate(business.address)
                          console.log("[v0] Navigating to:", business.address)
                        }}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Ir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
