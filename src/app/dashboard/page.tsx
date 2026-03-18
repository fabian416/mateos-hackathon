"use client";

import { useState } from "react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import AgentNetworkLight from "@/components/dashboard/AgentNetworkLight";
import StarField from "@/components/dashboard/StarField";
import ActivityFeedLight from "@/components/dashboard/ActivityFeedLight";
import RevenueChartLight from "@/components/dashboard/RevenueChartLight";

const SQUADS = [
  { id: "1", name: "Pizzeria Don Juan", revenue: "$1,890", status: "active" as const },
  { id: "2", name: "Peluqueria Marta", revenue: "$940", status: "active" as const },
  { id: "3", name: "Taller Roberto", revenue: "$720", status: "active" as const },
  { id: "4", name: "Tienda Luna", revenue: "—", status: "onboarding" as const },
];

export default function DashboardPage() {
  const [activeSquad, setActiveSquad] = useState("1");

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0B0B14] relative">
      {/* Star field background */}
      <StarField />
      {/* Top bar */}
      <header className="relative z-10 border-b border-white/[0.06] px-6 py-3 flex items-center justify-between bg-black/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold text-white">M</div>
          <span className="font-bold text-white/90 text-[16px] tracking-tight">MateOS</span>
          <span className="text-[11px] text-white/25 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full ml-1">Zero Human Factory</span>
        </div>

        {/* Squad tabs — center */}
        <div className="flex items-center gap-1">
          {SQUADS.map((s) => (
            <button key={s.id} onClick={() => setActiveSquad(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] transition-all ${
                activeSquad === s.id ? "bg-white/10 text-white/90 border border-white/10" : "text-white/30 hover:text-white/50 border border-transparent"
              }`}>
              <span className="font-medium">{s.name}</span>
              <span className="ml-2 text-[10px]" style={{ color: s.status === "active" ? "#34D399" : "#FBBF24", opacity: 0.7 }}>{s.revenue}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-[12px] text-emerald-400/80 font-medium">7 agents online</span>
          </div>
          <span className="text-[11px] text-white/25">Base Mainnet</span>
        </div>
      </header>

      {/* Stats bar */}
      <div className="relative z-10 border-b border-white/[0.05] bg-black/20 backdrop-blur-sm shrink-0">
        <div className="grid grid-cols-6">
          {[
            { label: "REVENUE (30D)", value: "$4,280", sub: "USDC", change: "+18%", color: "#34D399" },
            { label: "ACTIVE SQUADS", value: "3", sub: "PyMEs", color: "#A78BFA" },
            { label: "TASKS COMPLETED", value: "4,601", sub: "this month", change: "+24%", color: "#FFD43B" },
            { label: "AVG RESPONSE", value: "2.8s", sub: "WhatsApp", color: "#22D3EE" },
            { label: "LLM REQUESTS", value: "11.2K", sub: "via Bankr Gateway", color: "#FB7185" },
            { label: "UPTIME", value: "99.7%", sub: "30d average", color: "#34D399" },
          ].map((s) => (
            <div key={s.label} className="px-6 py-4 border-r border-white/[0.04] last:border-r-0">
              <div className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{s.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
                {s.change && <span className="text-[11px] text-emerald-400/70">{s.change}</span>}
              </div>
              <div className="text-[10px] text-white/15 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main — network + right panel */}
      <div className="relative z-10 flex-1 flex min-h-0">
        {/* Network 2/3 */}
        <div className="flex-[2] min-w-0 relative">
          <div className="px-5 py-3 shrink-0">
            <h2 className="text-[11px] text-white/25 uppercase tracking-wider">Agent Network</h2>
            <p className="text-[10px] text-white/10 mt-0.5">Click an agent to inspect</p>
          </div>
          <div className="absolute inset-0 top-12">
            <AgentNetworkLight />
          </div>
        </div>

        {/* Right panel 1/3 */}
        <div className="flex-[1] min-w-0 border-l border-white/[0.04] bg-black/10 backdrop-blur-sm flex flex-col min-h-0 max-w-[420px]">
          <div className="shrink-0 border-b border-white/[0.04]">
            <RevenueChartLight />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ActivityFeedLight />
          </div>
        </div>
      </div>
    </div>
  );
}
