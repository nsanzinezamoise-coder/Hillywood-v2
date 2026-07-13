import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Category, Movie, User, Series } from "@/lib/models"
import { getSession } from "@/lib/session"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const adminUser = await User.findById(session.userId)
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const categories = await Category.find().sort({ name: 1 })

    // Get movie counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const movieCount = await Movie.countDocuments({ category: cat._id })
        const seriesCount = await Series.countDocuments({ category: cat._id })
        return { ...cat.toObject(), movieCount, seriesCount }
      })
    )

    return NextResponse.json({ categories: categoriesWithCounts })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const adminUser = await User.findById(session.userId)
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const slug = generateSlug(name)

    // Check for duplicate
    const existing = await Category.findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const category = await Category.create({
      name,
      slug,
      description,
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
