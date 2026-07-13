"use client"

/**
 * Thin "use client" wrapper so that `dynamic(..., { ssr: false })` is legal.
 * Server Components cannot use ssr:false directly — they must delegate to a
 * Client Component. This file is that delegate.
 */
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const WatchPlayer = dynamic(
    () => import("@/components/watch-player").then((m) => ({ default: m.WatchPlayer })),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-white">
                    <Loader2 className="w-10 h-10 animate-spin text-white/60" />
                    <span className="text-sm">Loading player…</span>
                </div>
            </div>
        ),
    }
)

interface Movie {
    _id: string
    title: string
    slug: string
    videoUrl: string
    poster: string
    backdrop?: string
}

export function WatchPlayerClient({ movie }: { movie: Movie }) {
    return <WatchPlayer movie={movie} />
}
