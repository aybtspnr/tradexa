import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface GlossaryTerm {
  term: string;
  definition: string;
  link: string;
}

const dailyTerms: GlossaryTerm[] = [
  {
    term: "NCM",
    definition:
      "Nomenclatura Comum do Mercosul — código de 8 dígitos que classifica mercadorias e define alíquotas de impostos no Brasil.",
    link: "/glossario",
  },
  {
    term: "Drawback",
    definition:
      "Regime aduaneiro que permite importar insumos com suspensão de tributos, desde que o produto final seja exportado.",
    link: "/glossario",
  },
  {
    term: "OEA",
    definition:
      "Operador Econômico Autorizado — certificação que concede agilidade no desembaraço aduaneiro e menor intervenção física.",
    link: "/glossario",
  },
  {
    term: "Incoterms",
    definition:
      "Termos internacionais de comércio definidos pela ICC que estabelecem responsabilidades entre comprador e vendedor.",
    link: "/glossario",
  },
  {
    term: "CIF",
    definition:
      "Cost, Insurance and Freight — incoterm onde o preço inclui custo, seguro e frete até o porto de destino.",
    link: "/glossario",
  },
  {
    term: "FOB",
    definition:
      "Free on Board — incoterm onde o vendedor entrega a bordo do navio; custos e riscos passam ao comprador a partir daí.",
    link: "/glossario",
  },
  {
    term: "ICMS",
    definition:
      "Imposto estadual que incide sobre importações com alíquota variando de 4% a 18% conforme o estado de destino.",
    link: "/glossario",
  },
  {
    term: "II",
    definition:
      "Imposto de Importação — tributo federal com alíquota de 0% a 35%, calculado sobre o valor aduaneiro (CIF + despesas).",
    link: "/glossario",
  },
  {
    term: "IPI",
    definition:
      "Imposto sobre Produtos Industrializados — tributo federal que incide sobre produtos nacionais e importados, variando por NCM.",
    link: "/glossario",
  },
  {
    term: "Siscomex",
    definition:
      "Sistema Integrado de Comércio Exterior — plataforma que integra todos os órgãos do comércio exterior brasileiro.",
    link: "/glossario",
  },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function GlossarioWidget() {
  const todayTerm = useMemo(() => {
    const dayOfYear = getDayOfYear();
    const index = dayOfYear % dailyTerms.length;
    return dailyTerms[index];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative my-10 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
    >
      {/* Red accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D80E16] to-[#b80c12]" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#D80E16]/5 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#D80E16]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#D80E16]">
            Termo do Dia
          </span>
        </div>

        {/* Term */}
        <h4 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-2">
          {todayTerm.term}
        </h4>

        {/* Definition */}
        <p className="text-slate-500 text-sm leading-relaxed mb-5">
          {todayTerm.definition}
        </p>

        {/* Link */}
        <Link
          to={todayTerm.link}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#D80E16] hover:text-[#b80c12] transition-colors"
        >
          Ver glossário completo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
