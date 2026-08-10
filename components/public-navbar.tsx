"use client"

import { useState } from "react"
import { Sun, Moon } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

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
  { name: "Events", link: "/events" },
  { name: "Resellers", link: "/reseller-dashboard" },
  { name: "Reviews", link: "#testimonials" },
  { name: "Contact", link: "#contact" },
]

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  return (
    <Navbar>
      <NavBody className="w-full">
        <div className="flex items-center justify-between w-full">
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <NavbarButton href="/login" className="bg-blue-500 hover:bg-blue-700 text-white">
              Start Selling
            </NavbarButton>
          </div>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
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
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-700 text-white"
            >
              Start Selling
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}
