"use client";

import { Shield, Lock, Server, EyeOff } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Infraestructura aislada",
    description:
      "Cada cliente tiene su propio entorno. Tu información no se mezcla con la de nadie.",
  },
  {
    icon: Lock,
    title: "Conexión segura (HTTPS)",
    description:
      "Toda la comunicación viaja encriptada por HTTPS. Cada agente corre en su propio container aislado.",
  },
  {
    icon: Server,
    title: "Backups automáticos",
    description:
      "Respaldos diarios. Si pasa algo, se recupera en minutos.",
  },
  {
    icon: EyeOff,
    title: "Vos tenés el control",
    description:
      "Si cancelás, te damos todo y borramos lo tuyo. No queda nada de nuestro lado.",
  },
];

export default function Security() {
  return (
    <section
      className="py-16 lg:py-24 px-6"
      style={{ backgroundColor: "#1A1A2E" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-secondary uppercase tracking-widest text-xs font-semibold text-center">
          SEGURIDAD
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-text-inverse text-center mt-4">
          Tus datos son tuyos. Punto.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={24} className="text-secondary" />
                </div>
                <div>
                  <h3 className="text-text-inverse font-semibold text-lg">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 mt-1">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
