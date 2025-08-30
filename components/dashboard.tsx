"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, LogOut, Mic, MicOff, Wifi, WifiOff } from "lucide-react"
import { SearchFilters } from "./search-filters"
import { SearchSuggestions } from "./search-suggestions"
import { BusinessDetails } from "./business-details"
import { ResultsViewToggle } from "./results-view-toggle"
import { BusinessList } from "./business-list"
import { BusinessGrid } from "./business-grid"
import { InteractiveEmbedMap } from "./interactive-embed-map"
import { DirectionsMap } from "./directions-map"
import { NativeNavigation } from "./native-navigation"
import { TrendingSection } from "./trending-section"
import { FeedbackSection } from "./feedback-section"
import { FavoritesPage } from "./favorites-page"
import { useToast } from "@/hooks/use-toast"
import { businessSearchService } from "@/lib/api-services"
import { dataStorage } from "@/lib/data/storage"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [filters, setFilters] = useState<any>({})
  const [isOnline, setIsOnline] = useState(true)
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [resultsView, setResultsView] = useState<"list" | "grid" | "map">("list")
  const [apiStatus, setApiStatus] = useState<"checking" | "configured" | "not-configured">("checking")
  const [showDirections, setShowDirections] = useState<any>(null)
  const [currentSection, setCurrentSection] = useState("home")
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [userStats, setUserStats] = useState({ searches: 0, favorites: 0, reviews: 0 })

  useEffect(() => {
    setIsMounted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })

    const updateUserStats = () => {
      const favorites = dataStorage.getUserFavorites()
      const analytics = dataStorage.getAnalytics()

      setUserStats({
        searches: analytics.searchPerformed || 0,
        favorites: favorites.length,
        reviews: analytics.reviewSubmitted || 0,
      })
    }

    updateUserStats()

    // Update stats when localStorage changes
    const handleStorageChange = () => {
      updateUserStats()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [currentSection])

  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const status = await businessSearchService.checkApiStatus()

        console.log("[v0] API status check result:", status)

        if (status.configured) {
          setApiStatus("configured")
          toast({
            title: "APIs configuradas",
            description: "Usando datos reales de Google Places y Foursquare",
          })
        } else {
          setApiStatus("not-configured")
          toast({
            title: "APIs no configuradas",
            description: "Usando datos de ejemplo. Configura las API keys para datos reales.",
          })
        }
      } catch (error) {
        console.error("[v0] Error checking API status:", error)
        setApiStatus("not-configured")
        toast({
          title: "Error verificando APIs",
          description: "Usando datos de ejemplo por seguridad.",
        })
      }
    }

    checkApiConfig()
  }, [toast])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const mockBusinesses = [
    {
      id: 1,
      name: "Pollería El Dorado",
      category: "Pollería",
      rating: 4.5,
      reviewCount: 127,
      distance: "0.3 km",
      address: "Av. Principal 123, Ate",
      phone: "+51 999 888 777",
      hours: "Abierto hasta 11:00 PM",
      isOpen: true,
      priceLevel: "budget",
      deliveryTime: "25-35 min",
      image: "/polleria-restaurant.png",
      specialties: ["Pollo a la brasa", "Papas fritas", "Ensalada criolla"],
      coordinates: { lat: -12.0464, lng: -76.9475 },
    },
    {
      id: 2,
      name: "Chifa Dragón Dorado",
      category: "Chifa",
      rating: 4.2,
      reviewCount: 89,
      distance: "0.5 km",
      address: "Jr. Los Olivos 456, Ate",
      phone: "+51 999 777 666",
      hours: "Abierto hasta 10:30 PM",
      isOpen: true,
      priceLevel: "mid",
      deliveryTime: "30-40 min",
      image: "/chifa-chinese-restaurant.png",
      specialties: ["Arroz chaufa", "Tallarín saltado", "Wantán frito"],
      coordinates: { lat: -12.0484, lng: -76.9455 },
    },
    {
      id: 3,
      name: "Broaster Express",
      category: "Broaster",
      rating: 4.6,
      reviewCount: 156,
      distance: "0.4 km",
      address: "Av. Separadora Industrial 234, Ate",
      phone: "+51 999 666 555",
      hours: "Abierto hasta 12:00 AM",
      isOpen: true,
      priceLevel: "budget",
      deliveryTime: "20-30 min",
      image: "/polleria-restaurant.png",
      specialties: ["Pollo broaster", "Papas rellenas", "Salchipapas"],
      coordinates: { lat: -12.0454, lng: -76.9485 },
    },
    {
      id: 4,
      name: "Cevichería El Pescador",
      category: "Cevichería",
      rating: 4.8,
      reviewCount: 203,
      distance: "0.6 km",
      address: "Calle Los Pescadores 567, Ate",
      phone: "+51 999 555 444",
      hours: "Abierto hasta 6:00 PM",
      isOpen: true,
      priceLevel: "mid",
      deliveryTime: "35-45 min",
      image: "/marisqueria-peruana.png",
      specialties: ["Ceviche mixto", "Tiradito", "Leche de tigre"],
      coordinates: { lat: -12.0474, lng: -76.9465 },
    },
    {
      id: 5,
      name: "Restobar La Noche",
      category: "Restobar",
      rating: 4.4,
      reviewCount: 178,
      distance: "0.8 km",
      address: "Av. Nicolás Ayllón 890, Ate",
      phone: "+51 999 444 333",
      hours: "Abierto hasta 2:00 AM",
      isOpen: true,
      priceLevel: "expensive",
      deliveryTime: "40-50 min",
      image: "/peruvian-restaurant-criollo.png",
      specialties: ["Anticuchos", "Pisco sour", "Parrillas"],
      coordinates: { lat: -12.0494, lng: -76.9445 },
    },
    {
      id: 6,
      name: "Restaurante Sabor Criollo",
      category: "Restaurante",
      rating: 4.7,
      reviewCount: 203,
      distance: "0.8 km",
      address: "Calle Lima 789, Ate",
      phone: "+51 999 666 555",
      hours: "Abierto hasta 9:00 PM",
      isOpen: true,
      priceLevel: "mid",
      deliveryTime: "35-45 min",
      image: "/peruvian-restaurant-criollo.png",
      specialties: ["Lomo saltado", "Ají de gallina", "Anticuchos"],
      coordinates: { lat: -12.0444, lng: -76.9495 },
    },
    {
      id: 7,
      name: "Pizzería Mama Mía",
      category: "Pizzería",
      rating: 4.3,
      reviewCount: 156,
      distance: "1.2 km",
      address: "Av. Benavides 321, Ate",
      phone: "+51 999 555 444",
      hours: "Abierto hasta 12:00 AM",
      isOpen: true,
      priceLevel: "mid",
      deliveryTime: "20-30 min",
      image: "/pizzeria-italiana.png",
      specialties: ["Pizza margherita", "Lasagna", "Tiramisu"],
      coordinates: { lat: -12.0504, lng: -76.9435 },
    },
    {
      id: 8,
      name: "Café Central",
      category: "Cafetería",
      rating: 4.6,
      reviewCount: 92,
      distance: "0.4 km",
      address: "Jr. Unión 654, Ate",
      phone: "+51 999 444 333",
      hours: "Abierto hasta 8:00 PM",
      isOpen: true,
      priceLevel: "budget",
      deliveryTime: "15-25 min",
      image: "/cafe-moderno.png",
      specialties: ["Café de especialidad", "Pasteles", "Sandwiches"],
      coordinates: { lat: -12.0474, lng: -76.9465 },
    },
  ]

  const categories = [
    { name: "Pollerías", icon: "🍗" },
    { name: "Broaster", icon: "🍗" },
    { name: "Chifas", icon: "🥡" },
    { name: "Cevicherías", icon: "🐟" },
    { name: "Restaurantes", icon: "🍽️" },
    { name: "Restobares", icon: "🍻" },
    { name: "Pizzerías", icon: "🍕" },
    { name: "Cafeterías", icon: "☕" },
  ]

  const handleSearch = async (query: string, appliedFilters = filters) => {
    if (!query.trim()) return

    setIsSearching(true)
    setSearchQuery(query)
    setShowSuggestions(false)
    setCurrentSection("search")

    await dataStorage.addSearch(query)

    const locationData = JSON.parse(localStorage.getItem("busca-local-location") || "{}")

    console.log("[v0] ===== DEBUGGING BÚSQUEDA =====")
    console.log("[v0] Query recibido:", query)
    console.log("[v0] Query tipo:", typeof query)
    console.log("[v0] Query length:", query.length)
    console.log("[v0] Query trim:", query.trim())
    console.log("[v0] Iniciando búsqueda para:", query)
    console.log("[v0] Ubicación del usuario:", locationData)

    if (locationData.coordinates) {
      console.log("[v0] Coordenadas GPS del usuario:")
      console.log("[v0] Latitud:", locationData.coordinates.latitude)
      console.log("[v0] Longitud:", locationData.coordinates.longitude)
      console.log("[v0] Precisión GPS:", locationData.coordinates.accuracy, "metros")
    }

    try {
      if (apiStatus === "configured" && isOnline) {
        console.log("[v0] Usando datos reales de APIs")

        if (!locationData.coordinates) {
          console.log("[v0] ERROR: No hay coordenadas GPS disponibles")
          toast({
            title: "Ubicación GPS requerida",
            description: "Activa tu GPS para buscar negocios cercanos a tu ubicación actual",
            variant: "destructive",
          })
          setIsSearching(false)
          return
        }

        const searchParams = {
          query,
          location: {
            latitude: locationData.coordinates.latitude,
            longitude: locationData.coordinates.longitude,
          },
          radius: appliedFilters.distance ? appliedFilters.distance[0] * 1000 : 2000,
          filters: {
            rating: appliedFilters.rating?.[0],
            priceLevel: appliedFilters.priceRange,
            openNow: appliedFilters.openNow,
          },
        }

        console.log("[v0] ===== PARÁMETROS DE BÚSQUEDA =====")
        console.log("[v0] searchParams completo:", JSON.stringify(searchParams, null, 2))
        console.log("[v0] searchParams.query:", searchParams.query)
        console.log("[v0] Radio de búsqueda:", searchParams.radius, "metros")

        const results = await businessSearchService.searchBusinesses(searchParams)
        console.log("[v0] Resultados de API real:", results.length, "negocios encontrados")

        if (results.length > 0) {
          console.log("[v0] Primeros 3 resultados:")
          results.slice(0, 3).forEach((business, index) => {
            console.log(`[v0] ${index + 1}. ${business.name} - ${business.address} - Rating: ${business.rating}`)
          })
        }

        if (results.length === 0) {
          toast({
            title: "No se encontraron resultados",
            description: "Pruebe con otra palabra",
            variant: "destructive",
          })
          const mockResults = getMockResults(query, appliedFilters, locationData.coordinates)
          setSearchResults(mockResults)
        } else {
          setSearchResults(results)
          toast({
            title: "Búsqueda completada",
            description: `Se encontraron ${results.length} lugares cerca de tu ubicación`,
          })
        }
      } else {
        console.log("[v0] Usando datos mock - API no configurada o sin conexión")
        const mockResults = getMockResults(query, appliedFilters, locationData.coordinates)

        if (mockResults.length === 0) {
          toast({
            title: "No se encontraron resultados",
            description: "Pruebe con otra palabra",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Búsqueda completada",
            description: `Se encontraron ${mockResults.length} lugares cerca de tu ubicación`,
          })
        }

        setSearchResults(mockResults)

        if (!isOnline) {
          toast({
            title: "Modo sin conexión",
            description: "Mostrando resultados de ejemplo basados en tu ubicación GPS.",
          })
        } else if (apiStatus === "not-configured") {
          toast({
            title: "APIs no configuradas",
            description: "Mostrando datos de ejemplo filtrados por tu ubicación GPS.",
          })
        }
      }
    } catch (error) {
      console.error("[v0] Error en búsqueda:", error)

      const errorMessage = error instanceof Error ? error.message : "Error desconocido"

      if (errorMessage.includes("ZERO_RESULTS") || errorMessage.includes("No se encontraron")) {
        toast({
          title: "Sin resultados",
          description: "No encontramos lugares que coincidan con tu búsqueda. Intenta con otros términos.",
          variant: "destructive",
        })
      } else if (errorMessage.includes("conexión") || errorMessage.includes("network")) {
        toast({
          title: "Error de conexión",
          description: "Verifica tu conexión a internet e intenta nuevamente.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error en la búsqueda",
          description: "Ocurrió un problema inesperado. Intenta con otros términos.",
          variant: "destructive",
        })
      }

      // Fallback to mock data on error
      const mockResults = getMockResults(query, appliedFilters, locationData.coordinates)
      setSearchResults(mockResults)
    }

    setIsSearching(false)
  }

  const getMockResults = (query: string, appliedFilters: any, userCoordinates?: any) => {
    console.log("[v0] Filtrando datos mock con coordenadas GPS:", userCoordinates)

    let filteredBusinesses = mockBusinesses.filter((business) => {
      const searchTerms = [
        business.name.toLowerCase(),
        business.category.toLowerCase(),
        ...business.specialties.map((s) => s.toLowerCase()),
      ].join(" ")

      const queryLower = query.toLowerCase()
      const matchesQuery =
        searchTerms.includes(queryLower) ||
        (queryLower.includes("broaster") && business.category.toLowerCase().includes("broaster")) ||
        (queryLower.includes("ceviche") && business.category.toLowerCase().includes("cevichería")) ||
        (queryLower.includes("restobar") && business.category.toLowerCase().includes("restobar")) ||
        (queryLower.includes("pollo") &&
          (business.category.toLowerCase().includes("pollería") ||
            business.category.toLowerCase().includes("broaster")))

      const matchesFilters =
        (!appliedFilters.rating || business.rating >= appliedFilters.rating[0]) &&
        (!appliedFilters.priceRange ||
          appliedFilters.priceRange === "all" ||
          business.priceLevel === appliedFilters.priceRange) &&
        (!appliedFilters.openNow || business.isOpen)

      return matchesQuery && matchesFilters
    })

    if (userCoordinates) {
      filteredBusinesses = filteredBusinesses.map((business) => {
        const distance = calculateDistance(
          userCoordinates.latitude,
          userCoordinates.longitude,
          business.coordinates.lat,
          business.coordinates.lng,
        )

        console.log(`[v0] ${business.name} está a ${distance.toFixed(2)} km de tu ubicación`)

        return {
          ...business,
          distance: `${distance.toFixed(1)} km`,
          calculatedDistance: distance,
        }
      })

      // Sort by distance
      filteredBusinesses.sort((a, b) => a.calculatedDistance - b.calculatedDistance)

      // Filter by distance if specified
      if (appliedFilters.distance) {
        const maxDistance = appliedFilters.distance[0]
        filteredBusinesses = filteredBusinesses.filter((business) => business.calculatedDistance <= maxDistance)
        console.log(`[v0] Filtrados por distancia máxima de ${maxDistance} km:`, filteredBusinesses.length, "negocios")
      }
    }

    console.log("[v0] Resultados finales filtrados:", filteredBusinesses.length, "negocios")
    filteredBusinesses.forEach((business, index) => {
      console.log(`[v0] ${index + 1}. ${business.name} - ${business.distance} - ${business.address}`)
    })

    return filteredBusinesses
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Búsqueda por voz no disponible",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      })
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "es-ES"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      handleSearch(transcript)
    }

    recognition.onerror = () => {
      toast({
        title: "Error en búsqueda por voz",
        description: "No se pudo procesar el audio. Intenta de nuevo.",
        variant: "destructive",
      })
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleSectionChange = (section: string) => {
    setCurrentSection(section)

    if (section !== "search") {
      setSelectedBusiness(null)
      setShowDirections(null)
    }
  }

  const userData =
    isMounted && typeof window !== "undefined" ? JSON.parse(localStorage.getItem("busca-local-user") || "{}") : {}
  const locationData =
    isMounted && typeof window !== "undefined" ? JSON.parse(localStorage.getItem("busca-local-location") || "{}") : {}

  const displayName = userData.name || userData.username || "Usuario"

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "trending":
        return <TrendingSection onBusinessClick={setSelectedBusiness} />
      case "feedback":
        return <FeedbackSection />
      case "favorites":
        return <FavoritesPage onBusinessClick={setSelectedBusiness} />
      case "profile":
        return (
          <div className="space-y-4 pb-20">
            <div className="max-w-md mx-auto bg-card rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="relative inline-block">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted mx-auto">
                    {userData.gender === "otro" ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {displayName.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    ) : (
                      <img
                        src={
                          userData.gender === "masculino"
                            ? "/male-avatar-professional.png"
                            : "/female-avatar-professional.png"
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">{displayName}</h2>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs sm:text-sm px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                      {userData.gender === "masculino"
                        ? "👨 Masculino"
                        : userData.gender === "femenino"
                          ? "👩 Femenino"
                          : "👤 Usuario"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Miembro desde {new Date().getFullYear()}</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm">📞</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-sm sm:text-base text-foreground">{userData.phone || "No configurado"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <span className="text-sm">📍</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Ubicación</p>
                    <p className="text-sm sm:text-base text-foreground">GPS detectado</p>
                    <p className="text-xs text-green-500 font-medium">GPS Activo</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{userStats.searches}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Búsquedas</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{userStats.favorites}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Favoritos</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{userStats.reviews}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Reseñas</div>
                </div>
              </div>
            </div>
          </div>
        )
      case "search":
      case "home":
      default:
        return (
          <div className="space-y-4 sm:space-y-6 pb-20">
            <div className="text-center space-y-2 py-2 sm:py-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ¡Hola, {displayName}!
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">¿Qué te gustaría comer hoy?</p>
            </div>

            <div className="space-y-2 max-w-2xl mx-auto px-2 sm:px-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-20 h-12 text-sm sm:text-base bg-input border-border focus:border-primary"
                />
                <div className="absolute right-1 top-1 flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 btn-hover-effect"
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-red-400" />
                    ) : (
                      <Mic className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    className="h-10 px-3 sm:px-4 btn-hover-effect bg-white text-black hover:bg-primary hover:text-white text-sm"
                    onClick={() => handleSearch(searchQuery)}
                    disabled={isSearching}
                    size="sm"
                  >
                    {isSearching ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>

              {showSuggestions && searchQuery.length >= 0 && (
                <SearchSuggestions
                  query={searchQuery}
                  onSuggestionClick={(suggestion) => {
                    setSearchQuery(suggestion)
                    handleSearch(suggestion)
                  }}
                  userLocation={locationData}
                />
              )}
            </div>

            <div className="px-2 sm:px-0">
              <SearchFilters
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters)
                  if (searchQuery) {
                    handleSearch(searchQuery, newFilters)
                  }
                }}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />
            </div>

            {!searchResults.length && (
              <div className="max-w-4xl mx-auto px-2 sm:px-0">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-center">Categorías populares</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {categories.map((category) => (
                    <Card
                      key={category.name}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border hover:border-primary"
                      onClick={() => handleSearch(category.name)}
                    >
                      <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                        <div className="text-2xl sm:text-3xl md:text-4xl mb-2">{category.icon}</div>
                        <h4 className="font-medium text-xs sm:text-sm md:text-base">{category.name}</h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="px-2 sm:px-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <h3 className="text-base sm:text-lg font-semibold">Resultados para "{searchQuery}"</h3>
                    <Badge variant="secondary" className="w-fit">
                      {searchResults.length} encontrados
                    </Badge>
                  </div>
                  <ResultsViewToggle currentView={resultsView} onViewChange={setResultsView} />
                </div>

                {resultsView === "list" && (
                  <BusinessList
                    businesses={searchResults}
                    onBusinessClick={setSelectedBusiness}
                    onCall={(phone) => window.open(`tel:${phone}`, "_self")}
                    onNavigate={(address, business) => setShowDirections(business)}
                  />
                )}
                {resultsView === "grid" && (
                  <BusinessGrid
                    businesses={searchResults}
                    onBusinessClick={setSelectedBusiness}
                    onCall={(phone) => window.open(`tel:${phone}`, "_self")}
                    onNavigate={(address, business) => setShowDirections(business)}
                  />
                )}
                {resultsView === "map" && (
                  <InteractiveEmbedMap
                    businesses={searchResults}
                    onBusinessClick={setSelectedBusiness}
                    onCall={(phone) => window.open(`tel:${phone}`, "_self")}
                    onNavigate={(address, business) => setShowDirections(business)}
                  />
                )}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8 px-4">
                <p className="text-red-500 font-medium mb-4 text-sm sm:text-base">
                  No se encontraron resultados para "{searchQuery}"
                </p>
                <p className="text-red-400 mb-4 text-sm sm:text-base">Pruebe con otra palabra</p>
                <Button variant="outline" onClick={() => setShowFilters(true)} className="text-sm">
                  Ajustar filtros de búsqueda
                </Button>
              </div>
            )}
          </div>
        )
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-3 sm:p-4 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate">BuscaLocal</h1>
              {!isOnline && <WifiOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              {isOnline && apiStatus === "configured" && <Wifi className="w-4 h-4 text-green-400 flex-shrink-0" />}
              {isOnline && apiStatus === "not-configured" && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  Demo
                </Badge>
              )}
              {apiStatus === "checking" && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  Verificando...
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center truncate">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {locationData.address || `${locationData.district}, ${locationData.cityLabel}`}
              </span>
              {locationData.coordinates && (
                <Badge variant="outline" className="ml-2 text-xs text-green-400 flex-shrink-0">
                  GPS Activo
                </Badge>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onLogout} className="btn-hover-effect p-2">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        {selectedBusiness && <BusinessDetails business={selectedBusiness} />}
        {showDirections && (
          <DirectionsMap
            business={showDirections}
            userLocation={locationData.coordinates || { latitude: -12.075008, longitude: -77.021184 }}
            onBack={() => setShowDirections(null)}
          />
        )}
        {!selectedBusiness && !showDirections && renderCurrentSection()}
      </div>

      <NativeNavigation currentSection={currentSection} onSectionChange={handleSectionChange} />
    </div>
  )
}
