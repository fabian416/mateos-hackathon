"use client";

import dynamic from "next/dynamic";
import TopNav from "@/components/ui/TopNav";

const ArgentinaNetwork = dynamic(() => import("@/components/network/ArgentinaNetwork"), { ssr: false });

import { useEffect, useRef } from "react";

export default function NetworkPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const totalH = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTo({ top: totalH * 0.10, behavior: "instant" });
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#08080F] text-white">
      <TopNav />
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative" style={{ height: "200vh" }}>
          <ArgentinaNetwork />
        </div>
      </div>
    </div>
  );
}
