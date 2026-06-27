"use client";

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Phone, Mail, MapPin, Clock } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Navbar — Premium navbar for Will & Pereira Advocacia
   Uses only CSS classes defined in index.css (no Tailwind).
   ═══════════════════════════════════════════════════════ */

interface AreaLink {
  label: string;
  href: string;
  desc?: string;
}

const AREAS: AreaLink[] = [
  { label: "Previdenciário", href: "/areas/previdenciario", desc: "Aposentadorias e benefícios do INSS" },
  { label: "Trabalhista",    href: "/areas/trabalhista",    desc: "Direitos trabalhistas e rescisões" },
  { label: "Cível",          href: "/areas/civel",          desc: "Contratos e responsabilidade civil" },
  { label: "Consumidor",     href: "/areas/consumidor",     desc: "Defesa do consumidor" },
  { label: "Família",        href: "/areas/familia",        desc: "Divórcio, guarda e pensão" },
  { label: "Imobiliário",    href: "/areas/imobiliario",    desc: "Imóveis, locação e usucapião" },
];

const CONTACT = {
  phone:   "+55 (47) 99999-0000",
  email:   "contato@willpereira.adv.br",
  address: "Joinville — Santa Catarina",
  hours:   "Seg–Sex · 9h às 18h",
};

/* Dropdown animation variants */
const dropdownVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeInOut" },
  },
};

/* Mobile panel animation variants */
const mobileVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.22, ease: "easeInOut" },
  },
};

/* Mobile sub-dropdown (Atuação) variants */
const mobileAreaVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAreasOpen, setMobileAreasOpen] = useState(false);

  /* Add .scrolled when scrollY > 60 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close all menus on route change */
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setMobileAreasOpen(false);
  }, [location.pathname]);

  /* Prevent body scroll when mobile panel is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="site-header">
      {/* ══════════════════════════ TOP BAR ══════════════════════════ */}
      <div className="top-bar hidden md:flex">
        <div className="top-bar-left">
          <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`} className="top-contact">
            <Phone size={13} />
            <span>{CONTACT.phone}</span>
          </a>
          <a href={`mailto:${CONTACT.email}`} className="top-contact">
            <Mail size={13} />
            <span>{CONTACT.email}</span>
          </a>
          <span className="top-contact">
            <MapPin size={13} />
            <span>{CONTACT.address}</span>
          </span>
        </div>
        <div className="top-bar-right">
          <span className="top-hours">
            <Clock size={13} />
            <span>{CONTACT.hours}</span>
          </span>
        </div>
      </div>

      {/* ══════════════════════════ MAIN NAV ══════════════════════════ */}
      <nav className={`nav-wrap${scrolled ? " scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/" className="nav-logo" aria-label="Will &amp; Pereira — Início">
          <img
            src="/logo.svg"
            alt="Will &amp; Pereira Advocacia"
            className="nav-logo-img"
            width={170}
            height={48}
          />
        </Link>

        {/* Desktop links */}
        <div className="nav-links desktop-only">
          <Link to="/" className="nav-link">
            Início
          </Link>

          {/* Atuação dropdown — hover on desktop */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              className="nav-link nav-link-dropdown"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              Atuação
              <motion.span
                animate={{ rotate: dropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="nav-chevron"
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="nav-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  role="menu"
                >
                  {AREAS.map((area) => (
                    <Link
                      key={area.href}
                      to={area.href}
                      className="nav-dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="nav-dropdown-title">{area.label}</span>
                      {area.desc && (
                        <span className="nav-dropdown-desc">{area.desc}</span>
                      )}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/blog" className="nav-link">
            Blog
          </Link>
          <Link to="/contato" className="nav-link">
            Contato
          </Link>
        </div>

        {/* CTA + Hamburger */}
        <div className="nav-actions">
          <Link to="/contato" className="btn btn-gold nav-cta">
            Fale Conosco
          </Link>

          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="x"
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                >
                  <X size={24} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                >
                  <Menu size={24} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* ══════════════════════════ MOBILE PANEL ══════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-panel"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mobile-panel-inner">
              <Link to="/" className="mobile-link" onClick={() => setMobileOpen(false)}>
                Início
              </Link>

              {/* Atuação (click to expand on mobile) */}
              <button
                type="button"
                className="mobile-link mobile-link-dropdown"
                onClick={() => setMobileAreasOpen((v) => !v)}
                aria-expanded={mobileAreasOpen}
              >
                Atuação
                <motion.span
                  animate={{ rotate: mobileAreasOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="nav-chevron"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {mobileAreasOpen && (
                  <motion.div
                    className="mobile-submenu"
                    variants={mobileAreaVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {AREAS.map((area) => (
                      <Link
                        key={area.href}
                        to={area.href}
                        className="mobile-sublink"
                        onClick={() => setMobileOpen(false)}
                      >
                        {area.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link to="/blog" className="mobile-link" onClick={() => setMobileOpen(false)}>
                Blog
              </Link>
              <Link to="/contato" className="mobile-link" onClick={() => setMobileOpen(false)}>
                Contato
              </Link>

              <Link
                to="/contato"
                className="btn btn-gold mobile-cta"
                onClick={() => setMobileOpen(false)}
              >
                Fale Conosco
              </Link>
            </div>

            {/* Contact info at bottom of mobile panel */}
            <div className="mobile-contacts">
              <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`} className="top-contact">
                <Phone size={14} />
                <span>{CONTACT.phone}</span>
              </a>
              <a href={`mailto:${CONTACT.email}`} className="top-contact">
                <Mail size={14} />
                <span>{CONTACT.email}</span>
              </a>
              <span className="top-contact">
                <MapPin size={14} />
                <span>{CONTACT.address}</span>
              </span>
              <span className="top-hours">
                <Clock size={14} />
                <span>{CONTACT.hours}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}