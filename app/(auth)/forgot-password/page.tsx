"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to process request")
            }

            setIsSubmitted(true)
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
                <div className="mb-10">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors gap-2 mb-6 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Sign In
                    </Link>
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
                            Reset Password
                        </h1>
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.p
                                    key="instruction"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-muted-foreground text-sm md:text-base font-medium"
                                >
                                    Enter your email address and we'll send you a link to reset your password.
                                </motion.p>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-4 mt-6"
                                >
                                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-primary" />
                                    </div>
                                    <p className="text-foreground font-bold text-lg text-center">
                                        Check your email
                                    </p>
                                    <p className="text-muted-foreground text-sm text-center max-w-[280px]">
                                        We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>.
                                    </p>
                                    <Button
                                        variant="link"
                                        onClick={() => setIsSubmitted(false)}
                                        className="mt-2 text-primary hover:text-primary/80 font-bold"
                                    >
                                        Didn't receive the email? Try again
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {!isSubmitted && (
                    <>
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
                                        className="h-14 bg-background/50 border-border rounded-2xl px-6 pl-14 text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                                        Send Reset Link
                                        <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </motion.div>
    )
}
