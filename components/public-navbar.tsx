"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from '@animateicons/react/lucide'
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"
import { useVendorAuth } from "@/contexts/VendorAuthContext"

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar"

const navItems = [
  { name: "Features", link: "#features" },
  { name: "Storefronts", link: "/storefronts" },
  { name: "Events", link: "/events" },
  { name: "Resellers", link: "/reseller-dashboard" },
  { name: "Reviews", link: "#testimonials" },
  { name: "Contact", link: "#contact" },
]

export function PublicNavbar({ onDark = false }: { onDark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()
  // Session-aware CTA: logged-in vendors go straight to the dashboard.
  // Default to the logged-out target while the session check is loading
  // to avoid flicker for logged-out visitors.
  const { isAuthenticated, loading: authLoading } = useVendorAuth()
  const ctaHref = !authLoading && isAuthenticated
    ? "/dashboard"
    : "/login?tab=signup"
  const ctaLabel = !authLoading && isAuthenticated ? "Go to Dashboard" : "Start Selling"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const onDarkHero = onDark && !scrolled
  const darkHeroClasses = onDarkHero
    ? "[&_a]:!text-white/90 [&_a:hover]:!text-white [&_span]:!text-white [&_button]:!text-white [&_svg]:!text-white"
    : ""
  const navBackgroundClasses = onDarkHero
    ? "bg-black/35 dark:bg-black/50"
    : ""

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  return (
    <Navbar>
      <NavBody className={`w-full ${navBackgroundClasses}`}>
        <div
          className={`flex w-full items-center justify-between ${darkHeroClasses}`}
        >
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
            <NavbarButton
              href={ctaHref}
              className="whitespace-nowrap bg-blue-500 text-white hover:bg-blue-700"
            >
              {ctaLabel}
            </NavbarButton>
          </div>
        </div>
      </NavBody>

      <MobileNav className={navBackgroundClasses}>
        <MobileNavHeader className={darkHeroClasses}>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </div>
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, idx) => {
            const isRouteLink = item.link.startsWith("/")
            const className = "text-sm font-medium text-muted-foreground py-2"
            return isRouteLink ? (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className={className}
              >
                {item.name}
              </Link>
            ) : (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => scrollToSection(item.link.replace("#", ""))}
                className={className}
              >
                {item.name}
              </a>
            )
          })}
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <NavbarButton
              href={ctaHref}
              className="whitespace-nowrap bg-blue-500 text-white hover:bg-blue-700"
            >
              {ctaLabel}
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}
