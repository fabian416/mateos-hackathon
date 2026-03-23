"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const BASE_DATA = [
  { day: "Mar 3", value: 120 },
  { day: "Mar 4", value: 145 },
  { day: "Mar 5", value: 98 },
  { day: "Mar 6", value: 167 },
  { day: "Mar 7", value: 189 },
  { day: "Mar 8", value: 234 },
  { day: "Mar 9", value: 198 },
  { day: "Mar 10", value: 156 },
  { day: "Mar 11", value: 178 },
  { day: "Mar 12", value: 210 },
  { day: "Mar 13", value: 245 },
  { day: "Mar 14", value: 198 },
  { day: "Mar 15", value: 267 },
  { day: "Mar 16", value: 289 },
  { day: "Mar 17", value: 312 },
  { day: "Hoy", value: 187 },
];

export default function RevenueChart() {
  const [todayValue, setTodayValue] = useState(187);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayValue((prev) => prev + Math.floor(Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const data = BASE_DATA.map((d, i) =>
    i === BASE_DATA.length - 1 ? { ...d, value: todayValue } : d
  );

  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="border-b border-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-text-muted">Revenue</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-green-400">
              ${(data.reduce((sum, d) => sum + d.value, 0)).toLocaleString()}
            </span>
            <span className="text-xs text-text-muted">USDC (16d)</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-400 font-medium">+18.4%</div>
          <div className="text-[10px] text-text-muted">vs prev period</div>
        </div>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-[3px] h-20">
        {data.map((d, i) => {
          const heightPct = (d.value / maxVal) * 100;
          const isToday = i === data.length - 1;
          return (
            <motion.div
              key={d.day}
              className="flex-1 rounded-t-sm relative group"
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              style={{
                background: isToday
                  ? "linear-gradient(to top, #22c55e, #22c55e88)"
                  : `linear-gradient(to top, rgba(99,102,241,0.6), rgba(99,102,241,0.2))`,
              }}
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                ${d.value} · {d.day}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue sources */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-white/[0.03] rounded-lg p-2">
          <div className="text-[10px] text-text-muted">Suscripciones</div>
          <div className="text-sm font-bold text-white/80">$2,400</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2">
          <div className="text-[10px] text-text-muted">Cobros PyMEs</div>
          <div className="text-sm font-bold text-white/80">$1,540</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2">
          <div className="text-[10px] text-text-muted">Token Fees</div>
          <div className="text-sm font-bold text-white/80">$340</div>
        </div>
      </div>
    </div>
  );
}
