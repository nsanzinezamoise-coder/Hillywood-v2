"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="bg-card/40 dark:bg-white/5 backdrop-blur-2xl border border-border/50 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Sign In
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">
            Enter your details to continue your cinematic journey
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-center"
          >
            <p className="text-sm text-destructive font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="group transition-all">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-primary transition-colors"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 bg-background/50 border-border rounded-2xl px-6 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="group transition-all">
              <div className="flex items-center justify-between ml-4 mb-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-primary transition-colors"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 bg-background/50 border-border rounded-2xl px-6 pr-14 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-lg font-bold transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            New to the experience?{" "}
            <Link
              href="/signup"
              className="text-foreground font-bold hover:text-primary transition-colors underline underline-offset-4"
            >
              Join now
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
