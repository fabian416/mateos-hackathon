// Shared event bus — network fires events, feed listens

export interface AgentEvent {
  id: number;
  from: string;
  to: string;
  action: string;
  type: "route" | "update" | "alert";
  timestamp: string;
}

type Listener = (event: AgentEvent) => void;

const listeners: Set<Listener> = new Set();
let counter = 0;

const AGENT_NAMES: Record<string, string> = {
  baqueano: "Baqueano", tropero: "Tropero", domador: "Domador",
  rastreador: "Rastreador", paisano: "Paisano", relator: "Relator", ceo: "CEO",
};

const TEMPLATES: Omit<AgentEvent, "id" | "timestamp">[] = [
  // Routes (delegation)
  { from: "baqueano", to: "tropero", action: "route → \"Lead calificado por WhatsApp\"", type: "route" },
  { from: "baqueano", to: "domador", action: "route → \"Agendar turno Sab 15hs\"", type: "route" },
  { from: "baqueano", to: "rastreador", action: "route → \"Cliente no puede pagar\" --priority urgent", type: "route" },
  { from: "tropero", to: "domador", action: "route → \"Agendar onboarding nuevo cliente\"", type: "route" },
  { from: "domador", to: "relator", action: "route → \"Crear caso de exito\"", type: "route" },
  { from: "ceo", to: "rastreador", action: "route → \"Buscar leads zona norte\" --priority urgent", type: "route" },
  { from: "ceo", to: "paisano", action: "route → \"Publicar promo viernes 2x1\"", type: "route" },
  { from: "ceo", to: "tropero", action: "route → \"Follow-up leads de la semana\"", type: "route" },
  { from: "rastreador", to: "tropero", action: "route → \"5 leads calificados\" --context {...}", type: "route" },
  { from: "paisano", to: "relator", action: "route → \"Fotos del evento listas\"", type: "route" },
  { from: "relator", to: "paisano", action: "route → \"Publicar post caso de exito\"", type: "route" },

  // Updates (task completion)
  { from: "tropero", to: "baqueano", action: "update task-47 → completed \"$45 USDC cobrado\"", type: "update" },
  { from: "domador", to: "baqueano", action: "update task-23 → completed \"Turno Sab 15hs confirmado\"", type: "update" },
  { from: "rastreador", to: "ceo", action: "update leads-batch → completed \"12 negocios, 5 calificados\"", type: "update" },
  { from: "relator", to: "ceo", action: "update newsletter → completed \"Enviado a 340 subs\"", type: "update" },
  { from: "domador", to: "tropero", action: "update onboarding-12 → completed \"Reunion agendada lun 10am\"", type: "update" },

  // Alerts
  { from: "ceo", to: "baqueano", action: "alert: pico de consultas detectado — reforzando WhatsApp", type: "alert" },
  { from: "ceo", to: "domador", action: "alert: revenue +18% w/w — reporte generado", type: "alert" },
];

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function fireEvent(): AgentEvent {
  const tmpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const now = new Date();
  counter++;
  const event: AgentEvent = {
    ...tmpl,
    id: counter,
    timestamp: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
  };
  listeners.forEach((l) => l(event));
  return event;
}

export { AGENT_NAMES };

export const AGENT_COLORS: Record<string, string> = {
  baqueano: "#10B981", tropero: "#8B5CF6", domador: "#A855F7",
  rastreador: "#06B6D4", paisano: "#EC4899", relator: "#F97316", ceo: "#EAB308",
};
