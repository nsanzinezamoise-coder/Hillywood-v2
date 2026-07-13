"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Facebook, Twitter, Instagram, Youtube, MessageCircle } from "lucide-react"
import { useEffect, useRef } from "react"

export function Footer() {
  const pathname = usePathname()
  const isWatchPage = pathname?.startsWith("/watch/")
  const isAdminPage = pathname?.startsWith("/admin")
  const isShortsPage = pathname?.startsWith("/shorts")
  const currentYear = new Date().getFullYear()
  const adContainerRef = useRef<HTMLDivElement>(null)

  // Load ad script
  useEffect(() => {
    // Skip ad loading on mobile to prevent history API conflicts
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return
    }

    // Check if ad script already exists in the container to avoid duplicates
    const container = adContainerRef.current
    if (container && !container.querySelector('#ad-script')) {
      try {
        const script1 = document.createElement('script')
        script1.type = 'text/javascript'
        script1.innerHTML = `
          atOptions = {
            'key' : 'afe7fc4afb447e0d467cfca3b4799b38',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        `
        
        const script2 = document.createElement('script')
        script2.src = 'https://www.highperformanceformat.com/afe7fc4afb447e0d467cfca3b4799b38/invoke.js'
        script2.id = 'ad-script'
        script2.async = true
        script2.onerror = () => {
          console.warn('Ad script failed to load')
        }
        
        container.appendChild(script1)
        container.appendChild(script2)
      } catch (error) {
        console.warn('Failed to load ads:', error)
      }
    }
  }, [])

  // Hide footer on watch pages, admin pages, and shorts pages
  if (isWatchPage || isAdminPage || isShortsPage) {
    return <></>
  }

  const footerLinks = {
    discover: [
      { href: "/movies", label: "Movies" },
      { href: "/series", label: "Series" },
      { href: "/shorts", label: "Short Films" },
    ],
    company: [
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact Us" },
    ],
    support: [
      { href: "/help", label: "Help Center" },
      { href: "/faq", label: "FAQ" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  }

  const socialLinks = [
    { href: "https://chat.whatsapp.com/Hz0snwV1IrzFmSAKOuC6DS", icon: MessageCircle, label: "WhatsApp", color: "#25D366" },
    { href: "https://facebook.com", icon: Facebook, label: "Facebook", color: "#1877F2" },
    { href: "https://twitter.com", icon: Twitter, label: "Twitter", color: "#1DA1F2" },
    { href: "https://instagram.com", icon: Instagram, label: "Instagram", color: "#E4405F" },
    { href: "https://youtube.com", icon: Youtube, label: "YouTube", color: "#FF0000" },
  ]

  return (
    <footer className="bg-card border-t border-border/40 pb-12 pt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand & Copyright - First Part */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <Film className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
              <span className="font-serif text-2xl font-bold text-foreground">
                Hilly <span className="text-primary">Wood</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Where Rwandan Wonders Come to Life
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-white transition-all hover:-translate-y-1 group relative"
                  aria-label={social.label}
                  style={{ 
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = social.color
                    e.currentTarget.style.color = "white"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = ""
                    e.currentTarget.style.color = ""
                  }}
                >
                  <social.icon className="h-5 w-5" />
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-2 hidden md:block" />

          {/* Links Sections */}
          <div className="md:col-span-6 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Discover */}
            <div>
              <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Discover</h3>
              <ul className="space-y-4">
                {footerLinks.discover.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Company</h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Support</h3>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* WhatsApp Group Banner */}
        <div className="mt-12 mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Join Our WhatsApp Community</h3>
                <p className="text-sm text-muted-foreground">Join For More update news of Trending Movies</p>
              </div>
            </div>
            <a
              href="https://chat.whatsapp.com/Hz0snwV1IrzFmSAKOuC6DS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#128C7E] transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              Join Now
            </a>
          </div>
        </div>

        {/* Copyright - Bottom Center */}
        <div className="mt-8 pt-8 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} hillywood, All rights reserved.            
          </p>
        </div>

        {/* Ad Banner */}
        <div className="mt-8 flex justify-center w-full">
          <div 
            id="ad-container" 
            ref={adContainerRef}
            className="overflow-hidden rounded-lg min-h-[90px] min-w-[320px] md:min-w-[728px] flex justify-center items-center"
          >
            {/* Ad script will load here */}
          </div>
        </div>
      </div>
      {/* Spacer for mobile navigation */}
      <div className="h-20 lg:hidden" />
    </footer>
  )
}