"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import TopNav from "@/components/ui/TopNav";
import { useWallet } from "@/lib/walletContext";

const StarField = dynamic(() => import("@/components/dashboard/StarField"), { ssr: false });

const BUSINESS_TYPES = [
  { id: "restaurant", name: "Restaurant / Bar", icon: "🍽", agents: 5, desc: "Customer support, reservations, billing" },
  { id: "salon", name: "Salon / Beauty", icon: "✦", agents: 4, desc: "Appointments, reminders, social media" },
  { id: "service", name: "Auto / Service", icon: "⚙", agents: 4, desc: "Quotes, follow-ups, scheduling" },
  { id: "retail", name: "Retail / Store", icon: "◆", agents: 3, desc: "Inventory, orders, customer support" },
  { id: "health", name: "Health / Clinic", icon: "✚", agents: 4, desc: "Bookings, patient comms, records" },
  { id: "agency", name: "Agency / Studio", icon: "▲", agents: 5, desc: "Leads, content, project coordination" },
];

interface AgentDef {
  id: string;
  name: string;
  letter: string;
  role: string;
  color: string;
  price: number;
  recommended: boolean;
  desc: string;
  preview: string[];
}

const ALL_AGENTS: AgentDef[] = [
  { id: "baqueano", name: "ChatGod", letter: "CG", role: "WhatsApp Support", color: "#10B981", price: 80, recommended: true, desc: "Responds to every customer message in seconds. 24/7. Never sleeps.", preview: ["Replied in 1.8s — booking confirmed", "Resolved complaint — 5/5 rating", "89 messages handled today"] },
  { id: "tropero", name: "BagChaser", letter: "BC", role: "Billing & Collections", color: "#8B5CF6", price: 80, recommended: true, desc: "Sends invoices, collects payments, chases debts. Your money never sleeps.", preview: ["Collected $45 USDC", "Invoice #1847 sent", "Payment reminder — 2 days overdue"] },
  { id: "domador", name: "CalendApe", letter: "CA", role: "Scheduling", color: "#A855F7", price: 70, recommended: true, desc: "Books appointments, sends reminders, handles rescheduling. Zero double-bookings.", preview: ["Booked: Sat 3pm — haircut", "Reminder sent: tomorrow 10am", "Rescheduled Mon → Tue 2pm"] },
  { id: "rastreador", name: "DM Sniper", letter: "DS", role: "Lead Outreach", color: "#06B6D4", price: 100, recommended: false, desc: "Finds prospects, sends outreach, qualifies leads. Your automated sales machine.", preview: ["12 prospects found", "5 qualified leads", "Conversion: Panaderia San Martin"] },
  { id: "paisano", name: "PostMalone", letter: "PM", role: "Social Media", color: "#EC4899", price: 90, recommended: false, desc: "Posts on Instagram, replies to comments, schedules stories. On-brand, on-schedule.", preview: ["Posted: Friday promo", "Replied to 8 comments", "Story scheduled 7pm"] },
  { id: "relator", name: "HypeSmith", letter: "HS", role: "Content & Marketing", color: "#F97316", price: 70, recommended: false, desc: "Writes newsletters, articles, threads. Tells your brand's story every day.", preview: ["Newsletter — 340 subs", "Article published", "Thread on X: weekly recap"] },
  { id: "ceo", name: "OpsChad", letter: "OC", role: "Coordination", color: "#EAB308", price: 60, recommended: false, desc: "Coordinates the squad, generates reports, optimizes operations. The brain.", preview: ["Revenue +18% this week", "Reassigned DM Sniper", "Alert: query spike detected"] },
];

const STEP_LABELS = ["Name", "Industry", "Squad"];

export default function OnboardingPage() {
  const router = useRouter();
  const { connected, address, connect, isOnBase, switchToBase } = useWallet();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);

  useEffect(() => { setDeploying(false); }, []);

  const totalPrice = ALL_AGENTS.filter((a) => selected.has(a.id)).reduce((s, a) => s + a.price, 0);

  const selectType = (typeId: string) => {
    setBusinessType(typeId);
    setSelected(new Set(ALL_AGENTS.filter((a) => a.recommended).map((a) => a.id)));
    setStep(2);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConnectWallet = async () => {
    setWalletConnecting(true);
    try {
      await connect();
    } finally {
      setWalletConnecting(false);
    }
  };

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      const params = new URLSearchParams({
        name: businessName || "My Business",
        type: businessType,
        agents: Array.from(selected).join(","),
        ...(address ? { wallet: address } : {}),
      });
      router.push(`/deploy?${params.toString()}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#08080F] text-white relative overflow-hidden">
      <TopNav />
      <StarField />

      {/* Deploy overlay */}
      <AnimatePresence>
        {deploying && (
          <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a14]" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[15px] text-white/60 font-medium">Deploying your squad...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col">
        {/* Step indicators */}
        <div className="flex justify-center items-center gap-6 py-5">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                i < step ? "bg-violet-500 text-white" : i === step ? "border-2 border-violet-500 text-violet-400" : "border border-white/10 text-white/20"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] font-medium transition-colors hidden sm:block ${i === step ? "text-white/60" : "text-white/20"}`}>{label}</span>
              {i < STEP_LABELS.length - 1 && <div className={`w-8 h-px ml-2 ${i < step ? "bg-violet-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <AnimatePresence mode="wait">

            {/* ═══ STEP 0: Business Name ═══ */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="text-center max-w-md w-full">

                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
                  Name your{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">business</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="text-white/30 text-[13px] mb-8">We&apos;ll build a custom AI squad around it.</motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <input type="text" value={businessName} autoFocus
                    onChange={(e) => setBusinessName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && businessName.trim() && setStep(1)}
                    placeholder="e.g. Pizzeria Don Juan"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-lg text-white text-center placeholder:text-white/15 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all" />
                </motion.div>

                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  onClick={() => businessName.trim() && setStep(1)} disabled={!businessName.trim()}
                  className="mt-8 bg-white text-black font-semibold px-8 py-3 rounded-xl text-[13px] hover:bg-white/90 transition-all disabled:opacity-15 disabled:cursor-not-allowed cursor-pointer">
                  Continue
                </motion.button>
              </motion.div>
            )}

            {/* ═══ STEP 1: Business Type ═══ */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="text-center max-w-2xl w-full">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
                  What does{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">{businessName}</span>{" "}
                  do?
                </h1>
                <p className="text-white/30 text-[13px] mb-8">We&apos;ll recommend the right agents for your industry.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BUSINESS_TYPES.map((type, i) => (
                    <motion.button key={type.id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => selectType(type.id)}
                      className="bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.04] rounded-xl p-5 text-left transition-all group cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg text-white/30 group-hover:text-violet-400 transition-colors">{type.icon}</span>
                        <h3 className="font-semibold text-[14px] text-white/60 group-hover:text-white/90 transition-colors">{type.name}</h3>
                      </div>
                      <p className="text-[11px] text-white/20">{type.desc}</p>
                      <div className="flex items-center gap-1.5 mt-3">
                        {Array.from({ length: type.agents }).map((_, j) => (
                          <div key={j} className="w-1.5 h-1.5 rounded-full bg-violet-500/40 group-hover:bg-violet-500 transition-colors" />
                        ))}
                        <span className="text-[10px] text-white/15 ml-1">{type.agents} agents</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button onClick={() => setStep(0)} className="mt-6 text-[12px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">&larr; Back</button>
              </motion.div>
            )}

            {/* ═══ STEP 2: Squad Assembly ═══ */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="max-w-4xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Assemble your{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">squad</span>
                  </h1>
                  <p className="text-white/25 text-[13px] mt-2">Toggle agents on or off. Hover for details.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-28 sm:mb-24">
                  {ALL_AGENTS.map((agent, i) => {
                    const isSelected = selected.has(agent.id);
                    const isHovered = hoveredAgent === agent.id;
                    return (
                      <motion.div key={agent.id}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => toggle(agent.id)}
                        onMouseEnter={() => setHoveredAgent(agent.id)}
                        onMouseLeave={() => setHoveredAgent(null)}
                        className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
                          isSelected
                            ? "bg-white/[0.04] border-white/[0.12]"
                            : "bg-white/[0.01] border-white/[0.04] opacity-40 hover:opacity-70"
                        }`}
                        style={isSelected ? { borderColor: `${agent.color}30`, boxShadow: `0 0 20px ${agent.color}08` } : {}}>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                              style={{
                                backgroundColor: isSelected ? `${agent.color}15` : "rgba(255,255,255,0.03)",
                                color: isSelected ? agent.color : "rgba(255,255,255,0.15)",
                              }}>
                              {agent.letter}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold" style={{ color: isSelected ? agent.color : "rgba(255,255,255,0.4)" }}>{agent.name}</div>
                              <div className="text-[10px] text-white/20">{agent.role}</div>
                            </div>
                          </div>
                          {/* Toggle */}
                          <div className={`w-9 h-5 rounded-full transition-all flex items-center ${isSelected ? "justify-end" : "justify-start"}`}
                            style={{ backgroundColor: isSelected ? agent.color : "rgba(255,255,255,0.06)" }}>
                            <motion.div layout className="w-3.5 h-3.5 bg-white rounded-full mx-0.5" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                          </div>
                        </div>

                        <p className="text-[11px] text-white/20 leading-relaxed mb-2">{agent.desc}</p>

                        <AnimatePresence>
                          {isHovered && isSelected && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
                                {agent.preview.map((p, j) => (
                                  <div key={j} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: agent.color }} />
                                    <span className="text-[10px] text-white/35 font-mono">{p}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px]" style={{ color: isSelected ? `${agent.color}90` : "rgba(255,255,255,0.1)" }}>${agent.price}/mo</span>
                          {agent.recommended && <span className="text-[9px] text-violet-400/40 bg-violet-500/10 px-1.5 py-0.5 rounded">recommended</span>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Sticky deploy bar */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                  className="fixed bottom-0 left-0 right-0 z-40 bg-[#08080F]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 sm:px-6 py-3">
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {ALL_AGENTS.filter((a) => selected.has(a.id)).slice(0, 5).map((a) => (
                          <div key={a.id} className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold border border-[#08080F]"
                            style={{ backgroundColor: `${a.color}20`, color: a.color }}>
                            {a.letter}
                          </div>
                        ))}
                      </div>
                      <div>
                        <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">${totalPrice}</span>
                        <span className="text-white/20 text-[11px] ml-1.5">/mo · {selected.size} agents</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setStep(1)} className="text-[12px] text-white/20 hover:text-white/40 transition-colors px-3 py-2 cursor-pointer">Back</button>

                      {/* Wallet connect + deploy */}
                      {!connected ? (
                        <button
                          onClick={handleConnectWallet}
                          disabled={walletConnecting}
                          className="bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-xl text-[13px] hover:bg-violet-500 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {walletConnecting ? "Connecting..." : "Connect Wallet to Deploy"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {connected && !isOnBase && (
                            <button
                              onClick={switchToBase}
                              className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer"
                            >
                              Switch to Base
                            </button>
                          )}
                          <span className="text-[11px] text-white/30 font-mono">
                            {address && address.length > 10
                              ? `${address.slice(0, 6)}...${address.slice(-4)}`
                              : address}
                          </span>
                          <button
                            onClick={handleDeploy}
                            disabled={selected.size === 0}
                            className="bg-white text-black font-semibold px-6 py-2.5 rounded-xl text-[13px] hover:bg-white/90 transition-all disabled:opacity-15 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Deploy Squad &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
