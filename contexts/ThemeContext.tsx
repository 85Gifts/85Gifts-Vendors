"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { usePathname } from "next/navigation"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Routes where dark mode should be disabled
const AUTH_ROUTES = ["/login", "/register", "/reset-password", "/verifyEmail", "/forgot-password"]
const AUTH_ROUTE_PREFIX = "/auth"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  // Force light mode on auth pages
  useEffect(() => {
    if (!mounted) return
    
    const isAuthRoute = AUTH_ROUTES.some(route => pathname?.startsWith(route)) || 
                       pathname?.startsWith(AUTH_ROUTE_PREFIX) ||
                       pathname?.includes("/login") ||
                       pathname?.includes("/register") ||
                       pathname?.includes("/reset-password") ||
                       pathname?.includes("/verifyEmail") ||
                       pathname?.includes("/forgot-password")
    
    if (isAuthRoute) {
      // Force light mode on auth pages
      applyTheme("light")
      // Don't change the theme state, just override the class
    } else {
      // Apply saved theme on non-auth pages
      const savedTheme = localStorage.getItem("theme") as Theme | null
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      const currentTheme = savedTheme || systemTheme
      setTheme(currentTheme)
      applyTheme(currentTheme)
    }
  }, [pathname, mounted])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const toggleTheme = () => {
    // Don't allow theme toggle on auth pages
    const isAuthRoute = AUTH_ROUTES.some(route => pathname?.startsWith(route)) || 
                       pathname?.startsWith(AUTH_ROUTE_PREFIX) ||
                       pathname?.includes("/login") ||
                       pathname?.includes("/register") ||
                       pathname?.includes("/reset-password") ||
                       pathname?.includes("/verifyEmail") ||
                       pathname?.includes("/forgot-password")
    
    if (isAuthRoute) {
      return // Disable theme toggle on auth pages
    }

    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

