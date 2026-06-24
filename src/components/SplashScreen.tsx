"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo3D } from "@/components/Logo3D";
import logoSrc from "@/assets/logo.png";

interface SplashScreenProps {
  show?: boolean;
  subtitle?: string;
  stages?: string[];
  duration?: number;
  onDone?: () => void;
  /** Full cinematic mode with rings, corners, radar. Default false (minimal). */
  cinematic?: boolean;
}

export function SplashScreen({
  show = true,
  subtitle,
  stages,
  duration,
  onDone,
  cinematic = false,
}: SplashScreenProps) {
  useEffect(() => {
    if (!duration || !onDone) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  const hasStages = stages && stages.length > 0;
  if (show === false) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fafafa 0%, #f0f0f0 50%, #f8f8f8 100%)" }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220,38,38,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.02) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Corner accents (cinematic only) */}
        {cinematic &&
          [
            { top: "20px", left: "20px", borderWidth: "2px 0 0 2px" },
            { top: "20px", right: "20px", borderWidth: "2px 2px 0 0" },
            { bottom: "20px", left: "20px", borderWidth: "0 0 2px 2px" },
            { bottom: "20px", right: "20px", borderWidth: "0 2px 2px 0" },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              transition={{ delay: 0.8 + i * 0.12, duration: 0.5 }}
              className="absolute w-12 h-12"
              style={{
                top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right,
                borderWidth: pos.borderWidth, borderStyle: "solid", borderColor: "#DC2626",
              }}
            />
          ))}

        {/* Logo container */}
        <div className={`relative flex items-center justify-center ${cinematic ? "w-48 h-48 mb-10" : "w-36 h-36 mb-8"}`}>
          {/* Rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.4 }, scale: { duration: 0.6 },
              rotate: { duration: cinematic ? 24 : 22, repeat: Infinity, ease: "linear" },
            }}
            className="absolute inset-0 rounded-full border border-[#DC2626]/10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#DC2626]"
              style={{ boxShadow: "0 0 12px rgba(220,38,38,0.35)" }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1, rotate: -360 }}
            transition={{
              opacity: { duration: 0.4, delay: 0.1 }, scale: { duration: 0.6, delay: 0.1 },
              rotate: { duration: cinematic ? 16 : 15, repeat: Infinity, ease: "linear" },
            }}
            className="absolute rounded-full border border-[#DC2626]/8"
            style={{ inset: cinematic ? "20px" : "12px" }}
          >
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#DC2626]/80"
              style={{ boxShadow: "0 0 8px rgba(220,38,38,0.25)" }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.4, delay: 0.2 }, scale: { duration: 0.6, delay: 0.2 },
              rotate: { duration: cinematic ? 10 : 9, repeat: Infinity, ease: "linear" },
            }}
            className="absolute rounded-full border border-[#DC2626]/15"
            style={{ inset: cinematic ? "42px" : "26px" }}
          />

          {/* Radar sweep (cinematic only) */}
          {cinematic && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.08, 0], rotate: [0, 360] }}
              transition={{
                opacity: { duration: 4, repeat: Infinity },
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                delay: 0.6,
              }}
              className="absolute rounded-full"
              style={{
                inset: "6px",
                background: "conic-gradient(from 0deg, transparent 0deg, rgba(220,38,38,0.08) 40deg, transparent 80deg)",
              }}
            />
          )}

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-10"
          >
            {cinematic ? (
              <div className="w-24 h-24 flex items-center justify-center">
                <Logo3D variant="default" />
              </div>
            ) : (
              <img src={logoSrc} alt="Tradexa" className="h-10 w-auto"
                style={{ animation: "splashPulse 3s ease-in-out infinite" }} />
            )}
          </motion.div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="overflow-hidden mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-[11px] tracking-[0.3em] text-gray-400 font-medium uppercase">
                {subtitle}
              </p>
            </motion.div>
          </div>
        )}

        {/* Progress bar + stages */}
        {hasStages && (
          <div className="w-56 md:w-72">
            <div className="relative w-full h-[2px] rounded-full overflow-hidden bg-[#DC2626]/6">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: (duration || 3000) / 1000 - 0.5, delay: 0.4, ease: "easeInOut",
                }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #DC2626, #EF4444, #DC2626)",
                  boxShadow: "0 0 10px rgba(220,38,38,0.25)",
                }}
              />
            </div>
            <div className="mt-3 h-4 flex items-center justify-center">
              {stages.map((text, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    delay: 0.4 + (i * (duration || 3000)) / stages.length / 1000,
                    duration: 0.6, times: [0, 0.08, 0.5, 1],
                  }}
                  className="absolute text-[9px] tracking-[0.1em] font-medium"
                  style={{ color: i === stages.length - 1 ? "#DC2626" : "#9CA3AF" }}
                >
                  {text}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes splashPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.85; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
