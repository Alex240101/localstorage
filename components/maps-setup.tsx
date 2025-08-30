"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"

interface MapsSetupProps {
  onBack: () => void
}

export function MapsSetup({ onBack }: MapsSetupProps) {
  const [apiKey, setApiKey] = useState("AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8")
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("valid")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const savedKey = localStorage.getItem("busca-local-maps-api-key")
    if (!savedKey) {
      localStorage.setItem("busca-local-maps-api-key", "AIzaSyB7cmJO7bjm30ZVmM7XH3E5KyepJsfkZi8")
    }
    // Load saved API key
    if (savedKey) {
      setApiKey(savedKey)
      setValidationStatus("valid")
    }
  }, [])

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("Por favor ingresa una API key")
      return
    }

    setIsValidating(true)
    setErrorMessage("")

    try {
      // Test the API key by loading Google Maps
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`

      script.onload = () => {
        console.log("[v0] Google Maps API key validation successful")
        setValidationStatus("valid")
        localStorage.setItem("busca-local-maps-api-key", apiKey)
        setIsValidating(false)
      }

      script.onerror = () => {
        console.log("[v0] Google Maps API key validation failed")
        setValidationStatus("invalid")
        setErrorMessage("API key inválida o sin permisos para Maps JavaScript API")
        setIsValidating(false)
      }

      document.head.appendChild(script)

      // Cleanup after test
      setTimeout(() => {
        document.head.removeChild(script)
      }, 3000)
    } catch (error) {
      console.log("[v0] Error validating Google Maps API key:", error)
      setValidationStatus("invalid")
      setErrorMessage("Error al validar la API key")
      setIsValidating(false)
    }
  }

  const removeApiKey = () => {
    localStorage.removeItem("busca-local-maps-api-key")
    setApiKey("")
    setValidationStatus("idle")
    setErrorMessage("")
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Configurar Google Maps</h1>
            <p className="text-gray-400 text-sm">Habilita el mapa interactivo</p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Estado del Mapa
              </CardTitle>
              {validationStatus === "valid" && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              )}
              {validationStatus === "invalid" && (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              )}
              {validationStatus === "idle" && (
                <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  No configurado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {validationStatus === "valid" ? (
              <div className="text-green-400 text-sm">✅ Google Maps configurado correctamente</div>
            ) : (
              <div className="text-gray-400 text-sm">Configure su API key para habilitar el mapa interactivo</div>
            )}
          </CardContent>
        </Card>

        {/* API Key Configuration */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">API Key de Google Maps</CardTitle>
            <CardDescription>Ingresa tu API key para habilitar el mapa interactivo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              {errorMessage && <p className="text-red-400 text-sm mt-2">{errorMessage}</p>}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={validateApiKey}
                disabled={isValidating || !apiKey.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isValidating ? "Validando..." : "Validar API Key"}
              </Button>

              {validationStatus === "valid" && (
                <Button
                  variant="outline"
                  onClick={removeApiKey}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  Remover
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">¿Cómo obtener la API Key?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            <div className="space-y-2">
              <p className="font-medium">1. Ve a Google Cloud Console</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                onClick={() => window.open("https://console.cloud.google.com", "_blank")}
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Abrir Google Cloud Console
              </Button>
            </div>

            <div className="space-y-1">
              <p className="font-medium">2. Habilita estas APIs:</p>
              <ul className="text-xs text-gray-400 space-y-1 ml-4">
                <li>• Maps JavaScript API</li>
                <li>• Places API</li>
                <li>• Geocoding API</li>
              </ul>
            </div>

            <div>
              <p className="font-medium">3. Crea una API Key</p>
              <p className="text-xs text-gray-400">En "APIs y servicios" → "Credenciales"</p>
            </div>

            <div>
              <p className="font-medium">4. Configura restricciones</p>
              <p className="text-xs text-gray-400">Agrega *.v0.app/* y *.vercel.app/* como dominios permitidos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
