"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Trust badges ─────────────────────────────────────────────────────────────
const trustBadges = [
  { icon: "✓", label: "No credit card required" },
  { icon: "✓", label: "Setup in minutes" },
  { icon: "✓", label: "Cancel anytime" },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { value: "2,400+", label: "Businesses" },
  { value: "$1.2M+", label: "Processed" },
  { value: "99.9%", label: "Uptime" },
];

// ─── CTA Section ─────────────────────────────────────────────────────────────
export function CTASection() {
  return (
    <section className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-neutral-950 antialiased">
      {/* Background Beams */}
      <BackgroundBeams />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">

        {/* Eyebrow tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/80 px-4 py-1.5 text-xs font-medium tracking-widest text-neutral-400 uppercase backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          All Systems Live
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent md:text-6xl"
        >
          Your Next Event.
          <br />
          Your Next Sale.
          <br />
          <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            One Platform.
          </span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 md:text-lg"
        >
          Join sellers and event organizers who have stopped juggling
          tools — and started running everything from Omniflow85.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="mt-10 flex items-center gap-8 divide-x divide-neutral-800"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-4 first:pl-0 last:pr-0">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-xs text-neutral-500">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          {/* Primary */}
          <Link
            href="/signup"
            className={cn(
              "group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full px-8 text-sm font-semibold text-white shadow-lg transition-all duration-300",
              "bg-gradient-to-r from-sky-500 to-emerald-500",
              "hover:shadow-sky-500/30 hover:shadow-xl hover:scale-[1.03]",
            )}
          >
            {/* shimmer sweep */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span>Get Started Free</span>
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Secondary */}
          <Link
            href="/demo"
            className={cn(
              "inline-flex h-12 items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/60 px-8 text-sm font-medium text-neutral-300 backdrop-blur-sm transition-all duration-300",
              "hover:border-neutral-500 hover:text-white hover:bg-neutral-800/60",
            )}
          >
            <svg
              className="h-4 w-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Schedule a Demo
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {trustBadges.map((badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-1.5 text-xs text-neutral-500"
            >
              <span className="text-emerald-400 font-bold">{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}