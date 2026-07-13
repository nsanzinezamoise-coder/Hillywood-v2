// ISR: revalidate this page every hour
export const revalidate = 3600

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Series, Review } from "@/lib/models"
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { ReviewSection } from "@/components/review-section"
import { ShareActions } from "@/components/share-actions"
import { AddToWatchlistButton } from "@/components/add-to-watchlist-button"
import { DownloadButton } from "@/components/download-button"
import { SmartlinkWatchButton } from "@/components/smartlink-watch-button"
import {
  Star,
  Clock,
  Calendar,
  Globe,
  User,
  Users,
  Play,
  Bookmark,
  Share2,
  Download,
} from "lucide-react"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

// Request-scoped cache — prevents the double DB hit from generateMetadata + page
const movieCache = new Map<string, ReturnType<typeof fetchMovieData>>()

async function fetchMovieData(slug: string) {
  await connectToDatabase()

  const movie = await Movie.findOne({ slug, approvalStatus: "approved" })
    .populate("category", "name slug")
    .lean()

  if (!movie) return null


  // Get reviews
  const reviews = await Review.find({ movie: movie._id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  // Get related content - filter strictly by same category
  let relatedContent: any[] = []
  if (movie.category?._id) {
    const [movies, series] = await Promise.all([
      Movie.find({
        _id: { $ne: movie._id },
        category: movie.category._id,
        approvalStatus: "approved",
      })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Series.find({
        category: movie.category._id,
        approvalStatus: "approved",
      })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
    ])

    relatedContent = [...movies, ...series]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12)
  }

  // If no same-category content, fallback to popular ones
  if (relatedContent.length === 0) {
    const [movies, series] = await Promise.all([
      Movie.find({
        _id: { $ne: movie._id },
        approvalStatus: "approved",
      })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Series.find({
        approvalStatus: "approved",
      })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
    ])

    relatedContent = [...movies, ...series]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12)
  }

  return {
    movie: JSON.parse(JSON.stringify(movie)),
    reviews: JSON.parse(JSON.stringify(reviews)),
    relatedMovies: JSON.parse(JSON.stringify(relatedContent)),
  }
}

function getMovie(slug: string) {
  if (!movieCache.has(slug)) {
    movieCache.set(slug, fetchMovieData(slug))
  }
  return movieCache.get(slug)!
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getMovie(slug)

  if (!data) {
    return {
      title: "Movie Not Found",
    }
  }

  return {
    title: data.movie.title,
    description: data.movie.description,
    openGraph: {
      title: data.movie.title,
      description: data.movie.description,
      images: [data.movie.poster],
    },
  }
}

export default async function MoviePage({ params }: Props) {
  const { slug } = await params
  const data = await getMovie(slug)

  if (!data) {
    notFound()
  }

  const { movie, reviews, relatedMovies } = data

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Hero Section with Backdrop */}
      <section className="relative">
        {/* Backdrop Image */}
        <div className="absolute inset-0 h-[60vh]">
          <Image
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 pt-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0 w-full max-w-[300px] mx-auto lg:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={movie.poster || "/placeholder.svg"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 lg:pt-8">
              {/* Category Badge */}
              {movie.category && (
                <Link
                  href={`/browse?category=${movie.category.slug}`}
                  className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                  {movie.category.name}
                </Link>
              )}

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance uppercase">
                {movie.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {movie.releaseYear}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDuration(movie.duration)}
                </span>
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {movie.rating.toFixed(1)}{" "}
                    <span className="text-sm">({movie.ratingCount} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {movie.languages?.join(", ")}
                </span>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {movie.description}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <SmartlinkWatchButton 
                  watchUrl={`/watch/movie/${movie.slug}`} 
                  title={movie.title}
                >
                  Watch Now
                </SmartlinkWatchButton>

                {movie.downloadUrl && (
                  <DownloadButton id={movie._id.toString()} type="movie" downloadUrl={movie.downloadUrl} />
                )}

                <AddToWatchlistButton id={movie._id} type="movie" />

                <ShareActions
                  title={movie.title}
                  url={`/movie/${movie.slug}`}
                />
              </div>

              {/* Cast & Crew */}
              <div className="grid sm:grid-cols-2 gap-6">
                {movie.cast.length > 0 && (
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Cast
                    </h3>
                    <p className="text-foreground">{movie.cast.join(", ")}</p>
                  </div>
                )}
                {movie.director && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      Director
                    </h3>
                    <p className="text-foreground">{movie.director}</p>
                  </div>
                )}
                {movie.producer && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      Producer
                    </h3>
                    <p className="text-foreground">{movie.producer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Suggestion Movies */}
        {relatedMovies.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6">
              More Like This
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {relatedMovies.map((relatedMovie: any) => (
                <MovieCard key={relatedMovie._id} movie={relatedMovie} />
              ))}
            </div>
          </section>
        )}
        {/* Tags */}
        {movie.tags.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-xl font-bold text-foreground mb-4">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {movie.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag}`}
                  className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <ReviewSection movieId={movie._id} initialReviews={reviews} />
      </div>
    </div>
  )
}
