export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { Series, Category } from "@/lib/models"
import { SeriesForm } from "@/components/admin/series-form"

interface Props {
    params: Promise<{ id: string }>
}

async function getSeries(id: string) {
    await connectToDatabase()
    const series = await Series.findById(id)
        .populate("category", "name slug _id")
        .lean()
    if (!series) return null
    return JSON.parse(JSON.stringify(series))
}

async function getCategories() {
    await connectToDatabase()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return JSON.parse(JSON.stringify(categories))
}

export default async function EditSeriesPage({ params }: Props) {
    const { id } = await params
    const [series, categories] = await Promise.all([
        getSeries(id),
        getCategories(),
    ])

    if (!series) {
        notFound()
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-foreground">
                    Edit Series
                </h1>
                <p className="text-muted-foreground">
                    Update series details and media
                </p>
            </div>

            <SeriesForm categories={categories} selectedSeries={series} isNewMovie={false} />
        </div>
    )
}
