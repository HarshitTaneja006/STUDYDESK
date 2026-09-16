"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer, Coffee, Settings } from "lucide-react";

type TimerMode = "focus" | "break";
type TimerState = "idle" | "running" | "paused" | "finished";

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const PRESETS = [15, 25, 35, 45, 50];

const STORAGE_KEY = "studydesk:pomodoro-durations";

interface Durations {
  focus: number;
  break: number;
}

function loadDurations(): Durations {
  if (typeof window === "undefined") return { focus: DEFAULT_FOCUS_MINUTES, break: DEFAULT_BREAK_MINUTES };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        focus: [15, 20, 25, 30, 35, 40, 45, 50, 55, 60].includes(parsed.focus) ? parsed.focus : DEFAULT_FOCUS_MINUTES,
        break: [3, 5, 10, 15, 20].includes(parsed.break) ? parsed.break : DEFAULT_BREAK_MINUTES,
      };
    }
  } catch {
    // ignore
  }
  return { focus: DEFAULT_FOCUS_MINUTES, break: DEFAULT_BREAK_MINUTES };
}

function saveDurations(d: Durations) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    // ignore
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PomodoroTimer() {
  // Lazy init from localStorage to avoid setState-in-effect
  const [durations, setDurations] = useState<Durations>(loadDurations);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [state, setState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(() => loadDurations().focus * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const focusMinutes = durations.focus;
  const breakMinutes = durations.break;
  const totalSeconds = mode === "focus" ? focusMinutes * 60 : breakMinutes * 60;
  const progressPct = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTick;
  }, [clearTick]);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        clearTick();
        setState("finished");
        if (mode === "focus") {
          setCompletedSessions((c) => c + 1);
        }
        // Play a subtle notification sound via Web Audio API
        try {
          const ctx = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = mode === "focus" ? 660 : 440;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch {
          // ignore audio errors
        }
        return 0;
      }
      return prev - 1;
    });
  }, [clearTick, mode]);

  const start = useCallback(() => {
    if (state === "finished") {
      setSecondsLeft(totalSeconds);
    }
    setState("running");
    clearTick();
    intervalRef.current = setInterval(tick, 1000);
  }, [state, totalSeconds, clearTick, tick]);

  const pause = useCallback(() => {
    setState("paused");
    clearTick();
  }, [clearTick]);

  const reset = useCallback(() => {
    clearTick();
    setState("idle");
    setSecondsLeft(totalSeconds);
  }, [clearTick, totalSeconds]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      clearTick();
      setMode(newMode);
      setState("idle");
      setSecondsLeft(newMode === "focus" ? durations.focus * 60 : durations.break * 60);
    },
    [clearTick, durations]
  );

  const updateDuration = useCallback(
    (type: "focus" | "break", minutes: number) => {
      const next = { ...durations, [type]: minutes };
      setDurations(next);
      saveDurations(next);
      // If updating the current mode's duration, reset the timer
      if (mode === type) {
        clearTick();
        setState("idle");
        setSecondsLeft(minutes * 60);
      }
    },
    [durations, mode, clearTick]
  );

  const isRunning = state === "running";
  const isFocus = mode === "focus";

  // Circular progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPct / 100);

  return (
    <div
      style={{
        marginBottom: "1.25rem",
        border: `2px solid ${isFocus ? "#a7342d" : "#5e7a44"}`,
        background: isFocus ? "#fff1ec" : "#e6eedb",
        boxShadow: "2px 3px 0 rgba(0,0,0,0.10)",
        overflow: "hidden",
        transition: "border-color 0.3s ease, background 0.3s ease",
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.65rem 0.9rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: "1.05rem",
          color: "#41403e",
        }}
      >
        {isFocus ? <Timer size={18} color="#a7342d" /> : <Coffee size={18} color="#5e7a44" />}
        <span style={{ flex: 1, textAlign: "left" }}>
          Focus Timer {isFocus ? "(Study)" : "(Break)"}
        </span>
        {completedSessions > 0 && (
          <span
            style={{
              fontFamily: "'Neucha', cursive",
              fontSize: "0.78rem",
              color: "#868e96",
              background: "#fffdf7",
              padding: "0.1rem 0.45rem",
              border: "1px solid #c1bdb4",
            }}
          >
            🍅 ×{completedSessions}
          </span>
        )}
        <span
          style={{
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "1.3rem",
            color: isFocus ? "#a7342d" : "#5e7a44",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(secondsLeft)}
        </span>
      </button>

      {/* Expanded timer */}
      {expanded && (
        <div
          className="fade-in"
          style={{
            padding: "0.5rem 0.9rem 0.9rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          {/* Mode switch */}
          <div
            role="group"
            aria-label="Timer mode"
            style={{
              display: "inline-flex",
              border: "2px solid #41403e",
              background: "#f4f1ea",
              padding: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => switchMode("focus")}
              style={{
                padding: "0.3rem 0.9rem",
                background: isFocus ? "#a7342d" : "transparent",
                color: isFocus ? "#fffdf7" : "#41403e",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Timer size={13} /> Focus {focusMinutes}m
            </button>
            <button
              type="button"
              onClick={() => switchMode("break")}
              style={{
                padding: "0.3rem 0.9rem",
                background: !isFocus ? "#5e7a44" : "transparent",
                color: !isFocus ? "#fffdf7" : "#41403e",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "0.88rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Coffee size={13} /> Break {breakMinutes}m
            </button>
          </div>

          {/* Circular timer */}
          <div style={{ position: "relative", width: "120px", height: "120px" }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#fffdf7"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={isFocus ? "#a7342d" : "#5e7a44"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1.8rem",
                  color: isFocus ? "#a7342d" : "#5e7a44",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                {formatTime(secondsLeft)}
              </span>
              <span
                style={{
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.7rem",
                  color: "#868e96",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginTop: "0.15rem",
                }}
              >
                {state === "running" ? "Focusing..." : state === "paused" ? "Paused" : state === "finished" ? "Done! 🎉" : "Ready"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {isRunning ? (
              <button
                type="button"
                onClick={pause}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1rem",
                  padding: "0.5rem 1.2rem",
                  background: "#ddcd45",
                  color: "#5a5308",
                  border: "2px solid #8b8612",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 rgba(0,0,0,0.15)",
                }}
              >
                <Pause size={16} /> Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1rem",
                  padding: "0.5rem 1.2rem",
                  background: isFocus ? "#a7342d" : "#5e7a44",
                  color: "#fffdf7",
                  border: `2px solid ${isFocus ? "#7a2118" : "#3a4d28"}`,
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
                }}
              >
                <Play size={16} /> {state === "paused" ? "Resume" : "Start"}
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              aria-label="Reset timer"
              title="Reset"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                background: "transparent",
                color: "#41403e",
                border: "2px solid #41403e",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Session count */}
          {completedSessions > 0 && (
            <p
              style={{
                margin: 0,
                fontFamily: "'Neucha', cursive",
                fontSize: "0.8rem",
                color: "#868e96",
                textAlign: "center",
              }}
            >
              You&apos;ve completed{" "}
              <strong style={{ color: "#a7342d" }}>{completedSessions}</strong> focus session
              {completedSessions === 1 ? "" : "s"} today.{" "}
              {completedSessions >= 4 ? "Great work — take a longer break! 🌟" : "Keep going! 💪"}
            </p>
          )}

          {/* Settings toggle */}
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontFamily: "'Neucha', cursive",
              fontSize: "0.8rem",
              color: "#868e96",
              background: "transparent",
              border: "1px dashed #868e96",
              cursor: "pointer",
              padding: "0.25rem 0.6rem",
            }}
          >
            <Settings size={12} /> Custom durations
          </button>

          {/* Settings panel */}
          {showSettings && (
            <div
              className="fade-in"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px dashed #c1bdb4",
                background: "#f9f7f0",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.85rem",
                    color: "#41403e",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Focus duration
                </label>
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateDuration("focus", m)}
                      style={{
                        padding: "0.3rem 0.55rem",
                        background: focusMinutes === m ? "#a7342d" : "#fffdf7",
                        color: focusMinutes === m ? "#fffdf7" : "#41403e",
                        border: `2px solid ${focusMinutes === m ? "#a7342d" : "#c1bdb4"}`,
                        cursor: "pointer",
                        fontFamily: "'Patrick Hand SC', cursive",
                        fontSize: "0.8rem",
                        minWidth: "38px",
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.85rem",
                    color: "#41403e",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Break duration
                </label>
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                  {[3, 5, 10, 15, 20].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateDuration("break", m)}
                      style={{
                        padding: "0.3rem 0.55rem",
                        background: breakMinutes === m ? "#5e7a44" : "#fffdf7",
                        color: breakMinutes === m ? "#fffdf7" : "#41403e",
                        border: `2px solid ${breakMinutes === m ? "#5e7a44" : "#c1bdb4"}`,
                        cursor: "pointer",
                        fontFamily: "'Patrick Hand SC', cursive",
                        fontSize: "0.8rem",
                        minWidth: "38px",
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
