// API Services for real business data integration

interface BusinessSearchParams {
  query: string
  location: {
    latitude: number
    longitude: number
  }
  radius?: number
  type?: string
  filters?: {
    rating?: number
    priceLevel?: string
    openNow?: boolean
  }
}

interface Business {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  distance: string
  address: string
  phone?: string
  hours?: string
  isOpen: boolean
  priceLevel: string
  deliveryTime?: string
  image?: string
  specialties?: string[]
  coordinates: {
    latitude: number
    longitude: number
  }
}

// Main Business Search Service that handles API calls through server routes
export class BusinessSearchService {
  private cache = new Map<string, { data: Business[]; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  async searchBusinesses(params: BusinessSearchParams): Promise<Business[]> {
    const cacheKey = JSON.stringify(params)
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log("[v0] Using cached results")
      return cached.data
    }

    try {
      console.log("[v0] Making API call with params:", params)

      const response = await fetch("/api/search-businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      const data = await response.json()
      console.log("[v0] API response:", data)

      if (!data.success) {
        throw new Error(data.error || "Error en la búsqueda")
      }

      const results = data.results || []

      // Cache results
      this.cache.set(cacheKey, { data: results, timestamp: Date.now() })
      console.log("[v0] Cached", results.length, "results")

      return results
    } catch (error) {
      console.error("[v0] Search error:", error)
      // Return empty array instead of throwing to maintain app functionality
      return []
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  async checkApiStatus(): Promise<{ configured: boolean; details: string }> {
    try {
      const response = await fetch("/api/search-businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "test",
          location: { latitude: -12.0464, longitude: -77.0428 }, // Lima coordinates
          radius: 1000,
        }),
      })

      const data = await response.json()

      if (data.success || (data.error && !data.error.includes("No hay APIs configuradas"))) {
        return { configured: true, details: "APIs configuradas correctamente" }
      } else {
        return { configured: false, details: "APIs no configuradas" }
      }
    } catch (error) {
      return { configured: false, details: "Error verificando APIs" }
    }
  }
}

// Create singleton instance
export const businessSearchService = new BusinessSearchService()
