"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, MapPin } from "lucide-react"
import { dataStorage } from "@/lib/data/storage"

interface SearchSuggestionsProps {
  query: string
  onSuggestionClick: (suggestion: string) => void
  userLocation: any
}

export function SearchSuggestions({ query, onSuggestionClick, userLocation }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [popularSearches, setPopularSearches] = useState<any[]>([])

  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const popular = await dataStorage.getPopularSearches(6)
        const formattedPopular = popular.map((search) => ({
          text: search,
          type: "popular",
          icon: TrendingUp,
        }))
        setPopularSearches(formattedPopular)
      } catch (error) {
        console.log("[v0] Error loading popular searches:", error)
        // Fallback to default suggestions
        setPopularSearches([
          { text: "Pollería cerca", type: "popular", icon: TrendingUp },
          { text: "Chifa delivery", type: "popular", icon: TrendingUp },
          { text: "Restaurante abierto", type: "popular", icon: Clock },
          { text: "Pizza para llevar", type: "popular", icon: TrendingUp },
        ])
      }
    }

    loadPopularSearches()
  }, [])

  const getRecentSearches = () => {
    try {
      const searches = localStorage.getItem("busca-local-searches")
      if (searches) {
        const parsedSearches = JSON.parse(searches)
        return parsedSearches
          .slice(-5) // Get last 5 searches
          .reverse() // Most recent first
          .map((search: any) => ({
            text: search.query,
            type: "recent",
            icon: Clock,
          }))
      }
    } catch (error) {
      console.log("[v0] Error loading recent searches:", error)
    }
    return []
  }

  const locationBasedSuggestions = [
    { text: `Restaurantes en ${userLocation?.district}`, type: "location", icon: MapPin },
    { text: `Pollerías cerca de ${userLocation?.district}`, type: "location", icon: MapPin },
    { text: `Delivery en ${userLocation?.cityLabel}`, type: "location", icon: MapPin },
  ]

  useEffect(() => {
    const recentSearches = getRecentSearches()

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
      setSuggestions([
        ...popularSearches.slice(0, 3),
        ...recentSearches.slice(0, 2),
        ...locationBasedSuggestions.slice(0, 1),
      ])
    }
  }, [query, userLocation, popularSearches])

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
