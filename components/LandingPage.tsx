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
    <div className="bg-gray-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
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
        
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-black hover:text-blue-400 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-black hover:text-blue-400 transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-black hover:text-blue-400 transition-colors"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-black hover:text-blue-400 transition-colors"
              >
                Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-black hover:text-blue-400">
                Sign In
              </Link>
              <Link 
              href="/dashboard" 
            className="bg-white from-blue-500 to-blue-400 text-md text-blue-600 hover:bg-white rounded-md p-2 hover:text-blue-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >Start Selling</Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden text-black hover:text-blue-300 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden backdrop-blur-lg bg-white/10 border-t border-white/20">
              <div className="px-4 py-6 space-y-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="block text-black hover:text-blue-200 transition-colors py-2"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="block text-black hover:text-blue-200 transition-colors py-2"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="block text-black hover:text-blue-200 transition-colors py-2"
                >
                  Reviews
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="block text-black hover:text-blue-200 transition-colors py-2"
                >
                  Contact
                </button>
                <div className="pt-4 border-t border-white/20 gap-4">
                  <Link
                    href="/login"
                  className="text-black hover:shadow-2xl  duration-300">
                    Sign In
                  </Link>
                  <Link  
                   href="/dashboard"
                  className="bg-white from-blue-500 to-blue-400 text-blue-500 mx-4 p-2 rounded-md hover:bg-white hover:text-blue-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >Start Selling</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-linear-to-l from-[#E2E5FF] to-[#B5B8FF] flex items-center">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-gray-800">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Sell Perfect
                <span className="bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  {" "}
                  Gifts{" "}
                </span>
                Online
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-gray-700 leading-relaxed">
                Join thousands of vendors creating magical gifting experiences. Manage inventory, track orders, and
                delight customers with our powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-blue-500 to-blue-400 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
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
              <div className="flex items-center space-x-6 text-gray-700">
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
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Dashboard Preview</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-linear-to-r from-blue-50 to-blue-50 rounded-xl">
                      <div>
                        <p className="text-gray-600 text-sm">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">₦2,490,580</p>
                      </div>
                      <div className="text-3xl">📈</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-600 text-sm">Orders</p>
                        <p className="text-lg font-bold">542</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-500 text-sm">Products</p>
                        <p className="text-lg font-bold">86</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-4xl animate-bounce">🎄</div>
        <div className="absolute top-40 right-20 text-3xl animate-bounce">🎂</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-bounce">💝</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce">🎉</div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to{" "}
              <span className="bg-linear-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed specifically for gift retailers. From inventory management to customer delight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎁",
                title: "Gift-Focused Design",
                description:
                  "Built specifically for gift retailers with features like gift wrapping, custom messages, and occasion-based categorization.",
                gradient: "from-blue-100 to-blue-50",
              },
              {
                icon: "📊",
                title: "Smart Analytics",
                description:
                  "Track your best-selling gifts, understand seasonal trends, and optimize your inventory with AI-powered insights.",
                gradient: "from-green-50 to-blue-50",
              },
              {
                icon: "🚚",
                title: "Smart Delivery",
                description:
                  "Schedule deliveries for special occasions, track shipments, and ensure gifts arrive exactly when needed.",
                gradient: "from-purple-50 to-pink-50",
              },
              {
                icon: "💬",
                title: "Customer Care",
                description:
                  "Built-in messaging system, order tracking for recipients, and tools to create unforgettable experiences.",
                gradient: "from-yellow-50 to-orange-50",
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                description:
                  "Optimized for speed with instant updates, real-time notifications, and seamless mobile experience.",
                gradient: "from-pink-50 to-red-50",
              },
              {
                icon: "🔒",
                title: "Secure & Reliable",
                description:
                  "Bank-level security, automated backups, and 99.9% uptime guarantee. Your business is always protected.",
                gradient: "from-indigo-50 to-purple-50",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-linear-to-br ${feature.gradient} p-8 rounded-3xl hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300`}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-linear-to-r from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Gift Retailers Worldwide</h2>
            <p className="text-xl text-purple-100">Join the growing community of successful gift vendors</p>
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
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">What Vendors Are Saying</h2>
            <p className="text-xl text-gray-600">Real stories from real gift retailers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
              {
                name: "Sarah Johnson",
                role: "Boutique Gift Shop",
                avatar: "S",
                color: "bg-yellow-500",
                testimonial:
                  "omniflow85 transformed my business! The gift-specific features like custom messages and delivery scheduling are exactly what I needed. Sales increased 300% in 6 months!",
              },
              {
                name: "Tunde Adelabu",
                role: "Artisan Gifts Co.",
                avatar: "M",
                color: "bg-blue-500",
                testimonial:
                  "The analytics are incredible! I can see which gifts perform best for each occasion and optimize my inventory accordingly. My profit margins improved by 45%.",
              },
              {
                name: "Ahmed Nagode",
                role: "Luxury Gift Boxes",
                avatar: "E",
                color: "bg-pink-500",
                testimonial:
                  "Customer support is phenomenal, and the platform is so intuitive. I was able to launch my gift business in just 2 days. Now I'm processing 500+ orders monthly!",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-lg mr-4`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-700 italic">{testimonial.testimonial}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-800 via-blue-700 to-blue-600 text-white relative overflow-hidden">
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
            Businesss?
            </span>
          </h2>
          <p className="text-xl lg:text-2xl mb-12 text-purple-100 leading-relaxed">
            Join thousands of successful vendors who chose omniflow85 to grow their business.
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


     <footer id="contact" className="bg-gray-900 text-white py-16">
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
                Empowering gift retailers with cutting-edge e-commerce solutions. Turn every purchase into a
                memorable experience.
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
              © 2025 omniflow85. All rights reserved. Made with ❤️ for retailers.
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
