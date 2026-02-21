"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerScrollProps {
  children: ReactNode;
  className?: string;
}

export function ContainerScroll({ children, className }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.5, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center p-4",
        className
      )}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          y: translateY,
          transformPerspective: 1000,
        }}
        className="relative w-full max-w-[600px]"
      >
        {/* Device Frame */}
        <div className="relative rounded-2xl bg-gray-900 border-4 border-gray-800 shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="h-6 bg-gray-800 flex items-center px-3 space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-20 h-1.5 bg-gray-700 rounded-full" />
            </div>
          </div>
          
          {/* Screen Content */}
          <div className="aspect-[4/3] bg-gray-950 relative overflow-hidden">
            {children}
            
            {/* Screen Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Bottom Base */}
        <div className="mx-auto w-[80%] h-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl mt-1" />
        <div className="mx-auto w-[60%] h-2 bg-gray-800 rounded-b-lg mt-0.5" />
      </motion.div>
    </div>
  );
}

interface DashboardPreviewProps {
  className?: string;
}

export function DashboardPreview({ className }: DashboardPreviewProps) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">OF</span>
          </div>
          <div>
            <div className="h-2.5 w-24 bg-gray-700 rounded" />
            <div className="h-2 w-16 bg-gray-800 rounded mt-1.5" />
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-800" />
          <div className="w-8 h-8 rounded-full bg-gray-800" />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="h-2 w-12 bg-gray-600 rounded mb-2" />
          <div className="h-6 w-16 bg-blue-500/20 rounded" />
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="h-2 w-12 bg-gray-600 rounded mb-2" />
          <div className="h-6 w-16 bg-green-500/20 rounded" />
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="h-2 w-12 bg-gray-600 rounded mb-2" />
          <div className="h-6 w-16 bg-purple-500/20 rounded" />
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-end justify-between h-24 space-x-2">
          {[40, 65, 45, 80, 55, 70, 85, 60, 75, 50].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
            />
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="space-y-2">
        <div className="h-2 w-20 bg-gray-600 rounded" />
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-gray-700" />
            <div className="flex-1">
              <div className="h-2 w-24 bg-gray-600 rounded" />
              <div className="h-1.5 w-16 bg-gray-700 rounded mt-1.5" />
            </div>
            <div className="h-2 w-12 bg-blue-500/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingCard({ children, delay = 0, className }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.33, 1, 0.68, 1] 
      }}
      className={cn(
        "bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
