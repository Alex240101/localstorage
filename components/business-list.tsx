"use client"

import { BusinessCard } from "./business-card"

interface BusinessListProps {
  businesses: any[]
  onBusinessClick: (business: any) => void
  onCall: (phone: string) => void
  onNavigate: (address: string, business?: any) => void // Agregar parámetro business opcional
}

export function BusinessList({ businesses, onBusinessClick, onCall, onNavigate }: BusinessListProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {businesses.map((business, index) => (
        <div
          key={business.id}
          onClick={() => onBusinessClick(business)}
          className="cursor-pointer transform transition-all duration-300 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <BusinessCard
            business={business}
            onCall={onCall}
            onNavigate={(address) => onNavigate(address, business)} // Pasar business completo
          />
        </div>
      ))}

      {businesses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No hay resultados</h3>
          <p className="text-muted-foreground">Intenta ajustar tus filtros de búsqueda</p>
        </div>
      )}
    </div>
  )
}
