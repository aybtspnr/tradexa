"use client";

import { motion } from "framer-motion";
import { stats } from "../landingData";

export function StatsSection() {
  return (
    <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg`}>
                <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <p className="text-2xl lg:text-3xl font-black text-white mb-2">{stat.value}</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}