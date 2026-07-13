export const dynamic = "force-dynamic"
import { Suspense } from "react"
import { connectToDatabase } from "@/lib/mongodb"
import { Category } from "@/lib/models"
import { BrowseSeries } from "@/components/browse-series"

async function getCategories() {
  await connectToDatabase()
  const categories = await Category.find().sort({ name: 1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

export const metadata = {
  title: "Browse Series & TV Shows",
  description:
    "Browse and discover Rwandan TV series, shows, and episodic content by genre, year, and language.",
}

export default async function BrowsePage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-8">
        <h1 className="mt-5 font-bold text-lg md:text-xl lg:text-2xl tracking-wide drop-shadow-lg">
          Browse Series
        </h1>
        <p className="text-muted-foreground">
          Discover Rwandan cinema by genre, year, or language
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-lg" />
                <div className="mt-3 h-4 bg-muted rounded w-3/4" />
                <div className="mt-2 h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        }
      >
        <BrowseSeries categories={categories} />
      </Suspense>
    </div>
  )
}
