/**
 * FloatingTOC — Table of Contents sidebar for blog posts.
 * Extracts H2 headings from markdown content and renders as anchor links.
 * Sticky on desktop, hidden on mobile.
 */
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractTOC(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      const text = h2[1].trim();
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      items.push({ id, text, level: 2 });
      continue;
    }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      const text = h3[1].trim();
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      items.push({ id, text, level: 3 });
    }
  }
  return items;
}

export function FloatingTOC({ content }: { content: string }) {
  const items = useMemo(() => extractTOC(content), [content]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Track which heading is currently in view
  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#D80E16] text-white shadow-lg flex items-center justify-center hover:bg-[#b80c12] transition-all"
          aria-label="Índice do artigo"
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] p-6 max-h-[60vh] overflow-y-auto"
            >
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />
              <div className="font-extrabold text-[#0F111A] text-sm uppercase tracking-wide mb-3">
                Neste artigo
              </div>
              <nav className="space-y-1">
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`block text-sm py-2 px-3 rounded-lg transition-all ${
                      item.level === 3 ? "pl-7" : ""
                    } ${
                      activeId === item.id
                        ? "bg-[#D80E16]/[0.06] text-[#D80E16] font-bold"
                        : "text-[#5E6278] hover:text-[#0F111A] hover:bg-slate-50"
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-28 self-start w-56 shrink-0">
        <nav className="space-y-1">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#5E6278] mb-3 px-2">
            Neste artigo
          </div>
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 text-[13px] py-1.5 px-2 rounded-md transition-all ${
                item.level === 3 ? "pl-6" : ""
              } ${
                activeId === item.id
                  ? "bg-[#D80E16]/[0.06] text-[#D80E16] font-bold"
                  : "text-[#5E6278] hover:text-[#0F111A] hover:bg-slate-50"
              }`}
            >
              {activeId === item.id && (
                <ChevronRight className="w-3 h-3 shrink-0 text-[#D80E16]" />
              )}
              <span className="leading-tight">{item.text}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
