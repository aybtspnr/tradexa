/**
 * Comparador de Portos Brasileiros — Custos, prazos e eficiência
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Anchor, Clock, DollarSign, TrendingUp, ArrowRight, Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

interface Porto {
  nome: string;
  estado: string;
  tipo: "marítimo" | "fluvial";
  custoMedioContainer: string;
  tempoMedioDesembaraco: string;
  eficiencia: 1 | 2 | 3 | 4 | 5;
  volumeAnual: string;
  principaisCargas: string[];
  observacao: string;
}

const portos: Porto[] = [
  { nome: "Porto de Santos", estado: "SP", tipo: "marítimo", custoMedioContainer: "R$ 1.800–2.500", tempoMedioDesembaraco: "5–8 dias", eficiencia: 4, volumeAnual: "147 milhões ton", principaisCargas: ["Soja", "Açúcar", "Contêineres", "Milho", "Café", "Automóveis"], observacao: "Maior porto da América Latina. Pode ter filas na safra (Mai–Jul)." },
  { nome: "Porto de Paranaguá", estado: "PR", tipo: "marítimo", custoMedioContainer: "R$ 1.600–2.200", tempoMedioDesembaraco: "4–7 dias", eficiencia: 4, volumeAnual: "56 milhões ton", principaisCargas: ["Soja", "Farelo", "Milho", "Contêineres", "Açúcar"], observacao: "Principal corredor de exportação do agronegócio. Estrutura moderna." },
  { nome: "Porto de Itajaí", estado: "SC", tipo: "marítimo", custoMedioContainer: "R$ 1.500–2.100", tempoMedioDesembaraco: "3–6 dias", eficiencia: 5, volumeAnual: "14 milhões ton", principaisCargas: ["Contêineres", "Carnes", "Madeira", "Cerâmica"], observacao: "Excelente para cargas refrigeradas. Gestão privada eficiente." },
  { nome: "Porto de Navegantes", estado: "SC", tipo: "marítimo", custoMedioContainer: "R$ 1.500–2.000", tempoMedioDesembaraco: "3–5 dias", eficiencia: 5, volumeAnual: "12 milhões ton", principaisCargas: ["Contêineres", "Carnes", "Madeira"], observacao: "Terminal privado Portonave. Um dos mais ágeis do Brasil." },
  { nome: "Porto de Rio Grande", estado: "RS", tipo: "marítimo", custoMedioContainer: "R$ 1.400–2.000", tempoMedioDesembaraco: "4–7 dias", eficiencia: 4, volumeAnual: "41 milhões ton", principaisCargas: ["Soja", "Arroz", "Trigo", "Contêineres"], observacao: "Saída estratégica para o Mercosul. Dragagem constante." },
  { nome: "Porto do Rio de Janeiro", estado: "RJ", tipo: "marítimo", custoMedioContainer: "R$ 2.000–2.800", tempoMedioDesembaraco: "5–10 dias", eficiencia: 3, volumeAnual: "9 milhões ton", principaisCargas: ["Contêineres", "Aço", "Trigo"], observacao: "Boa infraestrutura mas custos portuários mais altos." },
  { nome: "Porto de Suape", estado: "PE", tipo: "marítimo", custoMedioContainer: "R$ 1.800–2.400", tempoMedioDesembaraco: "5–8 dias", eficiencia: 4, volumeAnual: "24 milhões ton", principaisCargas: ["Granéis líquidos", "Contêineres", "Graneis sólidos"], observacao: "Hub do Nordeste. Complexo industrial integrado." },
  { nome: "Porto de Pecém", estado: "CE", tipo: "marítimo", custoMedioContainer: "R$ 1.600–2.200", tempoMedioDesembaraco: "5–8 dias", eficiencia: 4, volumeAnual: "17 milhões ton", principaisCargas: ["Minério", "Aço", "Contêineres"], observacao: "Porto offshore. Ligação com ZPE para indústrias." },
  { nome: "Porto de Manaus", estado: "AM", tipo: "fluvial", custoMedioContainer: "R$ 2.500–3.500", tempoMedioDesembaraco: "8–15 dias", eficiencia: 2, volumeAnual: "12 milhões ton", principaisCargas: ["Eletrônicos", "Insumos industriais"], observacao: "Zona Franca. Acesso fluvial. Navegação limitada na seca (Set–Nov)." },
  { nome: "Porto de Vila do Conde", estado: "PA", tipo: "marítimo", custoMedioContainer: "R$ 1.400–2.000", tempoMedioDesembaraco: "5–9 dias", eficiencia: 3, volumeAnual: "11 milhões ton", principaisCargas: ["Minério", "Alumina", "Contêineres"], observacao: "Acesso ao Norte/Nordeste. Menos congestionado." },
];

export default function ComparadorPortosPage() {
  useSeo({
    title: "Comparador de Portos — Custos, Prazos e Eficiência",
    description: "Compare os principais portos do Brasil: custo médio por contêiner, tempo de desembaraço, eficiência operacional e principais cargas movimentadas.",
  });

  return (
    <SiteLayout>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-blue-500/10 text-blue-600">
              Ferramenta Gratuita
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Comparador de <span className="text-[#D80E16]">Portos</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Compare os principais portos brasileiros por custo, prazo de desembaraço, eficiência e perfil de carga para escolher a melhor rota.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black/[0.08]">
                <th className="text-left py-3 px-4 font-extrabold text-[#0F111A]">Porto</th>
                <th className="text-left py-3 px-4 font-extrabold text-[#0F111A]">Custo Médio</th>
                <th className="text-left py-3 px-4 font-extrabold text-[#0F111A]">Desembaraço</th>
                <th className="text-left py-3 px-4 font-extrabold text-[#0F111A]">Eficiência</th>
                <th className="text-left py-3 px-4 font-extrabold text-[#0F111A]">Volume Anual</th>
                <th className="text-left py-3 px-4 font-extrabold text-[#0F111A]">Principais Cargas</th>
              </tr>
            </thead>
            <tbody>
              {portos.map((p, i) => (
                <motion.tr
                  key={p.nome}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-black/[0.04] hover:bg-black/[0.01]"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0F111A]">{p.nome}</div>
                    <div className="text-[10px] text-[#5E6278]">{p.estado} · {p.tipo === "marítimo" ? "Marítimo" : "Fluvial"}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0F111A]">{p.custoMedioContainer}</td>
                  <td className="py-3 px-4 text-[#5E6278]">{p.tempoMedioDesembaraco}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, j) => (
                        <div key={j} className={`w-3 h-3 rounded-sm ${j < p.eficiencia ? "bg-[#10b981]" : "bg-black/[0.06]"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#5E6278]">{p.volumeAnual}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.principaisCargas.map(c => (
                        <span key={c} className="text-[10px] bg-black/[0.04] text-[#5E6278] px-1.5 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Precisa decidir a melhor rota?
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">Cotação de Frete Personalizada</h2>
          <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
            Nossa equipe compara cotações de frete nos portos que fazem sentido para sua carga, considerando custo, prazo e eficiência.
          </p>
          <Link to="/servicos/cotacao-frete-internacional" className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-8 py-4 rounded-2xl transition-colors">
            Solicitar Cotação
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
