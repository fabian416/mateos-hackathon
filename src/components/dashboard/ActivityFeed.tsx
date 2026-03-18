"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface ActivityEvent {
  id: number;
  agent: string;
  agentName: string;
  color: string;
  action: string;
  time: string;
  type: "message" | "payment" | "task" | "coordination";
}

const ACTIVITY_TEMPLATES = [
  { agent: "baqueano", agentName: "El Baqueano", color: "#2D5A3D", type: "message" as const, actions: [
    "Respondio WhatsApp: \"Mesa para 4 confirmada\"",
    "Atendio consulta: \"Hacen delivery los domingos?\"",
    "Derivo cliente VIP a cobros",
    "Respondio en 1.8s — satisfaccion 5/5",
    "Resolvio reclamo: pedido corregido",
    "Nuevo cliente: primera consulta resuelta",
  ]},
  { agent: "tropero", agentName: "El Tropero", color: "#6366F1", type: "payment" as const, actions: [
    "Cobro recibido: $45 USDC",
    "Factura #1847 enviada",
    "Recordatorio de pago enviado",
    "Cobro recibido: $120 USDC — sena evento",
    "Pago parcial recibido: $30 USDC",
  ]},
  { agent: "domador", agentName: "El Domador", color: "#8B5CF6", type: "task" as const, actions: [
    "Turno agendado: Sab 15hs",
    "Recordatorio enviado: turno manana 10hs",
    "Reagendo turno: Lun → Mar 14hs",
    "Slot cancelado → notificado a lista de espera",
    "Turno confirmado via WhatsApp",
  ]},
  { agent: "paisano", agentName: "El Paisano", color: "#EC4899", type: "task" as const, actions: [
    "Post en Instagram publicado: promo viernes",
    "Story programado para las 19hs",
    "Respondio comentario en IG",
    "Reel publicado: detras de escena cocina",
  ]},
  { agent: "relator", agentName: "El Relator", color: "#F59E0B", type: "task" as const, actions: [
    "Newsletter semanal enviado a 340 subs",
    "Articulo publicado: recomendaciones del chef",
    "Thread en X: recap semanal",
  ]},
  { agent: "ceo", agentName: "El CEO", color: "#C4A35A", type: "coordination" as const, actions: [
    "Reporte generado — revenue +18%",
    "Reasigno rastreador a campaña nuevos clientes",
    "Alerta: pico de consultas detectado → refuerzo WhatsApp",
    "Optimizo horarios del squad basado en demanda",
  ]},
  { agent: "rastreador", agentName: "El Rastreador", color: "#06B6D4", type: "task" as const, actions: [
    "12 negocios encontrados sin presencia online",
    "Outreach enviado a 5 leads calificados",
    "Lead convertido: Panaderia San Martin",
  ]},
];

let eventCounter = 0;

function generateEvent(): ActivityEvent {
  const template = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
  const action = template.actions[Math.floor(Math.random() * template.actions.length)];
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  eventCounter++;
  return {
    id: eventCounter,
    agent: template.agent,
    agentName: template.agentName,
    color: template.color,
    action,
    time,
    type: template.type,
  };
}

const typeIcons: Record<string, string> = {
  message: "💬",
  payment: "💰",
  task: "⚡",
  coordination: "🧠",
};

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>(() =>
    Array.from({ length: 8 }, () => generateEvent()).reverse()
  );
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = generateEvent();
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-text-muted">Live Activity</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400">live</span>
        </div>
      </div>

      <div ref={feedRef} className="flex-1 overflow-y-auto px-3 py-2" style={{ maxHeight: "340px" }}>
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="py-2 border-b border-white/[0.03] last:border-0"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs mt-0.5">{typeIcons[event.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: event.color }}
                    >
                      {event.agentName}
                    </span>
                    <span className="text-[9px] text-text-muted">{event.time}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed truncate">
                    {event.action}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
