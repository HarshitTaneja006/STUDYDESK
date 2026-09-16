"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "38px",
        height: "38px",
        background: "transparent",
        color: "var(--paper-text, #41403e)",
        border: "2px solid var(--paper-border, #41403e)",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Show both icons; CSS controls visibility via theme to avoid hydration mismatch */}
      <Sun
        size={18}
        style={{
          position: "absolute",
          opacity: mounted && isDark ? 0 : 1,
          transform: mounted && isDark ? "rotate(90deg) scale(0)" : "rotate(0) scale(1)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      />
      <Moon
        size={18}
        style={{
          position: "absolute",
          opacity: mounted && isDark ? 1 : 0,
          transform: mounted && isDark ? "rotate(0) scale(1)" : "rotate(-90deg) scale(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      />
    </button>
  );
}
