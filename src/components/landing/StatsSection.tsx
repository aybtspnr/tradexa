"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const VPS_STATS_API = "https://api.tradexa.app/api/stats";

interface GlobalStats {
  importers: number;
  countries: number;
  hsChapters: number;
  exportsValue: number;
  importsValue: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Tentar buscar stats reais do VPS
    fetch(VPS_STATS_API)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: GlobalStats) => setStats(d))
      .catch(() => {
        // Fallback: usar dados fallback (serão atualizados via build/env)
        setStats({
          importers: 1600000,
          countries: 175,
          hsChapters: 97,
          exportsValue: 300,
          importsValue: 224,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const items = stats ? [
    { value: `${stats.importers / 1e6 >= 1 ? `${(stats.importers / 1e6).toFixed(1)}M+` : `${(stats.importers / 1e3).toFixed(0)}K+`}`, label: "Importadores globais" },
    { value: `${stats.countries}+`, label: "Países cobertos" },
    { value: `${stats.hsChapters}+`, label: "Capítulos HS" },
    { value: `$${stats.exportsValue}B+`, label: "Exportações anuais" },
  ] : [];

  return (
    <section ref={ref} className="relative z-10 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            </motion.div>
          ))}
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-2 mx-auto w-24" />
              <div className="h-4 bg-gray-200 rounded mx-auto w-32" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
