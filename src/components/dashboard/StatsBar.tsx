"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: string;
  subvalue?: string;
  color: string;
  trend?: string;
}

const INITIAL_STATS: Stat[] = [
  { label: "Revenue (30d)", value: "$4,280", subvalue: "USDC", color: "#22c55e", trend: "+18%" },
  { label: "Active Squads", value: "3", subvalue: "PyMEs", color: "#C4A35A" },
  { label: "Tasks Completed", value: "4,601", subvalue: "this month", color: "#6366F1", trend: "+24%" },
  { label: "Avg Response", value: "2.8s", subvalue: "WhatsApp", color: "#06B6D4" },
  { label: "LLM Requests", value: "11.2K", subvalue: "via Bankr Gateway", color: "#EC4899" },
  { label: "Uptime", value: "99.7%", subvalue: "30d average", color: "#2D5A3D" },
];

export default function StatsBar() {
  const [stats, setStats] = useState(INITIAL_STATS);

  // Simulate minor stat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => {
          if (stat.label === "Tasks Completed") {
            const current = parseInt(stat.value.replace(",", ""));
            return { ...stat, value: (current + Math.floor(Math.random() * 3)).toLocaleString() };
          }
          if (stat.label === "LLM Requests") {
            const current = parseFloat(stat.value.replace("K", ""));
            return { ...stat, value: `${(current + Math.random() * 0.01).toFixed(1)}K` };
          }
          return stat;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b border-white/5">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="px-5 py-4 border-r border-white/5 last:border-r-0"
        >
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
            {stat.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </span>
            {stat.trend && (
              <span className="text-[10px] text-green-400 font-medium">{stat.trend}</span>
            )}
          </div>
          {stat.subvalue && (
            <div className="text-[10px] text-text-muted mt-0.5">{stat.subvalue}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
