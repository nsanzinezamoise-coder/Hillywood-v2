"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin" | "moderator"
  avatar?: string
  watchlist?: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()

    // Periodically refresh user data to handle real-time role changes
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshUser()
      }
    }, 30000) // Poll every 30 seconds

    // Handle session re-verification when navigating back/forward (BFCache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshUser()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser()
      }
    }

    window.addEventListener("pageshow", handlePageShow)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("pageshow", handlePageShow)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to log in")
    }

    setUser(data.user)
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create account")
    }

    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      // Force a re-fetch of 'me' to be absolutely sure, or just rely on the fetch above
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null) // Still clear local state
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
