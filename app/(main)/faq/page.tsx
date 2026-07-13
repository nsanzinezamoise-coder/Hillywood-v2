"use client"

import React from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { MessageCircleQuestion, Sparkles, Tv, CreditCard, ShieldCheck } from "lucide-react"

export default function FAQPage() {
    const faqCategories = [
        {
            title: "General Questions",
            icon: Sparkles,
            questions: [
                {
                    q: "What is hillywood?",
                    a: "hillywood is a premium streaming platform dedicated to celebrating and distributing Rwandan and African cinema. We provide a stage for local filmmakers and offer a curated collection of movies, series, and short films to audiences worldwide."
                },
                {
                    q: "Where can I watch hillywood?",
                    a: "You can watch hillywood on any internet-connected device, including smartphones, tablets, computers, and smart TVs. Simply visit our website or download our app to start streaming."
                },
                {
                    q: "Is there a free trial?",
                    a: "Yes, we often offer promotional periods or free trials for new subscribers. Check our pricing page for the latest offers."
                }
            ]
        },
        {
            title: "Streaming & Devices",
            icon: Tv,
            questions: [
                {
                    q: "What internet speed do I need?",
                    a: "For the best experience, we recommend a minimum download speed of 5 Mbps for HD quality and 25 Mbps for 4K streaming. The platform automatically adjusts video quality based on your connection speed."
                },
                {
                    q: "Can I download movies to watch offline?",
                    a: "Yes! Most of our content is available for download on our mobile applications (iOS and Android) for offline viewing."
                }
            ]
        },
        {
            title: "Billing & Subscriptions",
            icon: CreditCard,
            questions: [
                {
                    q: "How much does hillywood cost?",
                    a: "We offer several subscription plans to fit your needs, including monthly and annual options. Please visit our pricing page for detailed information on current rates."
                },
                {
                    q: "How do I cancel my subscription?",
                    a: "You can cancel your subscription at any time through your Account Settings. Your access will continue until the end of the current billing period."
                }
            ]
        },
        {
            title: "Privacy & Security",
            icon: ShieldCheck,
            questions: [
                {
                    q: "Is my personal information secure?",
                    a: "Absolutely. We use industry-standard encryption and security protocols to protect your data. We never share your personal information with third parties without your explicit consent."
                }
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-background pt-20 md:pt-28">
            {/* Header */}
            <section className="py-12 md:py-20 bg-muted/30">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-primary/10 text-primary">
                        <MessageCircleQuestion className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Frequently Asked Questions</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 italic">Got Questions? <span className="not-italic">We've Got Answers.</span></h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about hillywood. If you can't find what you're looking for, feel free to contact our support team.
                    </p>
                </div>
            </section>

            {/* FAQ Accordions */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-16">
                        {faqCategories.map((category, idx) => (
                            <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <category.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{category.title}</h2>
                                </div>
                                <Accordion type="single" collapsible className="w-full space-y-4">
                                    {category.questions.map((item, qIdx) => (
                                        <AccordionItem
                                            key={qIdx}
                                            value={`item-${idx}-${qIdx}`}
                                            className="border border-border/50 bg-card/30 rounded-2xl px-6 transition-all hover:bg-card/50 overflow-hidden"
                                        >
                                            <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still have questions? */}
            <section className="py-20 border-t border-border/40">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-2xl mx-auto rounded-3xl p-10 bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                        <h2 className="text-3xl font-serif font-bold mb-4">Still have questions?</h2>
                        <p className="text-muted-foreground mb-8">
                            Can't find the answer you're looking for? Please chat to our friendly team.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Get in touch
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
