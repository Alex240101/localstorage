import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Coordenadas requeridas" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    console.log("[v0] Google Places API key no configurada para reverse geocoding")
    return NextResponse.json(
      {
        error: "API key no configurada",
        formatted_address: `Ubicación aproximada: ${lat}, ${lng}`,
        address_components: [],
      },
      { status: 200 },
    )
  }

  try {
    console.log(`[v0] Realizando reverse geocoding para: ${lat}, ${lng}`)

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log("[v0] Respuesta de Google Geocoding:", data.status)

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0]
      console.log("[v0] Dirección encontrada:", result.formatted_address)

      return NextResponse.json({
        formatted_address: result.formatted_address,
        address_components: result.address_components,
        place_id: result.place_id,
        coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) },
      })
    } else {
      console.log("[v0] No se encontraron resultados de geocoding")
      return NextResponse.json({
        formatted_address: `Ubicación: ${lat}, ${lng}`,
        address_components: [],
        coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) },
      })
    }
  } catch (error) {
    console.error("[v0] Error en reverse geocoding:", error)
    return NextResponse.json(
      {
        error: "Error en reverse geocoding",
        formatted_address: `Ubicación: ${lat}, ${lng}`,
        address_components: [],
        coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) },
      },
      { status: 200 },
    )
  }
}
