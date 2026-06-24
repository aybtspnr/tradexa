"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CursorContextType {
  setCursor: (type: CursorType, label?: string) => void;
  resetCursor: () => void;
}

type CursorType = "default" | "link" | "card" | "button" | "input";

const CursorContext = createContext<CursorContextType | null>(null);

export function useCustomCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCustomCursor must be inside CursorProvider");
  return ctx;
}

// SVG Icons
const ArrowUpRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7" /><path d="M7 7h10v10" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
  </svg>
);

const HandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0" />
    <path d="M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v2" />
    <path d="M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v8" />
    <path d="M18 8a2 2 0 012 2v6a8 8 0 01-16 0v-5" />
  </svg>
);

const CursorLineIcon = () => (
  <svg width="10" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [cursorLabel, setCursorLabel] = useState("");
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [clickPulse, setClickPulse] = useState(false);
  const trailsRef = useRef<{ x: number; y: number }[]>([
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 },
  ]);

  // Hide default cursor
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    style.id = "custom-cursor-hide";
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);
    const onDown = () => {
      setClickPulse(true);
      setTimeout(() => setClickPulse(false), 300);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("mousedown", onDown);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mousedown", onDown);
    };
  }, []);

  // Update trails with lerp
  useEffect(() => {
    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const animate = () => {
      trailsRef.current[0] = {
        x: lerp(trailsRef.current[0].x, position.x, 0.45),
        y: lerp(trailsRef.current[0].y, position.y, 0.45),
      };
      trailsRef.current[1] = {
        x: lerp(trailsRef.current[1].x, trailsRef.current[0].x, 0.35),
        y: lerp(trailsRef.current[1].y, trailsRef.current[0].y, 0.35),
      };
      trailsRef.current[2] = {
        x: lerp(trailsRef.current[2].x, trailsRef.current[1].x, 0.25),
        y: lerp(trailsRef.current[2].y, trailsRef.current[1].y, 0.25),
      };
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [position]);

  const setCursor = useCallback((type: CursorType, label?: string) => {
    setCursorType(type);
    setCursorLabel(label || "");
    setIsHovering(type !== "default");
  }, []);

  const resetCursor = useCallback(() => {
    setCursorType("default");
    setCursorLabel("");
    setIsHovering(false);
  }, []);

  const size = isHovering
    ? cursorType === "card" ? 80 : cursorType === "button" ? 60 : cursorType === "input" ? 2 : 44
    : 12;

  const getIcon = () => {
    switch (cursorType) {
      case "link": return <ArrowUpRightIcon />;
      case "card": return <HandIcon />;
      case "button": return <ArrowRightIcon />;
      case "input": return <CursorLineIcon />;
      default: return null;
    }
  };

  const trailSizes = [8, 16, 24];
  const trailOpacities = [0.6, 0.35, 0.15];

  return (
    <CursorContext.Provider value={{ setCursor, resetCursor }}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Trail dots */}
            {trailsRef.current.map((trail, i) => (
              <motion.div
                key={i}
                className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference"
                style={{
                  translateX: trail.x - trailSizes[i] / 2,
                  translateY: trail.y - trailSizes[i] / 2,
                }}
                animate={{
                  width: trailSizes[i],
                  height: trailSizes[i],
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.3 }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: isHovering ? "#D80E16" : "white",
                    opacity: trailOpacities[i],
                    transition: "background 0.3s ease",
                  }}
                />
              </motion.div>
            ))}

            {/* Main ring */}
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
              style={{
                translateX: position.x - size / 2,
                translateY: position.y - size / 2,
              }}
              animate={{
                width: size,
                height: size,
                scale: clickPulse ? 1.6 : 1,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            >
              <div
                className="w-full h-full rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: isHovering ? "#D80E16" : "white",
                  transition: "border-color 0.3s ease",
                }}
              >
                {isHovering && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-white"
                  >
                    {getIcon()}
                  </motion.div>
                )}
              </div>
              {clickPulse && (
                <motion.div
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 2.5 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-full border-2 border-white"
                />
              )}
            </motion.div>

            {/* Center dot */}
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9999]"
              style={{
                translateX: position.x - 3,
                translateY: position.y - 3,
              }}
              animate={{
                scale: isHovering ? 0 : 1,
                opacity: isHovering ? 0 : 0.9,
              }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
            >
              <div className="w-1.5 h-1.5 bg-[#D80E16] rounded-full" />
            </motion.div>

            {/* Label */}
            <AnimatePresence>
              {cursorLabel && isHovering && (
                <motion.div
                  className="fixed top-0 left-0 pointer-events-none z-[9999]"
                  style={{
                    translateX: position.x + size / 2 + 10,
                    translateY: position.y - 8,
                  }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                >
                  <span className="text-[11px] font-bold text-[#D80E16] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap border border-[#D80E16]/10">
                    {cursorLabel}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </CursorContext.Provider>
  );
}

/* Hook helper */
export function useCursorInteraction(type: CursorType, label?: string) {
  const ctx = useCustomCursor();
  return {
    onMouseEnter: () => ctx.setCursor(type, label),
    onMouseLeave: () => ctx.resetCursor(),
  };
}
