"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Heart, Clock, Star, Phone, Edit3, ArrowLeft, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfileProps {
  onBack: () => void
}

export function UserProfile({ onBack }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState<any>({})
  const [locationData, setLocationData] = useState<any>({})
  const [favorites, setFavorites] = useState<any[]>([])
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const { toast } = useToast()

  const refreshFavorites = () => {
    if (typeof window !== "undefined") {
      const favs = JSON.parse(localStorage.getItem("busca-local-favorites") || "[]")
      setFavorites(favs)
    }
  }

  useEffect(() => {
    // Load user data
    const user = JSON.parse(localStorage.getItem("busca-local-user") || "{}")
    const location = JSON.parse(localStorage.getItem("busca-local-location") || "{}")
    const favs = JSON.parse(localStorage.getItem("busca-local-favorites") || "[]")
    const history = JSON.parse(localStorage.getItem("busca-local-search-history") || "[]")

    setUserData(user)
    setLocationData(location)
    setFavorites(favs)
    setSearchHistory(history.slice(0, 10)) // Last 10 searches

    refreshFavorites()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "busca-local-favorites") {
        refreshFavorites()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshFavorites()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleSaveProfile = () => {
    localStorage.setItem("busca-local-user", JSON.stringify(userData))
    setIsEditing(false)
    toast({
      title: "Perfil actualizado",
      description: "Tus datos han sido guardados correctamente",
    })
  }

  const handleRemoveFavorite = (businessId: string) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== businessId)
    setFavorites(updatedFavorites)
    localStorage.setItem("busca-local-favorites", JSON.stringify(updatedFavorites))
    toast({
      title: "Favorito eliminado",
      description: "El negocio ha sido removido de tus favoritos",
    })
  }

  const handleClearHistory = () => {
    setSearchHistory([])
    localStorage.setItem("busca-local-search-history", JSON.stringify([]))
    toast({
      title: "Historial limpiado",
      description: "Tu historial de búsquedas ha sido eliminado",
    })
  }

  const getGenderAvatar = (gender: string) => {
    if (gender === "masculino") {
      return "/male-avatar-professional.png"
    } else if (gender === "femenino") {
      return "/female-avatar-professional.png"
    }
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getLocationDisplay = () => {
    if (locationData.address) {
      // Truncar dirección larga para móviles
      return locationData.address.length > 30 ? `${locationData.address.substring(0, 30)}...` : locationData.address
    }
    if (locationData.district && locationData.cityLabel) {
      return `${locationData.district}, ${locationData.cityLabel}`
    }
    return "Ubicación no disponible"
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border px-3 py-2 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1.5 h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold text-primary">Mi Perfil</h1>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            className="text-xs px-2.5 py-1.5 h-8"
          >
            {isEditing ? (
              "Guardar"
            ) : (
              <>
                <Edit3 className="w-3 h-3 mr-1" />
                Editar
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-3 py-3 space-y-3">
        {/* Profile Info */}
        <Card>
          <CardHeader className="text-center pb-2 px-3 pt-3">
            {getGenderAvatar(userData.gender) ? (
              <Avatar className="w-16 h-16 mx-auto mb-2">
                <AvatarImage src={getGenderAvatar(userData.gender) || "/placeholder.svg"} />
                <AvatarFallback className="text-base bg-primary text-primary-foreground">
                  {getInitials(userData.username || userData.name || "Usuario")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-16 h-16 mx-auto mb-2 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                {getInitials(userData.username || userData.name || "Usuario")}
              </div>
            )}
            <CardTitle className="text-lg leading-tight">{userData.username || userData.name || "Usuario"}</CardTitle>
            <CardDescription className="space-y-1">
              {userData.gender && (
                <Badge variant="outline" className="mb-1.5 text-xs px-2 py-0.5">
                  {userData.gender === "masculino"
                    ? "👨 Masculino"
                    : userData.gender === "femenino"
                      ? "👩 Femenino"
                      : "🧑 Otro"}
                </Badge>
              )}
              <div className="text-xs text-muted-foreground">Miembro desde {new Date().getFullYear()}</div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 px-3 pb-3">
            {isEditing ? (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-xs">
                    Nombre de usuario
                  </Label>
                  <Input
                    id="username"
                    value={userData.username || ""}
                    onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    placeholder="Tu nombre de usuario"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    value={userData.name || ""}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={userData.phone || ""}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    placeholder="+51 999 999 999"
                    className="text-sm h-8"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{userData.phone || "No configurado"}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-tight">
                      {locationData.coordinates ? (
                        <div className="space-y-1">
                          <span className="block text-xs text-muted-foreground">
                            Ubicación GPS detectada automáticamente
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs text-green-600 border-green-600/20 bg-green-50 dark:bg-green-950/20"
                          >
                            GPS Activo
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm">{getLocationDisplay()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="flex items-center space-x-1.5 text-sm">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>Mis Favoritos</span>
            </CardTitle>
            <CardDescription className="text-xs">Negocios que has marcado como favoritos</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {favorites.length > 0 ? (
              <div className="space-y-2">
                {favorites.map((business) => (
                  <div key={business.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">
                          {business.category === "Pollería" ? "🍗" : business.category === "Chifa" ? "🥡" : "🍽️"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs truncate">{business.name}</h4>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          <span>{business.rating}</span>
                          <span>•</span>
                          <span>{business.distance}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(business.id)}
                      className="text-red-500 hover:text-red-600 p-1 h-7 w-7"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Heart className="w-8 h-8 mx-auto mb-1.5 opacity-50" />
                <p className="text-xs">No tienes favoritos aún</p>
                <p className="text-xs opacity-75">Marca negocios como favoritos para verlos aquí</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search History */}
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-1.5 text-sm">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Historial de Búsquedas</span>
                </CardTitle>
                <CardDescription className="text-xs">Tus búsquedas más recientes</CardDescription>
              </div>
              {searchHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-xs px-2 py-1 h-7 bg-transparent"
                >
                  <Trash2 className="w-2.5 h-2.5 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {searchHistory.length > 0 ? (
              <div className="space-y-1">
                {searchHistory.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 hover:bg-muted/50 rounded text-xs"
                  >
                    <span className="truncate flex-1 mr-2">{search.query}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{search.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-1.5 opacity-50" />
                <p className="text-xs">No hay búsquedas recientes</p>
                <p className="text-xs opacity-75">Tu historial de búsquedas aparecerá aquí</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
