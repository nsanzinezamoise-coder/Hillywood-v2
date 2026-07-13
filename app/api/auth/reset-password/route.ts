import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Hash the token from the URL to compare with the one in the database
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            )
        }

        // Update password
        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        return NextResponse.json({ message: "Password updated successfully" })
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
