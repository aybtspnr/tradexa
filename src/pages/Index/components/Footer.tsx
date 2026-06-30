"use client";

import { Link } from "react-router-dom";
import { Logo3D } from "@/components/Logo3D";

const footerColumns = [
  {
    title: "Consultoria",
    links: [
      { label: "Pesquisa de Mercado para Exportação", href: "/servicos/pesquisa-mercado-exportacao" },
      { label: "Pesquisa de Compradores Internacionais", href: "/servicos/pesquisa-compradores" },
      { label: "Cotação de Frete Internacional", href: "/servicos/cotacao-frete-internacional" },
      { label: "Despacho Aduaneiro", href: "/servicos/despacho-aduaneiro" },
      { label: "Fulfillment Internacional", href: "/servicos/fulfillment" },
      { label: "Representação Comercial no Brasil", href: "/servicos/representacao-brasil" },
      { label: "Auditoria de Classificação Fiscal", href: "/servicos/auditoria-classificacao-fiscal" },
      { label: "Frete Internacional Gerenciado", href: "/servicos/agenciamento-carga" },
    ],
  },
  {
    title: "Inteligência",
    links: [
      { label: "AI Search", href: "/ai-search" },

      { label: "HS Lookup EUA", href: "/hts-lookup" },

      { label: "Tarifário Global", href: "/global-tariff" },
      { label: "Inteligência Comercial", href: "/intelligence" },

      { label: "Diretório de Importadores", href: "/importadores" },
      { label: "Importadores Potenciais", href: "/potential-importers" },
      { label: "Mapa de Importadores", href: "/importers-map" },


      { label: "Análise Avançada", href: "/trade-intelligence" },
      { label: "Supply Chain", href: "/supply-chain" },
      { label: "Notícias", href: "/noticias" },
    ],
  },
  {
    title: "Ferramentas",
    links: [

      { label: "Calculadora Incoterms", href: "/ferramentas/calculadora-incoterms" },
      { label: "Calculadora ACC/ACE", href: "/ferramentas/calculadora-acc-ace" },
      { label: "Calculadora de Drawback", href: "/ferramentas/calculadora-drawback" },
      { label: "Calculadora de Precificação", href: "/ferramentas/precificacao-exportacao" },
      { label: "Gerador de Documentos", href: "/ferramentas/gerador-documentos" },
      { label: "Conformidade Regulatória", href: "/ferramentas/conformidade-regulatoria" },
      { label: "Comparador de Portos", href: "/ferramentas/comparador-portos" },
      { label: "Simulador de Acordos", href: "/ferramentas/simulador-acordos-comerciais" },
      { label: "Calculadora de Carbono", href: "/ferramentas/calculadora-carbono" },
      { label: "Calendário Aduaneiro", href: "/calendario-aduaneiro" },

      { label: "Mapa de Frete", href: "/maritime-freight-map" },
      { label: "Track & Trace", href: "/track-trace" },
      { label: "Rastreamento de Carga", href: "/rastreamento" },
      { label: "Port Intelligence EUA", href: "/port-intelligence" },
    ],
  },
  {
    title: "Aprenda",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Tutoriais", href: "/tutorial" },
      { label: "Guia de Exportação", href: "/guia-exportacao" },
      { label: "Guia de Importação", href: "/guia-importacao" },
      { label: "Guia NCM", href: "/guia-ncm" },
      { label: "Guia DUIMP 2026", href: "/guia-duimp" },
      { label: "Logística Internacional", href: "/logistica-internacional" },
      { label: "Feiras e Eventos", href: "/feiras-eventos" },
      { label: "Glossário", href: "/glossario" },
      { label: "Recursos", href: "/recursos" },
    ],
  },
  {
    title: "Links Úteis",
    links: [
      { label: "Comex Stat", href: "https://comexstat.mdic.gov.br/" },
      { label: "Siscomex", href: "https://www.gov.br/siscomex/" },
      { label: "ApexBrasil", href: "https://apexbrasil.com.br/" },
      { label: "MDIC", href: "https://www.gov.br/mdic/" },
      { label: "Receita Federal", href: "https://www.gov.br/receitafederal/" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Planos", href: "/pricing" },
      { label: "Contato", href: "/contato" },
      { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
      { label: "Privacidade", href: "/privacidade" },
      { label: "Termos de Uso", href: "/termos" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0F111A] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Logo + tagline — linha própria */}
        <div className="mb-12 text-center md:text-left">
          <Logo3D className="h-7 mb-3 mx-auto md:mx-0" variant="white" />
          <p className="text-sm text-white/60 leading-relaxed max-w-xs mx-auto md:mx-0">
            Inteligência de mercado para comércio exterior com dados atualizados.
          </p>
        </div>

        {/* Colunas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold text-white mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("http") ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-[#D80E16] transition-colors">{l.label}</a>
                    ) : (
                      <Link to={l.href} className="text-sm text-white/50 hover:text-[#D80E16] transition-colors">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] pt-8 text-center">
          <p className="text-xs text-white/60">© {new Date().getFullYear()} TRADEXA — Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
