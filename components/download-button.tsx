"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  id: string
  type: "movie" | "series"
  downloadUrl: string
}

export function DownloadButton({ id, type, downloadUrl }: DownloadButtonProps) {
  const handleDownload = () => {
    // Fire and forget, don't block the download
    fetch("/api/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(type === "movie" ? { movieId: id } : { seriesId: id }),
    }).catch((error) => console.error("Failed to register download action", error))
  }

  return (
    <Button
      size="lg"
      variant="secondary"
      className="gap-2"
      asChild
    >
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownload}
      >
        <Download className="h-5 w-5" />
        Download
      </a>
    </Button>
  )
}
