import mongoose, { Schema, Document, Model } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  role: "user" | "admin" | "moderator"
  avatar?: string
  watchlist: mongoose.Types.ObjectId[]
  downloads: mongoose.Types.ObjectId[]
  watchHistory: {
    movie?: mongoose.Types.ObjectId
    series?: mongoose.Types.ObjectId
    watchedAt: Date
    progress: number
  }[]
  subscription: {
    tier: "free" | "basic" | "premium"
    status: "active" | "cancelled" | "expired"
    currentPeriodEnd?: Date
  }
  isActive: boolean
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    watchlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    downloads: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    watchHistory: [
      {
        movie: {
          type: Schema.Types.ObjectId,
          ref: "Movie",
        },
        series: {
          type: Schema.Types.ObjectId,
          ref: "Series",
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    subscription: {
      tier: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active",
      },
      currentPeriodEnd: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
)

// Hash password before saving

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    throw error
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
