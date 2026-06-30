"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
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
import { MaskReveal } from "@/components/ui/text-mask-reveal"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import FeatureSectionDemo from "@/components/feature"
import { TestimonialsSection } from "@/components/testimonial"
import { CTASection } from "@/components/cta-section"
import { Footer2 } from "@/components/footer-2"
import HowItWorksFlow from "@/components/ui/flow/HowItWorksFlow"

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
}

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Reviews", link: "#testimonials" },
    { name: "Contact", link: "#contact" },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  return (
    <div className="bg-background text-foreground overflow-x-clip">
      {/* Navigation */}
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
              <NavbarButton href="/login" className="bg-blue-500 hover:bg-blue-700 text-white">Start Selling</NavbarButton>
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
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => scrollToSection(item.link.replace("#", ""))}
                className="text-sm font-medium text-muted-foreground py-2"
              >
                {item.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <NavbarButton href="/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white">Start Selling</NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Hero Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="relative min-h-screen flex items-center pt-2 z-10"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
           <div className="text-foreground flex-1">
              <MaskReveal delay={0.2}>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  AI Powered
                  <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    {" "}
                    Business Suite
                  </span>
                </h1>
              </MaskReveal>
              <MaskReveal delay={0.4}>
                <p className="text-lg lg:text-xl mb-8 text-muted-foreground leading-relaxed">
                  Manage events and ticket booking, products and inventory, cross-platform ads, invoices and receipts,
                  payment links, and secure buyer–seller escrow—all in one platform.
                </p>
              </MaskReveal>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                >
                  <Button
                    size="lg"
                    className="bg-transparent text-foreground hover:text-lg hover:bg-transparent"
                  >
                    <Link href="/login">
                      Join Us Today
                    </Link>
                  </Button>
                </HoverBorderGradient>
             </div>
              </div>

            {/* Dashboard Preview - Stacked Cards (Desktop) / Grid (Mobile) */}
            <div className="flex-1 w-full lg:relative lg:h-[400px] mt-8 lg:mt-0">
              {/* Desktop: Stacked Cards */}
              <div className="hidden lg:block">
                <MaskReveal delay={0.2}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 left-0 right-0 z-10 group cursor-pointer"
                  >
                    <Card className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors">Total Revenue</CardDescription>
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">$1,250.00</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-500 group-hover:bg-green-500/10 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                <MaskReveal delay={0.3}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[80px] left-4 right-4 z-20 group cursor-pointer"
                  >
                    <Card className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors">New Customers</CardDescription>
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">1,234</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-red-500/50 text-red-500 group-hover:bg-red-500/10 transition-all">
                          <IconTrendingDown className="w-3 h-3 mr-1" />
                          -20%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                <MaskReveal delay={0.4}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[160px] left-8 right-8 z-30 group cursor-pointer"
                  >
                    <Card className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors">Active Accounts</CardDescription>
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">45,678</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-500 group-hover:bg-green-500/10 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                <MaskReveal delay={0.5}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[240px] left-12 right-12 z-40 group cursor-pointer"
                  >
                    <Card className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors">Growth Rate</CardDescription>
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">4.5%</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-500 group-hover:bg-green-500/10 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +4.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>
              </div>

              {/* Mobile: Stacked Cards */}
              <div className="lg:hidden relative w-full h-[340px] px-4 sm:px-6">
                <MaskReveal delay={0.2}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 z-10 group cursor-pointer"
                  >
                    <Card className="w-full bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors text-sm">Total Revenue</CardDescription>
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">$1,250.00</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-500 group-hover:bg-green-500/10 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                <MaskReveal delay={0.3}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[70px] left-8 right-8 sm:left-10 sm:right-10 z-20 group cursor-pointer"
                  >
                    <Card className="w-full bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors text-sm">New Customers</CardDescription>
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">1,234</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-red-500/50 text-red-500 group-hover:bg-red-500/10 transition-all">
                          <IconTrendingDown className="w-3 h-3 mr-1" />
                          -20%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                <MaskReveal delay={0.4}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[140px] left-12 right-12 sm:left-14 sm:right-14 z-30 group cursor-pointer"
                  >
                    <Card className="w-full bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors text-sm">Active Accounts</CardDescription>
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">45,678</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-500 group-hover:bg-green-500/10 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                <MaskReveal delay={0.5}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[210px] left-16 right-16 sm:left-18 sm:right-18 z-40 group cursor-pointer"
                  >
                    <Card className="w-full bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-muted-foreground group-hover:text-primary transition-colors text-sm">Growth Rate</CardDescription>
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">4.5%</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-500 group-hover:bg-green-500/10 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +4.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>
              </div>
            </div>
          </div>
         </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative py-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              How Omniflow85 Works
            </h2>
            <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
              From setup to growth — see how the platform powers your business end-to-end.
            </p>
          </div>
          <div className="h-[400px] lg:h-[500px]">
            <HowItWorksFlow />
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative z-20 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureSectionDemo />
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.div
        id="testimonials"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <TestimonialsSection />
      </motion.div>

      {/* CTA Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <CTASection />
      </motion.div>

      {/* Footer */}
      <motion.div
        id="contact"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Footer2 />
      </motion.div>
    </div>
  )
}
