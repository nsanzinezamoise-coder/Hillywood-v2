import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie } from "@/lib/models"
import { requireAdmin } from "@/lib/session"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params
    const { action } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await connectToDatabase()

    const movie = await Movie.findById(id)
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    movie.approvalStatus = action === "approve" ? "approved" : "rejected"
    movie.approvedBy = new mongoose.Types.ObjectId(session.userId)
    movie.approvedAt = new Date()

    await movie.save()

    return NextResponse.json({
      success: true,
      movie,
    })
  } catch (error) {
    console.error("Update approval error:", error)
    return NextResponse.json(
      { error: "Failed to update approval status" },
      { status: 500 }
    )
  }
}
