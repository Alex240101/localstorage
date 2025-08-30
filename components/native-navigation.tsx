"use client"
import { Button } from "@/components/ui/button"
import { Home, TrendingUp, MessageSquare, User, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

interface NativeNavigationProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

export function NativeNavigation({ currentSection, onSectionChange }: NativeNavigationProps) {
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    // Hide scroll hint after 3 seconds
    const timer = setTimeout(() => {
      setShowScrollHint(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const navItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "trending", label: "Tendencias", icon: TrendingUp },
    { id: "favorites", label: "Favoritos", icon: Heart },
    { id: "feedback", label: "Mejoras", icon: MessageSquare },
    { id: "profile", label: "Perfil", icon: User },
  ]

  return (
    <>
      {showScrollHint && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-full text-xs flex items-center space-x-2 z-40 animate-bounce">
          <ChevronLeft className="w-3 h-3" />
          <span>Desliza para navegar</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
        <div className="flex items-center justify-around px-1 sm:px-2 py-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentSection === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center space-y-1 h-auto py-2 px-2 sm:px-3 transition-all duration-200 min-w-0 flex-shrink-0 ${
                  isActive ? "text-purple-500 bg-purple-500/10" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-purple-500" : ""}`} />
                <span className={`text-xs font-medium truncate max-w-16 ${isActive ? "text-purple-500" : ""}`}>
                  {item.label}
                </span>
              </Button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
