"use client";

import { useState } from "react";
import Link from "next/link";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import AgentNetworkVisual from "@/components/dashboard/AgentNetworkVisual";
import StarField from "@/components/dashboard/StarField";
import ActivityFeedLight from "@/components/dashboard/ActivityFeedLight";
import RevenueChartLight from "@/components/dashboard/RevenueChartLight";

const SQUADS = [
  { id: "hq", name: "MateOS HQ", revenue: "$12,400", status: "active" as const, isHQ: true },
  { id: "1", name: "Pizzeria Don Juan", revenue: "$1,890", status: "active" as const, isHQ: false },
  { id: "2", name: "Peluqueria Marta", revenue: "$940", status: "active" as const, isHQ: false },
];

export default function DashboardPage() {
  const [activeSquad, setActiveSquad] = useState("hq");

  return (
    <div className="h-screen overflow-y-auto lg:overflow-hidden flex flex-col bg-[#0B0B14] relative">
      {/* Star field background */}
      <StarField />
      {/* Top bar */}
      <header className="relative z-10 border-b border-white/[0.06] px-4 sm:px-6 py-3 bg-black/30 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-xs sm:text-sm font-bold text-white">M</div>
            <span className="font-bold text-white/90 text-[14px] sm:text-[16px] tracking-tight">MateOS</span>
            <span className="text-[11px] text-white/25 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full ml-1 hidden sm:inline">Zero Human Factory</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[11px] sm:text-[12px] text-emerald-400/80 font-medium">7 online</span>
            </div>
            <span className="text-[11px] text-white/25 hidden sm:inline">Base Mainnet</span>
          </div>
        </div>

        {/* Squad tabs — scrollable on mobile */}
        <div className="flex items-center gap-1 mt-2 overflow-x-auto no-scrollbar">
          {SQUADS.map((s) => (
            <button key={s.id} onClick={() => setActiveSquad(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] transition-all whitespace-nowrap shrink-0 ${
                activeSquad === s.id
                  ? s.isHQ
                    ? "bg-amber-500/10 text-amber-200 border border-amber-500/20"
                    : "bg-white/10 text-white/90 border border-white/10"
                  : "text-white/30 hover:text-white/50 border border-transparent"
              }`}>
              {s.isHQ && <span className="mr-1 text-amber-400">&#10022;</span>}
              <span className="font-medium">{s.name}</span>
              <span className="ml-2 text-[10px]" style={{ color: s.status === "active" ? "#34D399" : "#FBBF24", opacity: 0.7 }}>{s.revenue}</span>
            </button>
          ))}
          <Link href="/explore"
            className="px-3 py-1.5 rounded-lg text-[11px] transition-all whitespace-nowrap shrink-0 text-white/30 hover:text-white/50 border border-transparent hover:border-white/10 flex items-center gap-1">
            <span className="text-[13px] leading-none">+</span>
            <span className="font-medium">Explore</span>
          </Link>
        </div>
      </header>

      {/* Stats bar */}
      <div className="relative z-10 border-b border-white/[0.05] bg-black/20 backdrop-blur-sm shrink-0 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-3 sm:grid-cols-6 min-w-0">
          {[
            { label: "REVENUE (30D)", value: "$12,400", sub: "USDC", change: "+18%", color: "#34D399" },
            { label: "TASKS COMPLETED", value: "8,247", sub: "this month", change: "+24%", color: "#FFD43B" },
            { label: "AVG RESPONSE", value: "1.4s", sub: "all channels", color: "#22D3EE" },
            { label: "UPTIME", value: "99.9%", sub: "30d average", color: "#34D399" },
            { label: "CLIENT SQUADS", value: "3", sub: "managed", color: "#A78BFA" },
            { label: "LLM REQUESTS", value: "11.2K", sub: "via Bankr Gateway", color: "#FB7185" },
          ].map((s) => (
            <div key={s.label} className="px-3 sm:px-6 py-3 sm:py-4 border-r border-white/[0.04] last:border-r-0">
              <div className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wider mb-1">{s.label}</div>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-lg sm:text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
                {s.change && <span className="text-[10px] sm:text-[11px] text-emerald-400/70">{s.change}</span>}
              </div>
              <div className="text-[10px] sm:text-[11px] text-white/35 mt-0.5">{s.sub}</div>
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
          <div className="shrink-0 border-b border-white/[0.04]">
            <RevenueChartLight />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden h-[300px] lg:h-auto">
            <ActivityFeedLight />
          </div>
        </div>
      </div>
    </div>
  );
}
