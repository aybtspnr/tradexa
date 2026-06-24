"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";

interface Logo3DProps {
  className?: string;
  variant?: "default" | "white";
  to?: string;
}

export function Logo3D({ className, variant = "default", to = "/" }: Logo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized offset from center: -1 to 1
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Clamp to prevent extreme tilts at edges
    const clampedX = Math.max(-1, Math.min(1, deltaX));
    const clampedY = Math.max(-1, Math.min(1, deltaY));

    // Tilt ranges: Y rotates left/right, X rotates up/down (inverted)
    setRotateY(clampedX * 22);
    setRotateX(-clampedY * 14);

    // Glow follows cursor: strongest at center, fades at edges
    const distance = Math.sqrt(clampedX * clampedX + clampedY * clampedY);
    setGlowIntensity(1 - distance * 0.4);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
    setGlowIntensity(0);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`relative inline-block cursor-pointer ${className ?? ""}`}
      style={{ perspective: 600 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Subtle idle float when not hovering
      animate={
        isHovering
          ? {}
          : {
              y: [0, -2, 0],
            }
      }
      transition={
        isHovering
          ? { duration: 0 }
          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* Red glow behind — intensifies on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl blur-2xl pointer-events-none"
        animate={{
          opacity: glowIntensity * 0.7,
          scale: 0.8 + glowIntensity * 0.5,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{
          background:
            "radial-gradient(circle, rgba(216,14,22,0.7) 0%, rgba(216,14,22,0.3) 35%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* 3D card with cursor-following tilt */}
      <motion.div
        className="relative z-10"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX,
          rotateY,
          scale: isHovering ? 1.06 : 1,
          z: isHovering ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 22,
          mass: 0.5,
        }}
      >
        {/* Front face */}
        <motion.div
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          animate={{
            z: isHovering ? 12 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Logo className={className} variant={variant} to={to} />
        </motion.div>

        {/* Subtle specular highlight overlay */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden", zIndex: 2 }}
          animate={{
            opacity: glowIntensity * 0.25,
            background: `radial-gradient(ellipse at ${50 + rotateY * 1.5}% ${50 - rotateX * 1.5}%, rgba(255,255,255,0.7) 0%, transparent 60%)`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        />
      </motion.div>
    </motion.div>
  );
}
