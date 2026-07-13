import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Short } from "@/lib/models"
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

        const short = await Short.findByIdAndUpdate(
            id,
            {
                approvalStatus: action === "approve" ? "approved" : "rejected",
            },
            { new: true }
        )

        if (!short) {
            return NextResponse.json(
                { error: "Short film not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            short,
        })
    } catch (error) {
        console.error("Update short approval error:", error)
        return NextResponse.json(
            { error: "Failed to update short film status" },
            { status: 500 }
        )
    }
}
