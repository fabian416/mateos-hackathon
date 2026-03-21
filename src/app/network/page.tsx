"use client";

import dynamic from "next/dynamic";
import TopNav from "@/components/ui/TopNav";

const ArgentinaNetwork = dynamic(() => import("@/components/network/ArgentinaNetwork"), { ssr: false });

export default function NetworkPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08080F] text-white">
      <TopNav />
      <div className="relative" style={{ height: "200vh" }}>
        <ArgentinaNetwork />
      </div>
    </div>
  );
}
