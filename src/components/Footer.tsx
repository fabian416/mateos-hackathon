import { Mail, MapPin, Linkedin, Instagram } from "lucide-react";

const productoLinks = [
  { label: "Agentes", href: "#agentes" },
  { label: "Proceso", href: "#proceso" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
];

const empresaLinks = [
  { label: "Contacto", href: "#contacto" },
  { label: "Blog", href: "#", comingSoon: true },
];

export default function Footer() {
  return (
    <footer className="py-16 px-6" style={{ backgroundColor: "#0D0D1A" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Col 1: Logo + description */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-text-inverse font-bold text-xl">
              Gaucho Solutions
            </span>
            <p className="text-slate-300 text-sm mt-4">
              Agentes de IA para empresas argentinas.
            </p>
            <p className="text-slate-300 text-sm italic mt-2">
              Mientras vos dormís, tu agente labura.
            </p>
          </div>

          {/* Col 2: Producto */}
          <div>
            <h4 className="text-text-muted text-xs uppercase tracking-widest font-semibold mb-4">
              Producto
            </h4>
            <ul className="space-y-3">
              {productoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-text-inverse transition text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Empresa */}
          <div>
            <h4 className="text-text-muted text-xs uppercase tracking-widest font-semibold mb-4">
              Empresa
            </h4>
            <ul className="space-y-3">
              {empresaLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-text-inverse transition text-sm inline-flex items-center gap-2"
                  >
                    {link.label}
                    {link.comingSoon && (
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                        próximamente
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-text-muted text-xs uppercase tracking-widest font-semibold mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contacto@gauchosolutions.com"
                  className="text-slate-300 hover:text-text-inverse transition text-sm flex items-center gap-2 break-all"
                >
                  <Mail size={16} className="flex-shrink-0" />
                  contacto@gauchosolutions.com
                </a>
              </li>
              <li className="text-slate-300 text-sm flex items-center gap-2">
                <MapPin size={16} />
                Buenos Aires, Argentina
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <span
                className="text-text-muted opacity-50 cursor-default inline-flex items-center gap-1"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
                <span className="text-xs">(próximamente)</span>
              </span>
              <span
                className="text-text-muted opacity-50 cursor-default inline-flex items-center gap-1"
                aria-label="Instagram"
              >
                <Instagram size={20} />
                <span className="text-xs">(próximamente)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Separator + copyright */}
        <div
          className="mt-12 pt-8"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <p className="text-slate-300 text-sm text-center">
            2026 Gaucho Solutions. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
