"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DATA = [120, 145, 98, 167, 189, 234, 198, 156, 178, 210, 245, 198, 267, 289, 312, 187];

export default function RevenueChartLight() {
  const [today, setToday] = useState(187);

  useEffect(() => {
    const i = setInterval(() => setToday((p) => p + Math.floor(Math.random() * 6)), 4000);
    return () => clearInterval(i);
  }, []);

  const data = [...DATA.slice(0, -1), today];
  const max = Math.max(...data);
  const total = data.reduce((s, v) => s + v, 0);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[11px] text-white/50 uppercase tracking-wider">Revenue</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">${total.toLocaleString()}</span>
            <span className="text-[11px] text-white/40">USDC (16d)</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-emerald-400/80 font-medium">+18.4%</div>
          <div className="text-[10px] text-white/35">vs prev period</div>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[3px] h-16">
        {data.map((v, i) => {
          const pct = (v / max) * 100;
          const isToday = i === data.length - 1;
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-sm relative group"
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              style={{
                background: isToday
                  ? "linear-gradient(to top, #34D399, #34D39960)"
                  : "linear-gradient(to top, rgba(167,139,250,0.5), rgba(167,139,250,0.15))",
              }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 backdrop-blur">
                ${v}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sources */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Suscripciones", value: "$2,400" },
          { label: "Cobros PyMEs", value: "$1,540" },
          { label: "Token Fees", value: "$340" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-2.5">
            <div className="text-[9px] text-white/40">{s.label}</div>
            <div className="text-[13px] font-bold text-white/70 mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
