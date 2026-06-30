import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Page transition wrapper — anima apenas em mudanças de rota,
 * não na primeira renderização (evita flash de "refresh").
 */
const pageTransition = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

export default function AnimatedPageContent({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      {...pageTransition}
    >
      {children}
    </motion.div>
  );
}
