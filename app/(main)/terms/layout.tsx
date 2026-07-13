import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Review the terms and conditions for using hillywood.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
