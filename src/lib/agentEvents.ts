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
  // Direct agent-to-agent (no CEO)
  { from: "baqueano", to: "tropero", action: "route → \"Client wants invoice for last order\"", type: "route" },
  { from: "baqueano", to: "domador", action: "route → \"Book onboarding call — new client\"", type: "route" },
  { from: "tropero", to: "baqueano", action: "update payment → completed \"$45 USDC collected\"", type: "update" },
  { from: "rastreador", to: "tropero", action: "route → \"New client signed — Cafe Monteverde\"", type: "route" },
  { from: "rastreador", to: "domador", action: "route → \"Book demo — TechFlow Agency\"", type: "route" },
  { from: "domador", to: "baqueano", action: "update demo → completed \"Demo Fri 3pm confirmed\"", type: "update" },
  { from: "domador", to: "tropero", action: "route → \"Send invoice after onboarding\"", type: "route" },
  { from: "paisano", to: "relator", action: "route → \"Write case study — Peluqueria Marta\"", type: "route" },
  { from: "relator", to: "paisano", action: "route → \"Publish case study thread on X\"", type: "route" },
  { from: "rastreador", to: "paisano", action: "route → \"Share new client win on socials\"", type: "route" },
  { from: "tropero", to: "domador", action: "route → \"Schedule follow-up — AutoFix renewal\"", type: "route" },
  { from: "baqueano", to: "rastreador", action: "route → \"Warm lead from WhatsApp — qualify\"", type: "route" },

  // CEO coordination (less frequent)
  { from: "ceo", to: "rastreador", action: "route → \"Target cafes in Montevideo\" --urgent", type: "route" },
  { from: "ceo", to: "paisano", action: "route → \"Share demo video on X\"", type: "route" },
  { from: "rastreador", to: "ceo", action: "update outreach → completed \"3 demos booked\"", type: "update" },
  { from: "relator", to: "ceo", action: "update content → completed \"Newsletter — 840 subs\"", type: "update" },
  { from: "tropero", to: "ceo", action: "update billing → completed \"$2.4K collected this week\"", type: "update" },

  // Alerts (CEO only)
  { from: "ceo", to: "baqueano", action: "alert: peak detected — 3 new inquiries", type: "alert" },
  { from: "ceo", to: "domador", action: "alert: revenue +22% w/w", type: "alert" },
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
