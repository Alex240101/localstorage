"use client"

import { Button } from "@/components/ui/button"
import { Grid3X3, List, Map } from "lucide-react"

interface ResultsViewToggleProps {
  currentView: "list" | "grid" | "map"
  onViewChange: (view: "list" | "grid" | "map") => void
}

export function ResultsViewToggle({ currentView, onViewChange }: ResultsViewToggleProps) {
  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-lg">
      <Button variant={currentView === "list" ? "default" : "ghost"} size="sm" onClick={() => onViewChange("list")}>
        <List className="w-4 h-4" />
      </Button>
      <Button variant={currentView === "grid" ? "default" : "ghost"} size="sm" onClick={() => onViewChange("grid")}>
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button variant={currentView === "map" ? "default" : "ghost"} size="sm" onClick={() => onViewChange("map")}>
        <Map className="w-4 h-4" />
      </Button>
    </div>
  )
}
