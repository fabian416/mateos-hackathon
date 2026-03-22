"use client";

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import TopNav from "@/components/ui/TopNav";

const AGENT_META: Record<string, { name: string; subtitle: string; color: string }> = {
  baqueano: { name: "ChatGod", subtitle: "WhatsApp Support", color: "#10B981" },
  domador: { name: "CalendApe", subtitle: "Scheduling", color: "#A855F7" },
  tropero: { name: "BagChaser", subtitle: "Billing", color: "#8B5CF6" },
  paisano: { name: "PostMalone", subtitle: "Social Media", color: "#EC4899" },
  relator: { name: "HypeSmith", subtitle: "Content", color: "#F97316" },
  rastreador: { name: "DM Sniper", subtitle: "Outreach", color: "#06B6D4" },
  ceo: { name: "OpsChad", subtitle: "Coordination", color: "#EAB308" },
};

function DeployContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessName = searchParams.get("name") || "Mi Negocio";
  const agentIds = (searchParams.get("agents") || "baqueano,domador,tropero").split(",");

  const [phase, setPhase] = useState(0); // 0: init, 1: deploying agents, 2: connecting, 3: online, 4: redirect
  const [deployedAgents, setDeployedAgents] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    // Phase 0 → 1: start deploying
    const t0 = setTimeout(() => setPhase(1), 800);

    // Deploy agents one by one
    agentIds.forEach((id, i) => {
      setTimeout(() => {
        setDeployedAgents((prev) => [...prev, id]);
      }, 1200 + i * 900);
    });

    // Phase 1 → 2: connecting
    const t2 = setTimeout(() => setPhase(2), 1200 + agentIds.length * 900 + 600);

    // Phase 2 → 3: ERC-8004 registration
    const t3 = setTimeout(() => {
      setRegistering(true);
      setPhase(3);
    }, 1200 + agentIds.length * 900 + 2000);

    // Phase 3 → 4: done, redirect
    const t4 = setTimeout(() => {
      setPhase(4);
    }, 1200 + agentIds.length * 900 + 4000);

    const t5 = setTimeout(() => {
      router.push("/dashboard");
    }, 1200 + agentIds.length * 900 + 5500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [agentIds, router]);

  // Calculate positions in a circle
  const centerX = 50; // percentage
  const centerY = 45;
  const orbitRadius = 28;
  const agentPositions = agentIds.map((_, i) => {
    const angle = (i / agentIds.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * orbitRadius,
      y: centerY + Math.sin(angle) * orbitRadius,
    };
  });

  return (
    <div
      className="min-h-screen text-text-inverse flex flex-col relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #111130 0%, #0a0a14 70%)",
      }}
    >
      <TopNav />
      <div className="flex-1 flex flex-col items-center justify-center">
      {/* Background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.05, 0.2, 0.05],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main deploy visualization */}
      <div className="relative w-full max-w-[85vw] sm:max-w-lg aspect-square">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            {agentIds.map((id) => {
              const meta = AGENT_META[id];
              return (
                <radialGradient key={`g-${id}`} id={`deploy-glow-${id}`}>
                  <stop offset="0%" stopColor={meta?.color || "#fff"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={meta?.color || "#fff"} stopOpacity={0} />
                </radialGradient>
              );
            })}
          </defs>

          {/* Connection lines (appear in phase 2+) */}
          {phase >= 2 && agentPositions.map((pos, i) => (
            <motion.line
              key={`conn-${i}`}
              x1={centerX} y1={centerY}
              x2={pos.x} y2={pos.y}
              stroke={AGENT_META[agentIds[i]]?.color || "#fff"}
              strokeWidth={0.3}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            />
          ))}

          {/* Cross-connections between agents (appear in phase 2+) */}
          {phase >= 2 && agentPositions.map((pos, i) => {
            const nextIdx = (i + 1) % agentPositions.length;
            const next = agentPositions[nextIdx];
            return (
              <motion.line
                key={`cross-${i}`}
                x1={pos.x} y1={pos.y}
                x2={next.x} y2={next.y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={0.2}
                strokeDasharray="1 2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
              />
            );
          })}

          {/* Center node — business name */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <circle cx={centerX} cy={centerY} r={8} fill="rgba(196,163,90,0.15)" stroke="#C4A35A" strokeWidth={0.6} />
                <text x={centerX} y={centerY + 1} textAnchor="middle" fontSize={3} fill="#C4A35A" fontWeight="bold">
                  {businessName.length > 12 ? businessName.substring(0, 12) + "..." : businessName}
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Agent nodes — appear one by one */}
          {agentIds.map((id, i) => {
            const meta = AGENT_META[id];
            const pos = agentPositions[i];
            const isDeployed = deployedAgents.includes(id);

            if (!meta) return null;

            return (
              <AnimatePresence key={id}>
                {isDeployed && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    {/* Glow */}
                    <motion.circle
                      cx={pos.x} cy={pos.y} r={8}
                      fill={`url(#deploy-glow-${id})`}
                      animate={{ r: [7, 9, 7], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    {/* Ring */}
                    <circle cx={pos.x} cy={pos.y} r={5} fill="none" stroke={meta.color} strokeWidth={0.5} opacity={0.6} />
                    {/* Fill */}
                    <circle cx={pos.x} cy={pos.y} r={4.5} fill={meta.color} opacity={0.15} />
                    {/* Initial letter */}
                    <text x={pos.x} y={pos.y - 0.3} textAnchor="middle" dominantBaseline="central" fontSize={3} fill={meta.color} fontWeight="bold">
                      {meta.name.split(" ")[1]?.[0] || "A"}
                    </text>
                    {/* Name below */}
                    <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontSize={1.6} fill="rgba(255,255,255,0.5)">
                      {meta.subtitle}
                    </text>
                    {/* Pulse on appear */}
                    <motion.circle
                      cx={pos.x} cy={pos.y} r={5}
                      fill="none" stroke={meta.color} strokeWidth={0.5}
                      initial={{ r: 5, opacity: 0.8 }}
                      animate={{ r: 14, opacity: 0 }}
                      transition={{ duration: 1.2 }}
                    />
                  </motion.g>
                )}
              </AnimatePresence>
            );
          })}
        </svg>
      </div>

      {/* Status text */}
      <div className="text-center mt-2 relative z-10">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-white/40 text-sm">Initializing MateOS...</p>
            </motion.div>
          )}
          {phase === 1 && (
            <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-white/60 text-sm">
                Deploying agents
                <span className="inline-block ml-1">
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    ...
                  </motion.span>
                </span>
              </p>
              <p className="text-white/20 text-xs mt-1">
                {deployedAgents.length} / {agentIds.length} online
              </p>
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-white/60 text-sm">Connecting agent network...</p>
            </motion.div>
          )}
          {phase === 3 && (
            <motion.div key="p3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <p className="text-secondary text-base font-semibold">Registering on-chain identity</p>
              <div className="flex items-center justify-center gap-2.5 mt-1">
                <div className="w-4 h-4 border border-secondary/50 rounded-sm flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-2 h-2 bg-secondary rounded-[1px]"
                  />
                </div>
                <span className="text-sm text-white/60 font-mono font-medium">ERC-8004 identity verified</span>
              </div>
            </motion.div>
          )}
          {phase === 4 && (
            <motion.div
              key="p4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
                style={{ boxShadow: "0 0 40px rgba(34,197,94,0.2)" }}
              >
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <p className="text-green-400 font-bold text-xl" style={{ textShadow: "0 0 20px rgba(34,197,94,0.3)" }}>Your squad is online</p>
              <p className="text-white/30 text-sm">Redirecting to dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

export default function DeployPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "radial-gradient(ellipse at 50% 40%, #111130 0%, #0a0a14 70%)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[15px] text-white/60 font-medium">Deploying your squad...</span>
        </motion.div>
      </div>
    }>
      <DeployContent />
    </Suspense>
  );
}
