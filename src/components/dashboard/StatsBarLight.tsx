"use client";

import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

const INITIAL: Stat[] = [
  { label: "Revenue (30d)", value: "$4,280", change: "+18%", positive: true },
  { label: "Active Squads", value: "3" },
  { label: "Tasks Completed", value: "4,601", change: "+24%", positive: true },
  { label: "Avg Response", value: "2.8s", change: "-0.4s", positive: true },
  { label: "LLM Requests", value: "11.2K" },
  { label: "Uptime", value: "99.7%" },
];

export default function StatsBarLight() {
  const [stats, setStats] = useState(INITIAL);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((s) => {
          if (s.label === "Tasks Completed") {
            const n = parseInt(s.value.replace(",", "")) + Math.floor(Math.random() * 3);
            return { ...s, value: n.toLocaleString() };
          }
          return s;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-[1400px] mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[11px] text-neutral-400 font-medium">{s.label}</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-semibold text-neutral-900 tabular-nums">{s.value}</span>
              {s.change && (
                <span className={`text-[11px] font-medium ${s.positive ? "text-emerald-600" : "text-red-500"}`}>
                  {s.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
