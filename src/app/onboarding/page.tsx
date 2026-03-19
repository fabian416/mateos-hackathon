"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const StarField = dynamic(() => import("@/components/dashboard/StarField"), { ssr: false });

const BUSINESS_TYPES = [
  { id: "restaurant", name: "Restaurant / Bar", emoji: "🍕", agents: 5 },
  { id: "salon", name: "Salon / Beauty", emoji: "✂️", agents: 4 },
  { id: "service", name: "Auto / Service", emoji: "🔧", agents: 4 },
  { id: "retail", name: "Retail / Store", emoji: "🛍️", agents: 3 },
  { id: "health", name: "Health / Clinic", emoji: "🏥", agents: 4 },
  { id: "agency", name: "Agency / Studio", emoji: "💼", agents: 5 },
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
  { id: "baqueano", name: "ChatGod", letter: "CG", role: "WhatsApp Support", color: "#10B981", price: 80, recommended: true, desc: "Responds to every customer message in seconds. 24/7. Never sleeps.", preview: ["\"Mesa para 4? Confirmada, viernes 21hs\"", "\"Si, hacemos delivery los domingos\"", "Resolved complaint in 2.1s — 5/5 rating"] },
  { id: "tropero", name: "BagChaser", letter: "BC", role: "Billing & Collections", color: "#8B5CF6", price: 80, recommended: true, desc: "Sends invoices, collects payments, chases debts. Your money never sleeps.", preview: ["Collected $45 USDC via payment link", "Invoice #1847 sent to client", "Payment reminder — due in 2 days"] },
  { id: "domador", name: "CalendApe", letter: "CA", role: "Scheduling", color: "#A855F7", price: 70, recommended: true, desc: "Books appointments, sends reminders, handles rescheduling. Zero double-bookings.", preview: ["Booked: Sat 3pm — haircut + beard", "Reminder sent: tomorrow 10am", "Rescheduled Mon → Tue 2pm"] },
  { id: "rastreador", name: "DM Sniper", letter: "DS", role: "Lead Outreach", color: "#06B6D4", price: 100, recommended: false, desc: "Finds prospects, sends outreach, qualifies leads. Your automated sales machine.", preview: ["Found 12 businesses without online presence", "Outreach sent to 5 qualified leads", "Lead converted: Panaderia San Martin"] },
  { id: "paisano", name: "PostMalone", letter: "PM", role: "Social Media", color: "#EC4899", price: 90, recommended: false, desc: "Posts on Instagram, replies to comments, schedules stories. On-brand, on-schedule.", preview: ["Posted: Friday 2x1 promo", "Replied to 8 IG comments", "Story scheduled for 7pm — peak hour"] },
  { id: "relator", name: "HypeSmith", letter: "HS", role: "Content & Marketing", color: "#F97316", price: 70, recommended: false, desc: "Writes newsletters, articles, threads. Tells your brand's story every day.", preview: ["Newsletter sent to 340 subscribers", "Article: \"5 reasons to try our pasta\"", "Thread on X: weekly business recap"] },
  { id: "ceo", name: "OpsChad", letter: "OC", role: "Coordination", color: "#EAB308", price: 60, recommended: false, desc: "Coordinates the squad, generates reports, optimizes operations. The brain.", preview: ["Weekly report: revenue +18%", "Reassigned DM Sniper to new campaign", "Alert: query spike — reinforcing ChatGod"] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);

  // Reset deploying state when user navigates back to this page
  // (browser bfcache or Next.js soft nav may restore stale state)
  useEffect(() => {
    setDeploying(false);
  }, []);

  const totalPrice = ALL_AGENTS.filter((a) => selected.has(a.id)).reduce((s, a) => s + a.price, 0);

  const selectType = (typeId: string) => {
    setBusinessType(typeId);
    const recommended = ALL_AGENTS.filter((a) => a.recommended).map((a) => a.id);
    setSelected(new Set(recommended));
    setStep(2);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      const params = new URLSearchParams({
        name: businessName || "My Business",
        type: businessType,
        agents: Array.from(selected).join(","),
      });
      router.push(`/deploy?${params.toString()}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#08080F] text-white relative overflow-hidden">
      <StarField />

      {/* Deploy overlay — appears instantly to prevent any white flash during transition */}
      <AnimatePresence>
        {deploying && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a14]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[15px] text-white/60 font-medium">Deploying your squad...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between shrink-0">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white">M</div>
            <span className="font-bold text-white/80 text-[14px]">MateOS</span>
          </a>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((s) => (
              <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s <= step ? "bg-violet-500 w-8" : "bg-white/10 w-4"}`} />
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">

            {/* ═══ STEP 0: Business Name ═══ */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-lg w-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[11px] text-white/50">90 seconds to your AI workforce</span>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-3xl lg:text-4xl font-bold mb-3">
                  What&apos;s your{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">business</span>{" "}
                  called?
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="text-white/30 text-[14px] mb-10">We&apos;ll build a custom AI squad around it.</motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <input type="text" value={businessName} autoFocus
                    onChange={(e) => setBusinessName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && businessName.trim() && setStep(1)}
                    placeholder="Pizzeria Don Juan"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-6 py-5 text-xl text-white text-center placeholder:text-white/15 focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all caret-violet-400" />
                  <p className="text-white/15 text-[11px] mt-3">Press Enter to continue</p>
                </motion.div>

                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  onClick={() => businessName.trim() && setStep(1)} disabled={!businessName.trim()}
                  className="mt-6 bg-white text-black font-semibold px-8 py-3 rounded-xl text-[13px] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer">
                  Continue
                </motion.button>
              </motion.div>
            )}

            {/* ═══ STEP 1: Business Type ═══ */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-2xl w-full">
                <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                  What does{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">{businessName}</span>{" "}
                  do?
                </h1>
                <p className="text-white/30 text-[14px] mb-10">We&apos;ll pre-select the best agents for your industry.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BUSINESS_TYPES.map((type, i) => (
                    <motion.button key={type.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => selectType(type.id)}
                      whileHover={{ y: -4, borderColor: "rgba(139,92,246,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-8 text-left transition-all group cursor-pointer">
                      <span className="text-4xl">{type.emoji}</span>
                      <h3 className="font-semibold text-[16px] text-white/70 mt-4 group-hover:text-white transition-colors">{type.name}</h3>
                      <p className="text-[12px] text-white/25 mt-1.5">{type.agents} agents recommended</p>
                    </motion.button>
                  ))}
                </div>

                <button onClick={() => setStep(0)} className="mt-6 text-[12px] text-white/20 hover:text-white/40 transition-colors">&larr; Back</button>
              </motion.div>
            )}

            {/* ═══ STEP 2: Squad Assembly ═══ */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl w-full">
                <div className="text-center mb-8">
                  <p className="text-[11px] text-white/25 uppercase tracking-[0.2em] mb-2">Assemble your squad</p>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    Pick your{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">agents</span>
                  </h1>
                  <p className="text-white/30 text-[13px] mt-2">Hover to preview. Click to toggle.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-28 sm:mb-24">
                  {ALL_AGENTS.map((agent, i) => {
                    const isSelected = selected.has(agent.id);
                    const isHovered = hoveredAgent === agent.id;
                    return (
                      <motion.div key={agent.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => toggle(agent.id)}
                        onMouseEnter={() => setHoveredAgent(agent.id)}
                        onMouseLeave={() => setHoveredAgent(null)}
                        whileHover={{ y: -3 }}
                        className={`cursor-pointer rounded-xl p-6 border transition-all ${
                          isSelected ? "bg-white/[0.05] border-white/15" : "bg-white/[0.02] border-white/[0.04] opacity-50 hover:opacity-80"
                        }`}
                        style={isSelected ? { borderColor: `${agent.color}40`, boxShadow: `0 0 20px ${agent.color}10` } : {}}>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold transition-transform"
                              style={{
                                backgroundColor: isSelected ? `${agent.color}20` : "rgba(255,255,255,0.04)",
                                color: isSelected ? agent.color : "rgba(255,255,255,0.2)",
                                transform: isHovered ? "scale(1.1)" : "scale(1)",
                              }}>
                              {agent.letter}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold" style={{ color: isSelected ? agent.color : "rgba(255,255,255,0.5)" }}>{agent.name}</div>
                              <div className="text-[10px] text-white/25">{agent.role}</div>
                            </div>
                          </div>
                          <div className={`w-11 h-6 rounded-full transition-all flex items-center ${isSelected ? "justify-end" : "justify-start"}`}
                            style={{ backgroundColor: isSelected ? agent.color : "rgba(255,255,255,0.08)" }}>
                            <motion.div layout className="w-4.5 h-4.5 bg-white rounded-full mx-0.5"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                          </div>
                        </div>

                        <p className="text-[11px] text-white/25 leading-relaxed">{agent.desc}</p>

                        <AnimatePresence>
                          {isHovered && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                              <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                                {agent.preview.map((p, j) => (
                                  <div key={j} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: agent.color }} />
                                    <span className="text-[11px] text-white/50 font-mono">{p}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="mt-2 text-[11px]" style={{ color: isSelected ? agent.color : "rgba(255,255,255,0.15)" }}>
                          ${agent.price}/mo
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Sticky deploy bar */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  className="fixed bottom-0 left-0 right-0 z-40 bg-[#08080F]/90 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4"
                  style={{ borderTop: "1px solid transparent", borderImage: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), rgba(34,211,238,0.3), transparent) 1" }}>
                  <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          {ALL_AGENTS.filter((a) => selected.has(a.id)).slice(0, 5).map((a) => (
                            <div key={a.id} className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[7px] sm:text-[8px] font-bold border border-[#08080F]"
                              style={{ backgroundColor: `${a.color}25`, color: a.color }}>
                              {a.letter}
                            </div>
                          ))}
                          {ALL_AGENTS.filter((a) => selected.has(a.id)).length > 5 && (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[7px] sm:text-[8px] font-bold border border-[#08080F] bg-white/10 text-white/40">
                              +{ALL_AGENTS.filter((a) => selected.has(a.id)).length - 5}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">${totalPrice}</span>
                          <span className="text-white/20 text-[11px] sm:text-[12px] ml-1">/mo · {selected.size} agents</span>
                        </div>
                      </div>
                      <button onClick={() => setStep(1)} className="text-[12px] text-white/20 hover:text-white/40 transition-colors px-3 py-2 sm:hidden">Back</button>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button onClick={() => setStep(1)} className="hidden sm:block text-[12px] text-white/20 hover:text-white/40 transition-colors px-4 py-2">Back</button>
                      <button onClick={handleDeploy} disabled={selected.size === 0}
                        className="w-full sm:w-auto bg-white text-black font-semibold px-8 py-3 rounded-xl text-[13px] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed">
                        Deploy Squad &rarr;
                      </button>
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
