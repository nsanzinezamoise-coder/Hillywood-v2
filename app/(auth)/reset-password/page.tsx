"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, CheckCircle2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams?.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError("No reset token found. Please check your link.")
        }
    }, [token])

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
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password")
            }

            setIsSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
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
                        New Password
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Resetting password for a fresh start in your cinematic journey
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {error && (
                                <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-center">
                                    <p className="text-sm text-destructive font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="group transition-all">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-primary transition-colors"
                                        >
                                            New Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="h-14 bg-background/50 border-border rounded-2xl px-6 pl-14 pr-14 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="group transition-all">
                                        <Label
                                            htmlFor="confirm-password"
                                            className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-primary transition-colors"
                                        >
                                            Confirm New Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirm-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="h-14 bg-background/50 border-border rounded-2xl px-6 pl-14 pr-14 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !token}
                                    className="w-full h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-lg font-bold transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Update Password
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-6 py-6"
                        >
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-foreground font-bold text-xl mb-2">Password Reset Successful!</p>
                                <p className="text-muted-foreground text-sm max-w-[280px]">
                                    Your password has been updated. You can now use your new password to sign in.
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground italic">Redirecting to login...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
