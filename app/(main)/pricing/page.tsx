"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Get started with Rwandan cinema",
    price: 0,
    currency: "RWF",
    period: "forever",
    features: [
      "Access to free content library",
      "Watch trailers and previews",
      "Standard video quality",
      "Ad-supported streaming",
      "Basic search and browse",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "basic",
    name: "Basic",
    description: "For regular movie lovers",
    price: 5000,
    currency: "RWF",
    period: "month",
    features: [
      "Everything in Free, plus:",
      "Full access to Basic library",
      "HD video quality",
      "No advertisements",
      "Watch on 1 device",
      "Download for offline viewing",
    ],
    cta: "Subscribe Now",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "The ultimate cinema experience",
    price: 12000,
    currency: "RWF",
    period: "month",
    features: [
      "Everything in Basic, plus:",
      "Full access to entire library",
      "4K Ultra HD quality",
      "Watch on 4 devices",
      "Exclusive premieres",
      "Behind-the-scenes content",
      "Early access to new releases",
      "Priority customer support",
    ],
    cta: "Go Premium",
    popular: true,
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = "/login?redirect=/pricing"
      return
    }

    setSelectedPlan(planId)
    // In production, this would redirect to a payment gateway
    alert(`Subscription to ${planId} plan would be processed here. Integration with payment gateway (e.g., MTN MoMo, Airtel Money) required.`)
    setSelectedPlan(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("rw-RW").format(price)
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Subscription Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of Rwandan cinema. From free access to premium
            exclusive content, find the plan that suits you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-border"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-serif">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? "Free" : formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm">
                        {plan.currency}/{plan.period}
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? "Processing..." : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
            Payment Methods
          </h2>
          <p className="text-muted-foreground mb-6">
            We support various local and international payment options
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["MTN MoMo", "Airtel Money", "Visa", "Mastercard", "Bank Transfer"].map(
              (method) => (
                <Badge key={method} variant="outline" className="px-4 py-2">
                  {method}
                </Badge>
              )
            )}
          </div>
        </div>

        <div className="mt-16 bg-muted/50 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
            Questions about our plans?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our team is here to help you choose the right plan for your needs.
            Contact us for any questions or special arrangements.
          </p>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </div>
  )
}
