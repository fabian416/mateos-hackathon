"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const Orb = dynamic(() => import("@/components/ui/Orb"), { ssr: false });
const LiveTicker = dynamic(() => import("@/components/ui/LiveTicker"), { ssr: false });
const StarField = dynamic(() => import("@/components/dashboard/StarField"), { ssr: false });
import ShinyText from "@/components/ui/ShinyText";
import StarBorder from "@/components/ui/StarBorder";
import BorderGlow from "@/components/ui/BorderGlow";

const AGENTS = [
  { name: "ChatGod", role: "WhatsApp Support", color: "#10B981", letter: "CG", hsl: "160 84 37" },
  { name: "BagChaser", role: "Billing & Collections", color: "#8B5CF6", letter: "BC", hsl: "258 89 66" },
  { name: "CalendApe", role: "Scheduling", color: "#A855F7", letter: "CA", hsl: "271 91 65" },
  { name: "DM Sniper", role: "Lead Outreach", color: "#06B6D4", letter: "DS", hsl: "189 96 42" },
  { name: "PostMalone", role: "Social Media", color: "#EC4899", letter: "PM", hsl: "330 81 60" },
  { name: "HypeSmith", role: "Content & Marketing", color: "#F97316", letter: "HS", hsl: "25 95 53" },
  { name: "OpsChad", role: "Coordination & Reports", color: "#EAB308", letter: "OC", hsl: "45 96 47" },
];

const COMPARISON = [
  { label: "Customer support", before: "You reply in 2 hours (if you remember)", after: "Agent replies in 3 seconds" },
  { label: "Scheduling", before: "Back-and-forth emails, double bookings", after: "Agent books, confirms, reminds" },
  { label: "Billing", before: "Manual invoices, chasing payments", after: "Agent invoices and follows up automatically" },
  { label: "Social media", before: "You post when you feel like it", after: "Agent posts daily, on-brand, on-schedule" },
  { label: "Outreach", before: "You cold-email 10 leads on a good week", after: "Agent contacts 200 qualified leads/day" },
  { label: "Cost", before: "$18,000/mo (3 employees)", after: "Self-funded via onchain revenue" },
];

const PROOF = [
  { title: "6 squads, 6 cities, 1 network", desc: "Wineries, logistics, citrus, meats, and a restaurant — all operated by AI agents coordinating across Argentina.", color: "#10B981" },
  { title: "Real inter-squad coordination", desc: "Squads communicate autonomously via ERC-8004 verified hooks. Every message is identity-checked onchain before acceptance.", color: "#8B5CF6" },
  { title: "Onchain trust layer", desc: "25+ cross-squad reputation feedbacks on Base Mainnet. Self-validation contract with dispute mechanism. Identity Registry, Reputation Registry, and SelfValidation — all deployed and verifiable on BaseScan.", color: "#06B6D4" },
  { title: "Self-sustaining economics", desc: "Agent squads generate revenue, pay for their own LLM inference, and build reputation — creating a self-funding flywheel.", color: "#EAB308" },
];

export default function HackathonLanding() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset transition state when user navigates back to this page
  useEffect(() => {
    setIsTransitioning(false);
  }, []);

  const handleWatchClick = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/network");
    }, 1500);
  }, [isTransitioning, router]);

  return (
    <div className="bg-[#08080F] text-white overscroll-none relative">
      {/* Star field background */}
      <div className="fixed inset-0 z-0">
        <StarField />
      </div>

      {/* ═══════ TRANSITION OVERLAY ═══════ */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0B14]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
            {/* Subtle gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-emerald-500/[0.03]" />

            <motion.div
              className="relative flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[15px] text-white/70 font-medium tracking-wide">
                  Connecting to live agents...
                </span>
              </div>

              {/* Subtle progress bar */}
              <motion.div
                className="w-48 h-[1px] bg-white/[0.06] rounded-full overflow-hidden mt-2"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-400/50 to-emerald-400/50"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 1.0, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ═══════ LIVE TICKER ═══════ */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <LiveTicker />
      </div>

      {/* ═══════ HERO ═══════ */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-x-clip pt-11" style={{ paddingBottom: "7vh" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[445px] h-[445px] sm:w-[668px] sm:h-[668px] lg:w-[890px] lg:h-[890px]">
            <Orb hue={19} hoverIntensity={0.18} rotateOnHover={true} forceHoverState={false} globalMouseTracking={false} backgroundColor="#08080F" />
          </div>
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <StarBorder color="#22d3ee" speed="5s" thickness={1} radius="9999px">
              <div className="flex items-center gap-2.5 bg-[#08080F] rounded-full px-5 py-2.5 cursor-default">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[14px] text-white/70 font-medium">6 Squads. Onchain Trust. Self-Sustaining.</span>
              </div>
            </StarBorder>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="text-5xl sm:text-7xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9]">
            <span className="text-white">Mate</span>
            <ShinyText
              text="OS"
              color="#7c3aed"
              shineColor="#22d3ee"
              speed={3}
              spread={100}
              className="font-extrabold"
            />
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl sm:text-2xl lg:text-3xl text-white mt-10 font-semibold">
            Your next employee is a network.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
            className="text-[15px] sm:text-[17px] text-white/50 mt-5 max-w-xl mx-auto leading-relaxed">
            A self-sustaining network of AI-operated businesses. Agent squads run real companies, coordinate autonomously, and verify trust onchain via ERC-8004 on Base.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mt-10">
            <button onClick={handleWatchClick}
              className="bg-white text-black font-bold px-10 py-4 rounded-xl text-[16px] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 cursor-pointer">
              See the Network &rarr;
            </button>
            <Link href="/onboarding"
              className="border border-white/20 text-white/70 font-semibold px-10 py-4 rounded-xl text-[16px] hover:bg-white/5 hover:text-white hover:border-white/30 transition-all">
              Deploy a Squad
            </Link>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </div>
        </motion.div>

        {/* Fade to black at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 0%, #08080F 100%)" }} />
      </section>

      {/* ═══════ HERO → COMPARISON SEPARATOR ═══════ */}
      <div className="relative py-4">
        <div className="mx-auto max-w-2xl h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="mx-auto max-w-md h-px mt-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent blur-sm" />
      </div>

      {/* ═══════ COMPARISON TABLE ═══════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[14px] text-white/40 uppercase tracking-[0.3em] mb-5 text-center">Before & After</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-center mb-12 sm:mb-16">
            Your business today <span className="text-white/30">vs</span>{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">on MateOS</span>
          </motion.h2>

          <div className="space-y-0">
            {COMPARISON.map((row, i) => {
              const isLast = i === COMPARISON.length - 1;
              return (
                <motion.div key={row.label}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex flex-col gap-1 sm:grid sm:grid-cols-[160px_1fr_1fr] sm:gap-6 py-5 border-b border-white/[0.04] sm:items-center ${isLast ? "border-0 pt-6" : ""}`}>
                  <span className={`text-[14px] font-semibold ${isLast ? "text-white" : "text-white/50"}`}>{row.label}</span>
                  <span className={`text-[13px] sm:text-[15px] rounded-lg sm:px-3 sm:py-2 ${isLast ? "text-red-400 font-bold sm:text-xl sm:bg-red-500/[0.08]" : "text-red-400/60 sm:bg-red-500/[0.04]"}`}>{row.before}</span>
                  <span className={`text-[13px] sm:text-[15px] rounded-lg sm:px-3 sm:py-2 ${isLast ? "text-emerald-400 font-bold sm:text-xl sm:bg-emerald-500/[0.08]" : "text-emerald-400/80 sm:bg-emerald-500/[0.04]"}`}>{row.after}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ PROVOCATIVE STATEMENT ═══════ */}
      <section className="py-28 sm:py-40 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
            &ldquo;The best-run company in this room has{" "}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">zero employees</span>.&rdquo;
          </h2>
        </motion.div>
      </section>

      {/* ═══════ THE SQUAD ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[14px] text-white/40 uppercase tracking-[0.3em] mb-5 text-center">The Squad</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white text-center mb-16">
            7 specialized agents. <span className="text-white/30">One coordinated team.</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENTS.map((agent, i) => (
              <motion.div key={agent.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
>
                <BorderGlow
                  animated
                  backgroundColor="#0c0c16"
                  borderRadius={50}
                  glowRadius={40}
                  glowIntensity={1.4}
                  coneSpread={25}
                  glowColor={agent.hsl}
                  colors={[agent.color, agent.color, agent.color]}
                  fillOpacity={0.4}
                >
                  <div className="p-6 cursor-default group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-[15px] font-bold mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${agent.color}15`, color: agent.color }}>
                      {agent.letter}
                    </div>
                    <div className="text-[16px] font-semibold text-white/80 group-hover:text-white transition-colors">{agent.name}</div>
                    <div className="text-[13px] text-white/35 mt-1 group-hover:text-white/50 transition-colors">{agent.role}</div>
                  </div>
                </BorderGlow>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[14px] text-white/40 uppercase tracking-[0.3em] mb-5 text-center">How It Works</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white text-center mb-16">
            From zero to operating <span className="text-white/30">in 90 seconds</span>
          </h2>

          {[
            { step: "01", title: "Pick your agents", desc: "Choose from 7 specialized AI agents. Each one replaces a human role in your business.", color: "#10B981" },
            { step: "02", title: "Agents get onchain identity", desc: "Each agent registers with ERC-8004 — verifiable identity, reputation, and task history on Base.", color: "#8B5CF6" },
            { step: "03", title: "Squad goes live", desc: "Agents activate on WhatsApp, Telegram, Instagram. Customers don't know they're talking to AI.", color: "#06B6D4" },
            { step: "04", title: "Agents coordinate autonomously", desc: "Using a delegation protocol, agents route tasks to each other. Lead comes in → Support qualifies → Sales follows up → Scheduler books → Biller invoices. Zero humans.", color: "#EAB308" },
            { step: "05", title: "Everything is verifiable", desc: "Revenue, tasks, communications — all trackable onchain. Real metrics, real accountability.", color: "#EC4899" },
          ].map((item, i) => (
            <motion.div key={item.step}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-4 sm:gap-6 py-6 sm:py-8 border-b border-white/[0.04] last:border-0 cursor-default group">
              <span className="text-[20px] font-bold font-mono shrink-0 group-hover:scale-110 transition-transform" style={{ color: item.color }}>{item.step}</span>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-[15px] text-white/50 mt-2 max-w-lg group-hover:text-white/60 transition-colors leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ PROOF ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[14px] text-white/40 uppercase tracking-[0.3em] mb-5 text-center">Not a pitch deck</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white text-center mb-16">
            A running system.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROOF.map((p, i) => (
              <motion.div key={p.title}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: `${p.color}30` }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 transition-all cursor-default group">
                <div className="w-3 h-3 rounded-full mb-4 group-hover:scale-150 transition-transform" style={{ backgroundColor: p.color }} />
                <h3 className="text-[17px] font-semibold text-white group-hover:text-white transition-colors">{p.title}</h3>
                <p className="text-[14px] text-white/40 mt-2 leading-relaxed group-hover:text-white/50 transition-colors">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-24 sm:py-36 px-6 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5">
          See the network live
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-white/40 text-lg sm:text-xl mb-12 max-w-lg mx-auto">
          6 AI-operated businesses coordinating across Argentina. Every interaction verified onchain.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <button onClick={handleWatchClick}
            className="bg-white text-black font-bold px-10 py-4 rounded-xl text-[16px] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 cursor-pointer">
            See the Network &rarr;
          </button>
          <Link href="/onboarding"
            className="border border-white/20 text-white/70 font-semibold px-10 py-4 rounded-xl text-[16px] hover:bg-white/5 hover:text-white hover:border-white/30 transition-all">
            Deploy Your Squad
          </Link>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <div className="mx-auto max-w-4xl h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <footer className="py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 220 220" fill="none"><defs><radialGradient id="hkGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7C5CFF"/><stop offset="100%" stopColor="#00D1FF"/></radialGradient></defs><circle cx="110" cy="110" r="90" stroke="url(#hkGrad)" strokeWidth="4" opacity="0.6"/><circle cx="110" cy="110" r="35" fill="url(#hkGrad)"/><circle cx="110" cy="40" r="6" fill="#7C5CFF"/><circle cx="180" cy="110" r="6" fill="#00D1FF"/><circle cx="110" cy="180" r="6" fill="#7C5CFF"/><circle cx="40" cy="110" r="6" fill="#00D1FF"/></svg>
            <span className="font-bold text-white/60">MateOS</span>
            <span className="text-[12px] text-white/20">Zero Human Factory</span>
          </div>
          <div className="text-[12px] text-white/30 font-medium">Powered by autonomous agents</div>
          <div className="flex items-center gap-4 text-[12px] text-white/25">
            <span>Synthesis 2026</span>
            <span>Base</span>
            <span>ERC-8004</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
