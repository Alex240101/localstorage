"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  businessName?: string
}

export default function ShareButton({
  title = "BuscaLocal - Encuentra Negocios Cerca de Ti",
  text = "Descubre los mejores restaurantes y negocios cerca de tu ubicación",
  url = window.location.href,
  businessName,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: businessName ? `${businessName} - BuscaLocal` : title,
      text: businessName ? `Encontré ${businessName} en BuscaLocal` : text,
      url: url,
    }

    try {
      // Usar Web Share API si está disponible
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        console.log("[PWA] Content shared successfully")
        return
      }

      // Fallback: copiar al portapapeles
      await navigator.clipboard.writeText(url)
      setCopied(true)

      setTimeout(() => setCopied(false), 2000)
      console.log("[PWA] URL copied to clipboard")
    } catch (error) {
      console.error("[PWA] Error sharing:", error)

      // Fallback manual para copiar
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (clipboardError) {
        console.error("[PWA] Clipboard error:", clipboardError)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
      title={businessName ? `Compartir ${businessName}` : "Compartir BuscaLocal"}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copiado</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Compartir</span>
        </>
      )}
    </button>
  )
}
