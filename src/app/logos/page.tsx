import MateLogo from "@/components/MateLogo";

function LogoPreview({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-mono text-text-muted">{label}</p>
      {/* Dark background */}
      <div className="bg-primary rounded-2xl p-8 flex items-center gap-4">
        <MateLogo size={48} />
        <span className="text-white font-extrabold text-3xl flex items-center gap-2">
          {children}
        </span>
      </div>
      {/* Light background */}
      <div className="bg-surface border border-border rounded-2xl p-8 flex items-center gap-4">
        <MateLogo size={48} />
        <span className="text-text font-extrabold text-3xl flex items-center gap-2">
          {children}
        </span>
      </div>
    </div>
  );
}

export default function LogosPage() {
  return (
    <div className="min-h-screen bg-surface-alt p-8 lg:p-16">
      <h1 className="text-4xl font-bold text-text mb-4">MateOS — Logo Typography</h1>
      <p className="text-text-secondary mb-12">Elegí la que más te guste. Arriba fondo oscuro, abajo fondo claro.</p>

      <div className="grid gap-16">
        {/* PROPOSAL 1 */}
        <LogoPreview label="PROPUESTA 1 — Playfair bold + JetBrains gold">
          <span style={{ display: "inline-flex", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Mate
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontWeight: 500, fontSize: "0.85em", color: "#C4A35A", letterSpacing: "0.05em" }}>
              OS
            </span>
          </span>
        </LogoPreview>

        {/* PROPOSAL 2 */}
        <LogoPreview label="PROPUESTA 2 — mate.os (lowercase + punto dorado)">
          <span style={{ display: "inline-flex", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "0.01em", textTransform: "lowercase" as const }}>
              mate
            </span>
            <span style={{ color: "#C4A35A", fontFamily: "var(--font-jetbrains-mono)", fontWeight: 700, fontSize: "0.5em", margin: "0 1px", position: "relative" as const, bottom: "0.15em" }}>
              .
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontWeight: 600, fontSize: "0.82em", letterSpacing: "0.08em", textTransform: "lowercase" as const }}>
              os
            </span>
          </span>
        </LogoPreview>

        {/* PROPOSAL 3 */}
        <LogoPreview label="PROPUESTA 3 — MATE espaciado + OS subscript sutil">
          <span style={{ display: "inline-flex", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" as const, fontSize: "1em" }}>
              Mate
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontWeight: 400, fontSize: "0.7em", letterSpacing: "0.12em", opacity: 0.7, marginLeft: "2px", position: "relative" as const, bottom: "-0.1em" }}>
              OS
            </span>
          </span>
        </LogoPreview>
      </div>
    </div>
  );
}
