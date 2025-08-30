"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, MapPin, Calendar, Edit3, Save, X, Heart, Clock, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { NativeNavigation } from "@/components/native-navigation"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [currentSection, setCurrentSection] = useState("profile")
  const [userProfile, setUserProfile] = useState({
    name: "",
    gender: "",
    joinDate: "",
    phone: "",
    bio: "",
    location: "",
    favoriteCount: 0,
    searchCount: 0,
  })

  useEffect(() => {
    // Cargar datos del perfil desde localStorage
    const savedProfile = localStorage.getItem("busca-local-user")
    const savedLocation = localStorage.getItem("busca-local-location")

    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserProfile({
        name: profile.username || "Usuario",
        gender: profile.gender || "masculino",
        joinDate: profile.joinDate || "2025",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: savedLocation ? JSON.parse(savedLocation).address : "Ubicación GPS detectada",
        favoriteCount: profile.favoriteCount || 0,
        searchCount: profile.searchCount || 0,
      })
    }
  }, [])

  const handleSave = () => {
    const savedProfile = JSON.parse(localStorage.getItem("busca-local-user") || "{}")
    const updatedProfile = {
      ...savedProfile,
      username: userProfile.name,
      phone: userProfile.phone,
      bio: userProfile.bio,
      favoriteCount: userProfile.favoriteCount,
      searchCount: userProfile.searchCount,
    }

    localStorage.setItem("busca-local-user", JSON.stringify(updatedProfile))
    setIsEditing(false)

    toast({
      title: "Perfil actualizado",
      description: "Tus cambios han sido guardados exitosamente",
    })
  }

  const getAvatarImage = () => {
    if (userProfile.gender === "femenino") {
      return "/female-avatar-professional.png"
    }
    return "/male-avatar-professional.png"
  }

  const profileStats = [
    { label: "Búsquedas", value: userProfile.searchCount, icon: Star },
    { label: "Favoritos", value: userProfile.favoriteCount, icon: Heart },
    { label: "Reseñas", value: "0", icon: Clock },
  ]

  const handleSectionChange = (section: string) => {
    if (section === "profile") return // Already on profile

    if (section === "home") {
      router.push("/")
    } else {
      router.push(`/?section=${section}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Mi Perfil</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Información Principal */}
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src={getAvatarImage() || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge
                  className={`absolute -bottom-1 -right-1 text-xs px-2 py-1 ${
                    userProfile.gender === "femenino" ? "bg-pink-500 text-white" : "bg-blue-500 text-white"
                  }`}
                >
                  {userProfile.gender === "femenino" ? "♀" : "♂"}
                </Badge>
              </div>

              {/* Información básica */}
              <div className="space-y-2 w-full">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nombre
                      </Label>
                      <Input
                        id="name"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="mt-1"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Teléfono
                      </Label>
                      <Input
                        id="phone"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        className="mt-1"
                        placeholder="Tu número de teléfono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium">
                        Biografía
                      </Label>
                      <Textarea
                        id="bio"
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        className="mt-1 resize-none"
                        rows={3}
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-foreground">{userProfile.name}</h2>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {userProfile.gender === "femenino" ? "Femenino" : "Masculino"}
                    </Badge>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      Miembro desde {userProfile.joinDate}
                    </div>
                    {userProfile.bio && <p className="text-sm text-muted-foreground mt-2 px-4">{userProfile.bio}</p>}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {profileStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Información de contacto */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center">
              <User className="w-4 h-4 mr-2" />
              Información de contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-20">Teléfono:</span>
                <span className="text-foreground">{userProfile.phone || "No configurado"}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Ubicación actual</div>
                  <div className="text-foreground text-sm">{userProfile.location}</div>
                  <Badge variant="outline" className="mt-1 text-xs border-green-500/30 text-green-600">
                    GPS Activo
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón de guardar cuando está editando */}
        {isEditing && (
          <div className="fixed bottom-20 left-4 right-4 z-40">
            <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
              <Save className="w-4 h-4 mr-2" />
              Guardar cambios
            </Button>
          </div>
        )}
      </div>

      {/* NativeNavigation component */}
      <NativeNavigation currentSection={currentSection} onSectionChange={handleSectionChange} />
    </div>
  )
}
