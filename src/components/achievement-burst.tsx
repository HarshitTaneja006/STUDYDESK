"use client";

import { useEffect, useState } from "react";
import type { Achievement } from "@/lib/achievements";

interface AchievementBurstProps {
  /** Achievement to celebrate, or null when idle */
  achievement: Achievement | null;
  /** Unique trigger key - changes when a new achievement unlocks */
  trigger: number;
  onDone: () => void;
}

interface BurstPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  angle: number; // direction in degrees
  distance: number; // distance to travel
}

const BURST_COLORS = ["#a7342d", "#ddcd45", "#86a361", "#0b74d5", "#8b8612", "#41403e"];

/** Full-screen celebration overlay when an achievement is unlocked. */
export function AchievementBurst({ achievement, trigger, onDone }: AchievementBurstProps) {
  const [pieces, setPieces] = useState<BurstPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement || trigger === 0) return;

    // Generate burst pieces radiating from center
    const count = 24;
    const newPieces: BurstPiece[] = Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 360 + (Math.random() - 0.5) * 20;
      const distance = 120 + Math.random() * 180;
      return {
        id: Date.now() + i,
        x: 50, // center percentage
        y: 50,
        rotation: Math.random() * 360,
        color: BURST_COLORS[i % BURST_COLORS.length],
        size: 8 + Math.random() * 10,
        delay: Math.random() * 150,
        duration: 800 + Math.random() * 600,
        angle,
        distance,
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(newPieces);
    setVisible(true);

    // Auto-dismiss after animation
    const maxDuration = Math.max(...newPieces.map((p) => p.duration + p.delay));
    const timer = setTimeout(() => {
      setVisible(false);
      setPieces([]);
      onDone();
    }, maxDuration + 1800); // extra time to read the badge
    return () => clearTimeout(timer);
  }, [trigger, achievement, onDone]);

  if (!visible || !achievement || pieces.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "achievement-fade-in 0.3s ease-out",
      }}
    >
      {/* Dimmed background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(20,18,15,0.4)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Burst confetti pieces */}
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.3}px`,
            background: p.color,
            border: "1px solid rgba(0,0,0,0.15)",
            clipPath: "polygon(0 0, 100% 10%, 95% 90%, 5% 100%)",
            animation: `burst-out ${p.duration}ms ease-out ${p.delay}ms forwards`,
            // CSS custom properties for direction
            ["--bx" as never]: `${Math.cos((p.angle * Math.PI) / 180) * p.distance}px`,
            ["--by" as never]: `${Math.sin((p.angle * Math.PI) / 180) * p.distance}px`,
            ["--rot" as never]: `${p.rotation + 720}deg`,
          }}
        />
      ))}

      {/* Badge card */}
      <div
        className="paper-pop"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem 2.5rem",
          border: `4px solid ${achievement.color}`,
          background: achievement.bg,
          boxShadow: `6px 6px 0 ${achievement.color}40, 0 0 40px ${achievement.color}30`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6rem",
          textAlign: "center",
          maxWidth: "320px",
        }}
      >
        <div
          style={{
            fontSize: "4.5rem",
            lineHeight: 1,
            animation: "badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          {achievement.emoji}
        </div>
        <div
          style={{
            fontFamily: "'Neucha', cursive",
            fontSize: "0.8rem",
            color: achievement.color,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          Achievement Unlocked!
        </div>
        <h3
          style={{
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "1.6rem",
            margin: 0,
            color: achievement.color,
            fontWeight: 700,
          }}
        >
          {achievement.label}
        </h3>
        <p
          style={{
            fontFamily: "'Neucha', cursive",
            fontSize: "0.9rem",
            color: "#41403e",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {achievement.description}
        </p>
      </div>

      <style>{`
        @keyframes burst-out {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--bx, 0), var(--by, 0)) rotate(var(--rot, 720deg)) scale(0.6);
            opacity: 0;
          }
        }
        @keyframes badge-pop {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes achievement-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
