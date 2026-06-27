import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/* ═══════════════════════════════════════
   Footer (Will & Pereira Advocacia)
   Premium section structure:
     1. CTA BAR (.footer-cta) — Precisa de orientação + Fale Conosco (.btn-gold)
     2. MAIN FOOTER (.site-footer) — 3-column grid
       - Brand col: logo + descricao
       - Areas col: 6 entradas .footer-link
       - Contato col: telefone, e-mail, endereco (cada com icone)
     3. BOTTOM BAR (.footer-bottom) — copyright + selo OAB/SC
   Estilizacao via classes em src/index.css (sem Tailwind).
   ═══════════════════════════════════════ */

interface AreaLink {
  label: string;
  to: string;
}

const AREAS: AreaLink[] = [
  { label: "Direito Previdenciário", to: "/areas/previdenciario" },
  { label: "Direito Trabalhista", to: "/areas/trabalhista" },
  { label: "Direito Cível", to: "/areas/civel" },
  { label: "Direito do Consumidor", to: "/areas/consumidor" },
  { label: "Direito de Família", to: "/areas/familia" },
  { label: "Direito Imobiliário", to: "/areas/imobiliario" },
];

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer-wrapper">
      {/* ──────────────────────────────────────────────
          1) CTA BAR
      ────────────────────────────────────────────── */}
      <section className="footer-cta">
        <div className="footer-cta-inner">
          <div className="footer-cta-text">
            <h3 className="footer-cta-title">
              Precisa de orientação jurídica?
            </h3>
            <p className="footer-cta-subtitle">
              Fale com um especialista e receba uma avaliação inicial
              personalizada, sem compromisso.
            </p>
          </div>
          <Link to="/contato" className="btn-gold">
            Fale Conosco
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          2) MAIN FOOTER (.site-footer)
      ────────────────────────────────────────────── */}
      <div className="site-footer">
        <div className="footer-grid">
          {/* ── Brand col ───────────────────────────────── */}
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-logo" aria-label="Will & Pereira Advocacia">
              <span className="footer-logo-mark">W&amp;P</span>
              <span className="footer-logo-text">
                Will &amp; Pereira
                <small>Advocacia</small>
              </span>
            </Link>
            <p className="footer-description">
              Advocacia especializada em Direito Previdenciário, Trabalhista,
              Cível, do Consumidor, de Família e Imobiliário. Atendimento
              humanizado e compromisso real com os resultados de cada cliente.
            </p>
            <span className="footer-oab-badge footer-oab-badge--compact">
              <ShieldCheck size={14} aria-hidden="true" />
              OAB/SC
            </span>
          </div>

          {/* ── Areas col ──────────────────────────────── */}
          <div className="footer-col">
            <h4>Áreas de Atuação</h4>
            <nav className="footer-links" aria-label="Áreas de atuação">
              {AREAS.map((area) => (
                <Link key={area.to} to={area.to} className="footer-link">
                  {area.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Contato col ───────────────────────────── */}
          <div className="footer-col">
            <h4>Contato</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  <Phone size={16} />
                </span>
                <div className="footer-contact-text">
                  <span className="footer-contact-label">Telefone</span>
                  <a href="tel:+5548999999999" className="footer-link">
                    (48) 99999-9999
                  </a>
                </div>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  <Mail size={16} />
                </span>
                <div className="footer-contact-text">
                  <span className="footer-contact-label">E-mail</span>
                  <a href="mailto:contato@willpereira.adv.br" className="footer-link">
                    contato@willpereira.adv.br
                  </a>
                </div>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  <MapPin size={16} />
                </span>
                <div className="footer-contact-text">
                  <span className="footer-contact-label">Endereço</span>
                  <span className="footer-contact-value">
                    Rua dos Andes, 100 — Sala 1202
                    <br />
                    Centro, Florianópolis — SC, 88010-001
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          3) BOTTOM BAR
      ────────────────────────────────────────────── */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">
            &copy; {YEAR} Will &amp; Pereira Advocacia. Todos os direitos
            reservados.
          </p>
          <span className="footer-oab-badge">
            <ShieldCheck size={14} aria-hidden="true" />
            Inscrita na OAB/SC
          </span>
        </div>
      </div>
    </footer>
  );
}