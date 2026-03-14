"use client";

import { motion } from "framer-motion";
import { Users, Activity, Zap } from "lucide-react";
import Threads from "./Threads";

const microStats = [
  { icon: Users, label: "50+ empresas" },
  { icon: Activity, label: "99.9% uptime" },
  { icon: Zap, label: "Listo en 48hs" },
];

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #2A2A4E 100%)",
      }}
    >
      {/* Threads background effect */}
      <div className="absolute inset-0">
        <Threads
          color={[0.77, 0.64, 0.35]}
          amplitude={0.8}
          distance={0.3}
          enableMouseInteraction={true}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 w-full py-32 lg:pt-24 lg:pb-0">
        <div className="lg:grid lg:grid-cols-12 gap-12 items-center">
          {/* Left column */}
          <div className="lg:col-span-9">
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-extrabold text-text-inverse leading-tight tracking-tight mt-6"
            >
              Tu próximo{" "}
              <span className="text-secondary">empleado</span> no pide
              aguinaldo, no se enferma y labura las 24 horas.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-slate-300 max-w-xl mt-6"
            >
              Creamos agentes de IA que laburan adentro de tu negocio. Atienden
              clientes por WhatsApp, organizan turnos, mandan presupuestos...
              todo lo que hoy te come el día. Vos no tenés que entender nada
              de tecnología.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <a
                href="#contacto"
                className="inline-flex items-center px-6 sm:px-8 py-4 rounded-xl text-text-inverse font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, #8B2F1C 0%, #6E2416 100%)",
                }}
              >
                Quiero mi Agente Gaucho
              </a>
              <a
                href="#proceso"
                className="inline-flex items-center px-6 sm:px-8 py-4 rounded-xl border border-white/30 text-text-inverse hover:bg-white/5 transition-all duration-200"
              >
                Mostrame cómo funciona
              </a>
            </motion.div>

            {/* Pricing line */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-slate-300 text-xs sm:text-sm mt-4"
            >
              $2.000.000 setup &middot; $500.000/mes &middot; Sin contrato
            </motion.p>

            {/* Micro stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 sm:gap-8 mt-8"
            >
              {microStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 text-slate-300 text-sm"
                >
                  <stat.icon size={16} className="text-secondary" />
                  <span>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
