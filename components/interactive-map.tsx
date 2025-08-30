"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Navigation, AlertCircle, Loader2 } from "lucide-react"

interface InteractiveMapProps {
  businesses: any[]
  onBusinessClick: (business: any) => void
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function InteractiveMap({ businesses, onBusinessClick, onCall, onNavigate }: InteractiveMapProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    window.initMap = initializeMap
    return () => {
      delete window.initMap
    }
  }, [])

  const loadGoogleMapsScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        if (window.google && window.google.maps) {
          console.log("[v0] Google Maps ya está cargado")
          resolve()
        } else {
          console.log("[v0] Script existe pero Google Maps no está disponible")
          reject(new Error("Google Maps script exists but not loaded"))
        }
        return
      }

      const API_KEY = "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8"
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log("[v0] ✅ Google Maps script cargado")
        resolve()
      }

      script.onerror = (error) => {
        console.error("[v0] ❌ Error cargando Google Maps:", error)
        reject(error)
      }

      document.head.appendChild(script)
      console.log("[v0] Script de Google Maps agregado al DOM")
    })
  }

  const initializeMap = () => {
    try {
      console.log("[v0] === INICIALIZANDO MAPA INTERACTIVO ===")
      console.log("[v0] mapRef.current:", mapRef.current)

      if (!mapRef.current) {
        console.error("[v0] ❌ Contenedor del mapa no disponible")
        setMapError("Contenedor del mapa no disponible")
        return
      }

      if (!window.google || !window.google.maps) {
        console.error("[v0] ❌ Google Maps API no disponible")
        setMapError("Google Maps API no disponible")
        return
      }

      const locationData = JSON.parse(localStorage.getItem("busca-local-location") || "{}")
      if (!locationData.coordinates) {
        console.error("[v0] ❌ No hay coordenadas GPS disponibles")
        setMapError("No hay coordenadas GPS disponibles")
        return
      }

      const userLocation = {
        lat: locationData.coordinates.latitude,
        lng: locationData.coordinates.longitude,
      }

      console.log("[v0] ✅ Ubicación del usuario:", userLocation)

      if (mapRef.current) {
        mapRef.current.style.width = "100%"
        mapRef.current.style.height = "384px" // h-96 = 384px
        mapRef.current.style.minHeight = "384px"
      }

      const map = new window.google.maps.Map(mapRef.current, {
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
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Tu ubicación",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4F46E5",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
      })

      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      let validBusinesses = 0
      businesses.forEach((business, index) => {
        let businessCoords = null

        if (
          business.coordinates &&
          typeof business.coordinates.latitude === "number" &&
          typeof business.coordinates.longitude === "number" &&
          !isNaN(business.coordinates.latitude) &&
          !isNaN(business.coordinates.longitude)
        ) {
          businessCoords = {
            lat: business.coordinates.latitude,
            lng: business.coordinates.longitude,
          }
          console.log("[v0] ✅ Coordenadas REALES para:", business.name, businessCoords)
        } else {
          console.log("[v0] ❌ Negocio sin coordenadas válidas:", business.name, business.coordinates)
          // Skip businesses without valid coordinates instead of generating fake ones
          return
        }

        try {
          const marker = new window.google.maps.Marker({
            position: { lat: businessCoords.lat, lng: businessCoords.lng },
            map: map,
            title: business.name,
            label: {
              text: (validBusinesses + 1).toString(),
              color: "white",
              fontWeight: "bold",
              fontSize: "12px",
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 18,
              fillColor: "#8B5CF6",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
          })

          marker.addListener("click", () => {
            setSelectedBusiness(business)
            onBusinessClick(business)
            console.log("[v0] Negocio seleccionado:", business.name)
          })

          markersRef.current.push(marker)
          validBusinesses++
        } catch (markerError) {
          console.error("[v0] ❌ Error creando marcador para:", business.name, markerError)
        }
      })

      mapInstance.current = map

      setTimeout(() => {
        if (window.google && window.google.maps && map) {
          window.google.maps.event.trigger(map, "resize")
          map.setCenter(userLocation)
          console.log("[v0] ✅ Mapa redimensionado y centrado")
        }
      }, 100)

      console.log("[v0] ✅ Estableciendo mapLoaded = true")
      setMapLoaded(true)
      setMapError(null)
      setIsLoading(false)

      console.log("[v0] ✅ MAPA INICIALIZADO EXITOSAMENTE!")
      console.log("[v0] - Marcadores creados:", validBusinesses)

      setTimeout(() => {
        console.log("[v0] Estado final - mapLoaded:", true, "isLoading:", false, "mapError:", null)
      }, 200)
    } catch (error) {
      console.error("[v0] ❌ Error inicializando mapa:", error)
      setMapError(`Error: ${error.message}`)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (businesses.length > 0 && !mapLoaded && !isLoading) {
      console.log("[v0] Iniciando carga del mapa...")
      setIsLoading(true)
      setMapError(null)

      loadGoogleMapsScript()
        .then(() => {
          console.log("[v0] Script cargado, inicializando mapa...")
          setTimeout(initializeMap, 100)
        })
        .catch((error) => {
          console.error("[v0] Error cargando script:", error)
          setMapError("Error cargando Google Maps")
          setIsLoading(false)
        })
    }
  }, [businesses, mapLoaded, isLoading])

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-gray-900 border-gray-700">
        <CardContent className="p-0 relative">
          {/* Contenedor del mapa siempre presente */}
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg relative z-10"
            style={{
              minHeight: "384px",
              height: "384px",
              backgroundColor: "#1f2937", // Fallback color for debugging
            }}
          ></div>

          {/* Overlay de carga/error que se muestra encima del mapa */}
          {(!mapLoaded || isLoading || mapError) && (
            <div
              className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center rounded-lg z-20"
              style={{
                display: mapLoaded && !isLoading && !mapError ? "none" : "flex",
              }}
            >
              <div className="text-center space-y-3">
                <div className="relative">
                  {isLoading ? (
                    <Loader2 className="w-16 h-16 mx-auto text-purple-400 animate-spin" />
                  ) : (
                    <>
                      <MapPin className="w-16 h-16 mx-auto text-purple-400" />
                      {mapError && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    {isLoading ? "Cargando Mapa..." : "Vista de Mapa"}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {isLoading && "Inicializando Google Maps..."}
                    {mapError && `Error: ${mapError}`}
                    {!isLoading && !mapError && !mapLoaded && "Esperando datos de negocios..."}
                  </p>
                  {mapError && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-purple-500 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                      onClick={() => {
                        console.log("[v0] Reintentando carga del mapa...")
                        setMapError(null)
                        setIsLoading(false)
                        setMapLoaded(false)
                      }}
                    >
                      Reintentar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {console.log(
            "[v0] Overlay state - mapLoaded:",
            mapLoaded,
            "isLoading:",
            isLoading,
            "mapError:",
            mapError,
            "shouldShowOverlay:",
            !mapLoaded || isLoading || mapError,
          )}
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => onNavigate(selectedBusiness.address)}
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Cómo llegar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {businesses.map((business, index) => (
        <div key={index} className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(business.address)
              console.log("[v0] Navigating to:", business.address)
            }}
          >
            <Navigation className="w-3 h-3 mr-1" />
            Cómo llegar
          </Button>
        </div>
      ))}
    </div>
  )
}
