"use client"

import type React from "react"

import { useState } from "react"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  businessName?: string
  className?: string
}

export default function ShareButton({
  title = "BuscaLocal - Encuentra Negocios Cerca de Ti",
  text = "Descubre los mejores restaurantes y negocios cerca de tu ubicación",
  url,
  businessName,
  className = "flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation()

    const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "")

    const shareData = {
      title: businessName ? `${businessName} - BuscaLocal` : title,
      text: businessName ? `Encontré ${businessName} en BuscaLocal` : text,
      url: currentUrl,
    }

    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        console.log("[PWA] Content shared successfully")
        return
      }

      // Fallback: copiar al portapapeles
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        console.log("[PWA] URL copied to clipboard")
      }
    } catch (error) {
      console.error("[PWA] Error sharing:", error)

      // Fallback manual para copiar
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(currentUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      } catch (clipboardError) {
        console.error("[PWA] Clipboard error:", clipboardError)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={className}
      title={businessName ? `Compartir ${businessName}` : "Compartir BuscaLocal"}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {className.includes("gap-2") && <span>Copiado</span>}
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          {className.includes("gap-2") && <span>Compartir</span>}
        </>
      )}
    </button>
  )
}
