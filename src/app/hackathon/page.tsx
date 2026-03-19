"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const Orb = dynamic(() => import("@/components/ui/Orb"), { ssr: false });
const LiveTicker = dynamic(() => import("@/components/ui/LiveTicker"), { ssr: false });

const AGENTS = [
  { name: "ChatGod", role: "WhatsApp Support", color: "#10B981", letter: "CG" },
  { name: "BagChaser", role: "Billing & Collections", color: "#8B5CF6", letter: "BC" },
  { name: "CalendApe", role: "Scheduling", color: "#A855F7", letter: "CA" },
  { name: "DM Sniper", role: "Lead Outreach", color: "#06B6D4", letter: "DS" },
  { name: "PostMalone", role: "Social Media", color: "#EC4899", letter: "PM" },
  { name: "HypeSmith", role: "Content & Marketing", color: "#F97316", letter: "HS" },
  { name: "OpsChad", role: "Coordination & Reports", color: "#EAB308", letter: "OC" },
];

const COMPARISON = [
  { label: "Customer support", before: "You reply in 2 hours (if you remember)", after: "Agent replies in 3 seconds" },
  { label: "Scheduling", before: "Back-and-forth emails, double bookings", after: "Agent books, confirms, reminds" },
  { label: "Billing", before: "Manual invoices, chasing payments", after: "Agent invoices and follows up automatically" },
  { label: "Social media", before: "You post when you feel like it", after: "Agent posts daily, on-brand, on-schedule" },
  { label: "Outreach", before: "You cold-email 10 leads on a good week", after: "Agent contacts 200 qualified leads/day" },
  { label: "Cost", before: "$18,000/mo (3 employees)", after: "$0 (7 agents, running now)" },
];

const PROOF = [
  { title: "7 agents deployed", desc: "Support, Scheduler, Biller, Social, Outreach, Content, Coordinator. All active. All coordinating.", color: "#10B981" },
  { title: "Real inter-agent comms", desc: "Agents delegate tasks to each other autonomously via delegate.py. No human routing.", color: "#8B5CF6" },
  { title: "On-chain identity", desc: "Every agent has verifiable identity via ERC-8004. Not a wallet. A reputation.", color: "#06B6D4" },
  { title: "Built on Base", desc: "Production-grade, L2-native, gas-efficient. Ready for mainnet.", color: "#EAB308" },
];

export default function HackathonLanding() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleWatchClick = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  }, [isTransitioning, router]);

  return (
    <div className="bg-[#08080F] text-white">
      {/* ═══════ TRANSITION OVERLAY ═══════ */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0B14]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden pt-11">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px]">
            <Orb hue={0} hoverIntensity={0.6} rotateOnHover={true} forceHoverState={false} backgroundColor="#08080F" />
          </div>
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] text-white/60">7 Agents. Zero Employees. Live Now.</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9]">
            <span className="text-white">Mate</span>
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">OS</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl lg:text-2xl text-white/60 mt-6 font-medium">
            Your next hire isn&apos;t human.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
            className="text-[13px] sm:text-[15px] text-white/30 mt-4 max-w-lg mx-auto leading-relaxed">
            An autonomous AI workforce that runs your business end-to-end — support, billing, scheduling, outreach, content — while you sleep.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10">
            <button onClick={handleWatchClick}
              className="bg-white text-black font-semibold px-8 py-3.5 rounded-xl text-[14px] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 cursor-pointer">
              Watch Them Work &rarr;
            </button>
            <Link href="/onboarding"
              className="border border-white/15 text-white/60 font-medium px-8 py-3.5 rounded-xl text-[14px] hover:bg-white/5 hover:text-white hover:border-white/25 transition-all">
              Deploy a Squad
            </Link>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ COMPARISON TABLE ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[12px] text-white/30 uppercase tracking-[0.3em] mb-4 text-center">Before & After</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-12 sm:mb-16">
            Your business today <span className="text-white/25">vs</span>{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">on MateOS</span>
          </motion.h2>

          <div className="space-y-0">
            {COMPARISON.map((row, i) => {
              const isLast = i === COMPARISON.length - 1;
              return (
                <motion.div key={row.label}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex flex-col gap-1 sm:grid sm:grid-cols-[120px_1fr_1fr] sm:gap-4 py-4 border-b border-white/[0.04] sm:items-center ${isLast ? "border-0 pt-6" : ""}`}>
                  <span className={`text-[12px] font-semibold ${isLast ? "text-white/80" : "text-white/40"}`}>{row.label}</span>
                  <span className={`text-[12px] sm:text-[13px] ${isLast ? "text-red-400/70 font-bold sm:text-lg" : "text-white/25"}`}>{row.before}</span>
                  <span className={`text-[12px] sm:text-[13px] ${isLast ? "text-emerald-400 font-bold sm:text-lg" : "text-white/60"}`}>{row.after}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ PROVOCATIVE STATEMENT ═══════ */}
      <section className="py-20 sm:py-32 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
            &ldquo;The best-run company in this room has{" "}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">zero employees</span>.&rdquo;
          </h2>
        </motion.div>
      </section>

      {/* ═══════ THE SQUAD ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[12px] text-white/30 uppercase tracking-[0.3em] mb-4 text-center">The Squad</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            7 specialized agents. <span className="text-white/25">One coordinated team.</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {AGENTS.map((agent, i) => (
              <motion.div key={agent.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, borderColor: `${agent.color}40` }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 transition-all cursor-default group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${agent.color}15`, color: agent.color }}>
                  {agent.letter}
                </div>
                <div className="text-[14px] font-semibold text-white/70 group-hover:text-white transition-colors">{agent.name}</div>
                <div className="text-[12px] text-white/25 mt-1 group-hover:text-white/40 transition-colors">{agent.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[12px] text-white/30 uppercase tracking-[0.3em] mb-4 text-center">How It Works</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            From zero to operating <span className="text-white/25">in 90 seconds</span>
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
              <span className="text-[14px] font-bold font-mono shrink-0 group-hover:scale-110 transition-transform" style={{ color: item.color }}>{item.step}</span>
              <div>
                <h3 className="text-lg font-semibold text-white/80 group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-[14px] text-white/30 mt-1.5 max-w-lg group-hover:text-white/40 transition-colors">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ PROOF ═══════ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[12px] text-white/30 uppercase tracking-[0.3em] mb-4 text-center">Not a pitch deck</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            A running system.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROOF.map((p, i) => (
              <motion.div key={p.title}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: `${p.color}30` }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 transition-all cursor-default group">
                <div className="w-2 h-2 rounded-full mb-4 group-hover:scale-150 transition-transform" style={{ backgroundColor: p.color }} />
                <h3 className="text-[15px] font-semibold text-white/80 group-hover:text-white transition-colors">{p.title}</h3>
                <p className="text-[13px] text-white/30 mt-2 leading-relaxed group-hover:text-white/40 transition-colors">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 sm:py-32 px-6 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          See it in action
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-white/30 text-base sm:text-lg mb-10 max-w-md mx-auto">
          Watch 7 AI agents coordinate in real-time to run a business. No humans involved.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button onClick={handleWatchClick}
            className="bg-white text-black font-semibold px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-[14px] sm:text-[15px] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 cursor-pointer">
            Watch Them Work &rarr;
          </button>
          <Link href="/onboarding"
            className="border border-white/15 text-white/50 font-medium px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-[14px] sm:text-[15px] hover:bg-white/5 hover:text-white hover:border-white/25 transition-all">
            Deploy Your Squad
          </Link>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white/60">MateOS</span>
            <span className="text-[11px] text-white/20">Zero Human Factory</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/20">
            <span>Synthesis 2026</span>
            <span>Base</span>
            <span>ERC-8004</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
