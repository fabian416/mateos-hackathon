"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const comparisonData = [
  {
    concept: "Costo mensual",
    traditional: "$800K - $1.5M + cargas",
    trasciende: "$500.000 (todo incluido)",
  },
  {
    concept: "Costo anual",
    traditional: "$15M - $28M",
    trasciende: "$8.000.000",
  },
  {
    concept: "Horas semanales",
    traditional: "40 hs (en teoría)",
    trasciende: "168 hs (24/7)",
  },
  {
    concept: "Disponibilidad",
    traditional: "Lun-Vie, horario",
    trasciende: "24/7/365",
  },
  {
    concept: "Consistencia",
    traditional: "Variable según el día",
    trasciende: "Siempre igual, sin días malos",
  },
  {
    concept: "Arranque",
    traditional: "30-90 días",
    trasciende: "7-14 días",
  },
  {
    concept: "Escalabilidad",
    traditional: "Contratar otro",
    trasciende: "Escala sin contratar a nadie",
  },
  {
    concept: "Riesgo",
    traditional: "Juicio, indemnización",
    trasciende: "Cancelás y listo",
  },
];

export default function Comparison() {
  return (
    <section id="precios" className="bg-surface py-28 lg:py-36 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase text-center">
            LOS NÚMEROS
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mt-4">
            Hacé las cuentas vos mismo
          </h2>
          <p className="text-text-secondary text-center mt-4">
            Poné lado a lado lo que gastás en un empleado vs. lo que te sale
            un agente nuestro.
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden mt-12"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-4 px-6" />
                  <th className="bg-red-50 text-error font-semibold text-center py-4 px-6">
                    Empleado Tradicional
                  </th>
                  <th className="bg-emerald-50 text-success font-semibold text-center py-4 px-6">
                    Agente MateOS
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-surface-alt hover:bg-surface-alt/50 transition-colors"
                  >
                    <td className="py-5 px-6 font-medium text-text">
                      {row.concept}
                    </td>
                    <td className="py-5 px-6 text-center text-text-secondary">
                      <span className="inline-flex items-center gap-2">
                        <X className="w-4 h-4 text-error flex-shrink-0" />
                        {row.traditional}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center text-text font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        {row.trasciende}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Version */}
          <div className="md:hidden p-6 space-y-6">
            {/* Traditional Card */}
            <div className="border-l-4 border-error rounded-lg bg-red-50/50 p-5">
              <h3 className="font-semibold text-error mb-4">
                Empleado Tradicional
              </h3>
              <ul className="space-y-3">
                {comparisonData.map((row, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-text text-sm">
                        {row.concept}:
                      </span>{" "}
                      <span className="text-text-secondary text-sm">
                        {row.traditional}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* MateOS Card */}
            <div className="border-l-4 border-success rounded-lg bg-emerald-50/50 p-5">
              <h3 className="font-semibold text-success mb-4">
                Agente MateOS
              </h3>
              <ul className="space-y-3">
                {comparisonData.map((row, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-text text-sm">
                        {row.concept}:
                      </span>{" "}
                      <span className="text-text-secondary text-sm">
                        {row.trasciende}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <p className="text-sm text-text-muted italic text-center mt-6">
          Valores estimados del mercado argentino a marzo 2026.
        </p>

        <div className="text-center mt-10">
          <a href="#contacto" className="text-secondary hover:text-secondary/80 font-semibold text-lg transition-colors">
            ¿Querés saber más? Hablemos →
          </a>
        </div>
      </div>
    </section>
  );
}
