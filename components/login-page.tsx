"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Users } from "lucide-react"
import { dataStorage } from "@/lib/data/storage"

interface LoginPageProps {
  onLogin: (userData: any) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [gender, setGender] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userData = await dataStorage.createUser({
        name: username,
        gender,
      })
      console.log("[v0] User created successfully:", userData)
      onLogin(userData)
    } catch (error) {
      console.error("[v0] Error creating user:", error)
      const userData = {
        id: Date.now().toString(),
        username,
        gender,
        name: username,
        createdAt: new Date(),
      }
      onLogin(userData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20"></div>
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/95 border-border shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-500 animate-pulse opacity-30"></div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              BuscaLocal
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Crea tu perfil para encontrar los mejores negocios cerca de ti
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-foreground font-medium">
                Nombre de usuario
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 h-12 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="gender" className="text-foreground font-medium">
                Género
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger className="pl-11 h-12 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                    <SelectValue placeholder="Selecciona tu género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 font-medium text-base btn-hover-effect"
              disabled={isLoading || !username || !gender}
            >
              {isLoading ? "Creando perfil..." : "Crear perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
