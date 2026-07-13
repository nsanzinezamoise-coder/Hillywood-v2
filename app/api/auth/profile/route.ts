import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { name, email, avatar, password, currentPassword } = await request.json();

        await connectToDatabase();

        // Get user with password field
        const userDoc = await User.findById(user._id).select("+password");

        if (!userDoc) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const updateData: any = {};
        
        // Update name
        if (name && name.trim()) {
            updateData.name = name.trim();
        }
        
        // Update email
        if (email && email.trim()) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: "Invalid email format" },
                    { status: 400 }
                );
            }
            
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ 
                email: email.toLowerCase().trim(),
                _id: { $ne: user._id }
            });
            
            if (existingUser) {
                return NextResponse.json(
                    { error: "Email already in use" },
                    { status: 409 }
                );
            }
            
            updateData.email = email.toLowerCase().trim();
        }
        
        // Update avatar
        if (avatar) {
            updateData.avatar = avatar;
        }
        
        // Update password (requires current password)
        if (password) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: "Current password is required to change password" },
                    { status: 400 }
                );
            }
            
            // Verify current password
            const isValidPassword = await userDoc.comparePassword(currentPassword);
            if (!isValidPassword) {
                return NextResponse.json(
                    { error: "Current password is incorrect" },
                    { status: 401 }
                );
            }
            
            // Validate new password
            if (password.length < 6) {
                return NextResponse.json(
                    { error: "Password must be at least 6 characters" },
                    { status: 400 }
                );
            }
            
            // Hash new password
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(password, salt);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
            },
        });
    } catch (error: any) {
        console.error("Profile update error:", error);
        
        // Handle duplicate email error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: error.message || "Failed to update profile" },
            { status: 500 }
        );
    }
}
