"use client";

import { motion } from "framer-motion";
import {
  Megaphone,
  Headphones,
  TrendingUp,
  FileSpreadsheet,
  Wrench,
  Settings,
} from "lucide-react";

const agents = [
  {
    name: "El Relator",
    color: "#C4A35A",
    icon: Megaphone,
    replaces: "Community manager, redactor",
    does: "Artículos, posteos, newsletters. Cuenta la historia de tu marca todos los días.",
  },
  {
    name: "El Baqueano",
    color: "#2D5A3D",
    icon: Headphones,
    replaces: "Mesa de ayuda, atención al cliente",
    does: "Conoce cada rincón de tu negocio. Guía a tus clientes por WhatsApp, mail o web sin perderse nunca.",
  },
  {
    name: "El Tropero",
    color: "#2A2A4E",
    icon: TrendingUp,
    replaces: "El que sale a buscar clientes",
    does: "Mueve leads, hace seguimiento, agenda reuniones. No se le escapa ninguno.",
  },
  {
    name: "El Domador",
    color: "#8B5CF6",
    icon: FileSpreadsheet,
    replaces: "Asistente administrativo, data entry",
    does: "Toma las tareas salvajes del día a día y las pone en orden. Datos, reportes, recordatorios.",
  },
  {
    name: "El Rastreador",
    color: "#06B6D4",
    icon: Wrench,
    replaces: "Soporte técnico nivel 1",
    does: "Lee las huellas del problema y lo resuelve. Diagnóstico, guías paso a paso, escalamiento.",
  },
  {
    name: "El Paisano",
    color: "#EC4899",
    icon: Settings,
    replaces: "Lo que tu negocio necesite",
    does: "Lo definimos juntos, como se hacen las cosas entre paisanos. Sin plantillas, sin límites.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function AgentTypes() {
  return (
    <section id="agentes" className="bg-surface-alt py-24 lg:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with decorative vertical line */}
        <div className="flex items-start gap-4">
          <div className="w-1 h-12 bg-accent rounded-full flex-shrink-0 mt-1" />
          <div>
            <p className="text-secondary uppercase tracking-widest text-xs font-semibold text-left">
              AGENTES DISPONIBLES
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-left mt-2 text-text">
              Elegí el agente que tu negocio necesita
            </h2>
            <p className="text-text-secondary text-left mt-2 max-w-xl">
              Cada agente está pensado para un rol específico. Elegí el que más se adapte a tu operación.
            </p>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                variants={cardVariants}
                className="bg-white border border-border border-l-4 border-l-transparent rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group"
                style={{ '--agent-color': agent.color } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = agent.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${agent.color}1A` }}
                >
                  <Icon size={28} style={{ color: agent.color }} />
                </div>
                <h3 className="text-xl font-bold mt-6 text-text">
                  {agent.name}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Reemplaza a:{" "}
                  <span className="font-medium">{agent.replaces}</span>
                </p>
                <p className="text-text-secondary mt-3">{agent.does}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
