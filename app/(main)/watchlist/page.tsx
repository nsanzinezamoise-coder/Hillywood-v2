"use client"

import { useAuth } from "@/lib/auth-context"
import useSWR from "swr"
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookmarkX, Film, LogIn } from "lucide-react"
import Link from "next/link"

interface Movie {
  _id: string
  title: string
  slug: string
  posterUrl: string
  releaseYear: number
  duration: number
  rating: number
  accessTier: "free" | "basic" | "premium"
  categories: Array<{ _id: string; name: string; slug: string }>
  seasons?: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function WatchlistPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { data, isLoading, mutate } = useSWR<{ watchlist: Movie[] }>(
    user ? "/api/watchlist" : null,
    fetcher
  )

  const handleRemove = async (movieId: string) => {
    try {
      await fetch(`/api/watchlist?movieId=${movieId}`, { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Failed to remove from watchlist:", error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Sign in to view your watchlist
          </h1>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to save movies and build your personal watchlist.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            My Watchlist
          </h1>
          <p className="text-muted-foreground">
            {data?.watchlist?.length || 0} movies saved
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : !data?.watchlist?.length ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Browse our collection and add movies you want to watch later.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Movies</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.watchlist.map((movie) => (
              <div key={movie._id} className="group relative">
                <MovieCard
                  movie={{
                    _id: movie._id,
                    title: movie.title,
                    slug: movie.slug,
                    poster: movie.posterUrl || "/placeholder.svg",
                    releaseYear: movie.releaseYear,
                    rating: movie.rating || 0,
                    duration: movie.duration,
                    seasons: movie.seasons,
                    category: movie.categories?.[0]
                      ? { name: movie.categories[0].name }
                      : undefined,
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => handleRemove(movie._id)}
                >
                  <BookmarkX className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
