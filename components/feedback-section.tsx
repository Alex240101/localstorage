"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, CheckCircle, User, Clock, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeedbackItem {
  id: number
  user: string
  gender: string
  feedback: string
  timestamp: string
  likes?: number
}

export function FeedbackSection() {
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const userData = JSON.parse(localStorage.getItem("busca-local-user") || "{}")

  useEffect(() => {
    loadAllFeedback()
  }, [])

  const loadAllFeedback = () => {
    const existingFeedback = JSON.parse(localStorage.getItem("busca-local-feedback") || "[]")
    // Sort by timestamp, newest first
    const sortedFeedback = existingFeedback.sort(
      (a: FeedbackItem, b: FeedbackItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    setAllFeedback(sortedFeedback)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setIsSubmitting(true)

    setTimeout(() => {
      const feedbackData = {
        id: Date.now(),
        user: userData.username,
        gender: userData.gender,
        feedback: feedback.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
      }

      // Save to localStorage for demo purposes
      const existingFeedback = JSON.parse(localStorage.getItem("busca-local-feedback") || "[]")
      existingFeedback.push(feedbackData)
      localStorage.setItem("busca-local-feedback", JSON.stringify(existingFeedback))

      setSubmitted(true)
      setIsSubmitting(false)
      loadAllFeedback() // Reload feedback list after submission

      toast({
        title: "¡Gracias por tu feedback!",
        description: "Tu sugerencia ha sido enviada y es visible para todos los usuarios.",
      })

      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFeedback("")
        setShowForm(false)
      }, 3000)
    }, 1500)
  }

  const handleLike = (feedbackId: number) => {
    const existingFeedback = JSON.parse(localStorage.getItem("busca-local-feedback") || "[]")
    const updatedFeedback = existingFeedback.map((item: FeedbackItem) => {
      if (item.id === feedbackId) {
        return { ...item, likes: (item.likes || 0) + 1 }
      }
      return item
    })
    localStorage.setItem("busca-local-feedback", JSON.stringify(updatedFeedback))
    loadAllFeedback()

    toast({
      title: "¡Gracias!",
      description: "Tu like ha sido registrado",
    })
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace menos de 1 hora"
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`
  }

  if (submitted) {
    return (
      <div className="pb-20 space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Feedback enviado!</h3>
            <p className="text-muted-foreground">
              Gracias {userData.username}, tu sugerencia es ahora visible para toda la comunidad
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Mejoras de la Comunidad</h2>
          <p className="text-muted-foreground">
            {allFeedback.length} sugerencia{allFeedback.length !== 1 ? "s" : ""} de usuarios
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-500 hover:bg-purple-600">
          <MessageSquare className="w-4 h-4 mr-2" />
          {showForm ? "Ver sugerencias" : "Enviar sugerencia"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <span>Déjanos tus mejoras</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Hola {userData.username}, comparte tus ideas para mejorar la aplicación
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Escribe aquí qué te gustaría que mejoremos en BuscaLocal..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-32 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    Usuario: {userData.username} ({userData.gender})
                  </span>
                  <span>{feedback.length}/500</span>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={!feedback.trim() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar sugerencia
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <div className="space-y-4">
          {allFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay sugerencias aún</h3>
                <p className="text-muted-foreground mb-4">
                  Sé el primero en compartir una idea para mejorar BuscaLocal
                </p>
                <Button onClick={() => setShowForm(true)} variant="outline">
                  Enviar primera sugerencia
                </Button>
              </CardContent>
            </Card>
          ) : (
            allFeedback.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.user}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.gender === "masculino" ? "Hombre" : "Mujer"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base mb-4 leading-relaxed">{item.feedback}</p>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      <span>{item.likes || 0}</span>
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      Sugerencia #{item.id}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
