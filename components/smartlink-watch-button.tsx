"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SmartlinkWatchButtonProps {
  watchUrl: string
  title: string
  className?: string
  children?: React.ReactNode
}

export function SmartlinkWatchButton({ 
  watchUrl, 
  title, 
  className,
  children 
}: SmartlinkWatchButtonProps) {

  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = watchUrl
  }

  return (
    <Button 
      size="lg" 
      className={`gap-2 ${className || ""}`}
      onClick={handleWatchClick}
    >
      <Play className="h-5 w-5 fill-current" />
      {children || 'Watch Now'}
    </Button>
  )
}
