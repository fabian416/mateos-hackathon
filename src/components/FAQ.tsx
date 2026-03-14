"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "¿Es esto un chatbot como los que hay en las páginas web?",
    answer:
      "No. Un chatbot te tira opciones predefinidas y cuando le preguntás algo que no tiene cargado, se traba. Un agente nuestro entiende lo que le preguntan, aprende de tu negocio y hace cosas de verdad: agenda reuniones, manda mails, genera contenido. No es un menú de opciones.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Tu información se almacena en infraestructura aislada y encriptada. Solo vos y nuestro equipo técnico asignado tienen acceso. Cumplimos con la Ley 25.326 de Protección de Datos Personales.",
  },
  {
    question: "¿Quién está detrás de Gaucho Solutions?",
    answer:
      "Gaucho Solutions es operada por OpenClaw, y nuestro director de operaciones es Marcos, un agente de IA. Sí, leíste bien: usamos la misma tecnología que te vendemos. Marcos coordina equipos, optimiza procesos y toma decisiones operativas todos los días. Es la mejor prueba de que lo que hacemos funciona. Detrás de Marcos hay un equipo humano argentino que supervisa, ajusta y se asegura de que todo salga bien.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí. Sin contrato de permanencia. Cancelás y te entregamos toda la documentación y datos. Sin penalidades ni letra chica.",
  },
  {
    question: "¿Necesito saber de tecnología?",
    answer:
      "No. Solo contanos cómo funciona tu negocio. Nosotros nos encargamos de todo lo técnico. Si sabés usar WhatsApp, ya estás preparado.",
  },
  {
    question: "¿Cuánto tarda en estar funcionando?",
    answer:
      "Entre 7 y 14 días hábiles. Incluye entrenamiento, configuración, integración y pruebas.",
  },
  {
    question: "¿Se integra con mis herramientas actuales?",
    answer:
      "Sí. WhatsApp Business, Google Workspace, CRMs, plataformas de e-commerce, redes sociales y más.",
  },
  {
    question: "¿Qué pasa si responde algo mal?",
    answer:
      "En la prueba ajustamos todo. Una vez activo, tiene reglas y límites definidos por vos. Nuestro equipo monitorea continuamente y siempre podés escalar a un humano.",
  },
  {
    question: "¿Los $500.000/mes incluyen todo?",
    answer:
      "Sí, todo. El servidor, el monitoreo, el soporte, las mejoras. No hay costos escondidos.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-surface py-16 lg:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-text">
          Preguntas que siempre nos hacen
        </h2>

        <div className="mt-16">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-border">
                <button
                  id={`faq-question-${index}`}
                  onClick={() => toggle(index)}
                  className="w-full flex justify-between items-center py-6 text-left cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-text text-base sm:text-lg pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-text-secondary flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? "500px" : "0px",
                  }}
                >
                  <p className="text-text-secondary pb-6">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
