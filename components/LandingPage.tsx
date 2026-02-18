"use client"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsAnimated, setStatsAnimated] = useState(false)

  // Counter animation function
  const animateCounter = (element: HTMLElement, target: number, suffix = "") => {
    let current = 0
    const increment = target / 100
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        element.textContent = target.toLocaleString() + suffix
        clearInterval(timer)
      } else {
        element.textContent = Math.floor(current).toLocaleString() + suffix
      }
    }, 20)
  }

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            const statElements = entry.target.querySelectorAll("[data-count]")
            statElements.forEach((element) => {
              const target = Number.parseInt((element as HTMLElement).dataset.count || "0")
              const suffix = (element as HTMLElement).dataset.suffix || ""
              animateCounter(element as HTMLElement, target, suffix)
            })
            setStatsAnimated(true)
          }
        })
      },
      { threshold: 0.3 },
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [statsAnimated])

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="bg-gray-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="https://res.cloudinary.com/dsmc6vtpt/image/upload/v1768827902/omniflow_monogram_blue_segmsg.png"
                alt="logo"
                className="h-8"
                width={50}
                height={50}
              />
              <span className="md:hidden text-white font-semibold text-lg tracking-tight">
                OMNIFLOW85
              </span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-200 hover:text-blue-400 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-200 hover:text-blue-400 transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-200 hover:text-blue-400 transition-colors"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-200 hover:text-blue-400 transition-colors"
              >
                Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="text-gray-200 hover:text-blue-400 transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/dashboard" 
                  className="bg-blue-500 text-white text-md hover:bg-blue-400 rounded-md p-2 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Selling
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden text-gray-200 hover:text-blue-400 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden backdrop-blur-lg bg-gray-900/95 border-t border-gray-700/50">
              <div className="px-4 py-6 space-y-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="block text-gray-200 hover:text-blue-400 transition-colors py-2"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="block text-gray-200 hover:text-blue-400 transition-colors py-2"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="block text-gray-200 hover:text-blue-400 transition-colors py-2"
                >
                  Reviews
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="block text-gray-200 hover:text-blue-400 transition-colors py-2"
                >
                  Contact
                </button>
                <div className="pt-4 border-t border-gray-700/50 gap-4">
                  <Link
                    href="/login"
                  className="text-gray-200 hover:text-blue-400 transition-colors">
                    Sign In
                  </Link>
                  <Link  
                   href="/dashboard"
                  className="bg-blue-500 text-white mx-4 p-2 rounded-md hover:bg-blue-400 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-block"
                  >Start Selling</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-gray-100">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                AI Powered
                <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {" "}
                  Business Suite
                </span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-gray-300 leading-relaxed">
                Manage events and ticket booking, products and inventory, cross-platform ads, invoices and receipts,
                payment links, and secure buyer–seller escrow—all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  🚀 Join Us Today
                </Button>
                {/* <Button */}
                {/*   size="lg" */}
                {/*   // variant="outline" */}
                {/**/}
                {/*   className=" flexflex-row items-center bg-linear-to-r from-blue-500 to-blue-400 text-white  hover:shadow-2xl transform hover:scale-105 transition-all duration-300" */}
                {/*   // className="backdrop-blur-lg bg-white/20 border-gray-400/30 text-gray-800 hover:bg-white hover:text-blue-500" */}
                {/* > */}
                {/* <span> 📺 </span>  */}
                {/*   <span>Watch Demo </span> */}
                {/* </Button> */}
              </div>
              <div className="flex items-center space-x-6 text-gray-400">
                {/* <div className="flex items-center space-x-2"> */}
                {/*   <span className="text-2xl">⭐</span> */}
                {/*   <span>4.9/5 Rating</span> */}
                {/* </div> */}
                {/* <div className="flex items-center space-x-2"> */}
                {/*   <span className="text-2xl">👥</span> */}
                {/*   <span></span> */}
                {/* </div> */}
                {/* <div className="flex items-center space-x-2"> */}
                {/*   <span className="text-2xl">💰</span> */}
                {/*   <span>₦50M+ Sales</span> */}
                {/* </div> */}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 animate-bounce">
                <div className="bg-gray-800/80 border border-gray-700 rounded-3xl shadow-2xl shadow-black/30 p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-100">Vendor Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div>
                        <p className="text-gray-400 text-sm">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-blue-400">₦2,490,580</p>
                      </div>
                      <div className="text-3xl">📈</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 text-sm">Tickets Sold</p>
                        <p className="text-lg font-bold text-gray-100">542</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 text-sm">Products</p>
                        <p className="text-lg font-bold text-gray-100">86</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-40 right-20 text-3xl animate-bounce">🎂</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce">🎉</div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              One platform for events, tickets, products, ads, invoices, payment links, and secure escrow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎫",
                title: "Events & Ticket Booking",
                description:
                  "Create and manage events, sell tickets online, and track attendance. Full event lifecycle from creation to check-in.",
                gradient: "from-blue-500/20 to-blue-500/5 border border-blue-500/20",
              },
              {
                icon: "📦",
                title: "Product & Inventory",
                description:
                  "Manage your product catalog and stock levels in one place. Track inventory in real time and avoid overselling.",
                gradient: "from-green-500/20 to-blue-500/10 border border-green-500/20",
              },
              {
                icon: "📢",
                title: "Cross-Platform Ads",
                description:
                  "Run and manage ads across multiple channels from a single dashboard. Reach more buyers and event-goers.",
                gradient: "from-purple-500/20 to-pink-500/10 border border-purple-500/20",
              },
              {
                icon: "🧾",
                title: "Invoices & Receipts",
                description:
                  "Generate professional invoices and receipts automatically. Keep records clean and tax-ready.",
                gradient: "from-amber-500/20 to-orange-500/10 border border-amber-500/20",
              },
              {
                icon: "🔗",
                title: "Payment Links",
                description:
                  "Share payment links for products, tickets, or custom amounts. Get paid quickly without a full checkout flow.",
                gradient: "from-pink-500/20 to-red-500/10 border border-pink-500/20",
              },
              {
                icon: "🔒",
                title: "Buyer & Seller Escrow",
                description:
                  "Secure online escrow for buyers and sellers. Funds are held safely until both parties are satisfied.",
                gradient: "from-indigo-500/20 to-purple-500/10 border border-indigo-500/20",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br ${feature.gradient} bg-gray-800/50 p-8 rounded-3xl hover:shadow-xl hover:shadow-black/20 transform hover:-translate-y-2 transition-all duration-300`}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Sellers & Event Organizers</h2>
            <p className="text-xl text-purple-100">Join the growing community of businesses using omniflow85</p>
          </div>
            {/* data to be filled as company grows  */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-8"> */}
          {/*   <div className="text-center"> */}
          {/*     <div className="text-5xl lg:text-6xl font-bold mb-2" data-count="10000" data-suffix="K+"> */}
          {/*       0K+ */}
          {/*     </div> */}
          {/*     <div className="text-purple-100 text-lg">Active Vendors</div> */}
          {/*   </div> */}
          {/*   <div className="text-center"> */}
          {/*     <div className="text-5xl lg:text-6xl font-bold mb-2" data-count="50" data-suffix="M+"> */}
          {/*       0M+ */}
          {/*     </div> */}
          {/*     <div className="text-purple-100 text-lg">Total Sales</div> */}
          {/*   </div> */}
          {/*   <div className="text-center"> */}
          {/*     <div className="text-5xl lg:text-6xl font-bold mb-2" data-count="2000000" data-suffix="M+"> */}
          {/*       0M+ */}
          {/*     </div> */}
          {/*     <div className="text-purple-100 text-lg">Gifts Delivered</div> */}
          {/*   </div> */}
          {/*   <div className="text-center"> */}
          {/*     <div className="text-5xl lg:text-6xl font-bold mb-2" data-count="99" data-suffix=".8%"> */}
          {/*       0.8% */}
          {/*     </div> */}
          {/*     <div className="text-purple-100 text-lg">Happy Customers</div> */}
          {/*   </div> */}
          {/* </div> */}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">What Our Users Say</h2>
            <p className="text-xl text-gray-400">Real stories from sellers and event organizers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
              {
                name: "Sarah Johnson",
                role: "Event Producer",
                avatar: "S",
                color: "bg-yellow-500",
                testimonial:
                  "omniflow85 made ticket sales and event management so simple. Escrow gives my attendees peace of mind, and payment links help me collect deposits in seconds. Game changer!",
              },
              {
                name: "Tunde Adelabu",
                role: "Online Seller",
                avatar: "M",
                color: "bg-blue-500",
                testimonial:
                  "Product and inventory management is solid, and the escrow system means I get paid safely while buyers feel protected. Invoices and receipts are automatic—no more spreadsheets.",
              },
              {
                name: "Ahmed Nagode",
                role: "Vendor & Event Host",
                avatar: "E",
                color: "bg-pink-500",
                testimonial:
                  "I run events and sell products on the side. Having tickets, products, payment links, and ads in one place saved me hours. Setup was quick and support is responsive.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800/80 border border-gray-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-black/20 transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-lg mr-4`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-300 italic">{testimonial.testimonial}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            Ready to Transform Your
            <span className="text-blue-200 bg-clip-text">
            {" "}
            Business?
            </span>
          </h2>
          <p className="text-xl lg:text-2xl mb-12 text-purple-100 leading-relaxed">
            Join sellers and event organizers who use omniflow85 for events, tickets, products, payments, and secure escrow.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-linear-to-r from-blue-400 to-blue-400 text-gray-900 hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              🚀 Join Us Now
            </Button>
            <Button
              size="lg"  
              className="bg-linear-to-r from-blue-400 to-blue-400 text-gray-900 hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              📞 Schedule Demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-purple-200">

            <div className="flex items-center">
              <span className="text-2xl mr-2">✓</span>
              <span>No credit card required</span>
          </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">✓</span>
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>

        {/* Floating CTA Elements */}
        <div className="absolute top-10 left-10 text-3xl animate-bounce">🎪</div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce">🎨</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-bounce">🎭</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce">🎯</div>
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
