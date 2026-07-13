"use client"

import React from "react"
import { Search, HelpCircle, Book, Video, Shield, CreditCard, User, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HelpCenterPage() {
    const categories = [
        {
            icon: User,
            title: "Account & Profile",
            description: "Manage your subscription, change passwords, and update profile details.",
            links: ["Changing your password", "How to delete account", "Managing profiles"],
        },
        {
            icon: Shield,
            title: "Privacy & Security",
            description: "Learn how we protect your data and how you can manage your privacy settings.",
            links: ["Data protection policy", "Two-factor authentication", "Privacy settings"],
        },
        {
            icon: CreditCard,
            title: "Billing & Plans",
            description: "Information about subscription tiers, payment methods, and invoices.",
            links: ["Accepted payment methods", "How to cancel subscription", "Update billing info"],
        },
        {
            icon: Video,
            title: "Watching hillywood",
            description: "Technical support for streaming, supported devices, and video quality.",
            links: ["Supported devices", "Video quality settings", "Buffering issues"],
        },
        {
            icon: Book,
            title: "For Filmmakers",
            description: "Resources for creators looking to showcase their work on hillywood.",
            links: ["Submission guidelines", "Monetization for creators", "Technical requirements"],
        },
        {
            icon: HelpCircle,
            title: "General FAQ",
            description: "Answers to the most common questions about hillywood.",
            links: ["What is hillywood?", "Where is it available?", "Gift cards"],
        },
    ]

    return (
        <div className="min-h-screen bg-background pt-20 md:pt-28">
            {/* Hero Search Section */}
            <section className="py-12 md:py-20 bg-primary/5 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">How can we help you today?</h1>
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Search for articles, topics, or keywords..."
                            className="h-14 pl-12 pr-4 rounded-2xl bg-background border-none shadow-lg focus-visible:ring-primary"
                        />
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                        <span>Popular:</span>
                        <button className="hover:text-primary underline decoration-primary/30">Reset password</button>
                        <button className="hover:text-primary underline decoration-primary/30">Payment methods</button>
                        <button className="hover:text-primary underline decoration-primary/30">Device compatibility</button>
                    </div>
                </div>

                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />
            </section>

            {/* Categories Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category, index) => (
                            <Card key={index} className="border-border/40 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <category.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl">{category.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                                        {category.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {category.links.map((link, lIndex) => (
                                            <li key={lIndex}>
                                                <button className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors group/link">
                                                    <span className="mr-2 h-1 w-1 rounded-full bg-primary" />
                                                    {link}
                                                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 border-t border-border/40 bg-muted/20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif font-bold mb-4">Still need help?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Our support team is available 24/7 to assist you with any questions or issues you might have.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" className="rounded-xl px-8" asChild>
                            <a href="/contact">Contact Support</a>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-xl px-8">
                            Live Chat
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
