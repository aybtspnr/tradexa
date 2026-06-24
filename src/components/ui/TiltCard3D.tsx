"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";

interface TiltCard3DProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  scale?: number;
  glareOpacity?: number;
}

export function TiltCard3D({
  children,
  className = "",
  tiltAmount = 15,
  scale = 1.03,
  glareOpacity = 0.07,
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [glareStyle, setGlareStyle] = useState({ opacity: 0, x: "50%", y: "50%" });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = x / rect.width - 0.5;
    const cy = y / rect.height - 0.5;
    const rotateX = -cy * tiltAmount;
    const rotateY = cx * tiltAmount;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`);
    setGlareStyle({
      opacity: glareOpacity,
      x: `${(x / rect.width) * 100}%`,
      y: `${(y / rect.height) * 100}%`,
    });
  }

  function handleMouseLeave() {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
    setGlareStyle({ opacity: 0, x: "50%", y: "50%" });
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      animate={{ transform }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-inherit transition-opacity duration-200"
        style={{
          opacity: glareStyle.opacity,
          background: `radial-gradient(circle at ${glareStyle.x} ${glareStyle.y}, rgba(255,255,255,0.4) 0%, transparent 60%)`,
        }}
      />
    </motion.div>
  );
}
