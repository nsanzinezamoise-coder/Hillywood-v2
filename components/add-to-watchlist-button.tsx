"use client"

import { useState } from "react"
import { Bookmark, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface AddToWatchlistButtonProps {
    id: string
    type: "movie" | "series"
}

export function AddToWatchlistButton({ id, type }: AddToWatchlistButtonProps) {
    const { user } = useAuth()
    const [isAdding, setIsAdding] = useState(false)
    const [added, setAdded] = useState(false)

    const handleAddToWatchlist = async () => {
        if (!user) return

        setIsAdding(true)

        try {
            const response = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(type === "movie" ? { movieId: id } : { seriesId: id }),
            })

            if (response.ok) {
                setAdded(true)
                toast.success("Added to Watchlist", {
                    description: `Successfully added to your watchlist.`,
                })
            } else {
                toast.error("Failed to add to watchlist")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsAdding(false)
        }
    }

    if (!user) return null

    return (
        <Button
            size="lg"
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={handleAddToWatchlist}
            disabled={isAdding || added}
        >
            {added ? <Check className="h-5 w-5 text-green-500" /> : <Bookmark className="h-5 w-5" />}
            {added ? "Added to Watchlist" : "Add to Watchlist"}
        </Button>
    )
}
