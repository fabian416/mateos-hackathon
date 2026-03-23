/**
 * Single source of truth for squad and agent definitions.
 * Used across dashboard, explore, onboarding, deploy, and network pages.
 */

export interface SquadInfo {
  id: string;
  name: string;
  desc: string;
  agents: number;
  color: string;
  revenue: string;
  tasks: string;
  uptime: string;
  isHQ: boolean;
}

export const SQUADS: SquadInfo[] = [
  { id: "bsas", name: "Buenos Table", desc: "Farm-to-Table Restaurant — Buenos Aires", agents: 7, color: "#EAB308", revenue: "$8,200", tasks: "8,247", uptime: "99.9%", isHQ: true },
  { id: "mendoza", name: "Andes Vineyard", desc: "Winery — Malbec & Olive Oil — Mendoza", agents: 5, color: "#10B981", revenue: "$3,400", tasks: "2,847", uptime: "99.8%", isHQ: false },
  { id: "salta", name: "Altura Wines", desc: "Boutique Winery — Torrontés — Salta", agents: 4, color: "#F97316", revenue: "$2,100", tasks: "1,890", uptime: "99.7%", isHQ: false },
  { id: "rosario", name: "Central Logistics", desc: "Logistics Hub — Consolidation — Rosario", agents: 6, color: "#8B5CF6", revenue: "$5,800", tasks: "5,102", uptime: "99.8%", isHQ: false },
  { id: "tucuman", name: "Norte Citrus Co.", desc: "Citrus Processing — Lemons — Tucumán", agents: 4, color: "#EC4899", revenue: "$1,800", tasks: "1,231", uptime: "99.6%", isHQ: false },
  { id: "cordoba", name: "Estancia Meats", desc: "Cured Meats & Artisan Cheese — Córdoba", agents: 4, color: "#06B6D4", revenue: "$1,500", tasks: "856", uptime: "99.5%", isHQ: false },
];

export const SQUAD_MAP: Record<string, SquadInfo> = Object.fromEntries(
  SQUADS.map((s) => [s.id, s]),
);

/** Ordered agent colors for dot displays */
export const AGENT_COLORS_ORDERED = ["#10B981", "#8B5CF6", "#A855F7", "#06B6D4", "#EC4899", "#F97316", "#EAB308"];
