"use client";

import { useEffect, useState, useCallback } from "react";
import { X, BarChart3, TrendingUp, Calendar, Flame, Star, Award, CheckCircle } from "lucide-react";
import { useStreak } from "@/hooks/use-streak";
import { ACHIEVEMENTS } from "@/lib/achievements";

interface WeeklyRecapModalProps {
  open: boolean;
  onClose: () => void;
}

interface DayData {
  date: string;
  label: string;
  weekday: string;
  completions: number;
  points: number;
  isToday: boolean;
}

function getLast7Days(): DayData[] {
  const days: DayData[] = [];
  const today = new Date();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: weekdays[d.getDay()],
      completions: 0,
      points: 0,
      isToday: i === 0,
    });
  }
  return days;
}

function getHeatColor(completions: number): string {
  if (completions === 0) return "#e9e6dd";
  if (completions === 1) return "#d5dfc8";
  if (completions === 2) return "#a8c88f";
  if (completions === 3) return "#86a361";
  if (completions === 4) return "#5e7a44";
  return "#3a4d28";
}

export function WeeklyRecapModal({ open, onClose }: WeeklyRecapModalProps) {
  const { studyPoints, totalCompleted, currentStreak, longestStreak, mounted } = useStreak();
  const [days, setDays] = useState<DayData[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open || !mounted) return;
    // Load points history to build the 7-day chart
    try {
      const raw = window.localStorage.getItem("studydesk:points");
      const history: { date: string; points: number; taskId: string }[] = raw
        ? JSON.parse(raw).history || []
        : [];
      const last7 = getLast7Days();
      for (const day of last7) {
        const entries = history.filter((h) => h.date === day.date);
        day.completions = entries.length;
        day.points = entries.reduce((s, h) => s + h.points, 0);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDays(last7);

      // Get unlocked badges
      const stats = {
        totalCompleted,
        currentStreak,
        longestStreak,
        studyPoints,
      };
      const unlocked = ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).map((a) => a.id);
      setUnlockedBadges(unlocked);
    } catch {
      // ignore
    }
  }, [open, mounted, totalCompleted, currentStreak, longestStreak, studyPoints]);

  if (!open) return null;

  const weekTotalCompletions = days.reduce((s, d) => s + d.completions, 0);
  const weekTotalPoints = days.reduce((s, d) => s + d.points, 0);
  const maxCompletions = Math.max(...days.map((d) => d.completions), 1);
  const avgPerDay = (weekTotalCompletions / 7).toFixed(1);
  const bestDay = days.reduce((best, d) => (d.completions > best.completions ? d : best), days[0]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Weekly recap"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,18,15,0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 70,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="paper-pop"
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#fffdf7",
          border: "3px solid #41403e",
          boxShadow: "6px 6px 0 rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1.25rem",
            borderBottom: "2px dashed #c1bdb4",
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.025) 6px, rgba(0,0,0,0.025) 12px)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1.5rem",
              margin: 0,
              color: "#1a1a1a",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <BarChart3 size={22} /> Weekly Recap
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recap"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#868e96",
              padding: "0.3rem",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem" }}>
          {/* Summary stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))",
              gap: "0.6rem",
              marginBottom: "1.25rem",
            }}
          >
            <RecapStat
              icon={<CheckCircle size={18} color="#86a361" />}
              label="Completed"
              value={weekTotalCompletions}
              bg="#e6eedb"
            />
            <RecapStat
              icon={<Star size={18} color="#8b8612" />}
              label="Points"
              value={weekTotalPoints}
              bg="#f5f0c6"
            />
            <RecapStat
              icon={<TrendingUp size={18} color="#0b74d5" />}
              label="Avg/day"
              value={avgPerDay}
              bg="#d8ebfd"
            />
            <RecapStat
              icon={<Flame size={18} color="#a7342d" />}
              label="Streak"
              value={currentStreak}
              bg="#f3d8d5"
            />
          </div>

          {/* 7-day bar chart */}
          <h4
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1rem",
              margin: "0 0 0.6rem",
              color: "#41403e",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Calendar size={15} /> Last 7 Days
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.35rem",
              height: "120px",
              padding: "0.5rem 0.3rem",
              border: "2px solid #41403e",
              background: "#f9f7f0",
              marginBottom: "0.5rem",
            }}
          >
            {days.map((d) => {
              const heightPct = (d.completions / maxCompletions) * 100;
              return (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.2rem",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Neucha', cursive",
                      fontSize: "0.7rem",
                      color: "#868e96",
                      fontWeight: 600,
                    }}
                  >
                    {d.completions > 0 ? d.completions : ""}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(heightPct, 2)}%`,
                      background: getHeatColor(d.completions),
                      border: `1px solid ${d.isToday ? "#41403e" : "rgba(0,0,0,0.1)"}`,
                      transition: "height 0.4s ease",
                      position: "relative",
                    }}
                    title={`${d.weekday} ${d.label}: ${d.completions} task${d.completions === 1 ? "" : "s"}, ${d.points} pts`}
                  >
                    {d.isToday && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-12px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "0.6rem",
                          color: "#0b74d5",
                          fontWeight: 700,
                        }}
                      >
                        ★
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Weekday labels */}
          <div
            style={{
              display: "flex",
              gap: "0.35rem",
              padding: "0 0.3rem",
              marginBottom: "1.25rem",
            }}
          >
            {days.map((d) => (
              <div
                key={d.date}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.72rem",
                  color: d.isToday ? "#0b74d5" : "#868e96",
                  fontWeight: d.isToday ? 700 : 400,
                }}
              >
                <div>{d.weekday}</div>
                <div style={{ fontSize: "0.68rem" }}>{d.label}</div>
              </div>
            ))}
          </div>

          {/* Best day callout */}
          {bestDay && bestDay.completions > 0 && (
            <div
              style={{
                padding: "0.6rem 0.8rem",
                border: "2px dashed #86a361",
                background: "#e6eedb",
                marginBottom: "1.25rem",
                fontFamily: "'Neucha', cursive",
                fontSize: "0.88rem",
                color: "#3a4d28",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Award size={16} color="#5e7a44" />
              Best day: <strong>{bestDay.weekday} {bestDay.label}</strong> with {bestDay.completions} task{bestDay.completions === 1 ? "" : "s"} completed
            </div>
          )}

          {/* Earned badges */}
          <h4
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1rem",
              margin: "0 0 0.6rem",
              color: "#41403e",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Award size={15} /> Earned Badges ({unlockedBadges.length}/{ACHIEVEMENTS.length})
          </h4>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              padding: "0.5rem",
              border: "2px dashed #c1bdb4",
              background: "#f9f7f0",
              minHeight: "50px",
            }}
          >
            {unlockedBadges.length === 0 ? (
              <span
                style={{
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.82rem",
                  color: "#868e96",
                  fontStyle: "italic",
                }}
              >
                No badges earned yet - complete tasks to unlock achievements!
              </span>
            ) : (
              ACHIEVEMENTS.filter((a) => unlockedBadges.includes(a.id)).map((a) => (
                <span
                  key={a.id}
                  title={`${a.label}: ${a.description}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.2rem 0.5rem",
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
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.6rem 1.25rem",
            borderTop: "2px dashed #c1bdb4",
            background: "#f9f7f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "'Neucha', cursive",
            fontSize: "0.8rem",
            color: "#868e96",
          }}
        >
          <span>Press <kbd>Esc</kbd> to close</span>
          <span>Keep up the great work! 💪</span>
        </div>
      </div>
    </div>
  );
}

function RecapStat({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
}) {
  return (
    <div
      style={{
        padding: "0.6rem 0.7rem",
        border: "2px solid #41403e",
        background: bg,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        boxShadow: "2px 2px 0 rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div>
        <div
          style={{
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "1.3rem",
            lineHeight: 1,
            color: "#1a1a1a",
            fontWeight: 700,
          }}
        >
          {value}
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
          {label}
        </small>
      </div>
    </div>
  );
}
