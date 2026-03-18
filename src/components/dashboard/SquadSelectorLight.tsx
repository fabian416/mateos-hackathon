"use client";

import { useState } from "react";

const SQUADS = [
  { id: "1", name: "Pizzeria Don Juan", agents: ["B", "D", "T", "P", "C"], colors: ["#059669", "#9333EA", "#7C3AED", "#E11D48", "#D97706"], revenue: "$1,890", tasks: "2.8K", status: "active" as const },
  { id: "2", name: "Peluqueria Marta", agents: ["B", "D", "T"], colors: ["#059669", "#9333EA", "#7C3AED"], revenue: "$940", tasks: "1.2K", status: "active" as const },
  { id: "3", name: "Taller Roberto", agents: ["B", "D", "T", "R"], colors: ["#059669", "#9333EA", "#7C3AED", "#0891B2"], revenue: "$720", tasks: "856", status: "active" as const },
  { id: "4", name: "Tienda Luna", agents: ["B", "D"], colors: ["#059669", "#9333EA"], revenue: "—", tasks: "—", status: "onboarding" as const },
];

export default function SquadSelectorLight() {
  const [selected, setSelected] = useState("1");

  return (
    <div className="bg-white rounded-xl border border-neutral-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-neutral-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Squads</span>
        <button className="text-[11px] text-neutral-500 hover:text-neutral-800 transition-colors" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
          + deploy
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SQUADS.map((s) => (
          <button key={s.id} onClick={() => setSelected(s.id)}
            className={`text-left rounded-lg p-3 border transition-all ${
              selected === s.id ? "border-neutral-300 bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-neutral-800">{s.name}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                s.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {s.status}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-2.5">
              <div>
                <div className="text-[14px] font-bold text-neutral-900" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{s.revenue}</div>
                <div className="text-[8px] text-neutral-400">rev/mo</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-neutral-600" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{s.tasks}</div>
                <div className="text-[8px] text-neutral-400">tasks</div>
              </div>
            </div>

            <div className="flex gap-1">
              {s.agents.map((a, i) => (
                <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ backgroundColor: s.colors[i] }}>
                  {a}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
