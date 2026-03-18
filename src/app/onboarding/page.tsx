"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const BUSINESS_TYPES = [
  { id: "restaurant", name: "Restaurante / Bar", emoji: "🍕", desc: "Reservas, delivery, menu, redes" },
  { id: "salon", name: "Salon de Belleza", emoji: "✂️", desc: "Turnos, recordatorios, promos" },
  { id: "taller", name: "Taller / Servicio", emoji: "🔧", desc: "Presupuestos, seguimiento, soporte" },
  { id: "retail", name: "Tienda / Retail", emoji: "🛍️", desc: "Ventas, inventario, atencion" },
  { id: "salud", name: "Salud / Consultorio", emoji: "🏥", desc: "Turnos, historiales, recordatorios" },
  { id: "otro", name: "Otro negocio", emoji: "💼", desc: "Lo configuramos a medida" },
];

interface AgentOption {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  price: number;
  recommended: boolean;
  description: string;
}

const AGENTS: Record<string, AgentOption[]> = {
  restaurant: [
    { id: "baqueano", name: "El Baqueano", subtitle: "WhatsApp Support", color: "#2D5A3D", price: 80, recommended: true, description: "Responde consultas, toma reservas, maneja reclamos. 24/7 en WhatsApp." },
    { id: "domador", name: "El Domador", subtitle: "Reservas & Turnos", color: "#8B5CF6", price: 70, recommended: true, description: "Gestiona reservas, envia recordatorios, optimiza ocupacion." },
    { id: "tropero", name: "El Tropero", subtitle: "Cobros & Facturas", color: "#6366F1", price: 80, recommended: true, description: "Envia links de pago, cobra senas, trackea deudas." },
    { id: "paisano", name: "El Paisano", subtitle: "Redes Sociales", color: "#EC4899", price: 90, recommended: false, description: "Publica en Instagram, responde comentarios, crea contenido." },
    { id: "relator", name: "El Relator", subtitle: "Contenido & Marketing", color: "#F59E0B", price: 70, recommended: false, description: "Newsletters, articulos, threads. Cuenta la historia de tu marca." },
    { id: "rastreador", name: "El Rastreador", subtitle: "Prospeccion & Outreach", color: "#06B6D4", price: 100, recommended: false, description: "Busca nuevos clientes, envia outreach, convierte leads." },
    { id: "ceo", name: "El CEO", subtitle: "Coordinacion & Reportes", color: "#C4A35A", price: 60, recommended: false, description: "Coordina al equipo, genera reportes, optimiza operaciones." },
  ],
  default: [
    { id: "baqueano", name: "El Baqueano", subtitle: "WhatsApp Support", color: "#2D5A3D", price: 80, recommended: true, description: "Responde consultas y atiende clientes 24/7 en WhatsApp." },
    { id: "domador", name: "El Domador", subtitle: "Agenda & Turnos", color: "#8B5CF6", price: 70, recommended: true, description: "Gestiona citas, envia recordatorios, optimiza agenda." },
    { id: "tropero", name: "El Tropero", subtitle: "Cobros & Facturas", color: "#6366F1", price: 80, recommended: false, description: "Envia links de pago, cobra, trackea deudas." },
    { id: "paisano", name: "El Paisano", subtitle: "Redes Sociales", color: "#EC4899", price: 90, recommended: false, description: "Publica en redes, responde comentarios, crea contenido." },
    { id: "relator", name: "El Relator", subtitle: "Contenido & Marketing", color: "#F59E0B", price: 70, recommended: false, description: "Newsletters, articulos, threads." },
    { id: "rastreador", name: "El Rastreador", subtitle: "Prospeccion", color: "#06B6D4", price: 100, recommended: false, description: "Busca nuevos clientes, envia outreach." },
    { id: "ceo", name: "El CEO", subtitle: "Coordinacion", color: "#C4A35A", price: 60, recommended: false, description: "Coordina al equipo y genera reportes." },
  ],
};

// Reuse restaurant agents for all types for now
for (const type of BUSINESS_TYPES) {
  if (!AGENTS[type.id]) AGENTS[type.id] = AGENTS.default;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: info, 1: business type, 2: select agents
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  const agents = AGENTS[businessType] || AGENTS.default;
  const totalPrice = agents
    .filter((a) => selectedAgents.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectBusinessType = (typeId: string) => {
    setBusinessType(typeId);
    // Auto-select recommended agents
    const recommended = (AGENTS[typeId] || AGENTS.default)
      .filter((a) => a.recommended)
      .map((a) => a.id);
    setSelectedAgents(new Set(recommended));
    setStep(2);
  };

  const handleDeploy = () => {
    const params = new URLSearchParams({
      name: businessName || "Mi Negocio",
      type: businessType,
      agents: Array.from(selectedAgents).join(","),
    });
    router.push(`/deploy?${params.toString()}`);
  };

  return (
    <div
      className="min-h-screen text-text-inverse"
      style={{
        background: "linear-gradient(135deg, #0a0a14 0%, #111127 50%, #0a0a14 100%)",
      }}
    >
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-dark">M</div>
          <span className="font-bold text-lg">MateOS</span>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                s <= step ? "bg-secondary w-8" : "bg-white/10 w-4"
              }`}
            />
          ))}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* STEP 0: Business info */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  Deploy your AI workforce
                  <span className="text-secondary"> in 90 seconds</span>
                </h1>
                <p className="text-white/50 mt-3 text-lg">
                  Tell us about your business. We handle the rest.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Pizzeria Don Juan"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                    WhatsApp number
                  </label>
                  <input
                    type="tel"
                    placeholder="+54 11 1234-5678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="juan@pizzeria.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="bg-secondary hover:bg-secondary-dark text-dark font-bold px-8 py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 1: Business type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  What kind of <span className="text-secondary">business</span>?
                </h1>
                <p className="text-white/50 mt-3">
                  We will pre-select the best agents for your industry.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {BUSINESS_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => selectBusinessType(type.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white/[0.04] border border-white/10 hover:border-secondary/40 rounded-2xl p-5 text-left transition-all group"
                  >
                    <span className="text-3xl">{type.emoji}</span>
                    <h3 className="font-bold mt-3 group-hover:text-secondary transition-colors">
                      {type.name}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">{type.desc}</p>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep(0)}
                className="text-sm text-white/30 hover:text-white/60 transition-colors"
              >
                &larr; Back
              </button>
            </motion.div>
          )}

          {/* STEP 2: Select agents */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">
                  Build your <span className="text-secondary">squad</span>
                </h1>
                <p className="text-white/50 mt-3">
                  We recommended the best agents for {BUSINESS_TYPES.find((t) => t.id === businessType)?.name || "your business"}.
                  Toggle to customize.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agents.map((agent, i) => {
                  const isSelected = selectedAgents.has(agent.id);
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => toggleAgent(agent.id)}
                      className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                        isSelected
                          ? "bg-white/[0.06] border-white/20"
                          : "bg-white/[0.02] border-white/5 opacity-50 hover:opacity-70"
                      }`}
                      style={isSelected ? { borderColor: `${agent.color}44` } : {}}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor: isSelected ? `${agent.color}22` : "rgba(255,255,255,0.05)",
                              color: isSelected ? agent.color : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {agent.name.split(" ")[1]?.[0] || "A"}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-2">
                              {agent.name}
                              {agent.recommended && (
                                <span className="text-[9px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-normal">
                                  recommended
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-white/40">{agent.subtitle}</div>
                          </div>
                        </div>

                        {/* Toggle */}
                        <div
                          className={`w-10 h-6 rounded-full transition-all flex items-center ${
                            isSelected ? "justify-end" : "justify-start"
                          }`}
                          style={{
                            backgroundColor: isSelected ? agent.color : "rgba(255,255,255,0.1)",
                          }}
                        >
                          <motion.div
                            layout
                            className="w-4 h-4 bg-white rounded-full mx-1"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-white/30 mt-3 leading-relaxed">
                        {agent.description}
                      </p>

                      <div className="text-xs mt-2" style={{ color: isSelected ? agent.color : "rgba(255,255,255,0.2)" }}>
                        ${agent.price}/mo
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sticky bottom bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky bottom-0 bg-[#0a0a14]/90 backdrop-blur-xl border-t border-white/5 -mx-6 px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm text-white/40">Your squad</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-secondary">
                      ${totalPrice}
                    </span>
                    <span className="text-sm text-white/30">/month</span>
                    <span className="text-xs text-white/20 ml-2">
                      {selectedAgents.size} agents
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-white/30 hover:text-white/60 transition-colors px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeploy}
                    disabled={selectedAgents.size === 0}
                    className="bg-secondary hover:bg-secondary-dark disabled:opacity-30 disabled:cursor-not-allowed text-dark font-bold px-8 py-3 rounded-xl transition-all"
                  >
                    Deploy Squad &rarr;
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
