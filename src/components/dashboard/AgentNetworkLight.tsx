"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MagicRings = dynamic(() => import("@/components/ui/MagicRings"), { ssr: false });

interface Agent {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  x: number;
  y: number;
  size: number;
  tasks: number;
  status: "working" | "idle" | "coordinating";
}

interface Conn {
  from: string;
  to: string;
  active: boolean;
}

const AGENTS: Agent[] = [
  { id: "ceo", name: "El CEO", subtitle: "Coordination", color: "#FFD43B", x: 0.5, y: 0.38, size: 42, tasks: 247, status: "coordinating" },
  { id: "baqueano", name: "El Baqueano", subtitle: "WhatsApp", color: "#34D399", x: 0.22, y: 0.13, size: 36, tasks: 1842, status: "working" },
  { id: "tropero", name: "El Tropero", subtitle: "Billing", color: "#818CF8", x: 0.78, y: 0.13, size: 34, tasks: 631, status: "working" },
  { id: "domador", name: "El Domador", subtitle: "Scheduling", color: "#A78BFA", x: 0.12, y: 0.58, size: 32, tasks: 924, status: "working" },
  { id: "rastreador", name: "El Rastreador", subtitle: "Outreach", color: "#22D3EE", x: 0.88, y: 0.58, size: 30, tasks: 456, status: "idle" },
  { id: "paisano", name: "El Paisano", subtitle: "Social", color: "#F472B6", x: 0.32, y: 0.82, size: 30, tasks: 312, status: "working" },
  { id: "relator", name: "El Relator", subtitle: "Content", color: "#FB923C", x: 0.68, y: 0.82, size: 30, tasks: 189, status: "working" },
];

const CONNS: Conn[] = [
  { from: "ceo", to: "baqueano", active: true },
  { from: "ceo", to: "tropero", active: true },
  { from: "ceo", to: "domador", active: true },
  { from: "ceo", to: "rastreador", active: false },
  { from: "ceo", to: "paisano", active: true },
  { from: "ceo", to: "relator", active: true },
  { from: "baqueano", to: "domador", active: true },
  { from: "baqueano", to: "tropero", active: true },
  { from: "paisano", to: "relator", active: true },
  { from: "rastreador", to: "tropero", active: false },
];

const EVENTS = [
  { agentId: "baqueano", text: "Responded — \"Mesa para 4, viernes 21hs\"" },
  { agentId: "tropero", text: "Payment received — $45 USDC" },
  { agentId: "domador", text: "Appointment booked — Sat 3pm" },
  { agentId: "paisano", text: "Posted Instagram — promo 2x1" },
  { agentId: "baqueano", text: "Resolved in 1.8s — 5/5 satisfaction" },
  { agentId: "ceo", text: "Revenue report — +18% w/w" },
  { agentId: "relator", text: "Newsletter → 340 subscribers" },
  { agentId: "tropero", text: "Invoice #1847 sent" },
  { agentId: "rastreador", text: "3 new leads found" },
  { agentId: "domador", text: "Reminder sent — tomorrow 10am" },
];

export default function AgentNetworkLight() {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 520 });
  const [agents, setAgents] = useState(AGENTS);
  const [conns, setConns] = useState(CONNS);
  const [sel, setSel] = useState<string | null>(null);
  const [evt, setEvt] = useState<{ agentId: string; text: string } | null>(null);

  useEffect(() => {
    const up = () => { if (ref.current) setDims({ w: ref.current.offsetWidth, h: ref.current.offsetHeight }); };
    up(); window.addEventListener("resize", up); return () => window.removeEventListener("resize", up);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const e = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setEvt(e);
      setAgents((p) => p.map((a) => ({ ...a, tasks: a.id === e.agentId ? a.tasks + 1 : a.tasks })));
      setConns((p) => p.map((c) => ({
        ...c, active: c.from === e.agentId || c.to === e.agentId ? true : Math.random() > 0.25,
      })));
      setTimeout(() => setEvt(null), 2800);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const { w, h } = dims;

  return (
    <div ref={ref} className="w-full h-full relative">
      {/* Grid dots */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <svg width={w} height={h} className="absolute inset-0">
        {/* Connections — thin elegant lines */}
        {conns.map((c) => {
          const fa = agents.find((a) => a.id === c.from);
          const ta = agents.find((a) => a.id === c.to);
          if (!fa || !ta) return null;
          const x1 = fa.x * w, y1 = fa.y * h, x2 = ta.x * w, y2 = ta.y * h;
          const isEvt = evt && (c.from === evt.agentId || c.to === evt.agentId);

          return (
            <g key={`${c.from}-${c.to}`}>
              <motion.line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={c.active ? (isEvt ? fa.color : "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.04)"}
                strokeWidth={isEvt ? 1.5 : 1}
                animate={{ opacity: c.active ? (isEvt ? 0.6 : 0.5) : 0.2 }}
                transition={{ duration: 0.4 }}
              />
              {/* Traveling dot — only on event connections */}
              {c.active && isEvt && (
                <motion.circle r={2.5} fill={fa.color}
                  animate={{ cx: [x1, x2], cy: [y1, y2] }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {agents.map((a) => {
          const cx = a.x * w, cy = a.y * h;
          const isEvt = evt?.agentId === a.id;
          const isSel = sel === a.id;

          return (
            <g key={a.id} onClick={() => setSel(isSel ? null : a.id)} className="cursor-pointer">
              {/* Ping on event */}
              {isEvt && (
                <motion.circle cx={cx} cy={cy} r={a.size} fill="none" stroke={a.color} strokeWidth={1.5}
                  initial={{ r: a.size, opacity: 0.5 }}
                  animate={{ r: a.size * 2.5, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}

              {/* Selection ring */}
              {isSel && (
                <circle cx={cx} cy={cy} r={a.size + 6} fill="none" stroke={a.color} strokeWidth={1}
                  strokeDasharray="4 3" opacity={0.4} />
              )}

              {/* Outer ring — glass */}
              <motion.circle cx={cx} cy={cy} r={a.size}
                fill={a.color}
                fillOpacity={isEvt ? 0.3 : 0.15}
                stroke={a.color}
                strokeWidth={isEvt ? 2.5 : 2}
                strokeOpacity={isEvt ? 1 : 0.7}
                animate={{ r: isEvt ? a.size * 1.08 : a.size }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 0 16px ${a.color}60)` }}
              />

              {/* Letter */}
              <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central"
                fontSize={18} fill={a.color} fontWeight="800"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {a.name.split(" ")[1]?.[0] || "?"}
              </text>

              {/* Name inside node */}
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.6)" fontWeight="500">
                {a.name}
              </text>

              {/* Subtitle below node */}
              <text x={cx} y={cy + a.size + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {a.subtitle}
              </text>

              {/* Task count */}
              <text x={cx} y={cy - a.size - 10} textAnchor="middle"
                fontSize={10} fill={isEvt ? a.color : "rgba(255,255,255,0.35)"} fontWeight="600"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {a.tasks.toLocaleString()}
              </text>

              {/* Status dot */}
              <circle cx={cx + a.size - 2} cy={cy - a.size + 2} r={4} fill="rgba(15,15,25,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <circle cx={cx + a.size - 2} cy={cy - a.size + 2} r={2.5}
                fill={a.status === "working" ? "#10B981" : a.status === "coordinating" ? "#F59E0B" : "#9CA3AF"} />
            </g>
          );
        })}
      </svg>

      {/* Event toast */}
      <AnimatePresence>
        {evt && (() => {
          const a = agents.find((x) => x.id === evt.agentId);
          if (!a) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg px-3 py-2 flex items-center gap-2 max-w-sm"
            >
              <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
              <div>
                <span className="text-[11px] font-semibold" style={{ color: a.color }}>{a.name}</span>
                <span className="text-[10px] text-white/50 ml-2">{evt.text}</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Detail card */}
      <AnimatePresence>
        {sel && (() => {
          const a = agents.find((x) => x.id === sel);
          if (!a) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-4 max-w-[240px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ backgroundColor: `${a.color}20`, color: a.color }}>
                  {a.name.split(" ")[1]?.[0]}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white/90">{a.name}</div>
                  <div className="text-[10px] text-white/35" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{a.subtitle}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[
                  { v: a.tasks.toLocaleString(), l: "Tasks" },
                  { v: "99.8%", l: "Uptime" },
                  { v: "2.1s", l: "Avg" },
                ].map((s) => (
                  <div key={s.l} className="bg-white/[0.04] rounded-md py-1.5">
                    <div className="text-[12px] font-bold text-white/80" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{s.v}</div>
                    <div className="text-[8px] text-white/25 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center gap-1">
                <svg className="w-2.5 h-2.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[9px] text-white/30" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>ERC-8004</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
