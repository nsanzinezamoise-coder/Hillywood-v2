export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Category } from "@/lib/models"
import { MovieForm } from "@/components/admin/movie-form"

interface Props {
    params: Promise<{ id: string }>
}

async function getMovie(id: string) {
    await connectToDatabase()
    const movie = await Movie.findById(id).lean()
    if (!movie) return null
    return JSON.parse(JSON.stringify(movie))
}

async function getCategories() {
    await connectToDatabase()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return JSON.parse(JSON.stringify(categories))
}

export default async function EditMoviePage({ params }: Props) {
    const { id } = await params
    const [movie, categories] = await Promise.all([
        getMovie(id),
        getCategories(),
    ])

    if (!movie) {
        notFound()
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-foreground">
                    Edit Movie
                </h1>
                <p className="text-muted-foreground">
                    Update movie details and media
                </p>
            </div>

            <MovieForm categories={categories} movie={movie} />
        </div>
    )
}
