"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, User, Mail, Lock, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const passwordRequirements = [
    { met: password.length >= 6, text: "6+ characters" },
    { met: /[A-Z]/.test(password), text: "Uppercase letter" },
    { met: /[0-9]/.test(password), text: "At least one number" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      await signup(name, email, password)
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account")
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
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">
            Join the community and start streaming
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
                htmlFor="name"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-primary transition-colors"
              >
                Full Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-14 bg-background/50 border-border rounded-2xl px-6 pl-12 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>

            <div className="group transition-all">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-primary transition-colors"
              >
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 bg-background/50 border-border rounded-2xl px-6 pl-12 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>

            <div className="group transition-all">
              <Label
                htmlFor="password"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-primary transition-colors"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 bg-background/50 border-border rounded-2xl px-6 pl-12 pr-14 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 ml-4">
                      {passwordRequirements.map((req, i) => (
                        <div
                          key={i}
                          className={`text-[10px] uppercase tracking-tighter font-bold flex items-center gap-1 ${req.met ? "text-green-500" : "text-muted-foreground/40"
                            }`}
                        >
                          <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-0"}`} />
                          {req.text}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="group transition-all">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-primary transition-colors"
              >
                Confirm Security
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-14 bg-background/50 border-border rounded-2xl px-6 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
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
                Create Account
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground font-bold hover:text-primary transition-colors underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
          <p className="mt-6 text-[10px] text-muted-foreground/20 uppercase tracking-widest">
            Protected by <span className="text-muted-foreground/40">hillywood Cloud</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
