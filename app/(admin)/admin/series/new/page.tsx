export const dynamic = "force-dynamic"
// app/admin/series/new/page.tsx - SERVER COMPONENT
import { connectToDatabase } from "@/lib/mongodb"
import { Category, Series } from "@/lib/models"
import { NewSeriesClient } from "@/app/(admin)/admin/series/new/new-series-client"

async function getCategories() {
    await connectToDatabase()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return JSON.parse(JSON.stringify(categories))
}

async function getAllSeriesTitles() {
    await connectToDatabase()
    // Only return TOP-LEVEL series (no parentSeries) — not individual episodes
    const series = await Series.find(
        { parentSeries: null }
    ).sort({ title: 1 }).lean()

    return JSON.parse(JSON.stringify(series))
}

export default async function NewSeriesPage() {
    const categories = await getCategories()
    const allSeries = await getAllSeriesTitles()

    return <NewSeriesClient categories={categories} allSeries={allSeries} />
}