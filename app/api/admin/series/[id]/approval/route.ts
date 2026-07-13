import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/mongodb"
import { Series } from "@/lib/models"
import { requireAdmin } from "@/lib/session"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin()
        const { id } = await params
        const { action } = await request.json()

        if (!action || !["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        const series = await Series.findById(id)
        if (!series) {
            return NextResponse.json(
                { error: "Series not found" },
                { status: 404 }
            )
        }

        series.approvalStatus = action === "approve" ? "approved" : "rejected"
        series.approvedBy = new mongoose.Types.ObjectId(session.userId)
        series.approvedAt = new Date()

        await series.save()

        return NextResponse.json({
            success: true,
            series,
        })
    } catch (error) {
        console.error("Update series approval error:", error)
        return NextResponse.json(
            { error: "Failed to update series status" },
            { status: 500 }
        )
    }
}
