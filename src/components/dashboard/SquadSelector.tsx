"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Squad {
  id: string;
  name: string;
  business: string;
  agents: number;
  revenue: string;
  status: "active" | "onboarding";
  health: number;
  since: string;
}

const SQUADS: Squad[] = [
  { id: "1", name: "Squad Gastro #1", business: "Pizzeria Don Juan", agents: 5, revenue: "$1,890/mes", status: "active", health: 98, since: "Ene 2026" },
  { id: "2", name: "Squad Salon #1", business: "Peluqueria Marta", agents: 3, revenue: "$940/mes", status: "active", health: 95, since: "Feb 2026" },
  { id: "3", name: "Squad Taller #1", business: "Taller Mecanico Roberto", agents: 4, revenue: "$720/mes", status: "active", health: 91, since: "Mar 2026" },
  { id: "4", name: "Squad Retail #1", business: "Tienda Luna", agents: 2, revenue: "—", status: "onboarding", health: 0, since: "Mar 2026" },
];

export default function SquadSelector() {
  const [selected, setSelected] = useState("1");

  return (
    <div className="border-t border-white/5 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-widest text-text-muted">Active Squads</h3>
        <button className="text-xs text-secondary hover:text-secondary-dark transition-colors">
          + Deploy New Squad
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {SQUADS.map((squad) => (
          <motion.button
            key={squad.id}
            onClick={() => setSelected(squad.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-shrink-0 rounded-xl p-4 text-left transition-all min-w-[220px] ${
              selected === squad.id
                ? "bg-white/[0.08] border border-secondary/30"
                : "bg-white/[0.03] border border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/80">{squad.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  squad.status === "active"
                    ? "bg-green-400/10 text-green-400"
                    : "bg-yellow-400/10 text-yellow-400"
                }`}
              >
                {squad.status}
              </span>
            </div>
            <div className="text-[10px] text-text-muted mb-2">{squad.business}</div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-bold text-white/70">{squad.agents}</div>
                <div className="text-[9px] text-text-muted">agents</div>
              </div>
              <div>
                <div className="text-sm font-bold text-green-400">{squad.revenue}</div>
                <div className="text-[9px] text-text-muted">revenue</div>
              </div>
              {squad.health > 0 && (
                <div>
                  <div className="text-sm font-bold text-white/70">{squad.health}%</div>
                  <div className="text-[9px] text-text-muted">health</div>
                </div>
              )}
            </div>
            {/* Mini agent dots */}
            <div className="flex gap-1 mt-3">
              {Array.from({ length: squad.agents }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: squad.status === "active"
                      ? ["#2D5A3D", "#6366F1", "#8B5CF6", "#EC4899", "#C4A35A", "#06B6D4", "#F59E0B"][i % 7]
                      : "#6b7280",
                  }}
                />
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
