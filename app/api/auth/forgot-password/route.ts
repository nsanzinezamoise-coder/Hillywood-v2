import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models"
import crypto from "crypto"
import nodemailer from "nodemailer"


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        await connectToDatabase()

        // 1. Check if user exists before doing anything else
        const user = await User.findOne({ email })
        if (!user) {
            return NextResponse.json({ error: "No account found with this email address" }, { status: 404 })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex")
        const hash = crypto.createHash("sha256").update(resetToken).digest("hex")

        // Token expires in 1 hour
        user.resetPasswordToken = hash
        user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000)

        await user.save()

        // Create reset URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

        // Email Template
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a; line-height: 1.6;">
        <h1 style="color: #ed1c24; text-align: center; margin-bottom: 30px;">RWANDA CINEMA</h1>
        <div style="background-color: #f9f9f9; padding: 40px; border-radius: 20px; border: 1px solid #eeeeee;">
          <h2 style="margin-top: 0;">Password Reset Request</h2>
          <p>You requested a password reset for your Rwanda Cinema account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background-color: #ed1c24; color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 60 minutes. If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
          <p style="font-size: 13px; color: #888888; text-align: center;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    `

        // 2. Use specific try-catch for email delivery
        if (!process.env.SMTP_USER) {
            console.log("------------------- PASSWORD RESET LINK -------------------")
            console.log(resetUrl)
            console.log("-----------------------------------------------------------")
            return NextResponse.json({ message: "Reset link generated in console (Development Mode)" })
        } else {
            try {
                await transporter.sendMail({
                    from: '"Rwanda Cinema" <ngabodaniel1000@gmail.com>',
                    to: user.email,
                    subject: "Password Reset Request - Rwanda Cinema",
                    html: emailHtml,
                })
                return NextResponse.json({ message: "Reset email sent successfully" })
            } catch (mailError) {
                console.error("Email delivery failed:", mailError)
                return NextResponse.json(
                    { error: "Failed to send email. Please check your credentials." },
                    { status: 500 }
                )
            }
        }
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
