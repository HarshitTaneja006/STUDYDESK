"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number; // starting x as percentage of viewport
  y: number; // starting y as percentage of viewport
  rotation: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  drift: number; // horizontal drift in px
}

const COLORS = [
  "#a7342d", // danger red
  "#ddcd45", // warning yellow
  "#86a361", // success green
  "#0b74d5", // secondary blue
  "#41403e", // primary dark
  "#f5f0c6", // light yellow
  "#d5dfc8", // light green
  "#f3d8d5", // light red
];

interface ConfettiBurstProps {
  /** Unique key that changes to trigger a new burst */
  trigger: number | string | null;
  /** Origin coordinates (viewport px). Defaults to center-top. */
  originX?: number;
  originY?: number;
  /** Number of pieces */
  count?: number;
}

/** Fires a burst of paper-style confetti pieces. Renders nothing after animation completes. */
export function ConfettiBurst({ trigger, originX, originY, count = 30 }: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger === null || trigger === undefined || trigger === 0) return;

    const x = originX ?? window.innerWidth / 2;
    const y = originY ?? window.innerHeight / 3;
    const xPct = (x / window.innerWidth) * 100;
    const yPct = (y / window.innerHeight) * 100;

    const newPieces: ConfettiPiece[] = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      x: xPct + (Math.random() - 0.5) * 10,
      y: yPct,
      rotation: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 100,
      duration: 800 + Math.random() * 700,
      drift: (Math.random() - 0.5) * 300,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(newPieces);

    // Clear after max duration
    const maxDuration = Math.max(...newPieces.map((p) => p.duration + p.delay));
    const timer = setTimeout(() => setPieces([]), maxDuration + 100);
    return () => clearTimeout(timer);
  }, [trigger, originX, originY, count]);

  if (pieces.length === 0) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            background: p.color,
            border: "1px solid rgba(0,0,0,0.15)",
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}ms ease-in ${p.delay}ms forwards`,
            // CSS custom property for drift
            ["--drift" as never]: `${p.drift}px`,
            // Paper-like slightly irregular shape
            clipPath: "polygon(0 0, 100% 10%, 95% 90%, 5% 100%)",
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--drift, 0px), 100vh) rotate(720deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
