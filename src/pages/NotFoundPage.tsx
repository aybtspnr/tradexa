"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";

export default function NotFoundPage() {
  useSeo({
    title: "Página Não Encontrada — TRADEXA",
    description: "A página que você procura não foi encontrada. Volte à página inicial da TRADEXA ou explore nossas ferramentas de inteligência comercial.",
    noIndex: true,
  });
  return (
    <SiteLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-lg"
        >
          {/* Large 404 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-[140px] sm:text-[180px] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #D80E16 0%, #FF5555 50%, #D80E16 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F111A] mt-2 mb-4">
            Página não encontrada
          </h1>

          <p className="text-[#5E6278] text-lg mb-10 leading-relaxed">
            A página que você procura pode ter sido removida, renomeada ou está temporariamente indisponível.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-2xl h-14 px-8 font-bold shadow-lg shadow-red-500/20 border-0"
              asChild
            >
              <Link to="/">
                <Home className="w-5 h-5" />
                Voltar ao Início
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl h-14 px-8 font-bold border-[#0F111A]/15"
              asChild
            >
              <Link to="/landing/ncm-classifier">
                <Search className="w-5 h-5" />
                Classificar Produto
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
