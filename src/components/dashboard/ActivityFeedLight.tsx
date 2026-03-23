"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { subscribe, AGENT_NAMES, AGENT_COLORS, type AgentEvent } from "@/lib/agentEvents";

export default function ActivityFeedLight({ isOwner = true }: { isOwner?: boolean }) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen to shared event bus — synced with network pulses
  useEffect(() => {
    const unsub = subscribe((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 30));
    });
    return () => { unsub(); };
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between shrink-0">
        <span className="text-[13px] text-white/55 uppercase tracking-wider font-semibold">Inter-Agent Comms</span>
        <div className="flex items-center gap-1.5">
          <div className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
          <span className="text-[11px] text-white/30">live</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-1">
        {events.length === 0 && (
          <div className="text-[12px] text-white/35 text-center py-8">Waiting for agent activity...</div>
        )}
        {events.slice(0, 10).map((e, i) => (
          <motion.div
            key={e.id}
            initial={i === 0 ? { opacity: 0, backgroundColor: "rgba(255,255,255,0.04)" } : false}
            animate={{ opacity: 1, backgroundColor: "rgba(255,255,255,0)" }}
            transition={{ duration: 0.8 }}
            className="py-2.5 border-b border-white/[0.03] last:border-0"
          >
            <div className="flex items-start gap-2.5">
              {/* From → To dots */}
              <div className="flex items-center gap-1 mt-1.5 shrink-0">
                <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: AGENT_COLORS[e.from] }} />
                <span className="text-[9px] text-white/40">→</span>
                <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: AGENT_COLORS[e.to] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold" style={{ color: AGENT_COLORS[e.from] }}>{AGENT_NAMES[e.from]}</span>
                  <span className="text-[10px] text-white/35">→</span>
                  <span className="text-[13px] font-semibold" style={{ color: AGENT_COLORS[e.to] }}>{AGENT_NAMES[e.to]}</span>
                  <span className="text-[10px] text-white/40 ml-auto shrink-0">{e.timestamp}</span>
                </div>
                <p className={`text-[11px] mt-0.5 truncate font-mono ${isOwner ? "text-white/45" : "text-white/40 blur-[4px] select-none"}`}>{isOwner ? e.action : "━━━━━━━━━━━━━━━━━━━━"}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
