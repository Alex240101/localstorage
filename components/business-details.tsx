"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Star,
  Phone,
  Clock,
  MapPin,
  Heart,
  Share2,
  Navigation,
  Camera,
  MessageCircle,
  ThumbsUp,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BusinessDetailsProps {
  business: any
  onBack: () => void
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

export function BusinessDetails({ business, onBack, onCall, onNavigate }: BusinessDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [newReview, setNewReview] = useState("")
  const [userRating, setUserRating] = useState(0)
  const { toast } = useToast()

  // Mock additional data for detailed view
  const detailedBusiness = {
    ...business,
    description:
      "Deliciosa comida casera preparada con ingredientes frescos y recetas tradicionales. Un ambiente acogedor perfecto para disfrutar en familia.",
    images: [
      business.image || "/placeholder.svg",
      "/restaurant-interior.png",
      "/food-platter.png",
      "/chef-cooking.png",
    ],
    hours: {
      monday: "9:00 AM - 10:00 PM",
      tuesday: "9:00 AM - 10:00 PM",
      wednesday: "9:00 AM - 10:00 PM",
      thursday: "9:00 AM - 10:00 PM",
      friday: "9:00 AM - 11:00 PM",
      saturday: "9:00 AM - 11:00 PM",
      sunday: "10:00 AM - 9:00 PM",
    },
    amenities: ["WiFi gratis", "Estacionamiento", "Delivery", "Para llevar", "Tarjetas de crédito"],
    menu: [
      { name: "Pollo a la brasa", price: "S/ 25", description: "Pollo entero con papas y ensalada" },
      { name: "Arroz chaufa", price: "S/ 18", description: "Arroz frito con pollo y verduras" },
      { name: "Lomo saltado", price: "S/ 22", description: "Carne salteada con papas y arroz" },
    ],
    reviews: [
      {
        id: 1,
        user: "María González",
        avatar: "/user-avatar-1.png",
        rating: 5,
        date: "Hace 2 días",
        comment: "Excelente comida y muy buen servicio. El pollo a la brasa estaba delicioso y las papas perfectas.",
        helpful: 12,
      },
      {
        id: 2,
        user: "Carlos Mendoza",
        avatar: "/user-avatar-2.png",
        rating: 4,
        date: "Hace 1 semana",
        comment: "Muy buena atención y ambiente familiar. Los precios son justos para la calidad que ofrecen.",
        helpful: 8,
      },
      {
        id: 3,
        user: "Ana Rodríguez",
        avatar: "/user-avatar-3.png",
        rating: 5,
        date: "Hace 2 semanas",
        comment: "Mi lugar favorito para almorzar. Siempre fresco y sabroso. Recomiendo el arroz chaufa.",
        helpful: 15,
      },
    ],
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    const favorites = JSON.parse(localStorage.getItem("busca-local-favorites") || "[]")

    if (isFavorite) {
      const updated = favorites.filter((fav: any) => fav.id !== business.id)
      localStorage.setItem("busca-local-favorites", JSON.stringify(updated))
      toast({
        title: "Eliminado de favoritos",
        description: `${business.name} eliminado de tus favoritos`,
      })
    } else {
      favorites.push(business)
      localStorage.setItem("busca-local-favorites", JSON.stringify(favorites))
      toast({
        title: "Agregado a favoritos",
        description: `${business.name} agregado a tus favoritos`,
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `Mira este ${business.category.toLowerCase()}: ${business.name}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(`${business.name} - ${business.address}`)
      toast({
        title: "Enlace copiado",
        description: "La información del negocio se copió al portapapeles",
      })
    }
  }

  const handleSubmitReview = () => {
    if (!newReview.trim() || userRating === 0) {
      toast({
        title: "Reseña incompleta",
        description: "Por favor, agrega una calificación y comentario",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Reseña enviada",
      description: "Tu reseña ha sido enviada y será visible pronto",
    })

    setNewReview("")
    setUserRating(0)
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    )
  }

  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    }
    return days[day] || day
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleFavorite}>
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative">
            <img
              src={detailedBusiness.images[selectedImageIndex] || "/placeholder.svg"}
              alt={business.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Badge className="absolute bottom-2 right-2 bg-black/50">
              <Camera className="w-3 h-3 mr-1" />
              {selectedImageIndex + 1}/{detailedBusiness.images.length}
            </Badge>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {detailedBusiness.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`${business.name} ${index + 1}`}
                className={`w-16 h-16 object-cover rounded cursor-pointer flex-shrink-0 ${
                  selectedImageIndex === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">{business.name}</h1>
              <Badge variant="outline">{business.category}</Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                {renderStars(business.rating)}
                <span className="font-medium">{business.rating}</span>
                <span>({business.reviewCount} reseñas)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{business.distance}</span>
              </div>
            </div>
            <p className="text-muted-foreground">{detailedBusiness.description}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button className="flex-1" onClick={() => onCall(business.phone)}>
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onNavigate(business.address)}>
              <Navigation className="w-4 h-4 mr-2" />
              Cómo llegar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="menu">Menú</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Horarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(detailedBusiness.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="font-medium">{getDayName(day)}</span>
                    <span className="text-muted-foreground">{hours}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{business.address}</p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => onNavigate(business.address)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver en Google Maps
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detailedBusiness.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platos principales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailedBusiness.menu.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="font-bold text-primary">{item.price}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {/* Write Review */}
            <Card>
              <CardHeader>
                <CardTitle>Escribir reseña</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tu calificación</label>
                  {renderStars(userRating, true, setUserRating)}
                </div>
                <Textarea
                  placeholder="Comparte tu experiencia..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                />
                <Button onClick={handleSubmitReview}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar reseña
                </Button>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              {detailedBusiness.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={review.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.user}</h4>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-sm">{review.comment}</p>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Útil ({review.helpful})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {detailedBusiness.images.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${business.name} foto ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
