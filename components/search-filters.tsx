"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Filter, X, Star, MapPin, Clock, DollarSign } from "lucide-react"

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onToggle: () => void
}

export function SearchFilters({ onFiltersChange, isOpen, onToggle }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    distance: [2], // km
    rating: [3.5],
    priceRange: "all",
    openNow: false,
    delivery: false,
    takeaway: false,
    categories: [] as string[],
  })

  const categories = [
    "Pollerías",
    "Chifas",
    "Restaurantes",
    "Restobares",
    "Pizzerías",
    "Cafeterías",
    "Comida Rápida",
    "Marisquerías",
    "Parrillas",
    "Heladerías",
    "Panaderías",
    "Juguerías",
  ]

  const priceRanges = [
    { value: "all", label: "Todos los precios" },
    { value: "budget", label: "Económico (S/ 10-25)" },
    { value: "mid", label: "Moderado (S/ 25-50)" },
    { value: "expensive", label: "Caro (S/ 50+)" },
  ]

  const updateFilters = (newFilters: any) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    updateFilters({ categories: newCategories })
  }

  const clearFilters = () => {
    const defaultFilters = {
      distance: [2],
      rating: [3.5],
      priceRange: "all",
      openNow: false,
      delivery: false,
      takeaway: false,
      categories: [],
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={onToggle} className="w-full bg-transparent">
        <Filter className="w-4 h-4 mr-2" />
        Filtros de búsqueda
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Distance Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Label>Distancia máxima: {filters.distance[0]} km</Label>
          </div>
          <Slider
            value={filters.distance}
            onValueChange={(value) => updateFilters({ distance: value })}
            max={10}
            min={0.5}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-muted-foreground" />
            <Label>Rating mínimo: {filters.rating[0]} estrellas</Label>
          </div>
          <Slider
            value={filters.rating}
            onValueChange={(value) => updateFilters({ rating: value })}
            max={5}
            min={1}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <Label>Rango de precios</Label>
          </div>
          <Select value={filters.priceRange} onValueChange={(value) => updateFilters({ priceRange: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label>Opciones rápidas</Label>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="open-now" className="text-sm">
                Abierto ahora
              </Label>
              <Switch
                id="open-now"
                checked={filters.openNow}
                onCheckedChange={(checked) => updateFilters({ openNow: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delivery" className="text-sm">
                Delivery disponible
              </Label>
              <Switch
                id="delivery"
                checked={filters.delivery}
                onCheckedChange={(checked) => updateFilters({ delivery: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="takeaway" className="text-sm">
                Para llevar
              </Label>
              <Switch
                id="takeaway"
                checked={filters.takeaway}
                onCheckedChange={(checked) => updateFilters({ takeaway: checked })}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label>Categorías</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={filters.categories.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
