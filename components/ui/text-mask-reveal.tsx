"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MaskRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function MaskReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: MaskRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directionVariants = {
    up: {
      hidden: { y: "100%", opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    down: {
      hidden: { y: "-100%", opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    left: {
      hidden: { x: "-100%", opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    right: {
      hidden: { x: "100%", opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
  };

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={directionVariants[direction]}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface TextMaskRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export function TextMaskReveal({
  text,
  className,
  delay = 0,
  as: Component = "span",
}: TextMaskRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="overflow-hidden inline-block">
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : { y: "100%" }}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        <Component className={className}>{text}</Component>
      </motion.div>
    </div>
  );
}

interface StaggeredTextRevealProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  staggerDelay?: number;
}

export function StaggeredTextReveal({
  text,
  className,
  charClassName,
  delay = 0,
  staggerDelay = 0.03,
}: StaggeredTextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const words = text.split(" ");

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap">
        {words.map((word, wordIndex) => (
          <div key={wordIndex} className="overflow-hidden mr-[0.25em]">
            <motion.span
              className={cn("inline-block", charClassName)}
              initial={{ y: "100%", opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + wordIndex * staggerDelay,
                ease: [0.33, 1, 0.68, 1],
              }}
            >
              {word}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}
