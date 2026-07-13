"use client"

import React from "react"
import { Shield, FileText, Lock, Globe, Clock, CheckCircle2 } from "lucide-react"

interface LegalPageProps {
    title: string
    lastUpdated: string
    icon: React.ReactNode
    content: React.ReactNode
}

function LegalLayout({ title, lastUpdated, icon, content }: LegalPageProps) {
    return (
        <div className="min-h-screen bg-background pt-20 md:pt-28 pb-20">
            {/* Header */}
            <section className="py-12 md:py-20 bg-muted/30 border-b border-border/50">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 text-primary">
                        {icon}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{title}</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Last Updated: {lastUpdated}</span>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {content}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default function TermsPage() {
    return (
        <LegalLayout
            title="Terms of Service"
            lastUpdated="March 2026"
            icon={<FileText className="w-8 h-8" />}
            content={
                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-primary">1.</span> Acceptance of Terms
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing and using hillywood, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-primary">2.</span> Subscription & Billing
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            hillywood offers subscription-based access to its content. By subscribing, you agree to:
                        </p>
                        <ul className="grid gap-3">
                            {[
                                "Provide accurate and complete billing information.",
                                "Authorize us to charge your provided payment method.",
                                "Accept changes to subscription fees with prior notice.",
                                "Cancel at any time before the next billing cycle."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-primary">3.</span> Content Usage
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            All content provided on hillywood, including movies, series, text, and graphics, is the property of hillywood or its content suppliers and is protected by international copyright laws. You are granted a limited, non-exclusive license for personal, non-commercial viewing only.
                        </p>
                    </section>

                    <section className="p-8 rounded-3xl bg-primary/5 border border-primary/10">
                        <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                        <p className="text-muted-foreground mb-0">
                            If you have any questions about these Terms, please contact us at <a href="mailto:legal@hillywood.rw" className="text-primary hover:underline">legal@hillywood.rw</a>.
                        </p>
                    </section>
                </div>
            }
        />
    )
}
