import { type NextRequest, NextResponse } from "next/server"

interface BusinessSearchParams {
  query: string
  location: {
    latitude: number
    longitude: number
  }
  radius?: number
  type?: string
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

export async function POST(request: NextRequest) {
  try {
    const params: BusinessSearchParams = await request.json()
    const { query, location, radius = 2000 } = params

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8"
    const foursquareApiKey = process.env.FOURSQUARE_API_KEY

    console.log("[v0] API Keys from environment:", {
      google: !!googleApiKey,
      foursquare: !!foursquareApiKey,
    })

    let results: Business[] = []

    // Try Google Places API first (server-side)
    if (googleApiKey) {
      try {
        console.log("[v0] Trying Google Places API...")
        const nearbyUrl =
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${location.latitude},${location.longitude}&` +
          `radius=${radius}&` +
          `type=restaurant&` +
          `keyword=${encodeURIComponent(query)}&` +
          `key=${googleApiKey}`

        console.log("[v0] Google Places API URL (key hidden):", nearbyUrl.replace(googleApiKey, "HIDDEN"))

        const response = await fetch(nearbyUrl)
        const data = await response.json()

        console.log("[v0] Google Places API response status:", data.status)
        console.log("[v0] Google Places API error message:", data.error_message)

        if (data.status === "OK" && data.results) {
          results = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            category: mapPlaceTypeToCategory(place.types),
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            distance: calculateDistance(location, {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }),
            address: place.vicinity || place.formatted_address,
            phone: place.formatted_phone_number,
            hours: place.opening_hours?.open_now ? "Abierto ahora" : "Cerrado",
            isOpen: place.opening_hours?.open_now || false,
            priceLevel: mapPriceLevel(place.price_level),
            image: place.photos?.[0] ? getPhotoUrl(place.photos[0].photo_reference, googleApiKey) : undefined,
            coordinates: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            },
          }))
          console.log("[v0] Google Places API returned", results.length, "results")
        } else {
          console.log("[v0] Google Places API error:", data.status, data.error_message)

          const getErrorMessage = (status: string) => {
            switch (status) {
              case "ZERO_RESULTS":
                return "No se encontraron lugares cerca de tu ubicación"
              case "INVALID_REQUEST":
                return "Error en la búsqueda. Intenta con otros términos"
              case "OVER_QUERY_LIMIT":
                return "Servicio temporalmente no disponible. Intenta más tarde"
              case "REQUEST_DENIED":
                return "Servicio no disponible en este momento"
              case "UNKNOWN_ERROR":
                return "Error temporal. Intenta nuevamente"
              default:
                return "No se encontraron resultados. Intenta con otra búsqueda"
            }
          }

          return NextResponse.json(
            {
              error: getErrorMessage(data.status),
              details: "Prueba con diferentes palabras clave o ajusta los filtros de búsqueda",
              success: false,
            },
            { status: 404 },
          )
        }
      } catch (error) {
        console.error("[v0] Google Places API error:", error)
        return NextResponse.json(
          {
            error: "Error de conexión",
            details: "Verifica tu conexión a internet e intenta nuevamente",
            success: false,
          },
          { status: 500 },
        )
      }
    }

    // Try Foursquare API if Google failed or no results
    if (results.length === 0 && foursquareApiKey) {
      try {
        console.log("[v0] Trying Foursquare API...")
        const searchUrl =
          `https://api.foursquare.com/v3/places/search?` +
          `query=${encodeURIComponent(query)}&` +
          `ll=${location.latitude},${location.longitude}&` +
          `radius=${radius}&` +
          `categories=13000&` +
          `limit=20`

        const response = await fetch(searchUrl, {
          headers: {
            Authorization: foursquareApiKey,
            Accept: "application/json",
          },
        })

        const data = await response.json()
        console.log("[v0] Foursquare API response:", data.results?.length || 0, "results")

        if (data.results) {
          results = data.results.map((place: any) => ({
            id: place.fsq_id,
            name: place.name,
            category: place.categories?.[0]?.name || "Restaurante",
            rating: place.rating || 0,
            reviewCount: place.stats?.total_ratings || 0,
            distance: `${(place.distance / 1000).toFixed(1)}km`,
            address: place.location?.formatted_address || place.location?.address,
            isOpen: place.hours?.open_now || false,
            priceLevel: mapFoursquarePriceLevel(place.price),
            coordinates: {
              latitude: place.geocodes?.main?.latitude || 0,
              longitude: place.geocodes?.main?.longitude || 0,
            },
          }))
        }
      } catch (error) {
        console.error("[v0] Foursquare API error:", error)
      }
    }

    console.log("[v0] Final results count:", results.length)

    if (results.length === 0) {
      return NextResponse.json(
        {
          error: "No se encontraron lugares",
          details: "Intenta con otros términos de búsqueda o amplía el área de búsqueda",
          success: false,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ results, success: true })
  } catch (error) {
    console.error("[v0] API route error:", error)
    return NextResponse.json(
      {
        error: "Error en la búsqueda",
        details: "Ocurrió un problema inesperado. Intenta nuevamente",
        success: false,
      },
      { status: 500 },
    )
  }
}

// Helper functions
function mapPlaceTypeToCategory(types: string[]): string {
  const categoryMap: { [key: string]: string } = {
    restaurant: "Restaurante",
    food: "Restaurante",
    meal_takeaway: "Comida para llevar",
    meal_delivery: "Delivery",
    cafe: "Cafetería",
    bakery: "Panadería",
    bar: "Bar",
    night_club: "Restobar",
  }

  for (const type of types) {
    if (categoryMap[type]) {
      return categoryMap[type]
    }
  }
  return "Restaurante"
}

function mapPriceLevel(priceLevel?: number): string {
  switch (priceLevel) {
    case 0:
    case 1:
      return "budget"
    case 2:
      return "mid"
    case 3:
    case 4:
      return "expensive"
    default:
      return "budget"
  }
}

function mapFoursquarePriceLevel(price?: number): string {
  switch (price) {
    case 1:
      return "budget"
    case 2:
      return "mid"
    case 3:
    case 4:
      return "expensive"
    default:
      return "budget"
  }
}

function calculateDistance(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): string {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(to.latitude - from.latitude)
  const dLon = toRad(to.longitude - from.longitude)
  const lat1 = toRad(from.latitude)
  const lat2 = toRad(to.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
}

function getPhotoUrl(photoReference: string, apiKey: string, maxWidth = 400): string {
  return (
    `https://maps.googleapis.com/maps/api/place/photo?` +
    `maxwidth=${maxWidth}&` +
    `photo_reference=${photoReference}&` +
    `key=${apiKey}`
  )
}
