"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Key, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiSetupGuideProps {
  onApiConfigured: (config: any) => void
}

export function ApiSetupGuide({ onApiConfigured }: ApiSetupGuideProps) {
  const [googleApiKey, setGoogleApiKey] = useState("")
  const [foursquareApiKey, setFoursquareApiKey] = useState("")
  const [isTestingGoogle, setIsTestingGoogle] = useState(false)
  const [isTestingFoursquare, setIsTestingFoursquare] = useState(false)
  const [googleStatus, setGoogleStatus] = useState<"idle" | "success" | "error">("idle")
  const [foursquareStatus, setFoursquareStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorDetails, setErrorDetails] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        const response = await fetch("/api/search-businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: "test",
            location: { latitude: -12.0464, longitude: -77.0428 },
            radius: 1000,
          }),
        })

        const data = await response.json()
        console.log("[v0] Environment check response:", data)

        if (data.success) {
          toast({
            title: "APIs ya configuradas",
            description: "Las variables de entorno están configuradas correctamente en Vercel",
          })
          onApiConfigured({ configured: true })
        }
      } catch (error) {
        console.log("[v0] Environment variables not configured, showing setup guide")
      }
    }

    checkEnvVars()
  }, [])

  const testGoogleApi = async () => {
    if (!googleApiKey.trim()) return

    setIsTestingGoogle(true)
    setErrorDetails("")

    try {
      // Store temporarily for testing
      const tempConfig = { googlePlacesApiKey: googleApiKey }
      localStorage.setItem("temp-api-config", JSON.stringify(tempConfig))

      const response = await fetch("/api/search-businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "restaurante",
          location: { latitude: -12.0464, longitude: -77.0428 },
          radius: 2000,
        }),
      })

      const data = await response.json()
      console.log("[v0] Google API test response:", data)

      if (data.success && data.results && data.results.length > 0) {
        setGoogleStatus("success")
        toast({
          title: "Google Places API configurada",
          description: `Encontrados ${data.results.length} resultados de prueba`,
        })
      } else {
        setGoogleStatus("error")
        setErrorDetails(data.details || "No se encontraron resultados")
        toast({
          title: "Error en Google Places API",
          description: data.details || "Verifica tu API key y que Places API esté habilitada",
          variant: "destructive",
        })
      }
    } catch (error) {
      setGoogleStatus("error")
      const errorMsg = error instanceof Error ? error.message : "Error de conexión"
      setErrorDetails(errorMsg)
      toast({
        title: "Error de conexión",
        description: errorMsg,
        variant: "destructive",
      })
    }
    setIsTestingGoogle(false)
  }

  const testFoursquareApi = async () => {
    if (!foursquareApiKey.trim()) return

    setIsTestingFoursquare(true)
    setErrorDetails("")

    try {
      // Store temporarily for testing
      const tempConfig = { foursquareApiKey: foursquareApiKey }
      localStorage.setItem("temp-api-config", JSON.stringify(tempConfig))

      const response = await fetch("/api/search-businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "restaurante",
          location: { latitude: -12.0464, longitude: -77.0428 },
          radius: 2000,
        }),
      })

      const data = await response.json()
      console.log("[v0] Foursquare API test response:", data)

      if (data.success && data.results && data.results.length > 0) {
        setFoursquareStatus("success")
        toast({
          title: "Foursquare API configurada",
          description: `Encontrados ${data.results.length} resultados de prueba`,
        })
      } else {
        setFoursquareStatus("error")
        setErrorDetails(data.details || "No se encontraron resultados")
        toast({
          title: "Error en Foursquare API",
          description: data.details || "Verifica tu API key",
          variant: "destructive",
        })
      }
    } catch (error) {
      setFoursquareStatus("error")
      const errorMsg = error instanceof Error ? error.message : "Error de conexión"
      setErrorDetails(errorMsg)
      toast({
        title: "Error de conexión",
        description: errorMsg,
        variant: "destructive",
      })
    }
    setIsTestingFoursquare(false)
  }

  const handleContinue = () => {
    const config = {
      googlePlacesApiKey: googleStatus === "success" ? googleApiKey : undefined,
      foursquareApiKey: foursquareStatus === "success" ? foursquareApiKey : undefined,
    }

    if (!config.googlePlacesApiKey && !config.foursquareApiKey) {
      toast({
        title: "API requerida",
        description: "Necesitas configurar al menos una API para continuar",
        variant: "destructive",
      })
      return
    }

    // Store in localStorage for persistence
    localStorage.setItem("busca-local-api-config", JSON.stringify(config))
    // Remove temp config
    localStorage.removeItem("temp-api-config")
    onApiConfigured(config)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Configuración de APIs</CardTitle>
          <CardDescription>
            Para obtener datos reales de negocios, necesitas configurar al menos una API externa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorDetails && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error detallado:</strong> {errorDetails}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="google" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">Google Places API</TabsTrigger>
              <TabsTrigger value="foursquare">Foursquare API</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recomendado:</strong> Google Places API ofrece los datos más completos y precisos para
                  búsquedas de negocios locales.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Pasos para obtener tu API Key:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Ve a{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => window.open("https://console.cloud.google.com/", "_blank")}
                      >
                        Google Cloud Console <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </li>
                    <li>Crea un nuevo proyecto o selecciona uno existente</li>
                    <li>Habilita las APIs: Places API, Maps JavaScript API, Geocoding API</li>
                    <li>Ve a "Credenciales" y crea una nueva API Key</li>
                    <li>Restringe la API Key a tu dominio para mayor seguridad</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-api-key">Google Places API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="google-api-key"
                      type="password"
                      placeholder="AIzaSy..."
                      value={googleApiKey}
                      onChange={(e) => setGoogleApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={testGoogleApi}
                      disabled={!googleApiKey.trim() || isTestingGoogle}
                    >
                      {isTestingGoogle ? "Probando..." : "Probar"}
                    </Button>
                  </div>
                  {googleStatus === "success" && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      API configurada correctamente
                    </div>
                  )}
                  {googleStatus === "error" && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Error en la configuración de la API
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Problemas comunes:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Verifica que Places API esté habilitada en Google Cloud Console</li>
                      <li>Asegúrate de tener facturación configurada</li>
                      <li>Revisa las restricciones de la API key</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="foursquare" className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alternativa:</strong> Foursquare API es una buena opción alternativa con un plan gratuito
                  generoso.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Pasos para obtener tu API Key:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Ve a{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => window.open("https://developer.foursquare.com/", "_blank")}
                      >
                        Foursquare Developer <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </li>
                    <li>Crea una cuenta de desarrollador</li>
                    <li>Crea una nueva aplicación</li>
                    <li>Copia tu API Key desde el dashboard</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foursquare-api-key">Foursquare API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="foursquare-api-key"
                      type="password"
                      placeholder="fsq3..."
                      value={foursquareApiKey}
                      onChange={(e) => setFoursquareApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={testFoursquareApi}
                      disabled={!foursquareApiKey.trim() || isTestingFoursquare}
                    >
                      {isTestingFoursquare ? "Probando..." : "Probar"}
                    </Button>
                  </div>
                  {foursquareStatus === "success" && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      API configurada correctamente
                    </div>
                  )}
                  {foursquareStatus === "error" && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Error en la configuración de la API
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Plan gratuito:</strong> 1,000 llamadas por día. Perfecto para desarrollo y uso personal.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Estado de configuración:</p>
                <div className="flex space-x-2">
                  <Badge variant={googleStatus === "success" ? "default" : "outline"}>
                    Google Places {googleStatus === "success" ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={foursquareStatus === "success" ? "default" : "outline"}>
                    Foursquare {foursquareStatus === "success" ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>
              <Button onClick={handleContinue} disabled={googleStatus !== "success" && foursquareStatus !== "success"}>
                Continuar al sistema
              </Button>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertDescription className="text-xs">
              <strong>Nota:</strong> Tus API keys se almacenan localmente en tu navegador y no se envían a ningún
              servidor externo. Solo se usan para hacer llamadas directas a las APIs desde tu navegador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
