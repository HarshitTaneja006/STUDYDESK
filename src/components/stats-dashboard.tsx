"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Clock, AlertTriangle, CalendarDays, Flame } from "lucide-react";
import type { TaskStats } from "@/lib/task-utils";
import { Skeleton } from "@/components/skeleton";

interface StatsDashboardProps {
  stats: TaskStats | null;
  loading: boolean;
  completedCount?: number;
  onClearCompleted?: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
  bg: string;
  delay?: number;
  hint?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) {
      prev.current = to;
      return;
    }
    const duration = 350;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
}

function StatCard({ icon, label, value, accent, bg, delay = 0, hint }: StatCardProps) {
  return (
    <div
      className="paper-pop stat-card-hover"
      style={{
        flex: "1 1 140px",
        minWidth: 0,
        padding: "0.85rem 0.9rem",
        border: "2px solid #41403e",
        background: bg,
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        position: "relative",
        boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
        animationDelay: `${delay}ms`,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        overflow: "hidden",
      }}
      title={hint}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: accent }}>
        {icon}
        <span
          style={{
            fontFamily: "'Neucha', cursive",
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: "1.9rem",
          lineHeight: 1,
          color: accent,
          fontWeight: 700,
        }}
      >
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
    </div>
  );
}

const PRIORITY_BAR_COLOR: Record<string, string> = {
  high: "#a7342d",
  medium: "#ddcd45",
  low: "#86a361",
};

export function StatsDashboard({
  stats,
  loading,
  completedCount = 0,
  onClearCompleted,
}: StatsDashboardProps) {
  if (loading && !stats) {
    return (
      <section aria-label="Loading statistics" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="stat"
              style={{ flex: "1 1 140px", animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        <div style={{ marginTop: "0.85rem" }}>
          <Skeleton height="68px" />
        </div>
      </section>
    );
  }

  if (!stats) return null;

  const totalPriority = stats.byPriority.reduce((s, p) => s + p.count, 0) || 1;

  return (
    <section
      aria-label="Dashboard statistics"
      style={{ marginBottom: "1.5rem" }}
    >
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <StatCard
          icon={<BookOpen size={16} />}
          label="Total"
          value={stats.total}
          accent="#41403e"
          bg="#fffdf7"
          delay={0}
          hint="All tasks on your desk"
        />
        <StatCard
          icon={<Clock size={16} />}
          label="Pending"
          value={stats.pending}
          accent="#7a6e0d"
          bg="#fbf6d8"
          delay={60}
          hint="Still to do"
        />
        <StatCard
          icon={<CheckCircle2 size={16} />}
          label="Done"
          value={stats.completed}
          accent="#5e7a44"
          bg="#e6eedb"
          delay={120}
          hint="Completed tasks"
        />
        <StatCard
          icon={<AlertTriangle size={16} />}
          label="Overdue"
          value={stats.overdue}
          accent="#a7342d"
          bg="#f3d8d5"
          delay={180}
          hint="Past due date and still pending"
        />
        <StatCard
          icon={<CalendarDays size={16} />}
          label="Due Today"
          value={stats.dueToday}
          accent="#0b74d5"
          bg="#d8ebfd"
          delay={240}
          hint="Tasks due today (any status)"
        />
        <StatCard
          icon={<Flame size={16} />}
          label="High Priority"
          value={stats.highPriority}
          accent="#a7342d"
          bg="#fff1ec"
          delay={300}
          hint="High priority and still pending"
        />
      </div>

      {/* Completion + priority breakdown */}
      <div
        style={{
          marginTop: "0.85rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "0.75rem",
        }}
      >
        {/* Completion progress bar */}
        <div
          style={{
            padding: "0.75rem 1rem",
            border: "2px solid #41403e",
            background: "#fffdf7",
            boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "0.45rem",
              flexWrap: "wrap",
            }}
          >
            {/* Circular progress ring */}
            <div
              style={{
                position: "relative",
                width: "64px",
                height: "64px",
                flexShrink: 0,
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#e9e6dd"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#86a361"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - stats.completionRate / 100)}`}
                  style={{
                    transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1.1rem",
                  color: stats.completionRate === 100 ? "#5e7a44" : "#41403e",
                  fontWeight: 700,
                }}
              >
                {stats.completionRate}%
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1rem",
                }}
              >
                Overall Completion
              </div>
              <div style={{ fontSize: "1.2rem", color: "#5e7a44" }}>
                {stats.completed}/{stats.total} done
              </div>
            </div>
          </div>
          {/* Linear bar (kept for detail) */}
          <div
            style={{
              height: "20px",
              border: "2px solid #41403e",
              background: "repeating-linear-gradient(90deg, #e9e6dd, #e9e6dd 6px, #ddd9d0 6px, #ddd9d0 12px)",
              position: "relative",
              overflow: "hidden",
            }}
            role="progressbar"
            aria-valuenow={stats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall completion rate"
          >
            <div
              style={{
                height: "100%",
                width: `${stats.completionRate}%`,
                background:
                  "repeating-linear-gradient(45deg, #86a361, #86a361 8px, #6f8850 8px, #6f8850 16px)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.55rem",
              flexWrap: "wrap",
              gap: "0.4rem",
            }}
          >
            {stats.total === 0 ? (
              <small
                style={{
                  color: "#868e96",
                  fontFamily: "'Neucha', cursive",
                }}
              >
                Add your first task to get started!
              </small>
            ) : (
              <small
                style={{
                  color: "#868e96",
                  fontFamily: "'Neucha', cursive",
                }}
              >
                {stats.pending} pending · {stats.completed} done
              </small>
            )}
            {completedCount > 0 && onClearCompleted && (
              <button
                type="button"
                onClick={onClearCompleted}
                style={{
                  background: "transparent",
                  color: "#a7342d",
                  border: "1px dashed #a7342d",
                  cursor: "pointer",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.8rem",
                  padding: "0.15rem 0.5rem",
                }}
              >
                Clear {completedCount} completed
              </button>
            )}
          </div>
        </div>

        {/* Priority breakdown */}
        <div
          style={{
            padding: "0.75rem 1rem",
            border: "2px solid #41403e",
            background: "#fffdf7",
            boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.55rem",
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1rem",
            }}
          >
            <span>By Priority</span>
            <small
              style={{
                color: "#868e96",
                fontFamily: "'Neucha', cursive",
                fontSize: "0.8rem",
              }}
            >
              {totalPriority} total
            </small>
          </div>
          <div
            style={{
              display: "flex",
              height: "20px",
              border: "2px solid #41403e",
              background: "#f4f1ea",
              overflow: "hidden",
            }}
            aria-label="Priority distribution"
          >
            {(["high", "medium", "low"] as const).map((p) => {
              const item = stats.byPriority.find((x) => x.priority === p);
              const count = item?.count || 0;
              const pct = (count / totalPriority) * 100;
              return (
                <div
                  key={p}
                  title={`${p}: ${count}`}
                  style={{
                    width: `${pct}%`,
                    background: PRIORITY_BAR_COLOR[p],
                    transition: "width 0.6s ease",
                    minWidth: count > 0 ? "2px" : 0,
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.45rem",
              fontFamily: "'Neucha', cursive",
              fontSize: "0.78rem",
            }}
          >
            {(["high", "medium", "low"] as const).map((p) => {
              const item = stats.byPriority.find((x) => x.priority === p);
              const count = item?.count || 0;
              return (
                <span
                  key={p}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    color: "#41403e",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      background: PRIORITY_BAR_COLOR[p],
                      border: "1px solid rgba(0,0,0,0.2)",
                    }}
                  />
                  {p[0].toUpperCase() + p.slice(1)} · {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
