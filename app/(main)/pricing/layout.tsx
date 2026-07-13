import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Pricing & Plans",
    description: "Unlock the full potential of Rwandan cinema. Choose from our free, basic, and premium subscription plans.",
}

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
