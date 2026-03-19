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
  baqueano: "ChatGod", tropero: "BagChaser", domador: "CalendApe",
  rastreador: "DM Sniper", paisano: "PostMalone", relator: "HypeSmith", ceo: "OpsChad",
};

const TEMPLATES: Omit<AgentEvent, "id" | "timestamp">[] = [
  // MateOS HQ — client acquisition
  { from: "baqueano", to: "ceo", action: "route → \"New client inquiry from landing page\"", type: "route" },
  { from: "ceo", to: "rastreador", action: "route → \"Follow up TechFlow Agency\"", type: "route" },
  { from: "rastreador", to: "domador", action: "route → \"Book demo — TechFlow Agency\"", type: "route" },
  { from: "ceo", to: "rastreador", action: "route → \"Target cafes in Montevideo\" --urgent", type: "route" },

  // MateOS HQ — billing
  { from: "ceo", to: "tropero", action: "route → \"Invoice Peluqueria Marta — $940\"", type: "route" },
  { from: "tropero", to: "ceo", action: "update sub-renewal → completed \"$300 USDC — Pizzeria\"", type: "update" },
  { from: "tropero", to: "baqueano", action: "update billing → completed \"3 subs collected today\"", type: "update" },

  // MateOS HQ — outreach results
  { from: "rastreador", to: "ceo", action: "update outreach → completed \"3 demos booked this week\"", type: "update" },
  { from: "rastreador", to: "tropero", action: "route → \"New client signed — Cafe Monteverde\"", type: "route" },
  { from: "domador", to: "ceo", action: "update demo-42 → completed \"Demo Fri 3pm — AutoFix\"", type: "update" },

  // MateOS HQ — content & social
  { from: "paisano", to: "relator", action: "route → \"Write case study — Peluqueria Marta\"", type: "route" },
  { from: "relator", to: "ceo", action: "update content → completed \"Newsletter sent — 840 subs\"", type: "update" },
  { from: "ceo", to: "paisano", action: "route → \"Share demo video on X\"", type: "route" },
  { from: "relator", to: "paisano", action: "route → \"Publish case study thread\"", type: "route" },

  // MateOS HQ — support & scheduling
  { from: "baqueano", to: "domador", action: "route → \"Reschedule onboarding — Don Juan\"", type: "route" },
  { from: "baqueano", to: "tropero", action: "route → \"Client asking about pricing\"", type: "route" },

  // MateOS HQ — alerts
  { from: "ceo", to: "baqueano", action: "alert: 3 new inquiries — peak detected", type: "alert" },
  { from: "ceo", to: "domador", action: "alert: revenue +22% w/w — report generated", type: "alert" },
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
