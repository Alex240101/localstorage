"use client"

import { useEffect, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { LoginPage } from "@/components/login-page"
import { LocationSetup } from "@/components/location-setup"
import { Dashboard } from "@/components/dashboard"
import { DeviceDetector } from "@/components/device-detector"

type AppState = "loading" | "login" | "location-setup" | "dashboard"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("loading")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Simulate loading time
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        // Check if user is logged in
        const user = localStorage.getItem("busca-local-user")
        if (user) {
          // Check if location is configured
          const location = localStorage.getItem("busca-local-location")
          if (location) {
            setAppState("dashboard")
          } else {
            setAppState("location-setup")
          }
        } else {
          setAppState("login")
        }
      } else {
        setAppState("login")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (userData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("busca-local-user", JSON.stringify(userData))
    }
    setAppState("location-setup")
  }

  const handleLocationSetup = (locationData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("busca-local-location", JSON.stringify(locationData))
    }
    setAppState("dashboard")
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("busca-local-user")
      localStorage.removeItem("busca-local-location")
    }
    setAppState("login")
  }

  if (!isMounted) {
    return <LoadingScreen />
  }

  return (
    <DeviceDetector>
      {(() => {
        switch (appState) {
          case "loading":
            return <LoadingScreen />
          case "login":
            return <LoginPage onLogin={handleLogin} />
          case "location-setup":
            return <LocationSetup onLocationSet={handleLocationSetup} />
          case "dashboard":
            return <Dashboard onLogout={handleLogout} />
          default:
            return <LoadingScreen />
        }
      })()}
    </DeviceDetector>
  )
}
