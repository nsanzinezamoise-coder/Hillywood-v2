// app/(main)/serie/[slug]/page.tsx
// ISR: revalidate this page every hour
export const revalidate = 3600

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import { Series, Review } from "@/lib/models"
import { VideoPlayer } from "@/components/video-player"
import { SeriesCard } from "@/components/series-card"
import { Button } from "@/components/ui/button"
import { ReviewSection } from "@/components/review-section"
import { ShareActions } from "@/components/share-actions"
import { AddToWatchlistButton } from "@/components/add-to-watchlist-button"
import { DownloadButton } from "@/components/download-button"
import { SmartlinkWatchButton } from "@/components/smartlink-watch-button"
import {
  Star,
  Calendar,
  Globe,
  Users,
  Play,
  Bookmark,
  Share2,
  Download,
  Clock,
} from "lucide-react"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

// Request-scoped cache — prevents double DB hit from generateMetadata + page
const seriesDetailCache = new Map<string, ReturnType<typeof fetchSeriesData>>()

async function fetchSeriesData(slug: string) {
  await connectToDatabase()

  const series = await Series.findOne({ slug, approvalStatus: "approved" })
    .populate("category", "name slug")
    .lean()

  if (!series) return null


  // reviews
  const reviews = await Review.find({ series: series._id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  // ------------------------------
  // FIND REAL EPISODES
  // ------------------------------
  const baseName = slug.includes("-s") ? slug.split("-s")[0] : slug

  const episodes = await Series.find({
    slug: { $regex: `^${baseName}-s`, $options: "i" },
    approvalStatus: "approved",
  })
    .sort({ createdAt: 1 })
    .lean()

  let relatedSeries: any[] = []

  if (episodes.length <= 1) {
    relatedSeries = await Series.find({
      _id: { $ne: series._id },
      category: series.category?._id,
      approvalStatus: "approved",
    })
      .sort({ rating: -1 })
      .limit(6)
      .lean()
  }

  return {
    series: JSON.parse(JSON.stringify(series)),
    reviews: JSON.parse(JSON.stringify(reviews)),
    episodes: JSON.parse(JSON.stringify(episodes)),
    relatedSeries: JSON.parse(JSON.stringify(relatedSeries)),
  }
}

function getSeries(slug: string) {
  if (!seriesDetailCache.has(slug)) {
    seriesDetailCache.set(slug, fetchSeriesData(slug))
  }
  return seriesDetailCache.get(slug)!
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getSeries(slug)

  if (!data) return { title: "Series Not Found" }

  return {
    title: data.series.title,
    description: data.series.description,
    openGraph: {
      title: data.series.title,
      description: data.series.description,
      images: [data.series.poster],
    },
  }
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params
  const data = await getSeries(slug)

  if (!data) notFound()

  const { series, reviews, relatedSeries, episodes } = data

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 h-[60vh]">
          <Image
            src={series.poster}
            alt={series.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 pt-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0 w-full max-w-[300px] mx-auto lg:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={series.poster || "/placeholder.svg"}
                  alt={series.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 lg:pt-8">
              {series.category && (
                <Link
                  href={`/series?category=${series.category.slug}`}
                  className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-primary text-primary-foreground rounded-full"
                >
                  {series.category.name}
                </Link>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 uppercase">
                {series.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {series.releaseYear}
                </span>

                {series.duration > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {Math.floor(series.duration / 60) > 0
                      ? `${Math.floor(series.duration / 60)}h ${series.duration % 60}m`
                      : `${series.duration}m`}
                  </span>
                )}

                {series.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {series.rating.toFixed(1)}
                    <span className="text-sm">({series.ratingCount} reviews)</span>
                  </span>
                )}

                {series.languages?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    {series.languages.join(", ")}
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {series.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <SmartlinkWatchButton 
                  watchUrl={`/watch/serie/${series.slug}`} 
                  title={series.title}
                >
                  Watch Now
                </SmartlinkWatchButton>
                {series.downloadurl && (
                  <DownloadButton id={series._id.toString()} type="series" downloadUrl={series.downloadurl} />
                )}
                <AddToWatchlistButton id={series._id} type="series" />
                <ShareActions
                  title={series.title}
                  url={`/serie/${series.slug}`}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {series.cast?.length > 0 && (
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Cast
                    </h3>
                    <p className="text-muted-foreground">{series.cast.join(", ")}</p>
                  </div>
                )}
                {series.director && (
                  <div>
                    <h3 className="text-sm font-medium mb-1 text-primary">Director</h3>
                    <p className="text-muted-foreground">{series.director}</p>
                  </div>
                )}
                {series.producer && (
                  <div>
                    <h3 className="text-sm font-medium mb-1 text-primary">Producer</h3>
                    <p className="text-muted-foreground">{series.producer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Carousel / Grid */}
        {episodes.length > 0 && (
          <section className="container mx-auto px-4 mt-12">
            <h2 className="text-2xl font-bold mb-6">Episodes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {episodes.map((ep: any) => (
                <Link
                  key={ep._id}
                  href={`/watch/serie/${series.slug}`}
                  className="group relative rounded-lg overflow-hidden"
                >
                  <div
                    className={`relative aspect-[2/3] ${ep._id === series._id ? "ring-2 ring-red-600" : ""
                      }`}
                  >
                    <Image
                      src={ep.poster}
                      alt={ep.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-sm font-semibold line-clamp-2 uppercase">{ep.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Reviews */}
        <ReviewSection seriesId={series._id} initialReviews={reviews} />

        {/* Related Series */}
        {relatedSeries.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedSeries.map((item: any) => (
                <SeriesCard key={item._id} series={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}