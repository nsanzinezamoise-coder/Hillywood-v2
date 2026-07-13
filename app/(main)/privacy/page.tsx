"use client"

import React from "react"
import { Shield, Lock, Eye, Share2, Globe, CheckCircle2, Clock } from "lucide-react"

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

export default function PrivacyPage() {
    return (
        <LegalLayout
            title="Privacy Policy"
            lastUpdated="March 2026"
            icon={<Shield className="w-8 h-8" />}
            content={
                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-primary" /> Data Collection
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We collect information you provide directly to us when you create an account, subscribe to our service, or communicate with us. This may include your name, email address, payment information, and watch history.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Eye className="w-6 h-6 text-primary" /> How We Use Your Data
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Your data allows us to provide a personalized and seamless experience. Specifically, we use it to:
                        </p>
                        <ul className="grid gap-3">
                            {[
                                "Provide, maintain, and improve our services.",
                                "Process transactions and send related information.",
                                "Personalize your experience and provide recommendations.",
                                "Monitor and analyze trends, usage, and activities."
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
                            <Share2 className="w-6 h-6 text-primary" /> Information Sharing
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not share your personal information with third parties except as described in this policy, such as with your consent, to comply with laws, or to protect our rights.
                        </p>
                    </section>

                    <section className="p-8 rounded-3xl bg-primary/5 border border-primary/10">
                        <h3 className="text-xl font-bold mb-4">Your Privacy Choices</h3>
                        <p className="text-muted-foreground mb-0">
                            You can update your account information, manage your communication preferences, and request the deletion of your data at any time through your account settings or by contacting <a href="mailto:privacy@hillywood.rw" className="text-primary hover:underline">privacy@hillywood.rw</a>.
                        </p>
                    </section>
                </div>
            }
        />
    )
}
