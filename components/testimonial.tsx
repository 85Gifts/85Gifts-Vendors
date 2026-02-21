"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

// ─── InfiniteMovingCards (unchanged) ────────────────────────────────────────
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: { quote: string; name: string; title: string }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });
      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse",
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const durations = { fast: "20s", normal: "40s", slow: "80s" };
      containerRef.current.style.setProperty(
        "--animation-duration",
        durations[speed],
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            key={item.name + idx}
            className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-b-0 border-zinc-200 bg-[linear-gradient(180deg,#fafafa,#f5f5f5)] px-8 py-6 md:w-[450px] dark:border-zinc-700 dark:bg-[linear-gradient(180deg,#27272a,#18181b)]"
          >
            <blockquote>
              <span className="relative z-20 text-sm font-normal leading-[1.6] text-neutral-800 dark:text-gray-100">
                {item.quote}
              </span>
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-normal leading-[1.6] text-neutral-500 dark:text-gray-400">
                    {item.name}
                  </span>
                  <span className="text-sm font-normal leading-[1.6] text-neutral-500 dark:text-gray-400">
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Omniflow85 testimonial data ─────────────────────────────────────────────
const rowOne = [
  {
    quote:
      "Omniflow85 has transformed how we manage events. The inventory system is seamless and payments are instant.",
    name: "Sarah Johnson",
    title: "Event Organizer",
  },
  {
    quote:
      "Best platform for selling products online. The escrow feature gives both buyers and sellers complete peace of mind.",
    name: "Michael Chen",
    title: "Online Seller",
  },
  {
    quote:
      "The analytics dashboard helps me track sales and inventory in real-time. Highly recommended for any business owner!",
    name: "Amanda Williams",
    title: "Store Owner",
  },
  {
    quote:
      "Setting up payment links took less than a minute. My customers love how easy checkout has become.",
    name: "Tunde Adeyemi",
    title: "Freelancer & Reseller",
  },
];

const rowTwo = [
  {
    quote:
      "Secure payments and excellent customer support. Omniflow85 is a game changer for my small business.",
    name: "David Brown",
    title: "Small Business Owner",
  },
  {
    quote:
      "I love how easy it is to set up events and manage ticket sales. The platform does everything I need.",
    name: "Jennifer Lee",
    title: "Concert Promoter",
  },
  {
    quote:
      "Running ads across platforms used to take hours. Now I manage everything from one dashboard — it's a huge time saver.",
    name: "Chidi Okafor",
    title: "Marketing Manager",
  },
  {
    quote:
      "The escrow system made our bulk orders feel safe. We'll never go back to manual payment handling.",
    name: "Aisha Bello",
    title: "Wholesale Buyer",
  },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
export function TestimonialsSection() {
  return (
    <section className="relative z-20 mx-auto max-w-7xl py-10 lg:py-20">
      {/* Heading */}
      <div className="px-8 text-center">
        <h4 className="mx-auto max-w-3xl text-3xl font-medium tracking-tight text-black lg:text-5xl lg:leading-tight dark:text-white">
          Trusted by Sellers &amp; Event Organizers
        </h4>
        <p className="mx-auto my-4 max-w-xl text-sm font-normal text-neutral-500 lg:text-base dark:text-neutral-300">
          Real stories from the growing community of businesses using Omniflow85.
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <InfiniteMovingCards
        items={rowOne}
        direction="left"
        speed="slow"
        pauseOnHover
        className="mt-6"
      />

      {/* Row 2 — scrolls right */}
      <InfiniteMovingCards
        items={rowTwo}
        direction="right"
        speed="slow"
        pauseOnHover
        className="mt-2"
      />
    </section>
  );
}