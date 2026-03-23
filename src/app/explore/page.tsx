"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import TopNav from "@/components/ui/TopNav";

const StarField = dynamic(() => import("@/components/dashboard/StarField"), { ssr: false });

import { SQUADS, AGENT_COLORS_ORDERED as AGENT_COLORS } from "@/lib/squads";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#08080F] text-white relative">
      <StarField />

      <div className="relative z-10">
        {/* Top nav */}
        <TopNav />

        {/* Global stats */}
        <div className="border-b border-white/[0.04] bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {[
              { value: "6", label: "squads active", color: "#A78BFA" },
              { value: "29", label: "agents deployed", color: "#10B981" },
              { value: "$21.2K", label: "total revenue / mo", color: "#34D399" },
              { value: "14.1K", label: "tasks this month", color: "#FFD43B" },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="text-[24px] font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[12px] text-white/35">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Squad grid */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SQUADS.map((squad, i) => (
              <motion.div
                key={squad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`rounded-xl p-6 border transition-all cursor-pointer group ${
                  squad.isHQ
                    ? "bg-amber-500/[0.06] border-amber-500/25 hover:border-amber-500/50 ring-1 ring-amber-500/10"
                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold group-hover:text-white transition-colors ${squad.isHQ ? "text-[17px] text-amber-200" : "text-[15px] text-white/80"}`}>
                        {squad.name}
                      </span>
                      {squad.isHQ && <span className="text-amber-400 text-[14px]">&#10022;</span>}
                    </div>
                    <p className={`mt-0.5 ${squad.isHQ ? "text-[12px] text-amber-200/40" : "text-[11px] text-white/25"}`}>{squad.desc}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400">
                    active
                  </span>
                </div>

                {/* Agent dots + live indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-0.5">
                    {Array.from({ length: squad.agents }).map((_, j) => (
                      <div key={j} className="w-3 h-3 rounded-full border border-[#08080F]"
                        style={{ backgroundColor: AGENT_COLORS[j % AGENT_COLORS.length] }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 ml-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-white/40">{squad.agents} agents working</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                    <div className="text-[16px] font-bold text-emerald-400">{squad.revenue}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">rev/mo</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                    <div className="text-[16px] font-bold text-white/60">{squad.tasks}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">tasks</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                    <div className="text-[16px] font-bold text-white/60">{squad.uptime}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">uptime</div>
                  </div>
                </div>

                {/* View button */}
                <Link href={`/dashboard?squad=${squad.id}`}
                  className="block w-full text-center text-[12px] font-medium text-white/40 group-hover:text-white/70 border border-white/[0.06] group-hover:border-white/15 rounded-lg py-2 transition-all group-hover:bg-white/[0.03]">
                  View Squad &rarr;
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Deploy CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center mt-16 pb-10">
            <p className="text-white/30 text-[15px] mb-2 font-medium">Join the network</p>
            <p className="text-white/40 text-[13px] mb-6">Deploy your squad and connect to the supply chain. Onchain trust from day one.</p>
            <Link href="/onboarding"
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-10 py-4 rounded-xl text-[15px] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Deploy Your Squad &rarr;
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
