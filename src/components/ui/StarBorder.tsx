"use client";

import { ReactNode } from "react";

interface StarBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  radius?: string;
  as?: React.ElementType;
}

export default function StarBorder({
  children, className = "", color = "white",
  speed = "6s", thickness = 1, radius = "9999px",
  as: Component = "div" as React.ElementType,
}: StarBorderProps) {
  return (
    <Component
      className={`relative inline-block overflow-hidden ${className}`}
      style={{ padding: `${thickness}px`, borderRadius: radius }}
    >
      {/* Bottom gradient */}
      <div
        className="absolute opacity-70 z-0"
        style={{
          width: "300%", height: "50%",
          bottom: "-12px", right: "-250%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-move-bottom ${speed} linear infinite alternate`,
        }}
      />
      {/* Top gradient */}
      <div
        className="absolute opacity-70 z-0"
        style={{
          width: "300%", height: "50%",
          top: "-12px", left: "-250%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-move-top ${speed} linear infinite alternate`,
        }}
      />
      {/* Inner content */}
      <div className="relative z-[1]" style={{ borderRadius: radius }}>
        {children}
      </div>
    </Component>
  );
}
