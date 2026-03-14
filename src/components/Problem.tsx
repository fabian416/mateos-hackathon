"use client";

import { motion } from "framer-motion";
import { Clock, Repeat, TrendingDown } from "lucide-react";

const cards = [
  {
    icon: Clock,
    title: "Tiempo perdido",
    description:
      "Te pasás el día haciendo cosas que una máquina resuelve en segundos.",
  },
  {
    icon: Repeat,
    title: "Tareas repetitivas",
    description:
      "Responder lo mismo 20 veces, cargar planillas, copiar y pegar como un robot. Todos los días.",
  },
  {
    icon: TrendingDown,
    title: "Oportunidades perdidas",
    description:
      "Mientras estás apagando incendios, los clientes se te van con el de enfrente.",
  },
];

export default function Problem() {
  return (
    <section id="problema" className="bg-surface-alt py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-6">
        {/* Heading — left aligned, no label */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl lg:text-4xl font-bold text-left"
        >
          Sabés que la IA puede cambiar tu negocio. El problema es cómo.
        </motion.h2>

        {/* Body text — left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mt-8 text-text-secondary text-lg leading-relaxed space-y-6"
        >
          <p>
            Tenés una empresa. Te levantás a las 7, revisás WhatsApp y ya
            tenés 14 mensajes de clientes preguntando lo mismo de siempre.
            Abrís el mail: presupuestos pendientes, turnos que confirmar,
            consultas que responder. Arrancás el día corriendo y terminás
            igual.
          </p>
          <p>
            Escuchaste que la inteligencia artificial puede ayudarte. Viste
            los videos, leíste las notas. Pero cada vez que intentás entender
            cómo aplicarlo a tu negocio, te chocás con lo mismo:
          </p>
          <div className="space-y-3">
            <p className="text-text font-medium">
              -- Herramientas que no están pensadas para tu tipo de negocio.
            </p>
            <p className="text-text font-medium">
              -- Consultores que hablan en un idioma que no entendés.
            </p>
            <p className="text-text font-medium">
              -- Soluciones carísimas que solo sirven para empresas grandes.
            </p>
            <p className="text-text font-medium">
              -- Tutoriales de YouTube que te dejan más confundido que antes.
            </p>
          </div>
          <p>
            Mientras tanto, tu competencia ya está automatizando. Y vos seguís
            haciendo todo a mano, perdiendo tiempo, plata y oportunidades.
          </p>
        </motion.div>

        {/* Cards — scale animation instead of fade-up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="bg-surface border border-border rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <card.icon size={22} className="text-error" />
              </div>
              <h3 className="text-lg font-semibold mt-4">{card.title}</h3>
              <p className="text-text-secondary mt-2">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
