"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, MapPin } from "lucide-react"

interface SearchSuggestionsProps {
  query: string
  onSuggestionClick: (suggestion: string) => void
  userLocation: any
}

export function SearchSuggestions({ query, onSuggestionClick, userLocation }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])

  const popularSearches = [
    { text: "Pollería cerca", type: "popular", icon: TrendingUp },
    { text: "Chifa delivery", type: "popular", icon: TrendingUp },
    { text: "Restaurante abierto", type: "popular", icon: Clock },
    { text: "Pizza para llevar", type: "popular", icon: TrendingUp },
  ]

  const recentSearches = [
    { text: "Pollería El Dorado", type: "recent", icon: Clock },
    { text: "Chifa Dragón", type: "recent", icon: Clock },
    { text: "Restaurante criollo", type: "recent", icon: Clock },
  ]

  const locationBasedSuggestions = [
    { text: `Restaurantes en ${userLocation?.district}`, type: "location", icon: MapPin },
    { text: `Pollerías cerca de ${userLocation?.district}`, type: "location", icon: MapPin },
    { text: `Delivery en ${userLocation?.cityLabel}`, type: "location", icon: MapPin },
  ]

  useEffect(() => {
    if (query.length > 0) {
      // Filter suggestions based on query
      const filtered = [
        ...popularSearches.filter((s) => s.text.toLowerCase().includes(query.toLowerCase())),
        ...recentSearches.filter((s) => s.text.toLowerCase().includes(query.toLowerCase())),
        ...locationBasedSuggestions.filter((s) => s.text.toLowerCase().includes(query.toLowerCase())),
      ]
      setSuggestions(filtered.slice(0, 6))
    } else {
      // Show default suggestions
      setSuggestions([...popularSearches.slice(0, 3), ...recentSearches.slice(0, 2)])
    }
  }, [query, userLocation])

  if (suggestions.length === 0) return null

  return (
    <Card className="mt-2">
      <CardContent className="p-3">
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => {
            const IconComponent = suggestion.icon
            return (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onSuggestionClick(suggestion.text)}
              >
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{suggestion.text}</span>
                <Badge variant="outline" className="text-xs">
                  {suggestion.type === "popular" && "Popular"}
                  {suggestion.type === "recent" && "Reciente"}
                  {suggestion.type === "location" && "Cerca"}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
