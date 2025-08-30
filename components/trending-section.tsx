"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, MapPin } from "lucide-react"

interface TrendingSectionProps {
  onBusinessClick: (business: any) => void
}

export function TrendingSection({ onBusinessClick }: TrendingSectionProps) {
  const [trendingBusinesses, setTrendingBusinesses] = useState<any[]>([])
  const [trendingSearches, setTrendingSearches] = useState<any[]>([])

  useEffect(() => {
    const mockTrendingBusinesses = [
      {
        id: 1,
        name: "Pollería El Dorado",
        category: "Pollería",
        searchCount: 47,
        rating: 4.5,
        distance: "0.3 km",
        image: "/polleria-restaurant.png",
        trending: "↗️ +23% hoy",
      },
      {
        id: 2,
        name: "Broaster Express",
        category: "Broaster",
        searchCount: 34,
        rating: 4.6,
        distance: "0.4 km",
        image: "/polleria-restaurant.png",
        trending: "🔥 +18% hoy",
      },
      {
        id: 3,
        name: "Cevichería El Pescador",
        category: "Cevichería",
        searchCount: 28,
        rating: 4.8,
        distance: "0.6 km",
        image: "/marisqueria-peruana.png",
        trending: "📈 +15% hoy",
      },
      {
        id: 4,
        name: "Chifa Dragón Dorado",
        category: "Chifa",
        searchCount: 22,
        rating: 4.2,
        distance: "0.5 km",
        image: "/chifa-chinese-restaurant.png",
        trending: "⭐ +12% hoy",
      },
    ]

    const mockTrendingSearches = [
      { term: "pollería cerca", count: 156, trend: "+45%" },
      { term: "broaster delivery", count: 134, trend: "+38%" },
      { term: "chifa abierto", count: 98, trend: "+22%" },
      { term: "ceviche fresco", count: 87, trend: "+19%" },
      { term: "restobar nocturno", count: 76, trend: "+15%" },
      { term: "pizza familiar", count: 65, trend: "+12%" },
    ]

    setTrendingBusinesses(mockTrendingBusinesses)
    setTrendingSearches(mockTrendingSearches)
  }, [])

  return (
    <div className="space-y-6 pb-20">
      {/* Trending Businesses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span>Restaurantes más buscados</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Los negocios con más de 10 búsquedas en tiempo real</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingBusinesses.map((business, index) => (
            <div
              key={business.id}
              onClick={() => onBusinessClick(business)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{business.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {business.searchCount} búsquedas
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{business.category}</span>
                  <span>•</span>
                  <span>⭐ {business.rating}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {business.distance}
                  </span>
                </div>
                <p className="text-xs text-green-600 font-medium">{business.trending}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span>Búsquedas populares</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Los términos más buscados en tiempo real</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {trendingSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-purple-500">#{index + 1}</span>
                  <span className="font-medium">{search.term}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {search.count}
                  </Badge>
                  <span className="text-xs text-green-600 font-medium">{search.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
