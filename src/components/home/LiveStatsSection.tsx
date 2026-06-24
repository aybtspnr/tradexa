"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Globe, Users, Zap } from "lucide-react";

function AnimatedStat({ value, suffix = "", prefix = "", duration = 2000 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = 30;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

const stats = [
  {
    icon: <FileText className="w-6 h-6" />,
    value: 52_300_000,
    suffix: "+",
    label: "Registros de Comércio",
    desc: "Importações e exportações brasileiras cruzadas",
  },
  {
    icon: <Users className="w-6 h-6" />,
    value: 48_700,
    suffix: "+",
    label: "Empresas Monitoradas",
    desc: "Importadores e exportadores ativos no Brasil",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    value: 250,
    suffix: "+",
    label: "Países Cobertos",
    desc: "Dados de comércio bilateral com o Brasil",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    value: 99.9,
    suffix: "%",
    label: "Uptime da Plataforma",
    desc: "Disponibilidade garantida em tempo real",
  },
];

export default function LiveStatsSection() {
  return (
    <section className="relative py-16 md:py-20 bg-white border-y border-slate-100">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center md:text-left"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D80E16]/10 text-[#D80E16] mb-4">
                {s.icon}
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                <AnimatedStat value={s.value} suffix={s.suffix} duration={2000 + i * 300} />
              </p>
              <p className="text-sm font-semibold text-slate-800 mb-1">{s.label}</p>
              <p className="text-xs text-slate-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
