"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AgentNetworkVisual from "@/components/dashboard/AgentNetworkVisual";
import StarField from "@/components/dashboard/StarField";
import ActivityFeedLight from "@/components/dashboard/ActivityFeedLight";
import RevenueChartLight from "@/components/dashboard/RevenueChartLight";

// The user's own squad — everything else is "external"
const MY_SQUAD = "bsas";

const SQUAD_INFO: Record<string, { name: string; agents: number; color: string }> = {
  hq: { name: "MateOS HQ", agents: 7, color: "#EAB308" },
  mendoza: { name: "Andes Vineyard", agents: 5, color: "#10B981" },
  salta: { name: "Altura Wines", agents: 4, color: "#F97316" },
  tucuman: { name: "Norte Citrus Co.", agents: 4, color: "#EC4899" },
  cordoba: { name: "Estancia Meats", agents: 4, color: "#06B6D4" },
  rosario: { name: "Central Logistics", agents: 6, color: "#8B5CF6" },
  bsas: { name: "Buenos Table", agents: 7, color: "#EAB308" },
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const fromNetwork = searchParams.get("squad");
  const squadId = fromNetwork || MY_SQUAD;
  const isOwner = squadId === MY_SQUAD;
  const squad = SQUAD_INFO[squadId] || SQUAD_INFO[MY_SQUAD];
  const [revenueOpen, setRevenueOpen] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (fromNetwork) {
      setTimeout(() => setHasAnimated(true), 50);
    } else {
      setHasAnimated(true);
    }
  }, [fromNetwork]);

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col bg-[#0B0B14] relative">
      {/* Star field background */}
      <StarField />
      {/* Top bar */}
      <header className="relative z-10 border-b border-white/[0.06] px-4 sm:px-6 py-3 bg-black/30 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="hdrGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#7C5CFF"/>
                    <stop offset="100%" stopColor="#00D1FF"/>
                  </radialGradient>
                </defs>
                <circle cx="110" cy="110" r="90" stroke="url(#hdrGrad)" strokeWidth="4" opacity="0.6"/>
                <circle cx="110" cy="110" r="35" fill="url(#hdrGrad)"/>
                <circle cx="110" cy="40" r="6" fill="#7C5CFF"/>
                <circle cx="180" cy="110" r="6" fill="#00D1FF"/>
                <circle cx="110" cy="180" r="6" fill="#7C5CFF"/>
                <circle cx="40" cy="110" r="6" fill="#00D1FF"/>
              </svg>
              <span className="font-bold text-white text-[15px] sm:text-[17px] tracking-tight">MateOS</span>
            </a>
            <span className="text-[11px] text-white/25 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full ml-1 hidden sm:inline">Zero Human Factory</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[11px] sm:text-[12px] text-emerald-400/80 font-medium">{squad.agents} online</span>
            </div>
            <span className="text-[11px] text-white/25 hidden sm:inline">Base Mainnet</span>
          </div>
        </div>

        {/* Current squad + navigation */}
        <div className="flex items-center gap-3 mt-2">
          <Link href="/network"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg px-4 py-1.5 transition-all group">
            <span className="text-[12px] text-white/40 group-hover:text-white/70 transition-colors">&larr; Network</span>
          </Link>
          <div className="flex items-center gap-2 rounded-lg px-4 py-1.5" style={{ backgroundColor: `${squad.color}15`, borderColor: `${squad.color}30`, borderWidth: 1, boxShadow: `0 0 16px ${squad.color}15` }}>
            <span style={{ color: squad.color }} className="text-[12px]">&#10022;</span>
            <span className="text-[12px] font-semibold" style={{ color: `${squad.color}dd` }}>{squad.name}</span>
            {isOwner && <span className="text-[10px] text-emerald-400/70 ml-1">Owner</span>}
            {!isOwner && <span className="text-[10px] text-white/30 ml-1">Viewer</span>}
          </div>
        </div>
      </header>

      {/* Animated content wrapper — zooms in from network transition */}
      <motion.div
        initial={fromNetwork && !hasAnimated ? { scale: 1.5, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col flex-1 min-h-0"
      >
      {/* Stats bar */}
      <div className="relative z-10 border-b border-white/[0.05] bg-black/20 backdrop-blur-sm shrink-0 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-4 sm:grid-cols-7 min-w-0">
          {[
            { label: "REVENUE (30D)", value: isOwner ? "$12,400" : "••••••", sub: isOwner ? "USDC" : "restricted", change: isOwner ? "+18%" : "", color: "#34D399", sensitive: true },
            { label: "TASKS COMPLETED", value: "8,247", sub: "this month", change: "+24%", color: "#FFD43B", sensitive: false },
            { label: "AVG RESPONSE", value: "1.4s", sub: "all channels", color: "#22D3EE", sensitive: false },
            { label: "UPTIME", value: "99.9%", sub: "30d average", color: "#34D399", sensitive: false },
            { label: "x402 API REVENUE", value: isOwner ? "$84.20" : "••••", sub: isOwner ? "USDC via x402" : "restricted", change: isOwner ? "+42%" : "", color: "#3B82F6", sensitive: true },
            { label: "CLIENT SQUADS", value: isOwner ? "3" : "••", sub: isOwner ? "managed" : "restricted", color: "#A78BFA", sensitive: true },
            { label: "LLM REQUESTS", value: isOwner ? "11.2K" : "••••", sub: isOwner ? "via Bankr Gateway" : "restricted", color: "#FB7185", sensitive: true },
          ].map((s) => (
            <div key={s.label} className="px-3 sm:px-4 py-2 sm:py-2.5 border-r border-white/[0.04] last:border-r-0">
              <div className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-wider mb-0.5">{s.label}</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-base sm:text-xl font-bold ${!isOwner && s.sensitive ? "blur-[6px] select-none" : ""}`} style={{ color: s.color }}>{s.value}</span>
                {s.change && <span className="text-[9px] sm:text-[10px] text-emerald-400/70">{s.change}</span>}
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/35">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main — network + right panel */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Network */}
        <div className="flex-[2] min-w-0 relative h-[50vh] lg:h-auto">
          <div className="px-5 py-3 shrink-0">
            <h2 className="text-[11px] text-white/45 uppercase tracking-wider">Agent Network</h2>
            <p className="text-[10px] text-white/10 mt-0.5">Click an agent to inspect</p>
          </div>
          <div className="absolute inset-0 top-12">
            <AgentNetworkVisual />
          </div>
        </div>

        {/* Right panel */}
        <div className="min-w-0 border-t lg:border-t-0 lg:border-l border-white/[0.04] bg-black/10 backdrop-blur-sm flex flex-col min-h-0 lg:flex-[1] lg:max-w-[420px]">
          {isOwner ? (
            <div className="shrink-0 border-b border-white/[0.04]">
              <button
                onClick={() => setRevenueOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-white/50 uppercase tracking-wider">Revenue</span>
                <span className="text-[10px] text-white/25">{revenueOpen ? "▲ hide" : "▼ show"}</span>
              </button>
              {revenueOpen && <RevenueChartLight />}
            </div>
          ) : (
            <div className="shrink-0 border-b border-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[11px] text-white/40 uppercase tracking-wider">Revenue — Restricted</span>
              </div>
              <p className="text-[10px] text-white/20">Financial data is only visible to squad owners. Connect your wallet to verify ownership.</p>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-hidden h-[300px] lg:h-auto">
            <ActivityFeedLight isOwner={isOwner} />
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0B0B14]" />}>
      <DashboardContent />
    </Suspense>
  );
}
