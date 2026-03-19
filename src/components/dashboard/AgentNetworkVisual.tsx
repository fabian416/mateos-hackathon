"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fireEvent as fireAgentEvent, AGENT_COLORS } from "@/lib/agentEvents";

interface Agent {
  id: string;
  name: string;
  letter: string;
  subtitle: string;
  color: string;
  colorLight: string;
  x: number;
  y: number;
  size: number;
  tasks: number;
  status: "working" | "idle" | "coordinating";
}

interface Message {
  id: number;
  from: string;
  to: string;
  text: string;
  emoji: string;
}

const AGENTS: Agent[] = [
  { id: "ceo", name: "OpsChad", letter: "OC", subtitle: "Coordination", color: "#EAB308", colorLight: "#FEF08A", x: 0.5, y: 0.42, size: 52, tasks: 247, status: "coordinating" },
  { id: "baqueano", name: "ChatGod", letter: "CG", subtitle: "WhatsApp", color: "#10B981", colorLight: "#A7F3D0", x: 0.18, y: 0.15, size: 46, tasks: 1842, status: "working" },
  { id: "tropero", name: "BagChaser", letter: "BC", subtitle: "Billing", color: "#8B5CF6", colorLight: "#DDD6FE", x: 0.82, y: 0.15, size: 44, tasks: 631, status: "working" },
  { id: "domador", name: "CalendApe", letter: "CA", subtitle: "Scheduling", color: "#A855F7", colorLight: "#E9D5FF", x: 0.1, y: 0.65, size: 42, tasks: 924, status: "working" },
  { id: "rastreador", name: "DM Sniper", letter: "DS", subtitle: "Outreach", color: "#06B6D4", colorLight: "#CFFAFE", x: 0.9, y: 0.65, size: 40, tasks: 456, status: "idle" },
  { id: "paisano", name: "PostMalone", letter: "PM", subtitle: "Social", color: "#EC4899", colorLight: "#FBCFE8", x: 0.3, y: 0.85, size: 40, tasks: 312, status: "working" },
  { id: "relator", name: "HypeSmith", letter: "HS", subtitle: "Content", color: "#F97316", colorLight: "#FED7AA", x: 0.7, y: 0.85, size: 40, tasks: 189, status: "working" },
];

const CONNECTIONS = [
  ["ceo", "baqueano"], ["ceo", "tropero"], ["ceo", "domador"],
  ["ceo", "rastreador"], ["ceo", "paisano"], ["ceo", "relator"],
  ["baqueano", "domador"], ["baqueano", "tropero"],
  ["paisano", "relator"], ["rastreador", "tropero"],
  ["domador", "paisano"], ["relator", "ceo"],
];

interface LightPulse {
  id: number;
  from: string;
  to: string;
  color: string;
}

let pulseCounter = 0;

// Real delegate.py format: route <agent> "<task>" --context '{"key":"val"}'
const MSG_TEMPLATES = [
  // MateOS HQ — client acquisition flow
  { from: "baqueano", to: "ceo", text: "route OpsChad \"New client inquiry from landing\"", emoji: "→" },
  { from: "ceo", to: "rastreador", text: "route DM Sniper \"Follow up TechFlow Agency\"", emoji: "→" },
  { from: "rastreador", to: "domador", text: "route CalendApe \"Book demo — TechFlow\"", emoji: "→" },
  { from: "domador", to: "ceo", text: "update demo-42 → completed \"Demo Fri 3pm — AutoFix\"", emoji: "✅" },

  // MateOS HQ — billing
  { from: "tropero", to: "ceo", text: "update sub-renewal → completed \"$300 USDC — Pizzeria\"", emoji: "✅" },
  { from: "ceo", to: "tropero", text: "route BagChaser \"Invoice Peluqueria Marta — $940\"", emoji: "→" },
  { from: "tropero", to: "baqueano", text: "update billing → completed \"3 subs collected today\"", emoji: "✅" },

  // MateOS HQ — outreach
  { from: "rastreador", to: "ceo", text: "update outreach → completed \"3 demos booked this week\"", emoji: "✅" },
  { from: "ceo", to: "rastreador", text: "route DM Sniper \"Target cafes in Montevideo\" --urgent", emoji: "→" },
  { from: "rastreador", to: "tropero", text: "route BagChaser \"New client signed — Cafe Monteverde\"", emoji: "→" },

  // MateOS HQ — content & social
  { from: "paisano", to: "relator", text: "route HypeSmith \"Write case study — Peluqueria Marta\"", emoji: "→" },
  { from: "relator", to: "ceo", text: "update content → completed \"Newsletter sent — 840 subs\"", emoji: "✅" },
  { from: "ceo", to: "paisano", text: "route PostMalone \"Share demo video on X\"", emoji: "→" },
  { from: "relator", to: "paisano", text: "route PostMalone \"Publish case study thread\"", emoji: "→" },

  // MateOS HQ — support
  { from: "baqueano", to: "domador", text: "route CalendApe \"Reschedule onboarding — Don Juan\"", emoji: "→" },
  { from: "baqueano", to: "tropero", text: "route BagChaser \"Client asking about pricing\"", emoji: "→" },

  // MateOS HQ — coordination
  { from: "ceo", to: "baqueano", text: "alert: 3 new inquiries — peak detected", emoji: "→" },
  { from: "paisano", to: "relator", text: "route HypeSmith \"Event photos ready\"", emoji: "🖼️" },
  { from: "relator", to: "paisano", text: "route PostMalone \"Publish success story\"", emoji: "📸" },
];

let msgCounter = 0;

export default function AgentNetworkVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 500 });
  const [agents, setAgents] = useState(AGENTS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pulses, setPulses] = useState<LightPulse[]>([]);
  const [impacts, setImpacts] = useState<{ id: number; agentId: string; color: string }[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    const up = () => { if (ref.current) setDims({ w: ref.current.offsetWidth, h: ref.current.offsetHeight }); };
    up(); window.addEventListener("resize", up); return () => window.removeEventListener("resize", up);
  }, []);

  // Fire light pulses — uses shared event bus so feed stays in sync
  useEffect(() => {
    const interval = setInterval(() => {
      // Fire event through shared bus (feed will pick it up)
      const evt = fireAgentEvent();
      const fromColor = AGENT_COLORS[evt.from] || "#fff";

      pulseCounter++;
      const pulse: LightPulse = { id: pulseCounter, from: evt.from, to: evt.to, color: fromColor };
      setPulses((prev) => [...prev.slice(-15), pulse]);
      setActiveAgent(evt.from);

      // Update task count
      setAgents((prev) => prev.map((a) => ({
        ...a,
        tasks: a.id === evt.from ? a.tasks + 1 : a.tasks,
      })));

      // On arrival — impact
      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.id !== pulse.id));
        setImpacts((prev) => [...prev.slice(-8), { id: pulse.id, agentId: evt.to, color: fromColor }]);
        setActiveAgent(evt.to);
        setTimeout(() => {
          setImpacts((prev) => prev.filter((i) => i.id !== pulse.id));
          setActiveAgent(null);
        }, 3200);
      }, 600);

      // Also fire a message bubble for some events
      if (Math.random() > 0.6) {
        msgCounter++;
        const tmpl = MSG_TEMPLATES[Math.floor(Math.random() * MSG_TEMPLATES.length)];
        const msg: Message = { id: msgCounter, ...tmpl };
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== msg.id)), 1200);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [agents]);

  const { w, h } = dims;
  const getPos = (id: string) => {
    const a = agents.find((x) => x.id === id);
    return a ? { x: a.x * w, y: a.y * h } : { x: 0, y: 0 };
  };

  return (
    <div ref={ref} className="w-full h-full relative overflow-hidden">
      <svg width={w} height={h} className="absolute inset-0">
        <defs>
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Connections — thin base lines */}
        {CONNECTIONS.map(([fromId, toId]) => {
          const from = getPos(fromId);
          const to = getPos(toId);
          const hasActive = pulses.some((p) => (p.from === fromId && p.to === toId) || (p.from === toId && p.to === fromId));

          return (
            <line key={`line-${fromId}-${toId}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={hasActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Light pulses — bright orbs that travel fast and fade */}
        {pulses.map((pulse) => {
          const from = getPos(pulse.from);
          const to = getPos(pulse.to);

          return (
            <g key={`pulse-${pulse.id}`}>
              {/* Bright core */}
              <motion.circle
                r={4}
                fill={pulse.color}
                filter="url(#pulse-glow)"
                initial={{ cx: from.x, cy: from.y, opacity: 1 }}
                animate={{ cx: to.x, cy: to.y, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              {/* White hot center */}
              <motion.circle
                r={2}
                fill="white"
                initial={{ cx: from.x, cy: from.y, opacity: 0.9 }}
                animate={{ cx: to.x, cy: to.y, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* Trail line that appears and fades */}
              <motion.line
                x1={from.x} y1={from.y}
                stroke={pulse.color}
                strokeWidth={2}
                filter="url(#pulse-glow)"
                initial={{ x2: from.x, y2: from.y, opacity: 0.6 }}
                animate={{ x2: to.x, y2: to.y, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </g>
          );
        })}

        {/* Agent nodes */}
        {agents.map((a) => {
          const cx = a.x * w;
          const cy = a.y * h;
          const isActive = activeAgent === a.id;
          const isSel = selectedAgent === a.id;
          const hasImpact = impacts.some((i) => i.agentId === a.id);

          return (
            <g key={a.id} onClick={() => setSelectedAgent(isSel ? null : a.id)} className="cursor-pointer">
              {/* Breathing outer glow */}
              <motion.circle
                cx={cx} cy={cy}
                fill={a.color}
                animate={{
                  r: hasImpact ? [a.size * 1.1, a.size * 1.4, a.size * 1.1] : [a.size * 0.9, a.size * 1.05, a.size * 0.9],
                  opacity: hasImpact ? [0.1, 0.2, 0.1] : [0.04, 0.08, 0.04],
                }}
                transition={{ duration: hasImpact ? 0.7 : 5, repeat: hasImpact ? 1 : Infinity, ease: "easeInOut" }}
              />

              {/* IMPACT ANIMATIONS */}
              {impacts.filter((i) => i.agentId === a.id).map((impact) => (
                <g key={`impact-${impact.id}`}>
                  {/* Flash — instant bright, quick fade */}
                  <motion.circle
                    cx={cx} cy={cy} r={a.size}
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />

                  {/* Glow — peaks fast, decays SLOWLY */}
                  <motion.circle
                    cx={cx} cy={cy}
                    fill={impact.color}
                    initial={{ r: a.size * 1.2, opacity: 0 }}
                    animate={{ r: [a.size * 1.2, a.size * 1.8, a.size * 1.3], opacity: [0, 0.25, 0] }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />

                  {/* Ring 1 — slow expanding ripple */}
                  <motion.circle
                    cx={cx} cy={cy}
                    fill="none"
                    stroke={impact.color}
                    initial={{ r: a.size, strokeWidth: 1.5, opacity: 0.4 }}
                    animate={{ r: a.size * 3, strokeWidth: 0.3, opacity: 0 }}
                    transition={{ duration: 2.5, ease: [0.0, 0.0, 0.15, 1] }}
                  />

                  {/* Ring 2 — delayed, even slower */}
                  <motion.circle
                    cx={cx} cy={cy}
                    fill="none"
                    stroke={impact.color}
                    initial={{ r: a.size, strokeWidth: 1, opacity: 0.25 }}
                    animate={{ r: a.size * 3.5, strokeWidth: 0.2, opacity: 0 }}
                    transition={{ duration: 3, delay: 0.15, ease: [0.0, 0.0, 0.1, 1] }}
                  />
                </g>
              ))}

              {/* Selection ring */}
              {isSel && (
                <motion.circle cx={cx} cy={cy} r={a.size + 5} fill="none" stroke={a.color}
                  strokeWidth={1.5} strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }} opacity={0.5} />
              )}

              {/* Main circle — with breath animation on impact */}
              <motion.circle
                cx={cx} cy={cy}
                fill={a.color}
                fillOpacity={hasImpact ? 0.28 : 0.14}
                stroke={a.color}
                strokeWidth={hasImpact ? 2.5 : 1.5}
                strokeOpacity={hasImpact ? 1 : 0.6}
                animate={{
                  r: hasImpact ? [a.size, a.size * 1.12, a.size * 0.97, a.size] : a.size,
                }}
                transition={hasImpact ? {
                  duration: 0.8,
                  times: [0, 0.15, 0.4, 1],
                  ease: "easeOut",
                } : { duration: 0.3 }}
                style={{ filter: `drop-shadow(0 0 ${hasImpact ? 22 : 12}px ${a.color}50)`, transformOrigin: `${cx}px ${cy}px` }}
              />

              {/* Inner ring */}
              <circle cx={cx} cy={cy} r={a.size * 0.65} fill="none" stroke={a.color} strokeWidth={0.6} opacity={0.15} />

              {/* Letter */}
              <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central"
                fontSize={22} fill={a.color} fontWeight="800"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {a.letter}
              </text>

              {/* Name inside */}
              <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.6)" fontWeight="500">
                {a.name}
              </text>

              {/* Subtitle below */}
              <text x={cx} y={cy + a.size + 16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.25)">
                {a.subtitle}
              </text>

              {/* Task counter */}
              <text x={cx} y={cy - a.size - 10} textAnchor="middle"
                fontSize={11} fill={isActive ? a.color : "rgba(255,255,255,0.35)"} fontWeight="700"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {a.tasks.toLocaleString()}
              </text>

              {/* Status dot */}
              <circle cx={cx + a.size - 4} cy={cy - a.size + 4} r={5} fill="#0B0B14" />
              <circle cx={cx + a.size - 4} cy={cy - a.size + 4} r={3}
                fill={a.status === "working" ? "#10B981" : a.status === "coordinating" ? "#EAB308" : "#6B7280"} />
              {a.status === "working" && (
                <motion.circle cx={cx + a.size - 4} cy={cy - a.size + 4} r={3}
                  fill="#10B981" animate={{ r: [3, 6, 3], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }} />
              )}
            </g>
          );
        })}
      </svg>

      {/* Animated message bubbles traveling between agents */}
      <AnimatePresence>
        {messages.map((msg) => {
          const from = getPos(msg.from);
          const to = getPos(msg.to);
          const fromAgent = agents.find((a) => a.id === msg.from);

          return (
            <motion.div
              key={msg.id}
              className="absolute pointer-events-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-lg"
              style={{
                backgroundColor: `rgba(15,15,25,0.85)`,
                backdropFilter: "blur(8px)",
                borderColor: `${fromAgent?.color || "#fff"}40`,
                boxShadow: `0 0 20px ${fromAgent?.color || "#fff"}25`,
              }}
              initial={{ x: from.x - 40, y: from.y - 12, opacity: 0, scale: 0.6 }}
              animate={{ x: to.x - 40, y: to.y - 12, opacity: [0, 1, 1, 0], scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="text-xs">{msg.emoji}</span>
              <span className="text-[10px] text-white/70 font-medium whitespace-nowrap">{msg.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Selected agent detail */}
      <AnimatePresence>
        {selectedAgent && (() => {
          const a = agents.find((x) => x.id === selectedAgent);
          if (!a) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-4 left-4 rounded-xl p-4 max-w-[260px] shadow-2xl border"
              style={{ backgroundColor: "rgba(15,15,25,0.9)", backdropFilter: "blur(16px)", borderColor: `${a.color}25` }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${a.color}20`, color: a.color, boxShadow: `0 0 12px ${a.color}20` }}>
                  {a.letter}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white/90">{a.name}</div>
                  <div className="text-[10px] text-white/35">{a.subtitle}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: a.tasks.toLocaleString(), l: "Tasks", c: a.color },
                  { v: "100%", l: "Activity", c: a.color },
                  { v: "99.8%", l: "Uptime", c: "#10B981" },
                ].map((s) => (
                  <div key={s.l} className="bg-white/[0.04] rounded-lg py-2 text-center">
                    <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
                    <div className="text-[8px] text-white/25 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-1.5">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] text-white/30 font-mono">ERC-8004 verified</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
