"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star, MapPin, Clock, Trash2 } from "lucide-react"
import { ShareButton } from "./share-button"

interface FavoritesPageProps {
  onBusinessClick: (business: any) => void
}

export function FavoritesPage({ onBusinessClick }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadFavorites()

    // Listen for favorites changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "busca-local-favorites") {
        loadFavorites()
      }
    }

    const handleFavoritesUpdate = () => {
      loadFavorites()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate)
    }
  }, [])

  const loadFavorites = () => {
    if (typeof window !== "undefined") {
      try {
        const savedFavorites = localStorage.getItem("busca-local-favorites")
        if (savedFavorites) {
          const favoritesData = JSON.parse(savedFavorites)
          setFavorites(favoritesData)
        } else {
          setFavorites([])
        }
      } catch (error) {
        console.error("Error loading favorites:", error)
        setFavorites([])
      }
    }
  }

  const removeFavorite = (businessId: string) => {
    if (typeof window !== "undefined") {
      try {
        const updatedFavorites = favorites.filter((fav) => fav.id !== businessId)
        localStorage.setItem("busca-local-favorites", JSON.stringify(updatedFavorites))
        setFavorites(updatedFavorites)

        // Dispatch event to update other components
        window.dispatchEvent(new Event("favoritesUpdated"))
      } catch (error) {
        console.error("Error removing favorite:", error)
      }
    }
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Cargando favoritos...</div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6 pb-20">
        <div className="text-center space-y-2 py-4">
          <h2 className="text-2xl font-bold text-foreground">Mis Favoritos</h2>
          <p className="text-muted-foreground">Lugares que me gustan</p>
        </div>

        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tienes favoritos aún</h3>
          <p className="text-muted-foreground mb-4">Marca con ❤️ los lugares que te gusten para verlos aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center space-y-2 py-4">
        <h2 className="text-2xl font-bold text-foreground">Mis Favoritos</h2>
        <p className="text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? "lugar favorito" : "lugares favoritos"}
        </p>
      </div>

      <div className="space-y-4 px-2">
        {favorites.map((business) => (
          <Card
            key={business.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => onBusinessClick(business)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={business.image || "/placeholder.svg?height=200&width=400&query=restaurant"}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFavorite(business.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>

                  <ShareButton
                    business={business}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200"
                  />
                </div>

                {/* Status badge */}
                {business.isOpen && (
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-green-500 hover:bg-green-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Abierto
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg leading-tight">{business.name}</h3>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{business.rating}</span>
                      <span>({business.reviewCount})</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{business.distance}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{business.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {business.category}
                  </Badge>

                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{business.hours}</span>
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
