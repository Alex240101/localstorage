"use client"

import { BusinessCard } from "./business-card"

interface BusinessGridProps {
  businesses: any[]
  onBusinessClick: (business: any) => void
  onCall: (phone: string) => void
  onNavigate: (address: string) => void
}

export function BusinessGrid({ businesses, onBusinessClick, onCall, onNavigate }: BusinessGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businesses.map((business) => (
        <div key={business.id} onClick={() => onBusinessClick(business)} className="cursor-pointer">
          <BusinessCard business={business} onCall={onCall} onNavigate={onNavigate} />
        </div>
      ))}
    </div>
  )
}
