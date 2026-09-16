"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import type { TaskResponse } from "@/lib/task-utils";

interface CalendarViewProps {
  tasks: TaskResponse[];
  onSelectTask: (task: TaskResponse) => void;
  onSelectDay?: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PRIORITY_DOT: Record<string, string> = {
  high: "#a7342d",
  medium: "#ddcd45",
  low: "#86a361",
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarView({ tasks, onSelectTask, onSelectDay }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Build tasks-by-day map (only tasks with dueDate)
  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskResponse[]>();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const d = new Date(t.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(t);
      map.set(key, arr);
    }
    return map;
  }, [tasks]);

  // Build calendar grid (6 weeks)
  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const startDate = new Date(first);
    startDate.setDate(startDate.getDate() - startDay);
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  // Count tasks with due dates
  const tasksWithDue = tasks.filter((t) => t.dueDate).length;

  return (
    <div
      style={{
        border: "2px solid #41403e",
        background: "#fffdf7",
        boxShadow: "3px 3px 0 rgba(0,0,0,0.12)",
        padding: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.85rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <h3
          style={{
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "1.4rem",
            margin: 0,
            color: "#1a1a1a",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CalendarDays size={22} color="#41403e" />
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={goToday}
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.85rem",
              padding: "0.3rem 0.7rem",
              background: "#f4f1ea",
              color: "#41403e",
              border: "2px solid #41403e",
              cursor: "pointer",
            }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            style={{
              width: "34px",
              height: "34px",
              background: "#f4f1ea",
              color: "#41403e",
              border: "2px solid #41403e",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            style={{
              width: "34px",
              height: "34px",
              background: "#f4f1ea",
              color: "#41403e",
              border: "2px solid #41403e",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          marginBottom: "4px",
        }}
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.8rem",
              textAlign: "center",
              padding: "0.3rem 0",
              background: "#41403e",
              color: "#fffdf7",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
        }}
      >
        {days.map((d, i) => {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const dayTasks = tasksByDay.get(key) || [];
          const isToday = sameDay(d, today);
          const inMonth = d.getMonth() === viewMonth;
          const doneCount = dayTasks.filter((t) => t.status === "completed").length;
          return (
            <div
              key={i}
              style={{
                minHeight: "84px",
                padding: "0.3rem",
                border: `1px solid ${isToday ? "#0b74d5" : "#c1bdb4"}`,
                background: isToday
                  ? "#eef4fc"
                  : inMonth
                    ? "#fffdf7"
                    : "#f4f1ea",
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
                opacity: inMonth ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.85rem",
                    color: isToday ? "#0b74d5" : inMonth ? "#41403e" : "#868e96",
                    fontWeight: isToday ? 700 : 400,
                    background: isToday ? "#0b74d5" : "transparent",
                    color: isToday ? "#fff" : undefined,
                    width: isToday ? "22px" : "auto",
                    height: isToday ? "22px" : "auto",
                    borderRadius: isToday ? "50%" : 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {d.getDate()}
                </span>
                {onSelectDay && (
                  <button
                    type="button"
                    onClick={() => onSelectDay(d)}
                    aria-label={`Add task on ${d.toDateString()}`}
                    title="Add task on this day"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#868e96",
                      padding: 0,
                      display: "flex",
                      opacity: 0,
                      transition: "opacity 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
              {/* Task dots */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "2px",
                  alignItems: "flex-start",
                  flex: 1,
                }}
              >
                {dayTasks.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTask(t)}
                    title={t.title}
                    aria-label={`Task: ${t.title}`}
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background:
                        t.status === "completed"
                          ? "transparent"
                          : PRIORITY_DOT[t.priority] || "#41403e",
                      border: `2px solid ${
                        t.status === "completed"
                          ? "#cdcccb"
                          : PRIORITY_DOT[t.priority] || "#41403e"
                      }`,
                      cursor: "pointer",
                      padding: 0,
                      opacity: t.status === "completed" ? 0.5 : 1,
                      textDecoration: t.status === "completed" ? "line-through" : "none",
                    }}
                  />
                ))}
                {dayTasks.length > 4 && (
                  <span
                    style={{
                      fontFamily: "'Neucha', cursive",
                      fontSize: "0.7rem",
                      color: "#868e96",
                    }}
                  >
                    +{dayTasks.length - 4}
                  </span>
                )}
              </div>
              {/* Count footer */}
              {dayTasks.length > 0 && (
                <div
                  style={{
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.72rem",
                    color: doneCount === dayTasks.length ? "#5e7a44" : "#868e96",
                    fontWeight: 600,
                    marginTop: "auto",
                  }}
                >
                  {doneCount}/{dayTasks.length}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "0.85rem",
          paddingTop: "0.6rem",
          borderTop: "1px dashed #c1bdb4",
          fontFamily: "'Neucha', cursive",
          fontSize: "0.78rem",
          color: "#41403e",
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#a7342d",
            }}
          />
          High
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ddcd45",
            }}
          />
          Medium
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#86a361",
            }}
          />
          Low
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "transparent",
              border: "2px solid #cdcccb",
            }}
          />
          Completed
        </span>
        <span style={{ marginLeft: "auto", color: "#868e96" }}>
          {tasksWithDue} of {tasks.length} tasks have due dates
        </span>
      </div>
    </div>
  );
}
