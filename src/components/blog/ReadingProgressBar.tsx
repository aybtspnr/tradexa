/**
 * ReadingProgressBar — thin animated bar at the top of blog posts
 * that fills as the user scrolls (like NYT/Bloomberg).
 */
import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      if (scrollable <= 0) {
        setProgress(100);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
      setProgress(pct);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[101] h-[3px] bg-black/[0.03]">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #D80E16, #ff4444)",
          boxShadow: "0 0 8px rgba(216, 14, 22, 0.3)",
        }}
      />
    </div>
  );
}
