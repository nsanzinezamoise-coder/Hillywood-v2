// ISR: revalidate this page every hour
export const revalidate = 3600

import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie } from "@/lib/models"
import type { Metadata } from "next"

import { WatchPlayerClient } from "@/components/watch-player-client"

interface Props {
  params: Promise<{ slug: string }>
}

// Request-scoped cache — shared between generateMetadata and the page
const movieCache = new Map<string, Promise<ReturnType<typeof fetchMovie>>>()

async function fetchMovie(slug: string) {
  await connectToDatabase()

  const movie = await Movie.findOne({ slug, approvalStatus: "approved" })
    .populate("category", "name slug")
    .lean()

  if (!movie) return null

  // Increment view count
  await Movie.findByIdAndUpdate(movie._id, { $inc: { views: 1 } })

  return JSON.parse(JSON.stringify(movie))
}

function getMovie(slug: string) {
  if (!movieCache.has(slug)) {
    movieCache.set(slug, fetchMovie(slug))
  }
  return movieCache.get(slug)!
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const movie = await getMovie(slug)

  if (!movie) {
    return { title: "Movie Not Found" }
  }

  return {
    title: `Watch ${movie.title}`,
    description: movie.description,
    openGraph: {
      title: `Watch ${movie.title}`,
      description: movie.description,
      images: [movie.poster],
    },
  }
}

export default async function WatchPage({ params }: Props) {
  const { slug } = await params
  const movie = await getMovie(slug)

  if (!movie) {
    notFound()
  }

  return <WatchPlayerClient movie={movie} />
}
