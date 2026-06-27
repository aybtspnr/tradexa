import { useRef, useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Briefcase,
  Building2,
  Shield,
  Users,
  Landmark,
  Award,
  Globe,
  Clock,
  MessageSquare,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { getAllPosts } from "@/data/blog/posts";
import type { BlogPostMeta } from "@/data/blog/posts";

/* ═══════════════════════════════════════
   MOTION VARIANTS
   ═══════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/* ═══════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════ */
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const duration = 2000;
    const step = 30;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, step);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════
   SECTION WRAPPERS
   ═══════════════════════════════════════ */
function FadeIn({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.7,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   1. HERO SECTION
   ═══════════════════════════════════════ */
function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 140]);
  const opacityY = useTransform(scrollY, [0, 500], [1, 0]);

  const badges = [
    "Atendimento Nacional",
    "OAB/SC",
    "15+ Anos de Experiência",
    "5.000+ Casos Atendidos",
  ];

  return (
    <section
      ref={heroRef}
      className="hero"
      style={{ minHeight: "100vh", backgroundColor: "#0F111A" }}
    >
      {/* Ambient gold glow orb */}
      <div className="glow-gold" />

      {/* Dotted pattern overlay */}
      <div className="pattern-dots" />

      <motion.div
        style={{ y: heroY, opacity: opacityY, position: "relative", zIndex: 10 }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="hero-content"
      >
        <motion.h1 variants={fadeUp} className="hero-title">
          Advocacia que <span className="gold-text">protege</span> seus direitos
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="section-sub"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Soluções jurídicas completas nas áreas trabalhista, previdenciária,
          civil, consumidor, família e imobiliária. Atendimento humanizado e
          resultados que fazem a diferença.
        </motion.p>

        <motion.div variants={fadeUp} className="hero-actions">
          <Link to="/contato" className="btn-gold">
            Fale Conosco
            <ArrowRight size={18} />
          </Link>
          <Link to="/areas-de-atuacao" className="btn-outline-white">
            Nossas Áreas
          </Link>
        </motion.div>

        {/* Trust badges with separators */}
        <motion.ul variants={fadeUp} className="trust-badges">
          {badges.map((badge, i) => (
            <li key={badge} className="trust-badge">
              {i > 0 && <span className="trust-sep" aria-hidden="true" />}
              <span>{badge}</span>
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Scroll-down indicator */}
      <motion.div
        className="scroll-down"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <motion.span
          style={{ display: "block", width: 1, height: 32, margin: "0 auto" }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   2. STATS SECTION
   ═══════════════════════════════════════ */
const stats = [
  { value: 15, suffix: "+", label: "Anos" },
  { value: 5000, suffix: "+", label: "Casos" },
  { value: 27, suffix: "+", label: "Cidades" },
  { value: 100, suffix: "%", label: "Dedicação" },
];

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      style={{ position: "relative", zIndex: 20, marginTop: "-80px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="glass-card">
          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              alignItems: "stretch",
            }}
          >
            {stats.map((s, i) => (
              <div key={s.label} className="stat-item-wrap">
                <motion.div
                  className="stat-item"
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={fadeUp}
                  transition={{ delay: i * 0.12 }}
                >
                  <span className="stat-number gold-text serif">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </span>
                  <span className="stat-label">{s.label}</span>
                </motion.div>
                {i < stats.length - 1 && (
                  <span className="stat-divider" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   3. SERVIÇOS SECTION
   ═══════════════════════════════════════ */
const services = [
  {
    icon: <Heart size={26} />,
    title: "Previdenciário",
    desc: "Aposentadorias, pensões e benefícios do INSS com acompanhamento completo.",
    topics: [
      "Aposentadoria por tempo",
      "Aposentadoria por idade",
      "Pensão por morte",
      "BPC/LOAS",
    ],
    link: "/areas/previdenciario",
  },
  {
    icon: <Briefcase size={26} />,
    title: "Trabalhista",
    desc: "Direitos trabalhistas, reclamações e ações de indenização por vínculo empregatício.",
    topics: [
      "Reclamação trabalhista",
      "Rescisão indireta",
      "Equiparação salarial",
      "Acidente de trabalho",
    ],
    link: "/areas/trabalhista",
  },
  {
    icon: <Building2 size={26} />,
    title: "Cível",
    desc: "Contratos, indenizações, obrigações e litígios entre particulares e empresas.",
    topics: [
      "Contratos",
      "Responsabilidade civil",
      "Cobranças",
      "Direito de vizinhança",
    ],
    link: "/areas/civel",
  },
  {
    icon: <Shield size={26} />,
    title: "Consumidor",
    desc: "Defesa dos direitos do consumidor contra abusos de empresas e prestadores.",
    topics: [
      "Revisão de contrato",
      "Indenização moral",
      "Produto defeituoso",
      "Cobrança indevida",
    ],
    link: "/areas/consumidor",
  },
  {
    icon: <Users size={26} />,
    title: "Família",
    desc: "Direito de família com sensibilidade: divórcios, guarda e pensão alimentícia.",
    topics: [
      "Divórcio consensual",
      "Guarda de filhos",
      "Pensão alimentícia",
      "Inventário",
    ],
    link: "/areas/familia",
  },
  {
    icon: <Landmark size={26} />,
    title: "Imobiliário",
    desc: "Questões jurídicas envolvendo imóveis, locação, usucapião e incorporação.",
    topics: [
      "Compra e venda",
      "Locação",
      "Usucapião",
      "Incorporação imobiliária",
    ],
    link: "/areas/imobiliario",
  },
];

function ServicosSection() {
  return (
    <section className="section section-cream">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <span className="section-tag">Áreas de Atuação</span>
          <h2 className="section-title">Soluções Jurídicas Completas</h2>
          <p className="section-sub">
            Nosso escritório oferece assessoria jurídica integral nas principais
            áreas do direito, sempre com atendimento personalizado e compromisso
            com os resultados.
          </p>
        </FadeIn>

        <motion.div
          className="srv-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            marginTop: "3.5rem",
          }}
        >
          {services.map((s) => (
            <motion.div key={s.title} variants={fadeUp} className="srv-card">
              <div className="srv-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <ul className="srv-topics">
                {s.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <Link to={s.link} className="srv-link">
                Saiba mais
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   4. SOBRE SECTION
   ═══════════════════════════════════════ */
function SobreSection() {
  return (
    <section className="section">
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: "4rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          alignItems: "center",
        }}
      >
        {/* Left column — text */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.span variants={fadeUp} className="section-tag">
            Quem Somos
          </motion.span>
          <motion.h2 variants={fadeUp} className="section-title">
            Seus Direitos em Mãos Experientes
          </motion.h2>
          <motion.div variants={fadeUp} className="gold-divider" />

          <motion.div
            variants={fadeUp}
            className="sobre-text"
            style={{ marginTop: "1.5rem" }}
          >
            <p>
              Fundada em 2011 em Palhoça/SC, a <strong>Will &amp; Pereira</strong>{" "}
              reúne advogados com mais de 15 anos de experiência em causas
              trabalhistas, previdenciárias, cíveis e de família. Nosso
              compromisso é colocar o cliente no centro de cada decisão, unindo
              conhecimento jurídico sólido a um atendimento humano e acessível.
            </p>
            <p>
              Mais de 5.000 famílias e empresas já confiaram em nossa equipe
              para proteger seus interesses. Atuamos em todo o território
              nacional com ética, transparência e a dedicação que cada caso
              merece, desde a primeira conversa até o desfecho final.
            </p>
            <p>
              Acreditamos na humanização do Direito: explicamos cada etapa do
              processo em linguagem simples, ouvimos suas necessidades e
              construímos, juntos, a melhor estratégia para defender o que é
              seu.
            </p>
          </motion.div>
        </motion.div>

        {/* Right column — decorative WP monogram */}
        <motion.div
          className="sobre-decor navy-dark"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}
        >
          <div className="pattern-dots" />
          <div
            className="serif gold-text"
            style={{
              fontSize: "clamp(8rem, 20vw, 14rem)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              textAlign: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            WP
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   5. DIFERENCIAIS SECTION
   ═══════════════════════════════════════ */
const values = [
  {
    icon: <Award size={24} />,
    title: "Expertise Consolidada",
    desc: "Mais de 15 anos de atuação nas mais diversas áreas do direito.",
  },
  {
    icon: <Globe size={24} />,
    title: "Atendimento Nacional",
    desc: "Estrutura moderna e equipe dedicada para atuar em todo o Brasil.",
  },
  {
    icon: <MessageSquare size={24} />,
    title: "Comunicação Clara",
    desc: "Explicamos cada etapa do processo em linguagem simples e acessível.",
  },
  {
    icon: <Clock size={24} />,
    title: "Agilidade",
    desc: "Processos eficientes que respeitam o tempo e a urgência de cada cliente.",
  },
  {
    icon: <Shield size={24} />,
    title: "Ética",
    desc: "Conduta irrepreensível e transparência em cada ação do escritório.",
  },
  {
    icon: <Users size={24} />,
    title: "Personalizado",
    desc: "Cada cliente recebe atendimento único, adaptado às suas necessidades.",
  },
];

function DiferenciaisSection() {
  return (
    <section className="section section-dark">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <span className="section-tag section-tag-light">Diferenciais</span>
          <h2 className="section-title" style={{ color: "#ffffff" }}>
            Por que escolher a Will &amp; Pereira
          </h2>
          <p className="section-sub">
            Nosso compromisso vai além do processo judicial. Oferecemos uma
            experiência jurídica completa, baseada em valores que fazem a
            diferença.
          </p>
        </FadeIn>

        <motion.div
          className="val-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          style={{
            display: "grid",
            gap: "1.25rem",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            marginTop: "3.5rem",
          }}
        >
          {values.map((v) => (
            <motion.div key={v.title} variants={fadeUp} className="val-card">
              <div className="srv-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   6. BLOG SECTION
   ═══════════════════════════════════════ */
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function BlogSection() {
  const posts: BlogPostMeta[] = getAllPosts();
  const latest = posts.slice(0, 3);

  return (
    <section className="section section-cream">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <span className="section-tag">Blog</span>
          <h2 className="section-title">Artigos e Atualizações Jurídicas</h2>
          <p className="section-sub">
            Fique por dentro das novidades do mundo jurídico e dicas para
            proteger seus direitos.
          </p>
        </FadeIn>

        {latest.length > 0 ? (
          <motion.div
            className="blog-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            style={{
              display: "grid",
              gap: "1.5rem",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              marginTop: "3.5rem",
            }}
          >
            {latest.map((post) => (
              <motion.div key={post.slug} variants={fadeUp}>
                <Link to={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-meta">
                    <span className="blog-dot" />
                    <time>{formatDate(post.date)}</time>
                    {post.readTime ? (
                      <>
                        <span className="blog-sep">|</span>
                        <span>{post.readTime} min de leitura</span>
                      </>
                    ) : null}
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  {post.tags && post.tags.length > 0 && (
                    <ul className="blog-tags">
                      {post.tags.slice(0, 3).map((tag) => (
                        <li key={tag} className="blog-tag">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="srv-link">
                    Ler artigo
                    <ArrowRight size={15} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="blog-empty"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", padding: "4rem 1rem" }}
          >
            <div className="blog-empty-icon">
              <BookOpen size={28} />
            </div>
            <h3
              className="serif"
              style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}
            >
              Artigos em Breve
            </h3>
            <p style={{ color: "#5E6278", maxWidth: 420, margin: "0 auto" }}>
              Em breve publicaremos artigos e atualizações sobre Direito
              Trabalhista, Previdenciário, Civil e muito mais. Volte em breve!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   7. CTA SECTION
   ═══════════════════════════════════════ */
function CTASection() {
  return (
    <section className="section section-dark">
      <FadeIn>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 className="section-title" style={{ color: "#ffffff" }}>
            Pronto para Defender Seus Direitos?
          </h2>
          <p className="section-sub">
            Agende uma conversa com nossa equipe e descubra como podemos ajudar
            você com segurança, transparência e dedicação.
          </p>
          <div className="hero-actions" style={{ marginTop: "2.5rem" }}>
            <Link to="/contato" className="btn-gold">
              Fale Conosco
              <ArrowRight size={18} />
            </Link>
            <a href="tel:+5548988420867" className="btn-outline-white">
              (48) 98842-0867
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ═══════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════ */
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <ServicosSection />
      <SobreSection />
      <DiferenciaisSection />
      <BlogSection />
      <CTASection />
    </main>
  );
}