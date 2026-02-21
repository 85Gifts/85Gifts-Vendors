"use client";
import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  IconCalendarEvent,
  IconShieldLock,
  IconPackage,
  IconBuildingStore,
} from "@tabler/icons-react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Events & Ticket Booking",
      description:
        "Create and manage events, sell tickets online, and track attendance. Full event lifecycle from creation to check-in.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Product & Inventory Management",
      description:
        "Manage your product catalog and stock levels in one place. Track inventory in real time and avoid overselling.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
      title: "Invoices, Receipts & Payment Links",
      description:
        "Generate professional invoices automatically and share payment links for products, tickets, or custom amounts — no full checkout needed.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r dark:border-neutral-800",
    },
    {
      title: "Reach Buyers Everywhere",
      description:
        "Run cross-platform ads and secure buyer–seller escrow from a single dashboard. Go global with confidence.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <div className="relative z-20 mx-auto max-w-7xl py-10 lg:py-40">
      <div className="px-8">
        <h4 className="mx-auto max-w-5xl text-center text-3xl font-medium tracking-tight text-black lg:text-5xl lg:leading-tight dark:text-white">
          Everything You Need to Succeed
        </h4>
        <p className="mx-auto my-4 max-w-2xl text-center text-sm font-normal text-neutral-500 lg:text-base dark:text-neutral-300">
          One platform for events, tickets, products, ads, invoices, payment
          links, and secure escrow. Built for sellers and event organizers.
        </p>
      </div>

      <div className="relative">
        <div className="mt-12 grid grid-cols-1 rounded-md lg:grid-cols-6 xl:border dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`relative overflow-hidden p-4 sm:p-8`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="mx-auto max-w-5xl text-left text-xl tracking-tight text-black md:text-2xl md:leading-snug dark:text-white">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "mx-auto max-w-4xl text-left text-sm md:text-base",
        "text-center font-normal text-neutral-500 dark:text-neutral-300",
        "mx-0 my-2 max-w-sm text-left md:text-sm",
      )}
    >
      {children}
    </p>
  );
};

// --- Skeleton 1: Event dashboard UI mockup ---
export const SkeletonOne = () => {
  const events = [
    { name: "Lagos Tech Summit", tickets: 320, status: "Live", color: "bg-green-500" },
    { name: "Afrobeats Night Out", tickets: 150, status: "Sold Out", color: "bg-red-400" },
    { name: "Startup Pitch Day", tickets: 80, status: "Upcoming", color: "bg-blue-400" },
    { name: "Fashion Week Expo", tickets: 210, status: "Live", color: "bg-green-500" },
  ];

  return (
    <div className="relative flex h-full gap-10 px-2 py-8">
      <div className="group mx-auto h-full w-full rounded-xl bg-white p-5 shadow-2xl dark:bg-neutral-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            <IconCalendarEvent className="h-4 w-4 text-blue-500" />
            My Events
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            + New Event
          </span>
        </div>

        {/* Stats row */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { label: "Total Events", value: "12" },
            { label: "Tickets Sold", value: "760" },
            { label: "Revenue", value: "$4,820" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800"
            >
              <p className="text-base font-bold text-neutral-800 dark:text-white">
                {stat.value}
              </p>
              <p className="text-[10px] text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Event list */}
        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <div
              key={event.name}
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-700"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${event.color}`} />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                  {event.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">
                  🎫 {event.tickets}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    event.status === "Live"
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      : event.status === "Sold Out"
                      ? "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300"
                      : "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-32 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-20 w-full bg-gradient-to-b from-white via-transparent to-transparent dark:from-black" />
    </div>
  );
};

// --- Skeleton 2: Inventory card grid ---
export const SkeletonTwo = () => {
  const products = [
    { name: "Sneakers", stock: 42, emoji: "👟" },
    { name: "T-Shirts", stock: 128, emoji: "👕" },
    { name: "Headphones", stock: 17, emoji: "🎧" },
    { name: "Watches", stock: 5, emoji: "⌚" },
    { name: "Bags", stock: 63, emoji: "👜" },
    { name: "Sunglasses", stock: 0, emoji: "🕶️" },
  ];

  const cardVariants = {
    whileHover: { scale: 1.08, rotate: 0, zIndex: 100 },
    whileTap: { scale: 1.08, rotate: 0, zIndex: 100 },
  };

  return (
    <div className="relative flex h-full flex-col items-start gap-4 overflow-hidden p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        <IconPackage className="h-4 w-4 text-orange-500" />
        Inventory
      </div>
      <div className="grid w-full grid-cols-3 gap-2">
        {products.map((p, idx) => (
          <motion.div
            key={p.name + idx}
            variants={cardVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="flex flex-col items-center rounded-xl border border-neutral-100 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="mt-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
              {p.name}
            </span>
            <span
              className={`mt-1 text-xs font-bold ${
                p.stock === 0
                  ? "text-red-500"
                  : p.stock < 10
                  ? "text-orange-400"
                  : "text-green-500"
              }`}
            >
              {p.stock === 0 ? "Out" : `${p.stock} left`}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-[100] h-full w-8 bg-gradient-to-r from-white to-transparent dark:from-black" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[100] h-full w-8 bg-gradient-to-l from-white to-transparent dark:from-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[100] h-16 w-full bg-gradient-to-t from-white to-transparent dark:from-black" />
    </div>
  );
};

// --- Skeleton 3: Invoice + payment link mockup ---
export const SkeletonThree = () => {
  return (
    <div className="group/card relative flex h-full items-center justify-center gap-4 p-4">
      <div className="mx-auto w-full max-w-xs rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
        {/* Invoice header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-800 dark:text-white">
              INVOICE #0042
            </p>
            <p className="text-[10px] text-neutral-400">Feb 21, 2025</p>
          </div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:bg-green-900 dark:text-green-300">
            PAID
          </span>
        </div>

        <div className="mb-3 space-y-1 border-t border-neutral-100 pt-3 dark:border-neutral-700">
          {[
            { item: "VIP Ticket × 2", price: "$120.00" },
            { item: "Merchandise Bundle", price: "$45.00" },
            { item: "Processing Fee", price: "$5.00" },
          ].map((line) => (
            <div key={line.item} className="flex justify-between">
              <span className="text-[11px] text-neutral-500">{line.item}</span>
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                {line.price}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between border-t border-neutral-100 pt-2 dark:border-neutral-700">
          <span className="text-xs font-bold text-neutral-800 dark:text-white">
            Total
          </span>
          <span className="text-xs font-bold text-blue-600">$170.00</span>
        </div>

        {/* Payment link pill */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-950">
          <span className="text-[10px] text-blue-500">🔗 pay.omniflow85.com/u/abc123</span>
          <span className="ml-auto rounded bg-blue-500 px-2 py-0.5 text-[9px] font-bold text-white">
            Copy
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Skeleton 4: Globe for global reach ---
export const SkeletonFour = () => {
  return (
    <div className="relative mt-10 flex h-60 flex-col items-center bg-transparent md:h-60 dark:bg-transparent">
      <Globe className="absolute -right-10 -bottom-80 md:-right-10 md:-bottom-72" />
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [6.5244, 3.3792], size: 0.08 },   // Lagos
        { location: [40.7128, -74.006], size: 0.05 },  // New York
        { location: [51.5074, -0.1278], size: 0.05 },  // London
        { location: [-33.8688, 151.2093], size: 0.04 },// Sydney
        { location: [1.3521, 103.8198], size: 0.04 },  // Singapore
        { location: [48.8566, 2.3522], size: 0.04 },   // Paris
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};