import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const certificacoes = [
  { cat: "ANVISA (Saúde)", items: ["Medicamentos e insumos farmacêuticos", "Produtos para saúde (luvas, seringas)", "Cosméticos e produtos de higiene", "Alimentos processados e bebidas", "Dispositivos médicos"] },
  { cat: "INMETRO (Conformidade)", items: ["Eletroeletrônicos (computadores, TVs)", "Brinquedos", "Equipamentos de proteção individual (EPI)", "Vedantes hidráulicos", "Materiais elétricos (fios, disjuntores)"] },
  { cat: "IBAMA (Meio Ambiente)", items: ["Produtos químicos perigosos", "Defensivos agrícolas", "Produtos controlados (combustíveis)", "Resíduos e materiais recicláveis"] },
  { cat: "MAPA (Agronegócio)", items: ["Produtos de origem animal (carnes, laticínios)", "Produtos de origem vegetal (grãos, frutas)", "Sementes e mudas", "Produtos veterinários", "Alimentos para animais"] },
  { cat: "DECEX/MDIC (Controle Especial)", items: ["Produtos de defesa", "Equipamentos militares", "Tecnologia sensível", "Produtos com potencial duplo uso"] },
];

export default function ChecklistCertificacoesPage() {
  useSeo({
    title: "Certificações Obrigatórias para Importação — Checklist",
    description: "Guia completo de certificações e licenças obrigatórias para importação no Brasil: ANVISA, INMETRO, IBAMA, MAPA e DECEX.",
    url: "https://www.tradexa.com.br/checklist/certificacoes-importacao",
    type: "website",
    schema: { "@context": "https://schema.org", "@type": "HowTo", name: "Certificações Obrigatórias para Importação" },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none"><ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} /></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <Shield className="w-4 h-4 text-[#D80E16]" /><span className="text-sm text-[#D80E16] font-medium">Lead Magnet</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Certificações <span className="text-[#D80E16]">Obrigatórias</span> para Importação</h1>
              <p className="text-lg text-slate-500 max-w-2xl">Saiba quais certificações seu produto precisa antes de importar. ANVISA, INMETRO, IBAMA, MAPA e mais.</p>
            </motion.div>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <div className="max-w-3xl">
            <p className="text-slate-600 leading-relaxed text-lg">
              A importação de produtos no Brasil está sujeita a diversas certificações obrigatórias 
              dependendo da natureza do produto. Esta checklist reúne as principais certificações 
              exigidas pelos órgãos reguladores brasileiros como ANVISA, INMETRO, MAPA e IBAMA. 
              Cada categoria de produto tem requisitos específicos que devem ser atendidos antes 
              do embarque ou no momento do desembaraço aduaneiro. Ignorar essas exigências pode 
              resultar em apreensão da carga, multas e até proibição de importação. Recomendamos 
              verificar com antecedência quais certificações se aplicam ao seu produto e iniciar 
              o processo de obtenção ainda durante a negociação com o fornecedor. Muitos 
              certificados exigem testes laboratoriais que podem levar de 30 a 90 dias.
            </p>
          </div>
          {certificacoes.map((cat, ci) => (
            <motion.div key={cat.cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.1 }}>
              <h2 className="text-xl font-bold mb-4">{cat.cat}</h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                    <div className="w-6 h-6 rounded border-2 border-gray-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>
        <section className="relative py-20 bg-gradient-to-b from-slate-50 to-[#D80E16]/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Verifique as exigências do seu produto</h2>
            <p className="text-slate-500 mb-8">Classifique seu produto no NCM e saiba quais regulamentações se aplicam.</p>
            <Link to="/landing/ncm-classifier" className="inline-flex items-center gap-2 bg-[#D80E16] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#b80c12] transition-colors">
              Classificar NCM <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
