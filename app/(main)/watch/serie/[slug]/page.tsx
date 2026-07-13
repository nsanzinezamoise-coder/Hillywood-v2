import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { Series } from "@/lib/models"
import { SerieWatchPlayer } from "@/components/serie-watch-player"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

async function getSeries(slug: string) {
  await connectToDatabase()

  const series = await Series.findOne({ slug, approvalStatus: "approved" })
    .populate("category", "name slug")
    .lean()

  if (!series) return null

  return JSON.parse(JSON.stringify(series))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const series = await getSeries(slug)

  if (!series) {
    return {
      title: "Series Not Found",
    }
  }

  return {
    title: `Watch ${series.title}`,
    description: series.description,
    openGraph: {
      title: `Watch ${series.title}`,
      description: series.description,
      images: [series.poster],
    },
  }
}

export default async function WatchSeriesPage({ params }: Props) {
  const { slug } = await params
  const series = await getSeries(slug)

  if (!series) {
    notFound()
  }

  return <SerieWatchPlayer series={series} />
}