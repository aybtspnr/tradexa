"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Package, TrendingUp, Zap, BarChart3, BellRing, Map,
} from "lucide-react";

interface FloatingCard {
  icon: React.ReactNode;
  label: string;
  color: string;
  baseX: number;
  baseY: number;
  parallaxSpeed: number;
  floatDelay: number;
  floatDuration: number;
}

const cardsData: FloatingCard[] = [
  { icon: <Package className="w-5 h-5" />, label: "Import", color: "#D80E16", baseX: -180, baseY: -70, parallaxSpeed: 0.15, floatDelay: 0, floatDuration: 4 },
  { icon: <TrendingUp className="w-5 h-5" />, label: "Export", color: "#10b981", baseX: 160, baseY: -90, parallaxSpeed: 0.12, floatDelay: 0.5, floatDuration: 4.5 },
  { icon: <Zap className="w-5 h-5" />, label: "Tools", color: "#f59e0b", baseX: -200, baseY: 70, parallaxSpeed: 0.18, floatDelay: 1, floatDuration: 3.5 },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Market", color: "#8b5cf6", baseX: 190, baseY: 60, parallaxSpeed: 0.10, floatDelay: 1.5, floatDuration: 5 },
  { icon: <BellRing className="w-5 h-5" />, label: "Alerts", color: "#ef4444", baseX: -120, baseY: 160, parallaxSpeed: 0.14, floatDelay: 2, floatDuration: 4.2 },
  { icon: <Map className="w-5 h-5" />, label: "Maps", color: "#06b6d4", baseX: 140, baseY: 150, parallaxSpeed: 0.16, floatDelay: 2.5, floatDuration: 3.8 },
];

export function FloatingCards3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative hidden lg:flex items-center justify-center h-[500px]">
      {cardsData.map((card, i) => (
        <FloatingCardItem key={card.label} card={card} index={i} scrollY={scrollY} isVisible={isVisible} />
      ))}
    </div>
  );
}

function FloatingCardItem({
  card,
  index,
  scrollY,
  isVisible,
}: {
  card: FloatingCard;
  index: number;
  scrollY: typeof scrollY;
  isVisible: boolean;
}) {
  const y = useTransform(scrollY, [0, 600], [0, card.parallaxSpeed * 300]);

  return (
    <motion.div
      className="absolute"
      style={{
        x: card.baseX,
        y,
      }}
      initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
      animate={isVisible ? {
        opacity: 1,
        scale: 1,
        rotateX: 0,
      } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: card.floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: card.floatDelay,
        }}
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      >
        <TiltCard3D color={card.color}>
          <div
            className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-white shadow-2xl cursor-pointer"
            style={{
              background: card.color,
              boxShadow: `0 8px 32px ${card.color}40, 0 0 60px ${card.color}20`,
            }}
          >
            {card.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
          </div>
        </TiltCard3D>
      </motion.div>
    </motion.div>
  );
}

function TiltCard3D({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * -25, y: x * 25 });
  };

  const handleLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 400, damping: 20, mass: 0.6 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      whileHover={{ scale: 1.1, translateZ: 40 }}
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: `0 0 30px ${color}60, 0 0 80px ${color}30`,
        }}
      />
    </motion.div>
  );
}
