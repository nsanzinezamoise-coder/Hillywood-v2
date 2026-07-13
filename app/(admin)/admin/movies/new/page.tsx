export const dynamic = "force-dynamic"

import { connectToDatabase } from "@/lib/mongodb"
import { Category } from "@/lib/models"
import { MovieForm } from "@/components/admin/movie-form"

async function getCategories() {
  await connectToDatabase()
  const categories = await Category.find().sort({ name: 1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

export default async function NewMoviePage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Add New Movie
        </h1>
        <p className="text-muted-foreground">
          Upload a new movie to the library
        </p>
      </div>

      <MovieForm categories={categories} />
    </div>
  )
}
