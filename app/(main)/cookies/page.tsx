"use client"

import React from "react"
import { Cookie, Info, Settings, ShieldCheck, CheckCircle2, Clock } from "lucide-react"

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

export default function CookiePage() {
    return (
        <LegalLayout
            title="Cookie Policy"
            lastUpdated="March 2026"
            icon={<Cookie className="w-8 h-8" />}
            content={
                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Info className="w-6 h-6 text-primary" /> What are Cookies?
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Cookies are small fragments of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the service or a third-party to recognize you and make your next visit easier and the service more useful to you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-primary" /> How We Use Cookies
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use cookies for the following purposes:
                        </p>
                        <ul className="grid gap-3">
                            {[
                                "Essential cookies to operate the service and authentication.",
                                "Analytics cookies to track usage and performance.",
                                "Preference cookies to remember your settings (like language or playback quality).",
                                "Marketing cookies to deliver relevant advertisements (if applicable)."
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
                            <ShieldCheck className="w-6 h-6 text-primary" /> Your Choices
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. However, this may prevent you from taking full advantage of the hillywood website.
                        </p>
                    </section>

                    <section className="p-8 rounded-3xl bg-primary/5 border border-primary/10">
                        <h3 className="text-xl font-bold mb-4">Managing Preferences</h3>
                        <p className="text-muted-foreground mb-0">
                            You can also manage your cookie preferences directly through our Cookie Settings panel available in the footer of our website.
                        </p>
                    </section>
                </div>
            }
        />
    )
}
