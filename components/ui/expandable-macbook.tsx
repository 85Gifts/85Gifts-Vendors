"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ExpandableMacbookProps {
  children: ReactNode;
  className?: string;
}

export function ExpandableMacbook({ children, className }: ExpandableMacbookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Start small on the side, expand to full screen
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.5, 1]);
  const x = useTransform(scrollYProgress, [0, 0.5], ["0%", "0%"]);
  const width = useTransform(scrollYProgress, [0, 0.5], ["100%", "100vw"]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5], [24, 0]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.div
        style={{
          scale,
          width,
          borderRadius,
        }}
        className="overflow-hidden origin-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
