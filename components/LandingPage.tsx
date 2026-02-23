"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
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
import { MaskReveal, StaggeredTextReveal } from "@/components/ui/text-mask-reveal"
import { SectionCards } from "@/components/section-cards"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import FeatureSectionDemo from "@/components/feature"
import { TestimonialsSection } from "@/components/testimonial"
import { CTASection } from "@/components/cta-section"




export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsAnimated, setStatsAnimated] = useState(false)

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "Reviews", link: "#testimonials" },
    { name: "Contact", link: "#contact" },
  ]

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <div className="bg-gray-950 overflow-x-hidden">
      {/* Navigation */}
      <Navbar>
        <NavBody className="w-full">
          <div className="flex items-center justify-between w-full">
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton href="/login">Start Selling</NavbarButton>
            </div>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => scrollToSection(item.link.replace("#", ""))}
                className="text-sm font-medium text-neutral-600 dark:text-neutral-300 py-2"
              >
                {item.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <NavbarButton href="/dashboard">Start Selling</NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-2 z-10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
             <div className="text-gray-100 flex-1">
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
                <p className="text-lg lg:text-xl mb-8 text-gray-300 leading-relaxed">
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
                  className="bg-transparent text-white hover:text-lg hover:bg-transparent"
                  // className="bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
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
                {/* Card 1 - Back */}
                <MaskReveal delay={0.2}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 left-0 right-0 z-10 group cursor-pointer"
                  >
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors">Total Revenue</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">$1,250.00</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-400 group-hover:bg-green-500/20 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                {/* Card 2 - Middle */}
                <MaskReveal delay={0.3}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[80px] left-4 right-4 z-20 group cursor-pointer"
                  >
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors">New Customers</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">1,234</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-red-500/50 text-red-400 group-hover:bg-red-500/20 transition-all">
                          <IconTrendingDown className="w-3 h-3 mr-1" />
                          -20%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                {/* Card 3 - Middle-Front */}
                <MaskReveal delay={0.4}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[160px] left-8 right-8 z-30 group cursor-pointer"
                  >
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors">Active Accounts</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">45,678</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-400 group-hover:bg-green-500/20 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                {/* Card 4 - Front */}
                <MaskReveal delay={0.5}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[240px] left-12 right-12 z-40 group cursor-pointer"
                  >
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors">Growth Rate</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">4.5%</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-400 group-hover:bg-green-500/20 transition-all">
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
                {/* Card 1 - Back */}
                <MaskReveal delay={0.2}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 z-10 group cursor-pointer"
                  >
                    <Card className="w-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors text-sm">Total Revenue</CardDescription>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">$1,250.00</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-400 group-hover:bg-green-500/20 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                {/* Card 2 - Middle */}
                <MaskReveal delay={0.3}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[70px] left-8 right-8 sm:left-10 sm:right-10 z-20 group cursor-pointer"
                  >
                    <Card className="w-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors text-sm">New Customers</CardDescription>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">1,234</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-red-500/50 text-red-400 group-hover:bg-red-500/20 transition-all">
                          <IconTrendingDown className="w-3 h-3 mr-1" />
                          -20%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                {/* Card 3 - Middle-Front */}
                <MaskReveal delay={0.4}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[140px] left-12 right-12 sm:left-14 sm:right-14 z-30 group cursor-pointer"
                  >
                    <Card className="w-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors text-sm">Active Accounts</CardDescription>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">45,678</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-400 group-hover:bg-green-500/20 transition-all">
                          <IconTrendingUp className="w-3 h-3 mr-1" />
                          +12.5%
                        </Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </MaskReveal>

                {/* Card 4 - Front */}
                <MaskReveal delay={0.5}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[210px] left-16 right-16 sm:left-18 sm:right-18 z-40 group cursor-pointer"
                  >
                    <Card className="w-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400 group-hover:text-blue-400 transition-colors text-sm">Growth Rate</CardDescription>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">4.5%</CardTitle>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Badge variant="outline" className="border-green-500/50 text-green-400 group-hover:bg-green-500/20 transition-all">
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

        {/* Floating Elements */}
        {/* <div className="absolute top-40 right-20 text-3xl animate-bounce">🎂</div> */}
        {/* <div className="absolute bottom-20 right-10 text-4xl animate-bounce">🎉</div> */}
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-20 py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeatureSectionDemo />
       </div>
      </section>


      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">What Our Users Say</h2>
            <p className="text-xl text-gray-400">Real stories from sellers and event organizers</p>
          </div>

       <TestimonialsSection/>

         </div>
       </section>

      {/* CTA Section */}
      <section className="">
        <CTASection/>
      </section>

      {/* Footer */}


     <footer id="contact" className="bg-gray-950 border-t border-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                              
                <Image
             src="https://res.cloudinary.com/dsmc6vtpt/image/upload/v1768827902/omniflow_monogram_blue_segmsg.png"
              alt="logo"
               className="h-8"
               width={50}
               height={50} 
            />
  
              </div>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                One platform for events & ticket booking, product & inventory management, cross-platform ads,
                invoices & receipts, payment links, and secure buyer–seller escrow.
              </p>
              {/* <div className="flex space-x-4"> */}
              {/*   <a */}
              {/*     href="#" */}
              {/*     className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-500 transition-colors" */}
              {/*   > */}
              {/*     <span className="text-xl">📘</span> */}
              {/*   </a> */}
              {/*   <a */}
              {/*     href="#" */}
              {/*     className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-colors" */}
              {/*   > */}
              {/*     <span className="text-xl">📷</span> */}
              {/*   </a> */}
              {/*   <a */}
              {/*     href="#" */}
              {/*     className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors" */}
              {/*   > */}
              {/*     <span className="text-xl">🐦</span> */}
              {/*   </a> */}
              {/* </div> */}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                {/* <li> */}
                {/*   <a href="#" className="hover:text-white transition-colors"> */}
                {/*     API */}
                {/*   </a> */}
                {/* </li> */}
                {/* <li> */}
                {/*   <a href="#" className="hover:text-white transition-colors"> */}
                {/*     Integrations */}
                {/*   </a> */}
                {/* </li> */}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status Page
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 omniflow85. All rights reserved. Made with ❤️ for sellers and event organizers.
            </p>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      </div>
  )
}
