import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

import PWAInstaller from "@/components/pwa-installer"
import ConnectionStatus from "@/components/connection-status"
import PerformanceMonitor from "@/components/performance-monitor"

export const metadata: Metadata = {
  title: "BuscaLocal - Encuentra Negocios Cerca de Ti | Pollerías, Restaurantes y Más",
  description:
    "Descubre los mejores restaurantes, pollerías, chifas y negocios cerca de tu ubicación en Lima, Perú. Búsqueda en tiempo real con GPS, direcciones y reseñas.",
  keywords:
    "restaurantes Lima, pollerías cerca, chifas delivery, negocios locales, comida peruana, búsqueda GPS, direcciones, reseñas",
  authors: [{ name: "BuscaLocal Team" }],
  creator: "BuscaLocal",
  publisher: "BuscaLocal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://localstorage-75z6.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      "es-PE": "/es-pe",
      es: "/es",
    },
  },
  openGraph: {
    title: "BuscaLocal - Encuentra Negocios Cerca de Ti",
    description:
      "Descubre los mejores restaurantes, pollerías, chifas y negocios cerca de tu ubicación en Lima, Perú. Búsqueda en tiempo real con GPS.",
    url: "https://localstorage-75z6.vercel.app",
    siteName: "BuscaLocal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BuscaLocal - Encuentra Negocios Cerca de Ti",
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: "BuscaLocal App",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuscaLocal - Encuentra Negocios Cerca de Ti",
    description: "Descubre los mejores restaurantes, pollerías, chifas y negocios cerca de tu ubicación en Lima, Perú.",
    images: ["/twitter-image.png"],
    creator: "@BuscaLocal",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#8b5cf6",
      },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "BuscaLocal",
    "application-name": "BuscaLocal",
    "msapplication-TileColor": "#1f2937",
    "msapplication-TileImage": "/mstile-144x144.png",
    "theme-color": "#1f2937",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preload" href="/icon-192x192.png" as="image" type="image/png" />
        <link rel="preload" href="/favicon-32x32.png" as="image" type="image/png" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        <link rel="dns-prefetch" href="//places.googleapis.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "BuscaLocal",
              description:
                "Encuentra restaurantes, pollerías, chifas y más negocios cerca de tu ubicación en Lima, Perú",
              url: "https://localstorage-75z6.vercel.app",
              applicationCategory: "BusinessApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "BuscaLocal Team",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
              applicationSubCategory: "Local Business Search",
              downloadUrl: "https://localstorage-75z6.vercel.app",
              screenshot: "https://localstorage-75z6.vercel.app/screenshot.png",
              softwareVersion: "1.0.0",
              datePublished: "2025-01-01",
              inLanguage: "es-PE",
              isAccessibleForFree: true,
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              countriesSupported: "PE",
              featureList: [
                "Búsqueda de negocios por GPS",
                "Direcciones en tiempo real",
                "Reseñas y calificaciones",
                "Filtros por categoría",
                "Modo offline",
              ],
            }),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <PWAInstaller />
        <ConnectionStatus />
        <PerformanceMonitor />
      </body>
    </html>
  )
}
