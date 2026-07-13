"use client"

import { Upload, Radio, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardModal } from "./DashboardModalProvider"

export function DashboardHeaderButtons() {
  const { openModal } = useDashboardModal()

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => openModal("upload")}
        className="text-muted-foreground hover:text-foreground"
      >
        <Upload className="h-5 w-5" />
        <span className="sr-only">Upload</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => openModal("live")}
        className="text-muted-foreground hover:text-foreground"
      >
        <Radio className="h-5 w-5" />
        <span className="sr-only">Go Live</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => openModal("post")}
        className="text-muted-foreground hover:text-foreground"
      >
        <Edit3 className="h-5 w-5" />
        <span className="sr-only">Create Post</span>
      </Button>
    </div>
  )
}
