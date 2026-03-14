"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const cards = [
  {
    title: "Hacelo vos mismo",
    tag: "DIY",
    highlighted: false,
    items: [
      "40 horas viendo tutoriales de YouTube",
      "Se rompe y no tenés a quién llamar",
      "Gastás tiempo que no tenés",
      "Nunca mejora solo",
    ],
    note: "Ideal para: gente con mucho tiempo libre",
  },
  {
    title: "Agencia genérica",
    tag: "TERCERIZADO",
    highlighted: false,
    items: [
      "Bot con plantillas prediseñadas",
      "Soporte que tarda 72hs en responder",
      "Te cobran en dólares",
      "Se borra el freelancer, te quedás solo",
    ],
    note: "Ideal para: algo rápido y básico",
  },
  {
    title: "Gaucho Solutions",
    tag: "TODO INCLUIDO",
    highlighted: true,
    items: [
      "Agente 100% personalizado",
      "Infraestructura dedicada y aislada",
      "Equipo humano argentino",
      "Mejora continua mes a mes",
      "Precio en pesos, sin contrato",
      "Setup en 7-14 días",
    ],
    note: null,
  },
];

export default function ThreeOptions() {
  return (
    <section className="bg-surface py-28 lg:py-36 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase text-center">
            ELEGÍ TU CAMINO
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mt-4">
            Tres caminos para sumar IA a tu empresa
          </h2>
          <p className="text-text-secondary text-center mt-4">
            Spoiler: solo uno te saca el problema de encima de verdad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
          {cards.map((card, index) => {
            const isHighlighted = card.highlighted;
            const delay = isHighlighted ? 0.6 : index * 0.2;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: isHighlighted ? 0 : 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.6,
                  delay,
                  ...(isHighlighted
                    ? {
                        y: {
                          type: "spring" as const,
                          stiffness: 300,
                          damping: 15,
                        },
                      }
                    : {}),
                }}
                className={
                  card.highlighted ? "relative lg:scale-105" : "relative"
                }
              >
                {card.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <span className="bg-secondary text-primary font-bold text-xs px-4 py-1.5 rounded-full whitespace-nowrap">
                      Más elegido
                    </span>
                  </div>
                )}

                <div
                  className={
                    card.highlighted
                      ? "rounded-2xl p-8 h-full flex flex-col"
                      : "bg-white border border-border rounded-2xl p-8 h-full flex flex-col"
                  }
                  style={
                    card.highlighted
                      ? {
                          background:
                            "linear-gradient(135deg, #2A2A4E, #1A1A2E)",
                          border: "2px solid #C4A35A",
                          boxShadow: "0 20px 60px rgba(26,26,46,0.4)",
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3
                      className={
                        card.highlighted
                          ? "text-text-inverse font-bold text-xl"
                          : "font-bold text-xl"
                      }
                    >
                      {card.title}
                    </h3>
                    <span
                      className={
                        card.highlighted
                          ? "text-xs bg-white/10 text-secondary rounded-full px-3 py-1"
                          : "text-xs bg-surface-alt text-text-secondary rounded-full px-3 py-1"
                      }
                    >
                      {card.tag}
                    </span>
                  </div>

                  <ul className="space-y-4 flex-grow">
                    {card.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {card.highlighted ? (
                          <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            card.highlighted
                              ? "text-text-inverse text-sm"
                              : "text-text-secondary text-sm"
                          }
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {card.note && (
                    <p className="text-sm text-text-muted italic mt-6">
                      {card.note}
                    </p>
                  )}

                  {card.highlighted && (
                    <div className="mt-6">
                      <p className="text-secondary font-mono font-bold text-base sm:text-lg">
                        $2.000.000 setup + $500.000/mes
                      </p>
                      <a
                        href="#contacto"
                        className="block w-full bg-accent hover:bg-accent-dark text-text-inverse font-bold py-4 rounded-xl mt-4 text-center transition-colors"
                      >
                        Quiero mi Agente Gaucho
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
