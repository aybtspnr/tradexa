"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Globe, Database, Search } from "lucide-react";

const STATS = [
  { icon: Globe, value: 31, suffix: "", prefix: "", label: "Países com Tarifas", sub: "Alíquotas de importação", color: "#10b981" },
  { icon: Database, value: 8700, suffix: "+", prefix: "", label: "Códigos NCM/HS", sub: "Classificação inteligente", color: "#D80E16" },
  { icon: Search, value: 3800000, suffix: "+", prefix: "", label: "Importadores Globais", sub: "Diretório por código HS", color: "#8b5cf6" },
  { icon: TrendingUp, value: 12, suffix: "M+", prefix: "", label: "Registros Processados", sub: "Dados de comércio exterior", color: "#06b6d4" },
];

function AnimatedStat({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let start = 0;
        const dur = 2000;
        const step = 30;
        const inc = value / (dur / step);
        const t = setInterval(() => {
          start += inc;
          if (start >= value) { setCount(value); clearInterval(t); }
          else setCount(Math.floor(start));
        }, step);
        obs.unobserve(el);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("pt-BR")}{suffix}
    </span>
  );
}

export function StatsBarSection() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-white">
      {/* Subtle gradient top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D80E16]/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F111A] tracking-tight leading-tight">
            A plataforma mais{" "}
            <span className="text-[#D80E16]">
              completa
            </span>
            {" "}do mercado
          </h2>
          <p className="text-lg text-[#5E6278] max-w-2xl mx-auto mt-4">
            Tarifas internacionais e diretório de importadores — tudo integrado em uma única plataforma.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="relative group"
            >
              <div className="glass-card-3d rounded-2xl p-5 md:p-6 text-center">
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: stat.color + "15" }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F111A] tracking-tight">
                  <AnimatedStat value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </p>
                <p className="text-sm font-bold text-[#0F111A] mt-1">{stat.label}</p>
                <p className="text-[11px] text-[#5E6278]/60 mt-0.5">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
