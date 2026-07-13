import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie } from "@/lib/models"
import { WatchPlayer } from "@/components/watch-player"
import type { Metadata } from "next"

interface Props {
    params: Promise<{ slug: string }>
}

async function getMovie(slug: string) {
    await connectToDatabase()

    const movie = await Movie.findOne({ slug, approvalStatus: "approved" })
        .populate("category", "name slug")
        .lean()

    if (!movie) return null

    // Increment view count removed - will be handled in watch player component
    // await Movie.findByIdAndUpdate(movie._id, { $inc: { views: 1 } })

    return JSON.parse(JSON.stringify(movie))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const movie = await getMovie(slug)

    if (!movie) {
        return {
            title: "Movie Not Found",
        }
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

    return <WatchPlayer movie={movie} />
}