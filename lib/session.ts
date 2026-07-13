import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { connectToDatabase } from "./mongodb"
import { User, type IUser } from "./models"

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-secret-key-change-in-production"
)

const SESSION_COOKIE_NAME = "hillywood-session"
const DEFAULT_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const ADMIN_SESSION_DURATION = 1 * 24 * 60 * 60 * 1000 // 1 day

export interface SessionPayload {
  userId: string
  email: string
  role: "user" | "admin" | "moderator"
  expiresAt: Date
}

export async function createSession(user: IUser): Promise<string> {
  const duration = user.role === "admin" ? ADMIN_SESSION_DURATION : DEFAULT_SESSION_DURATION
  const expiresAt = new Date(Date.now() + duration)

  const token = await new SignJWT({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SECRET_KEY)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}


export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    const userId = payload.userId as string

    // Real-time role verification: Always use the role from the database
    await connectToDatabase()
    const userRoleDoc = await User.findById(userId).select("role").lean()

    if (!userRoleDoc) {
      return null
    }

    return {
      userId,
      email: payload.email as string,
      role: userRoleDoc.role as "admin" | "moderator" | "user",
      expiresAt: new Date((payload.exp as number) * 1000),
    }
  } catch {
    return null
  }
}

export const getSession = verifySession

export async function getCurrentUser(): Promise<IUser | null> {
  const session = await verifySession()

  if (!session) return null

  try {
    await connectToDatabase()
    const user = await User.findById(session.userId)
    return user
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireRole(allowedRoles: ("user" | "admin" | "moderator")[]): Promise<SessionPayload> {
  const session = await verifySession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden: Access denied")
  }

  return session
}

export async function requireAdmin(): Promise<SessionPayload> {
  return requireRole(["admin"])
}
