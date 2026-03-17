"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import MateLogo from "./MateLogo";

const navLinks = [
  { label: "Agentes", href: "#agentes" },
  { label: "Proceso", href: "#proceso" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
      style={
        scrolled
          ? { backgroundColor: "rgba(250,248,245,0.9)" }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#inicio");
          }}
          className={`font-extrabold text-xl lg:text-2xl shrink-0 transition-colors duration-300 flex items-center gap-2 ${scrolled ? "text-text" : "text-white"}`}
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          <MateLogo size={36} />
          MateOS
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className={`relative transition-colors duration-300 text-sm font-medium group ${scrolled ? "text-text-secondary hover:text-text" : "text-slate-300 hover:text-white"}`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="#contacto"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#contacto");
          }}
          className="hidden lg:inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-bold text-text-inverse transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #8B2F1C 0%, #6E2416 100%)",
          }}
        >
          Hablemos
        </a>

        {/* Mobile hamburger */}
        <button
          className={`lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-300 ${scrolled ? "text-text" : "text-white"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-72 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "rgba(13,13,26,0.97)" }}
      >
        <div className="flex justify-end p-6">
          <button
            className="text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="text-text-muted hover:text-white transition-colors duration-200 text-base font-medium py-3 border-b border-white/5"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#contacto");
            }}
            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-text-inverse transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #8B2F1C 0%, #6E2416 100%)",
            }}
          >
            Hablemos
          </a>
        </nav>
      </div>

      {/* Backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </header>
  );
}
