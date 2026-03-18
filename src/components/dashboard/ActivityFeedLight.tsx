"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Event {
  id: number;
  agent: string;
  color: string;
  action: string;
  time: string;
}

const T = [
  { agent: "El Baqueano", color: "#34D399", actions: ["Responded — \"Mesa para 4 confirmada\"", "Resolved in 1.8s — 5/5", "Forwarded VIP to billing", "New customer inquiry resolved"] },
  { agent: "El Tropero", color: "#A78BFA", actions: ["Payment — $45 USDC", "Invoice #1847 sent", "Reminder — due in 2d"] },
  { agent: "El Domador", color: "#C084FC", actions: ["Booked — Sat 3pm", "Reminder — tomorrow 10am", "Rescheduled Mon → Tue"] },
  { agent: "El Paisano", color: "#FB7185", actions: ["Posted IG — Friday promo", "Replied IG comment", "Story at 7pm"] },
  { agent: "El CEO", color: "#FFD43B", actions: ["Report — revenue +18%", "Reassigned outreach", "Peak detected"] },
  { agent: "El Rastreador", color: "#22D3EE", actions: ["12 businesses found", "5 leads contacted", "Lead converted"] },
  { agent: "El Relator", color: "#FBBF24", actions: ["Newsletter → 340 subs", "Article published"] },
];

let c = 0;
function gen(): Event {
  const t = T[Math.floor(Math.random() * T.length)];
  const now = new Date();
  c++;
  return {
    id: c, agent: t.agent, color: t.color,
    action: t.actions[Math.floor(Math.random() * t.actions.length)],
    time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
  };
}

export default function ActivityFeedLight() {
  const [events, setEvents] = useState<Event[]>(() => Array.from({ length: 20 }, gen).reverse());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const i = setInterval(() => {
      setEvents((p) => {
        const next = [gen(), ...p];
        return next.slice(0, 30);
      });
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] text-white/35 uppercase tracking-wider">Live Activity</span>
        <div className="flex items-center gap-1.5">
          <div className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
          <span className="text-[10px] text-white/20">live</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-1">
        {events.map((e, i) => (
          <motion.div
            key={e.id}
            initial={i === 0 ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="py-2.5 border-b border-white/[0.03] last:border-0"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: e.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium" style={{ color: e.color }}>{e.agent}</span>
                  <span className="text-[9px] text-white/20">{e.time}</span>
                </div>
                <p className="text-[11px] text-white/35 mt-0.5 truncate">{e.action}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
