"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp, ChevronDown, Newspaper, ExternalLink, Clock, Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   BOTTOM NEWS PANEL — Osiris-style
   Fetches from /api/news (CNBC RSS, proxied via Vercel)
   ═══════════════════════════════════════════════════════════════ */

interface NewsItem {
  title: string; link: string; pubDate: string; source: string;
}

export default function BottomIntelBar() {
  const [expanded, setExpanded] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const xml = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const items = doc.querySelectorAll("item");
      const parsed: NewsItem[] = [];
      items.forEach(item => {
        parsed.push({
          title: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "",
          pubDate: item.querySelector("pubDate")?.textContent || "",
          source: "CNBC",
        });
      });
      setNews(parsed.slice(0, 20));
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
    const iv = setInterval(fetchNews, 300000);
    return () => clearInterval(iv);
  }, [fetchNews]);

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h`;
      return `${Math.floor(hrs / 24)}d`;
    } catch { return ""; }
  };

  return (
    <>
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-t-xl px-4 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 shadow-lg flex items-center gap-1.5 z-30"
      >
        <Newspaper className="w-3.5 h-3.5 text-[#D80E16]" />
        NOTÍCIAS
        {news.length > 0 && <span className="text-[#D80E16]">({news.length})</span>}
        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_32px_rgba(15,17,26,0.08)]">
              <div className="px-4 py-2 max-h-[260px] overflow-y-auto space-y-1.5">
                {news.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[8px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                          {item.source}
                        </span>
                        <span className="text-[8px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(item.pubDate)}
                        </span>
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-[#D80E16] transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#D80E16] flex-shrink-0 mt-1 transition-colors" />
                  </a>
                ))}
                {news.length === 0 && !loading && (
                  <div className="text-center py-6 text-[11px] text-slate-400">Carregando notícias...</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
