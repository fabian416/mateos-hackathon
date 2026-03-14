"use client";

import { motion } from "framer-motion";
import { BarChart3, ArrowUpRight, Brain } from "lucide-react";

const milestones = [
  {
    month: "Mes 1",
    metric: "40%",
    label: "de tareas automatizadas",
    description: "Tu agente ya responde consultas, agenda turnos y maneja lo básico.",
  },
  {
    month: "Mes 3",
    metric: "65%",
    label: "de tareas automatizadas",
    description: "Aprendió patrones de tu negocio. Resuelve más cosas solo.",
  },
  {
    month: "Mes 6",
    metric: "90%",
    label: "de tareas automatizadas",
    description: "Funciona casi en piloto automático. Vos solo supervisás.",
  },
];

const features = [
  {
    icon: BarChart3,
    title: "Optimización mensual permanente",
    description:
      "Nuestro equipo analiza cómo está rindiendo tu agente, detecta oportunidades y lo ajusta.",
  },
  {
    icon: ArrowUpRight,
    title: "Lo que funciona en otros negocios, lo aplicamos al tuyo",
    description:
      "Si algo funciona bien en otro cliente, lo adaptamos a tu agente. Tus datos no se tocan, obvio.",
  },
  {
    icon: Brain,
    title: "Equipo humano detrás, siempre",
    description:
      "Especialistas argentinos monitoreando rendimiento y asegurándose de que tu agente rinda.",
  },
];

export default function ContinuousImprovement() {
  return (
    <section
      className="py-24 lg:py-32 px-6"
      style={{
        background:
          "linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #2A2A4E 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header — centered */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium inline-block">
            Mejora continua
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-inverse mt-4">
            Tu agente arranca bien. En tres meses no lo vas a reconocer.
          </h2>
        </motion.div>

        {/* Milestone cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {milestones.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="rounded-2xl p-8 border border-white/10"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-secondary text-sm font-semibold tracking-wider uppercase">
                {item.month}
              </p>
              <p
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 font-mono"
                style={{ color: "#C4A35A" }}
              >
                {item.metric}
              </p>
              <p className="text-slate-400 text-sm mt-1">{item.label}</p>
              <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Features row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
              >
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-text-inverse font-semibold text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 mt-1 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
