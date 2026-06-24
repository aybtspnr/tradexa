"use client";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="py-10 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo className="h-6" />
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Tradexa — Inteligência de Mercado. Dados atualizados.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Início</Link>
            <Link to="/sobre" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Sobre</Link>
            <Link to="/pricing" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Planos</Link>
            <Link to="/blog" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Blog</Link>
            <Link to="/recursos" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Recursos</Link>
            <Link to="/glossario" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Glossário</Link>
            <Link to="/trabalhe-conosco" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Trabalhe Conosco</Link>
            <Link to="/termos" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Termos</Link>
            <Link to="/privacidade" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Privacidade</Link>
            <Link to="/contato" className="text-xs text-gray-500 hover:text-[#D80E16] font-medium transition-colors">Contato</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
