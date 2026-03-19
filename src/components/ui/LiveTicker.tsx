"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TickerItem {
  id: number;
  agent: string;
  color: string;
  action: string;
  type: "task" | "payment" | "lead" | "alert" | "stat";
}

const TICKER_DATA = [
  { agent: "ChatGod", color: "#10B981", action: "Replied in 1.8s — \"Mesa para 4 confirmada\"", type: "task" as const },
  { agent: "BagChaser", color: "#8B5CF6", action: "Collected $45 USDC — Invoice #1847", type: "payment" as const },
  { agent: "CalendApe", color: "#A855F7", action: "Booked 3 appointments today", type: "task" as const },
  { agent: "DM Sniper", color: "#06B6D4", action: "5 new leads qualified — zona norte", type: "lead" as const },
  { agent: "PostMalone", color: "#EC4899", action: "Posted IG story — 2.4K views", type: "task" as const },
  { agent: "HypeSmith", color: "#F97316", action: "Newsletter sent — 340 subscribers", type: "task" as const },
  { agent: "OpsChad", color: "#EAB308", action: "Revenue +18% week over week", type: "stat" as const },
  { agent: "ChatGod", color: "#10B981", action: "89 messages handled — 0 missed", type: "stat" as const },
  { agent: "BagChaser", color: "#8B5CF6", action: "Payment received — $120 USDC deposit", type: "payment" as const },
  { agent: "CalendApe", color: "#A855F7", action: "Reminder sent — 14 appointments tomorrow", type: "task" as const },
  { agent: "DM Sniper", color: "#06B6D4", action: "Lead converted — Panaderia San Martin", type: "lead" as const },
  { agent: "PostMalone", color: "#EC4899", action: "Reel published — behind the scenes", type: "task" as const },
  { agent: "OpsChad", color: "#EAB308", action: "Reassigned DM Sniper → new campaign", type: "alert" as const },
  { agent: "ChatGod", color: "#10B981", action: "Complaint resolved in 4.2s — 5/5 rating", type: "task" as const },
  { agent: "BagChaser", color: "#8B5CF6", action: "$2,400 collected this month", type: "stat" as const },
  { agent: "HypeSmith", color: "#F97316", action: "Article published — chef recommendations", type: "task" as const },
  { agent: "OpsChad", color: "#EAB308", action: "3 squads active — 7 agents online", type: "stat" as const },
  { agent: "DM Sniper", color: "#06B6D4", action: "200 outreach messages sent today", type: "stat" as const },
  { agent: "CalendApe", color: "#A855F7", action: "Zero double-bookings — 45 day streak", type: "stat" as const },
  { agent: "PostMalone", color: "#EC4899", action: "Engagement up 32% — new content strategy", type: "stat" as const },
];

const TYPE_DOTS: Record<string, string> = {
  task: "#10B981", payment: "#8B5CF6", lead: "#06B6D4", alert: "#EAB308", stat: "#EC4899",
};

let counter = 0;
function getItem(): TickerItem {
  const tmpl = TICKER_DATA[counter % TICKER_DATA.length];
  counter++;
  return { id: counter, ...tmpl };
}

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(() =>
    Array.from({ length: 12 }, () => getItem())
  );

  // Add new items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => [...prev, getItem()].slice(-20));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <div className="relative h-10 sm:h-12 flex items-center">
        {/* Scrolling container */}
        <motion.div
          className="flex items-center gap-3 absolute whitespace-nowrap"
          animate={{ x: [0, -2400] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items].map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-1.5 sm:gap-2 bg-white/[0.03] border border-white/[0.05] rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 shrink-0">
              <div className="w-[4px] h-[4px] sm:w-[5px] sm:h-[5px] rounded-full shrink-0" style={{ backgroundColor: TYPE_DOTS[item.type] || item.color }} />
              <span className="text-[9px] sm:text-[11px] font-semibold" style={{ color: item.color }}>{item.agent}</span>
              <span className="text-[9px] sm:text-[11px] text-white/40">{item.action}</span>
            </div>
          ))}
        </motion.div>

        {/* Fade edges — match page background exactly */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#08080F] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#08080F] to-transparent z-10 pointer-events-none" />
      </div>
    </div>
  );
}
