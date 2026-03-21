"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// --- Squad nodes positioned on Argentina's geography ---
interface Squad {
  id: string;
  name: string;
  city: string;
  type: string;
  agents: number;
  revenue: string;
  reputation: number;
  x: number; // 0-1 relative to map
  y: number;
  color: string;
}

// City positions in raw SVG coordinates (same coordinate system as the Argentina path)
// Calculated from lat/lon: x = 605 + (73.6 - lon) / 20 * 75, y = 708 + (lat - 21.8) / 33.3 * 225
const SQUADS: Squad[] = [
  { id: "mendoza", name: "Andes Vineyard", city: "Mendoza", type: "Winery — Malbec & Olive Oil", agents: 5, revenue: "$3,400", reputation: 95, x: 623, y: 783, color: "#10B981" },
  { id: "salta", name: "Altura Wines", city: "Salta", type: "Boutique Winery — Torrontés", agents: 4, revenue: "$2,100", reputation: 94, x: 636, y: 731, color: "#F97316" },
  { id: "tucuman", name: "Norte Citrus Co.", city: "Tucumán", type: "Citrus Processing — Lemons", agents: 4, revenue: "$1,800", reputation: 91, x: 641, y: 745, color: "#EC4899" },
  { id: "cordoba", name: "Estancia Meats", city: "Córdoba", type: "Cured Meats & Artisan Cheese", agents: 4, revenue: "$1,500", reputation: 88, x: 640, y: 774, color: "#06B6D4" },
  { id: "rosario", name: "Central Logistics", city: "Rosario", type: "Logistics Hub — Consolidation", agents: 6, revenue: "$5,800", reputation: 96, x: 654, y: 783, color: "#8B5CF6" },
  { id: "bsas", name: "Buenos Table", city: "Buenos Aires", type: "Farm-to-Table Restaurant", agents: 7, revenue: "$8,200", reputation: 97, x: 662, y: 795, color: "#EAB308" },
];

// --- Supply chain connections (real commercial relationships) ---
interface Connection {
  from: string;
  to: string;
  label: string;
  type: "supply" | "service" | "referral";
}

const CONNECTIONS: Connection[] = [
  // Wine route
  { from: "mendoza", to: "rosario", label: "Malbec & olive oil shipment", type: "supply" },
  { from: "salta", to: "rosario", label: "Torrontés high-altitude crates", type: "supply" },
  // Food route
  { from: "tucuman", to: "rosario", label: "Meyer lemons & grapefruit", type: "supply" },
  { from: "cordoba", to: "rosario", label: "Salame, bondiola & artisan cheese", type: "supply" },
  // Hub to restaurant
  { from: "rosario", to: "bsas", label: "Consolidated weekly delivery", type: "supply" },
  // Proactive AI-to-AI coordination
  { from: "bsas", to: "rosario", label: "Demand forecast & menu changes", type: "service" },
  { from: "rosario", to: "mendoza", label: "Stock alert & reorder trigger", type: "service" },
  { from: "rosario", to: "salta", label: "Quality report request", type: "service" },
];

// --- Inter-squad task templates ---
const TASK_TEMPLATES = [
  // Proactive AI-to-AI coordination
  { from: "bsas", to: "rosario", action: "Saturday reservations +40% — requesting extra wine allocation" },
  { from: "rosario", to: "mendoza", action: "Buenos Table needs 15 cases Malbec by Thursday — confirming stock" },
  { from: "mendoza", to: "rosario", action: "Malbec Reserva confirmed — shipping Wednesday AM" },
  { from: "rosario", to: "salta", action: "Torrontés stock low — requesting quality report on new batch" },
  { from: "salta", to: "rosario", action: "New Torrontés batch: 14.2% ABV, floral notes — ideal for seafood pairing" },
  { from: "tucuman", to: "rosario", action: "Meyer lemon harvest quality: Grade A — 200kg ready to ship" },
  { from: "cordoba", to: "rosario", action: "Artisan salame cured 45 days — 30kg dispatched with cheese" },
  { from: "rosario", to: "bsas", action: "Consolidated shipment: wine route + food route — ETA Friday 6AM" },
  { from: "bsas", to: "rosario", action: "Menu change: replacing citrus dessert with cheese board — adjust order" },
  { from: "rosario", to: "tucuman", action: "Buenos Table reduced lemon order — hold 50kg for next week" },
  { from: "rosario", to: "cordoba", action: "Increase cheese allocation +5kg — Buenos Table added cheese board to menu" },
  { from: "mendoza", to: "rosario", action: "Frost alert: Cabernet delayed 1 week — suggesting Bonarda as substitute" },
  { from: "rosario", to: "bsas", action: "Cabernet unavailable — Andes Vineyard suggests Bonarda, similar profile. Approve?" },
  { from: "bsas", to: "rosario", action: "Bonarda approved — updating wine pairing menu and Instagram post" },
];

const CONNECTION_COLORS: Record<string, string> = {
  supply: "#8B5CF6",
  service: "#EC4899",
  referral: "#10B981",
};

interface Pulse {
  id: number;
  from: string;
  to: string;
  color: string;
  label: string;
}

let pulseCounter = 0;

// Real Argentina outline from world-map-country-shapes (viewBox origin ~619,712 size ~62x216)
// We transform it to fit our SVG by mapping to relative coords
const ARGENTINA_RAW = "M669.8 920.7l.9-3-7.3-1.5-7.7-3.6-4.3-4.6-3-2.8 5.9 13.5h5l2.9.2 3.3 2.1 4.3-.3z M619.4 712.6l-7.4-1.5-4 5.7.9 1.6-1.1 6.6-5.6 3.2 1.6 10.6-.9 2 2 2.5-3.2 4-2.6 5.9-.9 5.8 1.7 6.2-2.1 6.5 4.9 10.9 1.6 1.2 1.3 5.9-1.6 6.2 1.4 5.4-2.9 4.3 1.5 5.9 3.3 6.3-2.5 2.4.3 5.7.7 6.4 3.3 7.6-1.6 1.2 3.6 7.1 3.1 2.3-.8 2.6 2.8 1.3 1.3 2.3-1.8 1.1 1.8 3.7 1.1 8.2-.7 5.3 1.8 3.2-.1 3.9-2.7 2.7 3.1 6.6 2.6 2.2 3.1-.4 1.8 4.6 3.5 3.6 12 .8 4.8.9 2.2.4-4.7-3.6-4.1-6.3.9-2.9 3.5-2.5.5-7.2 4.7-3.5-.2-5.6-5.2-1.3-6.4-4.5-.1-4.7 2.9-3.1 4.7-.1.2-3.3-1.2-6.1 2.9-3.9 4.1-1.9-2.5-3.2-2.2 2-4-1.9-2.5-6.2 1.5-1.6 5.6 2.3 5-.9 2.5-2.2-1.8-3.1-.1-4.8-2-3.8 5.8.6 10.2-1.3 6.9-3.4 3.3-8.3-.3-3.2-3.9-2.8-.1-4.5-7.8-5.5-.3-3.3-.4-4.2.9-1.4-1.1-6.3.3-6.5.5-5.1 5.9-8.6 5.3-6.2 3.3-2.6 4.2-3.5-.5-5.1-3.1-3.7-2.6 1.2-.3 5.7-4.3 4.8-4.2 1.1-6.2-1-5.7-1.8 4.2-9.6-1.1-2.8-5.9-2.5-7.2-4.7-4.6-1-11.2-10.4-1-1.3-6.3-.3-1.6 5.1-3.7-4.6";
// Bounding box of the raw path: x=605..680, y=710..930
const ARG_BBOX = { x: 605, y: 708, w: 75, h: 225 };

export default function ArgentinaNetwork() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 700 });
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [activeConnection, setActiveConnection] = useState<string | null>(null);
  const [taskLog, setTaskLog] = useState<{ id: number; text: string; from: string; to: string; time: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const up = () => {
      if (ref.current) setDims({ w: ref.current.offsetWidth, h: ref.current.offsetHeight });
    };
    up();
    window.addEventListener("resize", up);
    return () => window.removeEventListener("resize", up);
  }, []);

  // Scale Argentina to fill 95% of container height, centered horizontally
  const getMapTransform = useCallback(() => {
    const targetH = dims.h * 0.95;
    const scale = targetH / ARG_BBOX.h;
    const offsetX = (dims.w - ARG_BBOX.w * scale) / 2;
    const offsetY = (dims.h - ARG_BBOX.h * scale) / 2;
    return { scale, offsetX, offsetY };
  }, [dims]);

  const getPos = useCallback(
    (id: string) => {
      const s = SQUADS.find((sq) => sq.id === id);
      if (!s) return { x: 0, y: 0 };
      const { scale, offsetX, offsetY } = getMapTransform();
      return {
        x: offsetX + (s.x - ARG_BBOX.x) * scale,
        y: offsetY + (s.y - ARG_BBOX.y) * scale,
      };
    },
    [getMapTransform]
  );

  // Fire inter-squad pulses
  const firePulse = useCallback(() => {
    const template = TASK_TEMPLATES[Math.floor(Math.random() * TASK_TEMPLATES.length)];
    const conn = CONNECTIONS.find((c) => c.from === template.from && c.to === template.to);
    const color = conn ? CONNECTION_COLORS[conn.type] : "#fff";

    pulseCounter++;
    const pulse: Pulse = { id: pulseCounter, from: template.from, to: template.to, color, label: template.action };
    setPulses((prev) => [...prev.slice(-8), pulse]);
    setActiveConnection(`${template.from}-${template.to}`);

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setTaskLog((prev) => [{ id: pulseCounter, text: template.action, from: template.from, to: template.to, time }, ...prev].slice(0, 12));

    setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== pulse.id));
      setActiveConnection(null);
    }, 1800);
  }, []);

  useEffect(() => {
    function scheduleNext() {
      const delay = 1500 + Math.random() * 3000;
      timerRef.current = setTimeout(() => {
        firePulse();
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [firePulse]);

  const { w, h } = dims;

  // Bezier control point for curved connections
  function getCurveCP(from: { x: number; y: number }, to: { x: number; y: number }, idx: number) {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const offset = (idx % 2 === 0 ? 1 : -1) * 0.15;
    return { x: mx - dy * offset, y: my + dx * offset };
  }

  return (
    <div ref={ref} className="w-full h-full relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

      {/* Title */}
      <div className="absolute top-4 left-5 z-20">
        <h2 className="text-[11px] text-white/45 uppercase tracking-wider">Supply Chain Network</h2>
        <p className="text-[10px] text-white/15 mt-0.5">Live inter-squad coordination across Argentina</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-5 z-20 flex gap-4">
        {[
          { label: "Supply", color: "#8B5CF6" },
          { label: "Service", color: "#EC4899" },
          { label: "Referral", color: "#10B981" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-white/30">{l.label}</span>
          </div>
        ))}
      </div>

      <svg width={w} height={h} className="absolute inset-0">
        <defs>
          <filter id="net-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="city-glow">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Argentina outline — real geography */}
        {(() => {
          const { scale, offsetX, offsetY } = getMapTransform();
          return (
            <g transform={`translate(${offsetX - ARG_BBOX.x * scale}, ${offsetY - ARG_BBOX.y * scale}) scale(${scale})`}>
              <path d={ARGENTINA_RAW} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5 / scale} />
            </g>
          );
        })()}

        {/* Connections */}
        {CONNECTIONS.map((conn, idx) => {
          const from = getPos(conn.from);
          const to = getPos(conn.to);
          const cp = getCurveCP(from, to, idx);
          const pathD = `M ${from.x} ${from.y} Q ${cp.x} ${cp.y} ${to.x} ${to.y}`;
          const isActive = activeConnection === `${conn.from}-${conn.to}`;
          const color = CONNECTION_COLORS[conn.type];

          return (
            <g key={`conn-${conn.from}-${conn.to}`}>
              <path d={pathD} fill="none" stroke={color} strokeWidth={isActive ? 1.5 : 0.6} opacity={isActive ? 0.5 : 0.12} />
              {isActive && (
                <>
                  <path d={pathD} fill="none" stroke={color} strokeWidth={3} filter="url(#net-glow)" opacity={0.2} />
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    strokeDasharray="4 8"
                    opacity={0.4}
                    animate={{ strokeDashoffset: [0, -24] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Pulses traveling along connections */}
        {pulses.map((pulse) => {
          const from = getPos(pulse.from);
          const to = getPos(pulse.to);
          const connIdx = CONNECTIONS.findIndex((c) => c.from === pulse.from && c.to === pulse.to);
          const cp = getCurveCP(from, to, connIdx >= 0 ? connIdx : 0);
          const pathD = `M ${from.x} ${from.y} Q ${cp.x} ${cp.y} ${to.x} ${to.y}`;

          return (
            <g key={`pulse-${pulse.id}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={pulse.color}
                strokeWidth={2}
                filter="url(#net-glow)"
                initial={{ pathLength: 0, opacity: 0.7 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <motion.circle
                r={7}
                fill={pulse.color}
                filter="url(#net-glow)"
                initial={{ cx: from.x, cy: from.y, opacity: 1 }}
                animate={{ cx: to.x, cy: to.y, opacity: [1, 0.8, 0.2] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <motion.circle r={3} fill="white" initial={{ cx: from.x, cy: from.y, opacity: 0.9 }} animate={{ cx: to.x, cy: to.y, opacity: [1, 0.7, 0] }} transition={{ duration: 1.3, ease: "easeOut" }} />
            </g>
          );
        })}

        {/* Squad nodes */}
        {SQUADS.map((squad) => {
          const pos = getPos(squad.id);
          const cx = pos.x;
          const cy = pos.y;
          return (
            <g key={squad.id} onClick={() => router.push(`/dashboard?squad=${squad.id}`)} className="cursor-pointer">
              {/* Ambient glow */}
              <circle cx={cx} cy={cy} r={50} fill={squad.color} opacity={0.08} filter="url(#city-glow)" />

              {/* Breathing ring */}
              <motion.circle
                cx={cx}
                cy={cy}
                fill="none"
                stroke={squad.color}
                strokeWidth={1.5}
                animate={{ r: [30, 36, 30], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main dot */}
              <circle cx={cx} cy={cy} r={20} fill={squad.color} fillOpacity={0.15} stroke={squad.color} strokeWidth={2} strokeOpacity={0.6} style={{ filter: `drop-shadow(0 0 14px ${squad.color}50)` }} />
              <circle cx={cx} cy={cy} r={7} fill={squad.color} opacity={0.9} />

              {/* Labels: business name big, city small */}
              <text x={cx} y={cy - 30} textAnchor="middle" fontSize={13} fill={squad.color} fontWeight="700" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {squad.name}
              </text>
              <text x={cx} y={cy + 36} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.3)">
                {squad.city}
              </text>

              {/* Status dot */}
              <circle cx={cx + 16} cy={cy - 16} r={5} fill="#0B0B14" />
              <circle cx={cx + 16} cy={cy - 16} r={3} fill="#10B981" />
              <motion.circle cx={cx + 16} cy={cy - 16} r={3} fill="#10B981" animate={{ r: [3, 6, 3], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
            </g>
          );
        })}
      </svg>

      {/* Live task log — always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#08080F] via-[#08080F]/95 to-transparent pt-6">
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Inter-Squad Activity</span>
          </div>
          <div className="space-y-1 max-h-[120px] overflow-hidden">
            {taskLog.slice(0, 4).map((task, i) => {
              const fromSquad = SQUADS.find((s) => s.id === task.from);
              const toSquad = SQUADS.find((s) => s.id === task.to);
              return (
                <motion.div
                  key={task.id}
                  initial={i === 0 ? { opacity: 0, y: -8 } : false}
                  animate={{ opacity: 1 - i * 0.25, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-[10px] text-white/15 font-mono shrink-0 mt-0.5">{task.time}</span>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: fromSquad?.color }} />
                    <span className="text-[9px] text-white/20">→</span>
                    <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: toSquad?.color }} />
                  </div>
                  <span className="text-[11px] text-white/40 truncate">{task.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
