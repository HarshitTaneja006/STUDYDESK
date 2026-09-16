"use client";

import { Flame, Trophy, Star, TrendingUp } from "lucide-react";
import { useStreak } from "@/hooks/use-streak";

export function StreakWidget() {
  const { currentStreak, longestStreak, totalCompleted, studyPoints, mounted } = useStreak();

  if (!mounted) return null;

  return (
    <div
      className="paper-pop"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))",
        gap: "0.5rem",
        marginBottom: "1.25rem",
      }}
    >
      {/* Current streak */}
      <div
        style={{
          padding: "0.75rem 0.85rem",
          border: "2px solid #41403e",
          background:
            currentStreak > 0
              ? "linear-gradient(135deg, #fff1ec 0%, #f3d8d5 100%)"
              : "#fffdf7",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: "2px solid #a7342d",
            background: "#fffdf7",
            flexShrink: 0,
          }}
        >
          <Flame
            size={20}
            color={currentStreak > 0 ? "#a7342d" : "#c1bdb4"}
            className={currentStreak > 0 ? "flame-flicker" : ""}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1.5rem",
              lineHeight: 1,
              color: currentStreak > 0 ? "#a7342d" : "#868e96",
              fontWeight: 700,
            }}
          >
            {currentStreak}
            <span
              style={{
                fontSize: "0.7rem",
                fontFamily: "'Neucha', cursive",
                marginLeft: "0.2rem",
                color: "#868e96",
              }}
            >
              day{currentStreak === 1 ? "" : "s"}
            </span>
          </div>
          <small
            style={{
              fontFamily: "'Neucha', cursive",
              fontSize: "0.72rem",
              color: "#868e96",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current streak
          </small>
        </div>
        {currentStreak > 0 && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "40px",
              height: "40px",
              background:
                "radial-gradient(circle at top right, rgba(167,52,45,0.08), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Study points */}
      <div
        style={{
          padding: "0.75rem 0.85rem",
          border: "2px solid #41403e",
          background:
            studyPoints > 0
              ? "linear-gradient(135deg, #fbf6d8 0%, #f5f0c6 100%)"
              : "#fffdf7",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: "2px solid #8b8612",
            background: "#fffdf7",
            flexShrink: 0,
          }}
        >
          <Star size={20} color={studyPoints > 0 ? "#8b8612" : "#c1bdb4"} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1.5rem",
              lineHeight: 1,
              color: studyPoints > 0 ? "#5a5308" : "#868e96",
              fontWeight: 700,
            }}
          >
            {studyPoints}
            <span
              style={{
                fontSize: "0.7rem",
                fontFamily: "'Neucha', cursive",
                marginLeft: "0.2rem",
                color: "#868e96",
              }}
            >
              pts
            </span>
          </div>
          <small
            style={{
              fontFamily: "'Neucha', cursive",
              fontSize: "0.72rem",
              color: "#868e96",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Study points
          </small>
        </div>
      </div>

      {/* Longest streak */}
      <div
        style={{
          padding: "0.75rem 0.85rem",
          border: "2px solid #41403e",
          background:
            longestStreak > 0
              ? "linear-gradient(135deg, #e6eedb 0%, #d5dfc8 100%)"
              : "#fffdf7",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: "2px solid #5e7a44",
            background: "#fffdf7",
            flexShrink: 0,
          }}
        >
          <Trophy size={20} color={longestStreak > 0 ? "#5e7a44" : "#c1bdb4"} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1.5rem",
              lineHeight: 1,
              color: longestStreak > 0 ? "#3a4d28" : "#868e96",
              fontWeight: 700,
            }}
          >
            {longestStreak}
            <span
              style={{
                fontSize: "0.7rem",
                fontFamily: "'Neucha', cursive",
                marginLeft: "0.2rem",
                color: "#868e96",
              }}
            >
              day{longestStreak === 1 ? "" : "s"}
            </span>
          </div>
          <small
            style={{
              fontFamily: "'Neucha', cursive",
              fontSize: "0.72rem",
              color: "#868e96",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Best streak
          </small>
        </div>
      </div>

      {/* Total completed */}
      <div
        style={{
          padding: "0.75rem 0.85rem",
          border: "2px solid #41403e",
          background:
            totalCompleted > 0
              ? "linear-gradient(135deg, #d8ebfd 0%, #eef4fc 100%)"
              : "#fffdf7",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: "2px solid #0b74d5",
            background: "#fffdf7",
            flexShrink: 0,
          }}
        >
          <TrendingUp size={20} color={totalCompleted > 0 ? "#0b74d5" : "#c1bdb4"} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1.5rem",
              lineHeight: 1,
              color: totalCompleted > 0 ? "#0b74d5" : "#868e96",
              fontWeight: 700,
            }}
          >
            {totalCompleted}
          </div>
          <small
            style={{
              fontFamily: "'Neucha', cursive",
              fontSize: "0.72rem",
              color: "#868e96",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Total done
          </small>
        </div>
      </div>
    </div>
  );
}
