"use client";

import { motion } from "framer-motion";
import logoSrc from "@/assets/logo.png";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #fafafa 0%, #f0f0f0 50%, #f8f8f8 100%)" }}
    >
      {/* Animated rings */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Ring 1 — slow */}
        <div
          className="absolute inset-0 rounded-full border border-[#DC2626]/10"
          style={{ animation: "spin 20s linear infinite" }}
        />
        {/* Ring 2 — reverse */}
        <div
          className="absolute rounded-full border border-[#DC2626]/8"
          style={{
            inset: "8px",
            animation: "spin 14s linear infinite reverse",
          }}
        />
        {/* Ring 3 — fast with dot */}
        <div
          className="absolute rounded-full border border-[#DC2626]/15"
          style={{
            inset: "16px",
            animation: "spin 8s linear infinite",
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#DC2626]"
            style={{ boxShadow: "0 0 8px rgba(220,38,38,0.4)" }}
          />
        </div>

        {/* Logo */}
        <img
          src={logoSrc}
          alt="Tradexa"
          className="relative z-10 h-8 w-auto"
          style={{ animation: "pulse 3s ease-in-out infinite" }}
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
      `}</style>
    </motion.div>
  );
}
