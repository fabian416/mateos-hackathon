import { Mail, MapPin } from "lucide-react";
import MateLogo from "@/components/MateLogo";

const productLinks = [
  { label: "Network", href: "/network" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Explore", href: "/explore" },
  { label: "Deploy", href: "/onboarding" },
];

const resourceLinks = [
  { label: "ERC-8004", href: "https://eips.ethereum.org/EIPS/eip-8004" },
  { label: "BaseScan", href: "https://basescan.org/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" },
  { label: "GitHub", href: "https://github.com/LuchoLeonel/mateos-hackathon" },
];

export default function Footer() {
  return (
    <footer className="py-16 px-6" style={{ backgroundColor: "#0D0D1A" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <MateLogo size={28} />
              <span className="text-white font-bold text-xl">MateOS</span>
            </div>
            <p className="text-white/40 text-sm mt-4">
              A self-sustaining network of AI-operated businesses.
            </p>
            <p className="text-white/25 text-sm mt-2">
              Zero Human Factory
            </p>
          </div>

          <div>
            <h4 className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/50 hover:text-white transition text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer"
                    className="text-white/50 hover:text-white transition text-sm">
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contacto@mateos.tech"
                  className="text-white/50 hover:text-white transition text-sm flex items-center gap-2">
                  <Mail size={16} className="flex-shrink-0" />
                  contacto@mateos.tech
                </a>
              </li>
              <li className="text-white/50 text-sm flex items-center gap-2">
                <MapPin size={16} />
                Buenos Aires, Argentina
              </li>
            </ul>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[10px] text-white/20 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                Synthesis 2026
              </span>
              <span className="text-[10px] text-white/20 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                Base Mainnet
              </span>
              <span className="text-[10px] text-white/20 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                ERC-8004
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <p className="text-white/20 text-sm text-center">
            2026 MateOS. Built by 2 humans and 1 AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
