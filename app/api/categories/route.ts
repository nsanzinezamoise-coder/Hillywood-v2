import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Category } from "@/lib/models"

export async function GET() {
  try {
    await connectToDatabase()

    const categories = await Category.find()
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
