import { useState, useEffect, type ReactNode } from "react";

/**
 * Progressive enhancement: renders children immediately without animation.
 * Loads framer-motion in background (~122KB / 40KB gzip) and applies
 * page transitions on subsequent navigations.
 */
export function AnimatedPage({ children }: { children: ReactNode }) {
  const [MotionDiv, setMotionDiv] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    import("./AnimatedPageContent").then((m) => setMotionDiv(() => m.default));
  }, []);

  if (!MotionDiv) return <>{children}</>;

  return <MotionDiv>{children}</MotionDiv>;
}
