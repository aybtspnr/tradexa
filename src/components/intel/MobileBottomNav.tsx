import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  items: NavItem[];
  onFilterClick?: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({ items, onFilterClick }) => {
  const [activeSection, setActiveSection] = useState<string>(items[0]?.id || "");
  const tickingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only activate on mobile
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY + 120;
        let current = items[0]?.id || "";

        for (const item of items) {
          const el = document.getElementById(item.id);
          if (el && el.offsetTop <= scrollY) {
            current = item.id;
          }
        }
        setActiveSection(current);
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] h-14">
          {items.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[44px] min-h-[44px]",
                  isActive ? "text-[#D80E16]" : "text-slate-400"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span className={cn("text-[9px] font-semibold", isActive && "font-bold")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
