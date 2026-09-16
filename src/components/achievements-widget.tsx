"use client";

import { useState } from "react";
import { Award, ChevronDown, Lock } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useStreak } from "@/hooks/use-streak";

export function AchievementsWidget() {
  const { totalCompleted, longestStreak, currentStreak, studyPoints, mounted } = useStreak();
  const [expanded, setExpanded] = useState(false);

  if (!mounted) return null;

  const stats = { totalCompleted, longestStreak, currentStreak, studyPoints };
  const unlocked = ACHIEVEMENTS.filter((a) => a.isUnlocked(stats));
  const locked = ACHIEVEMENTS.filter((a) => !a.isUnlocked(stats));
  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div
      style={{
        marginBottom: "1.25rem",
        border: "2px solid #41403e",
        background: "#fffdf7",
        boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}
    >
      {/* Header (collapsible) */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.7rem 0.9rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: "1.05rem",
          color: "#41403e",
        }}
      >
        <Award size={18} color="#8b8612" />
        <span style={{ flex: 1, textAlign: "left" }}>Achievements</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {/* Mini progress */}
          <div
            style={{
              width: "60px",
              height: "8px",
              border: "1.5px solid #41403e",
              background: "#f4f1ea",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "#8b8612",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'Neucha', cursive",
              fontSize: "0.82rem",
              color: "#868e96",
              whiteSpace: "nowrap",
            }}
          >
            {unlockedCount}/{totalCount}
          </span>
          <ChevronDown
            size={16}
            style={{
              transition: "transform 0.2s ease",
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
              color: "#868e96",
            }}
          />
        </div>
      </button>

      {/* Expanded badge grid */}
      {expanded && (
        <div
          className="fade-in"
          style={{
            padding: "0 0.9rem 0.85rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 90px), 1fr))",
            gap: "0.5rem",
          }}
        >
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = a.isUnlocked(stats);
            return (
              <div
                key={a.id}
                title={`${a.label}: ${a.description}${isUnlocked ? " ✓" : " (locked)"}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.55rem 0.3rem",
                  border: `2px ${isUnlocked ? "solid" : "dashed"} ${isUnlocked ? a.color : "#c1bdb4"}`,
                  background: isUnlocked ? a.bg : "#f9f7f0",
                  opacity: isUnlocked ? 1 : 0.6,
                  position: "relative",
                  transition: "all 0.2s ease",
                  cursor: "default",
                }}
              >
                <span
                  style={{
                    fontSize: "1.6rem",
                    lineHeight: 1,
                    filter: isUnlocked ? "none" : "grayscale(1)",
                  }}
                >
                  {a.emoji}
                </span>
                <span
                  style={{
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.72rem",
                    color: isUnlocked ? a.color : "#868e96",
                    textAlign: "center",
                    lineHeight: 1.1,
                    fontWeight: 700,
                  }}
                >
                  {a.label}
                </span>
                {!isUnlocked && (
                  <Lock
                    size={10}
                    style={{
                      position: "absolute",
                      top: "3px",
                      right: "3px",
                      color: "#c1bdb4",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Collapsed preview: show latest unlocked badges */}
      {!expanded && unlocked.length > 0 && (
        <div
          style={{
            padding: "0 0.9rem 0.7rem",
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {unlocked.slice(-5).reverse().map((a) => (
            <span
              key={a.id}
              title={`${a.label}: ${a.description}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.15rem 0.5rem",
                background: a.bg,
                border: `1px solid ${a.color}`,
                fontFamily: "'Neucha', cursive",
                fontSize: "0.78rem",
                color: a.color,
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: "0.95rem" }}>{a.emoji}</span>
              {a.label}
            </span>
          ))}
          {unlocked.length > 5 && (
            <span
              style={{
                fontFamily: "'Neucha', cursive",
                fontSize: "0.78rem",
                color: "#868e96",
              }}
            >
              +{unlocked.length - 5} more
            </span>
          )}
        </div>
      )}
      {!expanded && unlocked.length === 0 && (
        <div
          style={{
            padding: "0 0.9rem 0.7rem",
            fontFamily: "'Neucha', cursive",
            fontSize: "0.82rem",
            color: "#868e96",
            fontStyle: "italic",
          }}
        >
          Complete tasks to unlock your first achievement!
        </div>
      )}
    </div>
  );
}
