"use client";

import { useRef, useCallback, useEffect } from "react";
import "./BorderGlow.css";

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const vars: Record<string, string> = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const GRADIENT_KEYS = ["--gradient-one", "--gradient-two", "--gradient-three", "--gradient-four", "--gradient-five", "--gradient-six", "--gradient-seven"];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]) {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  colors?: string[];
  fillOpacity?: number;
  animated?: boolean;
}

export default function BorderGlow({
  children, className = "", glowColor = "40 80 80", backgroundColor = "#08080F",
  borderRadius = 12, glowRadius = 30, glowIntensity = 1.0, coneSpread = 25,
  colors = ["#c084fc", "#f472b6", "#38bdf8"], fillOpacity = 0.4,
  animated = false,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated) return;
    const card = cardRef.current;
    if (!card) return;

    let cancelled = false;
    let hasPlayed = false;

    function runSweep() {
      if (hasPlayed || cancelled || !card) return;
      hasPlayed = true;
      card.classList.add("sweep-active");
      const startTime = performance.now();

      function tick(now: number) {
        if (cancelled || !card) return;
        const elapsed = now - startTime;

        const angleProgress = Math.min(elapsed / 6500, 1);
        const angleEased = angleProgress < 0.5
          ? 2 * angleProgress * angleProgress
          : 1 - Math.pow(-2 * angleProgress + 2, 2) / 2;
        card.style.setProperty("--cursor-angle", `${(110 + angleEased * 355).toFixed(3)}deg`);

        let proximity: number;
        if (elapsed < 800) proximity = (elapsed / 800) * 100;
        else if (elapsed < 5000) proximity = 100;
        else if (elapsed < 7000) proximity = 100 * (1 - (elapsed - 5000) / 2000);
        else proximity = 0;
        card.style.setProperty("--edge-proximity", `${Math.max(0, Math.min(100, proximity)).toFixed(3)}`);

        if (elapsed < 7000) requestAnimationFrame(tick);
        else { card.style.setProperty("--edge-proximity", "0"); card.classList.remove("sweep-active"); }
      }
      requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) runSweep();
    }, { threshold: 0.3 });
    observer.observe(card);

    return () => { cancelled = true; observer.disconnect(); };
  }, [animated]);

  const getCenterOfElement = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const [cx, cy] = getCenterOfElement(card);
    const dx = x - cx, dy = y - cy;
    let kx = Infinity, ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
    card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
  }, [getCenterOfElement]);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        "--card-bg": backgroundColor,
        "--edge-sensitivity": 30,
        "--border-radius": `${borderRadius}px`,
        "--glow-padding": `${glowRadius}px`,
        "--cone-spread": coneSpread,
        "--fill-opacity": fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      } as React.CSSProperties}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
