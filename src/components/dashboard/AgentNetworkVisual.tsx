"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fireEvent as fireAgentEvent, AGENT_COLORS } from "@/lib/agentEvents";
import { getSquadReputation, SQUAD_CONFIG, type SquadReputation } from "@/lib/erc8004";

interface Agent {
  id: string;
  name: string;
  letter: string;
  subtitle: string;
  color: string;
  x: number;
  y: number;
  size: number;
  tasks: number;
  status: "working" | "idle" | "coordinating";
}

const AGENTS: Agent[] = [
  { id: "ceo", name: "OpsChad", letter: "OC", subtitle: "Coordination", color: "#EAB308", x: 0.5, y: 0.42, size: 52, tasks: 247, status: "coordinating" },
  { id: "baqueano", name: "ChatGod", letter: "CG", subtitle: "WhatsApp", color: "#10B981", x: 0.18, y: 0.22, size: 46, tasks: 1842, status: "working" },
  { id: "tropero", name: "BagChaser", letter: "BC", subtitle: "Billing", color: "#8B5CF6", x: 0.82, y: 0.22, size: 44, tasks: 631, status: "working" },
  { id: "domador", name: "CalendApe", letter: "CA", subtitle: "Scheduling", color: "#A855F7", x: 0.1, y: 0.65, size: 42, tasks: 924, status: "working" },
  { id: "rastreador", name: "DM Sniper", letter: "DS", subtitle: "Outreach", color: "#06B6D4", x: 0.9, y: 0.65, size: 40, tasks: 456, status: "idle" },
  { id: "paisano", name: "PostMalone", letter: "PM", subtitle: "Social", color: "#EC4899", x: 0.3, y: 0.82, size: 40, tasks: 312, status: "working" },
  { id: "relator", name: "HypeSmith", letter: "HS", subtitle: "Content", color: "#F97316", x: 0.7, y: 0.82, size: 40, tasks: 189, status: "working" },
];

const CONNECTIONS: [string, string][] = [
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
  isCascade?: boolean;
}

// Orbit particle configs for working nodes (2-3 particles per node)
const ORBIT_PARTICLES = [
  { offset: 0, duration: 3 },
  { offset: 2.1, duration: 4 },
  { offset: 4.2, duration: 5 },
];

// Generate random scatter directions for impact micro-particles (seeded per impact)
function getScatterOffsets(id: number, count: number): { dx: number; dy: number }[] {
  const offsets: { dx: number; dy: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = ((id * 137.5 + i * 72) % 360) * (Math.PI / 180);
    const dist = 8 + ((id * 31 + i * 17) % 13);
    offsets.push({ dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist });
  }
  return offsets;
}

let pulseCounter = 0;

// Compute bezier control point for a curved connection
function getBezierCP(from: { x: number; y: number }, to: { x: number; y: number }, idx: number) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const offset = (idx % 2 === 0 ? 1 : -1) * 0.12;
  return { x: mx - dy * offset, y: my + dx * offset };
}

function getBezierPath(from: { x: number; y: number }, to: { x: number; y: number }, idx: number) {
  const cp = getBezierCP(from, to, idx);
  return `M ${from.x} ${from.y} Q ${cp.x} ${cp.y} ${to.x} ${to.y}`;
}

export default function AgentNetworkVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 500 });
  const [agents, setAgents] = useState(AGENTS);
  const [pulses, setPulses] = useState<LightPulse[]>([]);
  const [impacts, setImpacts] = useState<{ id: number; agentId: string; color: string }[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [connectionHeat, setConnectionHeat] = useState<Record<string, number>>({});
  const [shockwave, setShockwave] = useState<{ x: number; y: number; color: string } | null>(null);
  const [fullSync, setFullSync] = useState(false);
  const [reputation, setReputation] = useState<SquadReputation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch onchain reputation from ERC-8004 Reputation Registry
  useEffect(() => {
    getSquadReputation().then(setReputation);
  }, []);

  useEffect(() => {
    const up = () => { if (ref.current) setDims({ w: ref.current.offsetWidth, h: ref.current.offsetHeight }); };
    up(); window.addEventListener("resize", up); return () => window.removeEventListener("resize", up);
  }, []);

  const getPos = useCallback((id: string) => {
    const a = agents.find((x) => x.id === id);
    return a ? { x: a.x * dims.w, y: a.y * dims.h } : { x: 0, y: 0 };
  }, [agents, dims]);

  // Fire a single pulse
  const firePulse = useCallback((fromId: string, toId: string, color: string, isCascade = false) => {
    pulseCounter++;
    const pulse: LightPulse = { id: pulseCounter, from: fromId, to: toId, color, isCascade };
    setPulses((prev) => [...prev.slice(-20), pulse]);
    setActiveAgent(fromId);

    // Heat up the connection
    const connKey = [fromId, toId].sort().join("-");
    setConnectionHeat((prev) => ({ ...prev, [connKey]: 1 }));

    setAgents((prev) => prev.map((a) => ({
      ...a, tasks: a.id === fromId ? a.tasks + 1 : a.tasks,
    })));

    setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== pulse.id));
      setImpacts((prev) => [...prev.slice(-10), { id: pulse.id, agentId: toId, color }]);
      setActiveAgent(toId);
      setTimeout(() => {
        setImpacts((prev) => prev.filter((i) => i.id !== pulse.id));
        setActiveAgent(null);
      }, 3200);
    }, 600);
  }, []);

  // STOCHASTIC PULSE TIMING — variable intervals
  useEffect(() => {
    function scheduleNext() {
      const delay = 300 + Math.random() * Math.random() * 1700;
      timerRef.current = setTimeout(() => {
        const evt = fireAgentEvent();
        const fromColor = AGENT_COLORS[evt.from] || "#fff";
        firePulse(evt.from, evt.to, fromColor);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [firePulse]);

  // CONNECTION HEAT DECAY — cool down every second
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionHeat((prev) => {
        const next: Record<string, number> = {};
        for (const [k, v] of Object.entries(prev)) {
          const nv = v - 0.15;
          if (nv > 0.01) next[k] = nv;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // CASCADE EVENT — every 18-30s
  useEffect(() => {
    const schedule = () => {
      const delay = 18000 + Math.random() * 12000;
      return setTimeout(() => {
        // Pick a random connection and cascade
        const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
        const fromAgent = agents.find((a) => a.id === conn[0]);
        if (!fromAgent) return;
        firePulse(conn[0], conn[1], fromAgent.color, true);

        // Secondary pulses from the receiver
        setTimeout(() => {
          const receiverConns = CONNECTIONS.filter(([f, t]) => f === conn[1] || t === conn[1]);
          const targets = receiverConns.slice(0, 3);
          targets.forEach(([f, t], i) => {
            const target = f === conn[1] ? t : f;
            const receiverAgent = agents.find((a) => a.id === conn[1]);
            setTimeout(() => {
              firePulse(conn[1], target, receiverAgent?.color || "#fff", true);
            }, 100 + i * 150);
          });
        }, 700);

        cascadeTimer.current = schedule();
      }, delay);
    };
    const cascadeTimer = { current: schedule() };
    return () => clearTimeout(cascadeTimer.current);
  }, [agents, firePulse]);

  // FULL SYNC EVENT — every 45-65s
  useEffect(() => {
    const delay = 45000 + Math.random() * 20000;
    const timer = setTimeout(() => {
      setFullSync(true);
      const peripherals = agents.filter((a) => a.id !== "ceo");
      peripherals.forEach((a, i) => {
        setTimeout(() => firePulse(a.id, "ceo", a.color), i * 80);
      });
      setTimeout(() => setFullSync(false), 3000);
    }, delay);
    return () => clearTimeout(timer);
  }, [agents, firePulse]);

  // OVERLOAD EVENT — every 55-80s
  useEffect(() => {
    const delay = 55000 + Math.random() * 25000;
    const timer = setTimeout(() => {
      const nonCeo = agents.filter((a) => a.id !== "ceo");
      const target = nonCeo[Math.floor(Math.random() * nonCeo.length)];
      const pos = getPos(target.id);
      setTimeout(() => {
        setShockwave({ x: pos.x, y: pos.y, color: target.color });
        setTimeout(() => setShockwave(null), 2000);
      }, 2500);
    }, delay);
    return () => clearTimeout(timer);
  }, [agents, getPos]);

  const { w, h } = dims;

  return (
    <div ref={ref} className="w-full h-full relative overflow-visible">
      <svg width={w} height={h} className="absolute inset-0">
        <defs>
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="shockwave-glow">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Curved connections with heat */}
        {CONNECTIONS.map(([fromId, toId], idx) => {
          const from = getPos(fromId);
          const to = getPos(toId);
          const connKey = [fromId, toId].sort().join("-");
          const heat = connectionHeat[connKey] || 0;
          const hasActive = pulses.some((p) => (p.from === fromId && p.to === toId) || (p.from === toId && p.to === fromId));
          const fromAgent = agents.find((a) => a.id === fromId);
          const pathD = getBezierPath(from, to, idx);

          return (
            <g key={`conn-${fromId}-${toId}`}>
              {/* Glow path for heated connections */}
              {heat > 0.3 && (
                <>
                  <path d={pathD} fill="none" stroke={fromAgent?.color || "#fff"}
                    strokeWidth={3} filter="url(#pulse-glow)"
                    opacity={heat * 0.2} />
                  {/* Animated dash flow on heated connections */}
                  <motion.path d={pathD} fill="none"
                    stroke={fromAgent?.color || "#fff"}
                    strokeWidth={1.2}
                    strokeDasharray="4 8"
                    opacity={heat * 0.35}
                    animate={{ strokeDashoffset: [0, -24] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                </>
              )}
              {/* Main path */}
              <path d={pathD} fill="none"
                stroke={hasActive ? `rgba(255,255,255,${0.08 + heat * 0.17})` : `rgba(255,255,255,${0.03 + heat * 0.08})`}
                strokeWidth={0.8 + heat * 1.2}
              />
            </g>
          );
        })}

        {/* Light pulses with comet trails along curves */}
        {pulses.map((pulse) => {
          const from = getPos(pulse.from);
          const to = getPos(pulse.to);
          const connIdx = CONNECTIONS.findIndex(([f, t]) => (f === pulse.from && t === pulse.to) || (f === pulse.to && t === pulse.from));
          const pathD = getBezierPath(from, to, connIdx >= 0 ? connIdx : 0);

          return (
            <g key={`pulse-${pulse.id}`}>
              {/* Comet trail — follows the curve path, fades */}
              <motion.path
                d={pathD} fill="none"
                stroke={pulse.color}
                strokeWidth={pulse.isCascade ? 3 : 2}
                filter="url(#pulse-glow)"
                initial={{ pathLength: 0, opacity: 0.6 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {/* Bright core traveling — starts full color, shifts to white, then fades */}
              <motion.circle
                r={pulse.isCascade ? 6 : 5}
                filter="url(#pulse-glow)"
                initial={{ cx: from.x, cy: from.y, opacity: 1, fill: pulse.color }}
                animate={{ cx: to.x, cy: to.y, opacity: [1, 0.8, 0.1], fill: [pulse.color, "#ffffff", pulse.color] }}
                transition={{ duration: 0.6, ease: "easeOut", opacity: { times: [0, 0.4, 1] }, fill: { times: [0, 0.5, 1] } }}
              />
              {/* White hot center */}
              <motion.circle
                r={pulse.isCascade ? 3 : 2}
                fill="white"
                initial={{ cx: from.x, cy: from.y, opacity: 0.95 }}
                animate={{ cx: to.x, cy: to.y, opacity: [1, 0.8, 0.1] }}
                transition={{ duration: 0.5, ease: "easeOut", opacity: { times: [0, 0.4, 1] } }}
              />
            </g>
          );
        })}

        {/* Full sync flash */}
        {fullSync && (
          <motion.rect x={0} y={0} width={w} height={h} fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.04, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}

        {/* Shockwave */}
        {shockwave && (
          <>
            <motion.circle cx={shockwave.x} cy={shockwave.y} fill="none"
              stroke={shockwave.color} strokeWidth={2} filter="url(#shockwave-glow)"
              initial={{ r: 30, opacity: 0.5 }}
              animate={{ r: Math.max(w, h) * 0.6, opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
            />
            <motion.circle cx={shockwave.x} cy={shockwave.y} fill="none"
              stroke="white" strokeWidth={1}
              initial={{ r: 20, opacity: 0.3 }}
              animate={{ r: Math.max(w, h) * 0.5, opacity: 0 }}
              transition={{ duration: 2, delay: 0.1, ease: "easeOut" }}
            />
          </>
        )}

        {/* Agent nodes */}
        {agents.map((a) => {
          const cx = a.x * w;
          const cy = a.y * h;
          const isSel = selectedAgent === a.id;
          const hasImpact = impacts.some((i) => i.agentId === a.id);

          // Activity-based glow intensity
          const recentHeat = Object.entries(connectionHeat)
            .filter(([k]) => k.includes(a.id))
            .reduce((sum, [, v]) => sum + v, 0);
          const activityScale = Math.min(1 + recentHeat * 0.08, 1.1);

          return (
            <g key={a.id} onClick={() => setSelectedAgent(isSel ? null : a.id)} className="cursor-pointer">
              {/* Breathing outer glow — intensity varies with activity */}
              <motion.circle
                cx={cx} cy={cy}
                fill={a.color}
                animate={{
                  r: hasImpact
                    ? [a.size * 1.2, a.size * 1.5, a.size * 1.2]
                    : [a.size * (0.95 + recentHeat * 0.1), a.size * (1.1 + recentHeat * 0.15), a.size * (0.95 + recentHeat * 0.1)],
                  opacity: hasImpact
                    ? [0.12, 0.22, 0.12]
                    : [0.04 + recentHeat * 0.03, 0.09 + recentHeat * 0.05, 0.04 + recentHeat * 0.03],
                }}
                transition={{ duration: hasImpact ? 0.7 : Math.max(2, 5 - recentHeat * 2), repeat: hasImpact ? 1 : Infinity, ease: "easeInOut" }}
              />

              {/* IMPACT ANIMATIONS */}
              {impacts.filter((i) => i.agentId === a.id).map((impact) => (
                <g key={`impact-${impact.id}`}>
                  <motion.circle cx={cx} cy={cy} r={a.size} fill="white"
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.2, ease: "easeOut" }} />
                  <motion.circle cx={cx} cy={cy} fill={impact.color}
                    initial={{ r: a.size * 1.2, opacity: 0 }}
                    animate={{ r: [a.size * 1.2, a.size * 1.8, a.size * 1.3], opacity: [0, 0.25, 0] }}
                    transition={{ duration: 2, ease: "easeOut" }} />
                  <motion.circle cx={cx} cy={cy} fill="none" stroke={impact.color}
                    initial={{ r: a.size, strokeWidth: 1.5, opacity: 0.4 }}
                    animate={{ r: a.size * 3, strokeWidth: 0.3, opacity: 0 }}
                    transition={{ duration: 2.5, ease: [0.0, 0.0, 0.15, 1] }} />
                  <motion.circle cx={cx} cy={cy} fill="none" stroke={impact.color}
                    initial={{ r: a.size, strokeWidth: 1, opacity: 0.25 }}
                    animate={{ r: a.size * 3.5, strokeWidth: 0.2, opacity: 0 }}
                    transition={{ duration: 3, delay: 0.15, ease: [0.0, 0.0, 0.1, 1] }} />
                  {/* Impact micro-particles — scatter outward from impact point */}
                  {getScatterOffsets(impact.id, 5).map((off, pi) => (
                    <motion.circle key={`mp-${impact.id}-${pi}`}
                      r={1} fill={impact.color}
                      initial={{ cx, cy, opacity: 0.9 }}
                      animate={{ cx: cx + off.dx, cy: cy + off.dy, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: pi * 0.03 }}
                    />
                  ))}
                </g>
              ))}

              {/* Selection ring */}
              {isSel && (
                <motion.circle cx={cx} cy={cy} r={a.size + 5} fill="none" stroke={a.color}
                  strokeWidth={1.5} strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }} opacity={0.5} />
              )}

              {/* Main circle — scales slightly with activity */}
              <motion.circle
                cx={cx} cy={cy}
                fill={a.color}
                fillOpacity={hasImpact ? 0.28 : 0.12 + recentHeat * 0.03}
                stroke={a.color}
                strokeWidth={hasImpact ? 2.5 : 1.5 + recentHeat * 0.5}
                strokeOpacity={hasImpact ? 1 : 0.6}
                animate={{
                  r: hasImpact ? [a.size, a.size * 1.12, a.size * 0.97, a.size] : a.size * activityScale,
                }}
                transition={hasImpact ? { duration: 0.8, times: [0, 0.15, 0.4, 1], ease: "easeOut" } : { duration: 1 }}
                style={{ filter: `drop-shadow(0 0 ${hasImpact ? 22 : 10 + recentHeat * 6}px ${a.color}50)`, transformOrigin: `${cx}px ${cy}px` }}
              />

              <circle cx={cx} cy={cy} r={a.size * 0.65} fill="none" stroke={a.color} strokeWidth={0.6} opacity={0.15} />

              <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central"
                fontSize={22} fill={a.color} fontWeight="800"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {a.letter}
              </text>

              <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.6)" fontWeight="500">
                {a.name}
              </text>

              <text x={cx} y={cy + a.size + 16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.25)">
                {a.subtitle}
              </text>

              <text x={cx} y={cy - a.size - 10} textAnchor="middle"
                fontSize={11} fill={hasImpact ? a.color : "rgba(255,255,255,0.35)"} fontWeight="700"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {a.tasks.toLocaleString()}
              </text>

              <circle cx={cx + a.size - 4} cy={cy - a.size + 4} r={5} fill="#0B0B14" />
              <circle cx={cx + a.size - 4} cy={cy - a.size + 4} r={3}
                fill={a.status === "working" ? "#10B981" : a.status === "coordinating" ? "#EAB308" : "#6B7280"} />
              {a.status === "working" && (
                <motion.circle cx={cx + a.size - 4} cy={cy - a.size + 4} r={3}
                  fill="#10B981" animate={{ r: [3, 6, 3], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }} />
              )}

              {/* Orbiting particles — only on working status nodes */}
              {a.status === "working" && ORBIT_PARTICLES.map((op, pi) => {
                const orbitR = a.size * 0.8;
                return (
                  <motion.circle key={`orbit-${a.id}-${pi}`}
                    r={1.5}
                    fill={a.color}
                    fillOpacity={0.6}
                    animate={{
                      cx: [
                        cx + Math.cos(op.offset) * orbitR,
                        cx + Math.cos(op.offset + Math.PI * 0.5) * orbitR,
                        cx + Math.cos(op.offset + Math.PI) * orbitR,
                        cx + Math.cos(op.offset + Math.PI * 1.5) * orbitR,
                        cx + Math.cos(op.offset + Math.PI * 2) * orbitR,
                      ],
                      cy: [
                        cy + Math.sin(op.offset) * orbitR,
                        cy + Math.sin(op.offset + Math.PI * 0.5) * orbitR,
                        cy + Math.sin(op.offset + Math.PI) * orbitR,
                        cy + Math.sin(op.offset + Math.PI * 1.5) * orbitR,
                        cy + Math.sin(op.offset + Math.PI * 2) * orbitR,
                      ],
                    }}
                    transition={{ duration: op.duration, repeat: Infinity, ease: "linear" }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Selected agent detail */}
      <AnimatePresence>
        {selectedAgent && (() => {
          const a = agents.find((x) => x.id === selectedAgent);
          if (!a) return null;

          const CARD_W = 260;
          const CARD_H = 180;
          const OFFSET = a.size + 20;
          const nodeCx = a.x * w;
          const nodeCy = a.y * h;

          // Position card near the node: left/right based on horizontal half, above if near bottom
          const showRight = nodeCx < w / 2;
          const showBelow = nodeCy < h * 0.6;

          const cardLeft = showRight ? nodeCx + OFFSET : nodeCx - OFFSET - CARD_W;
          const cardTop = showBelow ? nodeCy - CARD_H * 0.3 : nodeCy - CARD_H + CARD_H * 0.3;

          // Clamp to container bounds
          const clampedLeft = Math.max(8, Math.min(cardLeft, w - CARD_W - 8));
          const clampedTop = Math.max(8, Math.min(cardTop, h - CARD_H - 8));

          // Connection line: from node center to nearest card edge
          const cardCenterX = clampedLeft + CARD_W / 2;
          const cardCenterY = clampedTop + CARD_H / 2;
          const lineEndX = showRight ? clampedLeft : clampedLeft + CARD_W;
          const lineEndY = Math.max(clampedTop, Math.min(nodeCy, clampedTop + CARD_H));

          return (
            <>
              {/* Click-outside overlay to dismiss */}
              <motion.div
                key="card-overlay"
                className="absolute inset-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAgent(null)}
              />

              {/* Connection line from node to card */}
              <svg
                key="card-connector"
                className="absolute inset-0 z-20 pointer-events-none"
                width={w}
                height={h}
              >
                <motion.line
                  x1={nodeCx} y1={nodeCy} x2={lineEndX} y2={lineEndY}
                  stroke={a.color}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
                {/* Small circle at the card connection point */}
                <motion.circle
                  cx={lineEndX} cy={lineEndY} r={3}
                  fill={a.color}
                  fillOpacity={0.3}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </svg>

              <motion.div
                key="agent-card"
                className="absolute z-20 rounded-xl p-4 shadow-2xl border"
                style={{
                  left: clampedLeft,
                  top: clampedTop,
                  width: CARD_W,
                  backgroundColor: "rgba(15,15,25,0.92)",
                  backdropFilter: "blur(16px)",
                  borderColor: `${a.color}30`,
                  boxShadow: `0 0 20px ${a.color}15, 0 8px 32px rgba(0,0,0,0.4)`,
                }}
                initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{
                  duration: 0.25,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
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
                <div className="mt-3 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] text-emerald-400/70 font-mono">ERC-8004 verified</span>
                    </div>
                    {reputation && (
                      <span className="text-[10px] text-white/20 font-mono">
                        #{SQUAD_CONFIG.agentId}
                      </span>
                    )}
                  </div>
                  {reputation && (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-amber-400">{reputation.averageScore}</span>
                        <span className="text-[9px] text-white/25">/100</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-white/35">{reputation.feedbackCount} reviews</span>
                      </div>
                      <a
                        href={`${SQUAD_CONFIG.explorerUrl}/address/${SQUAD_CONFIG.reputationRegistry}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-violet-400/50 hover:text-violet-400 transition-colors ml-auto font-mono"
                        onClick={(e) => e.stopPropagation()}
                      >
                        verify ↗
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
