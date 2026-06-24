"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion } from "framer-motion";

interface TiltWrapperProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  perspective?: number;
  scale?: number;
  glowColor?: string;
  glowOnHover?: boolean;
  zOffset?: number;
}

export function TiltWrapper({
  children,
  className = "",
  tiltAmount = 15,
  perspective = 1200,
  scale = 1.02,
  glowColor = "rgba(216, 14, 22, 0.15)",
  glowOnHover = true,
  zOffset = 20,
}: TiltWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.setProperty("--rotateX", `${y * -tiltAmount}deg`);
    ref.current.style.setProperty("--rotateY", `${x * tiltAmount}deg`);
    ref.current.style.setProperty("--glow-x", `${50 + x * 40}%`);
    ref.current.style.setProperty("--glow-y", `${50 + y * 40}%`);
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rotateX", "0deg");
    ref.current.style.setProperty("--rotateY", "0deg");
    ref.current.style.setProperty("--glow-x", "50%");
    ref.current.style.setProperty("--glow-y", "50%");
  };

  const style: CSSProperties = {
    perspective,
    transformStyle: "preserve-3d",
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(var(--rotateX)) rotateY(var(--rotateY)) translateZ(0)",
          willChange: "transform",
        } as CSSProperties}
        whileHover={{ scale, translateZ: zOffset }}
        transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
      >
        {children}
        {glowOnHover && (
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at var(--glow-x) var(--glow-y), ${glowColor}, transparent 60%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
