import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google Maps API key not configured",
          hasApiKey: false,
        },
        { status: 200 },
      )
    }

    // Return only a flag indicating if API key exists, not the key itself
    return NextResponse.json({
      hasApiKey: true,
      // For demo purposes, we'll use a restricted key or return an error
      // In production, you'd want to proxy the Maps API calls through your server
      error: "Google Maps requires server-side implementation for security",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check Maps configuration",
        hasApiKey: false,
      },
      { status: 500 },
    )
  }
}
