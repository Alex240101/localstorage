"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MapPin, Heart, Navigation, Truck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ShareButton from "@/components/share-button"

interface BusinessCardProps {
  business: any
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

export function BusinessCard({ business, onCall, onNavigate }: BusinessCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const favorites = JSON.parse(localStorage.getItem("busca-local-favorites") || "[]")
      const isBusinessFavorite = favorites.some((fav: any) => fav.id === business.id)
      setIsFavorite(isBusinessFavorite)
    }
  }, [business.id])

  const handleFavorite = () => {
    if (typeof window === "undefined") return

    const favorites = JSON.parse(localStorage.getItem("busca-local-favorites") || "[]")

    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: any) => fav.id !== business.id)
      localStorage.setItem("busca-local-favorites", JSON.stringify(updatedFavorites))
      setIsFavorite(false)
      toast({
        title: "Eliminado de favoritos",
        description: `${business.name} eliminado de tus favoritos`,
      })
    } else {
      const favoriteData = {
        id: business.id,
        name: business.name,
        category: business.category,
        rating: business.rating,
        distance: business.distance,
        address: business.address,
        image: business.image,
        priceLevel: business.priceLevel,
        reviewCount: business.reviewCount,
        hours: business.hours,
        isOpen: business.isOpen,
        specialties: business.specialties,
        addedAt: new Date().toISOString(),
      }
      const updatedFavorites = [...favorites, favoriteData]
      localStorage.setItem("busca-local-favorites", JSON.stringify(updatedFavorites))
      setIsFavorite(true)
      toast({
        title: "Agregado a favoritos",
        description: `${business.name} agregado a tus favoritos`,
      })
    }
  }

  const getPriceLevel = (level: string) => {
    switch (level) {
      case "budget":
        return "S/"
      case "mid":
        return "S/S/"
      case "expensive":
        return "S/S/S/"
      default:
        return "S/"
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] bg-card border-border">
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={business.image || "/placeholder.svg"}
            alt={business.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm border-0 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
            onClick={handleFavorite}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`}
            />
          </Button>
          <div className="h-8 w-8">
            <ShareButton
              businessName={business.name}
              title={`${business.name} - ${business.category}`}
              text={`Encontré ${business.name} en BuscaLocal. ${business.address}`}
              className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm border-0 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg text-gray-600 hover:text-purple-600"
            />
          </div>
        </div>
        {business.isOpen && (
          <Badge className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur-sm border-0 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Abierto
          </Badge>
        )}
      </div>

      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-lg md:text-xl text-foreground line-clamp-1">{business.name}</h3>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {business.category}
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">{getPriceLevel(business.priceLevel)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{business.rating}</span>
              <span>({business.reviewCount})</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">{business.distance}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground flex items-start line-clamp-2">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
            {business.address}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{business.hours}</span>
            </div>
            {business.deliveryTime && (
              <div className="flex items-center text-green-400">
                <Truck className="w-4 h-4 mr-1" />
                <span>{business.deliveryTime}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              className="w-full bg-white text-black hover:bg-primary hover:text-white transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onNavigate(business.address)
              }}
            >
              <Navigation className="w-4 h-4 mr-1" />
              Cómo llegar
            </Button>
          </div>

          {business.specialties && business.specialties.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Especialidades:</p>
              <div className="flex flex-wrap gap-1">
                {business.specialties.slice(0, 3).map((specialty: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-muted/50 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors duration-200"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
