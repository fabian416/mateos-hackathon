"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Consulta gratuita",
    description:
      "Videollamada de 30 minutos. Nos contás cómo funciona tu negocio y qué te gustaría automatizar. Sin compromiso.",
  },
  {
    number: 2,
    title: "Diagnóstico y propuesta",
    description:
      "Miramos cómo funciona tu negocio y te armamos una propuesta clara. Todo por escrito, sin letra chica.",
  },
  {
    number: 3,
    title: "Armado y entrenamiento",
    description:
      "Construimos tu agente con tu información, tu tono y tus procesos. Armamos infraestructura dedicada. 7 a 14 días hábiles.",
  },
  {
    number: 4,
    title: "Prueba y ajuste",
    description:
      "Probamos con casos reales. Vos lo revisás, nos das feedback. No sale hasta que estés conforme.",
  },
  {
    number: 5,
    title: "Agente activo + mejora continua",
    description:
      "Tu agente sale a la cancha. Monitoreo, reportes mensuales y optimización continua.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Process() {
  return (
    <section id="proceso" className="bg-surface py-24 lg:py-32 px-6 relative overflow-hidden">
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <p className="text-secondary uppercase tracking-widest text-xs font-semibold text-center">
          PROCESO
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-center mt-4 text-text">
          De la consulta al agente activo en 5 pasos
        </h2>
        <p className="text-text-secondary text-center mt-4">
          Sin vueltas, como tiene que ser.
        </p>

        <motion.div
          className="relative mt-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-6 top-0 bottom-0 w-0.5 bg-border" />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="flex gap-6 relative mb-12 last:mb-0"
            >
              <div className="w-12 h-12 rounded-full bg-secondary text-text-inverse font-bold flex items-center justify-center text-lg flex-shrink-0 z-10 relative">
                {step.number}
              </div>
              <div className="bg-white border border-border rounded-2xl p-6 flex-1">
                <h3 className="font-semibold text-lg text-text">
                  {step.title}
                </h3>
                <p className="text-text-secondary mt-2">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <a
            href="#contacto"
            className="inline-block font-bold px-8 py-4 rounded-xl text-text-inverse"
            style={{
              background: "linear-gradient(135deg, #8B2F1C 0%, #6E2416 100%)",
            }}
          >
            Quiero arrancar con el Paso 1
          </a>
        </div>
      </div>
    </section>
  );
}
