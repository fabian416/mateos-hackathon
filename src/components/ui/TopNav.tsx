"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/walletContext";

const NAV_TABS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Network", href: "/network" },
  { label: "Explore", href: "/explore" },
  { label: "Deploy Squad", href: "/onboarding" },
];

import MateLogo from "@/components/MateLogo";

function MateOSLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
      <MateLogo size={32} />
      <span className="font-bold text-white text-[16px] tracking-tight">MateOS</span>
    </Link>
  );
}

function WalletButton() {
  const { connected, address, connect, disconnect } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { currentSquadView, isOwner: checkOwner } = useWallet();
  const viewingOwn = checkOwner(currentSquadView);

  if (!connected) {
    return (
      <button
        onClick={connect}
        className="border border-white/15 rounded-lg px-4 py-2 text-[12px] text-white/50 hover:text-white/70 hover:border-white/25 hover:bg-white/5 transition-all cursor-pointer"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 bg-white/5 border border-emerald-500/20 rounded-lg px-3 py-1.5 hover:bg-white/8 transition-all cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
        <span className="text-[12px] font-mono text-white/70">{address}</span>
        {viewingOwn ? (
          <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
            Owner
          </span>
        ) : (
          <span className="text-[10px] text-white/30 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
            Base
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 bg-[#12121F] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px]">
          <button
            onClick={() => {
              disconnect();
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="h-[56px] bg-[#08080F]/80 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between relative z-50 shrink-0">
      {/* Left: Logo */}
      <MateOSLogo />

      {/* Center: Nav tabs (desktop) */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-4 py-[17px] text-[13px] font-medium transition-colors ${
                isActive ? "text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-16px)] h-[2px] bg-violet-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right: Wallet + mobile hamburger */}
      <div className="flex items-center gap-3">
        <WalletButton />

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1 p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span className={`block w-4 h-[1.5px] bg-white/50 transition-all ${mobileMenuOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-4 h-[1.5px] bg-white/50 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-[1px]" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[56px] left-0 right-0 bg-[#08080F]/95 backdrop-blur-md border-b border-white/[0.06] md:hidden z-50">
          {NAV_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-6 py-3 text-[13px] font-medium border-b border-white/[0.04] transition-colors ${
                  isActive ? "text-white bg-violet-500/10" : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
