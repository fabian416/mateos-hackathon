"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "./ParticleField";

interface Agent {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  activity: number;
  tasks: number;
  status: "working" | "idle" | "coordinating";
}

interface Connection {
  from: string;
  to: string;
  active: boolean;
  intensity: number;
}

const AGENTS_INIT: Agent[] = [
  { id: "ceo", name: "El CEO", subtitle: "Coordination", color: "#C4A35A", x: 0.5, y: 0.36, radius: 42, activity: 0.9, tasks: 247, status: "coordinating" },
  { id: "baqueano", name: "El Baqueano", subtitle: "WhatsApp", color: "#2D5A3D", x: 0.26, y: 0.18, radius: 38, activity: 0.95, tasks: 1842, status: "working" },
  { id: "tropero", name: "El Tropero", subtitle: "Billing", color: "#6366F1", x: 0.74, y: 0.18, radius: 35, activity: 0.7, tasks: 631, status: "working" },
  { id: "domador", name: "El Domador", subtitle: "Scheduling", color: "#8B5CF6", x: 0.18, y: 0.56, radius: 34, activity: 0.85, tasks: 924, status: "working" },
  { id: "rastreador", name: "El Rastreador", subtitle: "Outreach", color: "#06B6D4", x: 0.82, y: 0.56, radius: 32, activity: 0.6, tasks: 456, status: "idle" },
  { id: "paisano", name: "El Paisano", subtitle: "Social", color: "#EC4899", x: 0.34, y: 0.78, radius: 30, activity: 0.75, tasks: 312, status: "working" },
  { id: "relator", name: "El Relator", subtitle: "Content", color: "#F59E0B", x: 0.66, y: 0.78, radius: 30, activity: 0.65, tasks: 189, status: "working" },
];

const CONNECTIONS_INIT: Connection[] = [
  { from: "ceo", to: "baqueano", active: true, intensity: 0.8 },
  { from: "ceo", to: "tropero", active: true, intensity: 0.7 },
  { from: "ceo", to: "domador", active: true, intensity: 0.9 },
  { from: "ceo", to: "rastreador", active: false, intensity: 0.3 },
  { from: "ceo", to: "paisano", active: true, intensity: 0.6 },
  { from: "ceo", to: "relator", active: true, intensity: 0.5 },
  { from: "baqueano", to: "domador", active: true, intensity: 0.85 },
  { from: "baqueano", to: "tropero", active: true, intensity: 0.7 },
  { from: "paisano", to: "relator", active: true, intensity: 0.9 },
  { from: "rastreador", to: "tropero", active: false, intensity: 0.2 },
  { from: "domador", to: "paisano", active: true, intensity: 0.4 },
  { from: "relator", to: "rastreador", active: false, intensity: 0.15 },
];

// Activity events that fire and light up specific agents
const EVENTS = [
  { agentId: "baqueano", text: "Respondio WhatsApp: \"Mesa para 4 confirmada\"" },
  { agentId: "tropero", text: "Cobro recibido: $45 USDC" },
  { agentId: "domador", text: "Turno agendado: Sab 15hs" },
  { agentId: "paisano", text: "Post en Instagram publicado" },
  { agentId: "baqueano", text: "Consulta resuelta en 1.8s" },
  { agentId: "ceo", text: "Reporte generado — revenue +18%" },
  { agentId: "relator", text: "Newsletter enviado a 340 subs" },
  { agentId: "tropero", text: "Factura #1847 enviada" },
  { agentId: "rastreador", text: "3 nuevos leads encontrados" },
  { agentId: "domador", text: "Recordatorio enviado: turno manana" },
  { agentId: "baqueano", text: "Reclamo resuelto: pedido corregido" },
  { agentId: "ceo", text: "Reasigno rastreador a nueva campana" },
];

// Traveling data packet on a connection
function DataPacket({ x1, y1, x2, y2, color, delay }: { x1: number; y1: number; x2: number; y2: number; color: string; delay: number }) {
  return (
    <>
      {/* Main packet */}
      <motion.circle
        r={3}
        fill={color}
        animate={{
          cx: [x1, x2],
          cy: [y1, y2],
          opacity: [0, 0.9, 0.9, 0],
        }}
        transition={{
          duration: 1.8 + Math.random() * 1.5,
          delay,
          repeat: Infinity,
          repeatDelay: 2 + Math.random() * 4,
          ease: "easeInOut",
        }}
      />
      {/* Packet trail */}
      <motion.circle
        r={6}
        fill={color}
        opacity={0.15}
        filter="url(#soft-blur)"
        animate={{
          cx: [x1, x2],
          cy: [y1, y2],
          opacity: [0, 0.2, 0.2, 0],
        }}
        transition={{
          duration: 1.8 + Math.random() * 1.5,
          delay: delay + 0.1,
          repeat: Infinity,
          repeatDelay: 2 + Math.random() * 4,
          ease: "easeInOut",
        }}
      />
    </>
  );
}

export default function AgentNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 560 });
  const [agents, setAgents] = useState(AGENTS_INIT);
  const [connections, setConnections] = useState(CONNECTIONS_INIT);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<{ agentId: string; text: string } | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Simulate activity — fire events that light up agents
  useEffect(() => {
    const interval = setInterval(() => {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setActiveEvent(event);

      // Update agent activity + tasks
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          activity: a.id === event.agentId
            ? Math.min(1, a.activity + 0.15)
            : Math.max(0.2, a.activity - 0.03),
          tasks: a.id === event.agentId ? a.tasks + 1 : a.tasks,
        }))
      );

      // Toggle some connections
      setConnections((prev) =>
        prev.map((c) => ({
          ...c,
          active: c.from === event.agentId || c.to === event.agentId ? true : Math.random() > 0.25,
          intensity: c.from === event.agentId || c.to === event.agentId
            ? Math.min(1, c.intensity + 0.2)
            : Math.max(0.1, c.intensity - 0.05),
        }))
      );

      setTimeout(() => setActiveEvent(null), 2000);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const { width, height } = dimensions;

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {/* Canvas particle field background */}
      <ParticleField />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />

      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          {agents.map((agent) => (
            <radialGradient key={`glow-${agent.id}`} id={`glow-${agent.id}`}>
              <stop offset="0%" stopColor={agent.color} stopOpacity={0.35} />
              <stop offset="50%" stopColor={agent.color} stopOpacity={0.08} />
              <stop offset="100%" stopColor={agent.color} stopOpacity={0} />
            </radialGradient>
          ))}
          <filter id="soft-blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Connections */}
        {connections.map((conn) => {
          const from = agents.find((a) => a.id === conn.from);
          const to = agents.find((a) => a.id === conn.to);
          if (!from || !to) return null;

          const x1 = from.x * width;
          const y1 = from.y * height;
          const x2 = to.x * width;
          const y2 = to.y * height;

          const isEventConn = activeEvent && (conn.from === activeEvent.agentId || conn.to === activeEvent.agentId);

          return (
            <g key={`${conn.from}-${conn.to}`}>
              {/* Glow line */}
              <motion.line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={from.color}
                strokeWidth={isEventConn ? 4 : 2}
                filter="url(#soft-blur)"
                animate={{ opacity: conn.active ? conn.intensity * 0.35 : 0.02 }}
                transition={{ duration: 0.6 }}
              />
              {/* Main line */}
              <motion.line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={conn.active ? from.color : "rgba(255,255,255,0.03)"}
                strokeWidth={conn.active ? 1 : 0.5}
                strokeDasharray={conn.active ? "none" : "4 10"}
                animate={{ opacity: conn.active ? conn.intensity * 0.5 : 0.06 }}
                transition={{ duration: 0.6 }}
              />
              {/* Data packets traveling on active connections */}
              {conn.active && conn.intensity > 0.4 && (
                <DataPacket
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  color={from.color}
                  delay={Math.random() * 3}
                />
              )}
              {/* Reverse packet occasionally */}
              {conn.active && conn.intensity > 0.6 && (
                <DataPacket
                  x1={x2} y1={y2} x2={x1} y2={y1}
                  color={to.color}
                  delay={1.5 + Math.random() * 3}
                />
              )}
            </g>
          );
        })}

        {/* Agent nodes */}
        {agents.map((agent) => {
          const cx = agent.x * width;
          const cy = agent.y * height;
          const isEventAgent = activeEvent?.agentId === agent.id;
          const isSelected = selectedAgent === agent.id;
          const glowSize = agent.radius * (2 + agent.activity * 2);

          return (
            <g
              key={agent.id}
              onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
              className="cursor-pointer"
            >
              {/* Outer ambient glow — breathes */}
              <motion.circle
                cx={cx} cy={cy}
                fill={`url(#glow-${agent.id})`}
                animate={{
                  r: [glowSize, glowSize * 1.12, glowSize],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Event flash — big pulse when agent does something */}
              {isEventAgent && (
                <>
                  <motion.circle
                    cx={cx} cy={cy}
                    r={agent.radius}
                    fill="none"
                    stroke={agent.color}
                    strokeWidth={2}
                    initial={{ r: agent.radius, opacity: 0.9 }}
                    animate={{ r: agent.radius * 3, opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx={cx} cy={cy}
                    r={agent.radius}
                    fill="none"
                    stroke={agent.color}
                    strokeWidth={1}
                    initial={{ r: agent.radius * 1.5, opacity: 0.5 }}
                    animate={{ r: agent.radius * 4, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.15 }}
                  />
                </>
              )}

              {/* Selection ring */}
              {isSelected && (
                <motion.circle
                  cx={cx} cy={cy}
                  r={agent.radius + 5}
                  fill="none"
                  stroke={agent.color}
                  strokeWidth={1}
                  strokeDasharray="5 4"
                  animate={{ strokeDashoffset: [0, -18] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Outer ring — subtle */}
              <circle
                cx={cx} cy={cy} r={agent.radius}
                fill="none"
                stroke={agent.color}
                strokeWidth={1.5}
                opacity={0.4}
              />

              {/* Inner fill — opacity tied to activity */}
              <motion.circle
                cx={cx} cy={cy}
                r={agent.radius - 1}
                fill={agent.color}
                animate={{
                  opacity: isEventAgent ? 0.25 : 0.06 + agent.activity * 0.12,
                }}
                transition={{ duration: isEventAgent ? 0.2 : 0.8 }}
              />

              {/* Inner subtle ring for depth */}
              <circle
                cx={cx} cy={cy}
                r={agent.radius * 0.65}
                fill="none"
                stroke={agent.color}
                strokeWidth={0.5}
                opacity={0.15}
              />

              {/* Agent initial letter */}
              <text
                x={cx} y={cy - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fill={agent.color}
                fontWeight="bold"
                fontFamily="var(--font-jetbrains-mono)"
                opacity={0.9}
              >
                {agent.name.split(" ")[1]?.[0] || "?"}
              </text>

              {/* Agent name */}
              <text
                x={cx} y={cy + 12}
                textAnchor="middle"
                fontSize={9}
                fill="rgba(255,255,255,0.55)"
                fontFamily="var(--font-sans)"
              >
                {agent.name}
              </text>

              {/* Subtitle */}
              <text
                x={cx} y={cy + 22}
                textAnchor="middle"
                fontSize={7}
                fill="rgba(255,255,255,0.25)"
                fontFamily="var(--font-sans)"
              >
                {agent.subtitle}
              </text>

              {/* Status dot with glow */}
              <circle
                cx={cx + agent.radius - 6}
                cy={cy - agent.radius + 6}
                r={5}
                fill={agent.status === "working" ? "#22c55e" : agent.status === "coordinating" ? "#C4A35A" : "#4b5563"}
                opacity={0.8}
              />
              <circle
                cx={cx + agent.radius - 6}
                cy={cy - agent.radius + 6}
                r={3}
                fill={agent.status === "working" ? "#22c55e" : agent.status === "coordinating" ? "#C4A35A" : "#6b7280"}
              />
            </g>
          );
        })}
      </svg>

      {/* Event toast — shows what the agent just did */}
      <AnimatePresence>
        {activeEvent && (() => {
          const agent = agents.find((a) => a.id === activeEvent.agentId);
          if (!agent) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: -10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -10, x: "-50%" }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 left-1/2 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3 max-w-sm"
              style={{ borderColor: `${agent.color}33` }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}` }}
              />
              <div>
                <span className="text-[10px] font-semibold" style={{ color: agent.color }}>
                  {agent.name}
                </span>
                <p className="text-xs text-white/60 mt-0.5">{activeEvent.text}</p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Selected agent detail card */}
      <AnimatePresence>
        {selectedAgent && (() => {
          const agent = agents.find((a) => a.id === selectedAgent);
          if (!agent) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 max-w-xs"
              style={{ borderColor: `${agent.color}33` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${agent.color}22`, color: agent.color }}
                >
                  {agent.name.split(" ")[1]?.[0] || "A"}
                </div>
                <div>
                  <div className="font-bold text-sm">{agent.name}</div>
                  <div className="text-xs text-white/40">{agent.subtitle}</div>
                </div>
                <div
                  className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: agent.status === "working" ? "#22c55e18" : agent.status === "coordinating" ? "#C4A35A18" : "#6b728018",
                    color: agent.status === "working" ? "#22c55e" : agent.status === "coordinating" ? "#C4A35A" : "#6b7280",
                  }}
                >
                  {agent.status}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold" style={{ color: agent.color }}>
                    {agent.tasks.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-white/30">Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: agent.color }}>
                    {(agent.activity * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-white/30">Activity</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">99.8%</div>
                  <div className="text-[10px] text-white/30">Uptime</div>
                </div>
              </div>
              {/* ERC-8004 badge */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1l2.5 5.5L18 7.5l-4 4.5L15 18l-5-3-5 3 1-6L2 7.5l5.5-1L10 1z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] text-white/30 font-mono">ERC-8004 verified</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Title */}
      <div className="absolute top-4 left-5">
        <h2 className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Agent Network</h2>
        <p className="text-white/15 text-[9px] mt-0.5">Click an agent to inspect</p>
      </div>
    </div>
  );
}
