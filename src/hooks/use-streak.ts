"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "studydesk:streak";
const POINTS_KEY = "studydesk:points";
const LAST_COMPLETION_KEY = "studydesk:last-completion";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null; // YYYY-MM-DD
  totalCompleted: number;
}

interface PointsData {
  total: number;
  history: { date: string; points: number; taskId: string }[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

function loadStreak(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastCompletionDate: null, totalCompleted: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentStreak: 0, longestStreak: 0, lastCompletionDate: null, totalCompleted: 0 };
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastCompletionDate: null, totalCompleted: 0 };
  }
}

function loadPoints(): PointsData {
  if (typeof window === "undefined") return { total: 0, history: [] };
  try {
    const raw = window.localStorage.getItem(POINTS_KEY);
    if (!raw) return { total: 0, history: [] };
    return JSON.parse(raw);
  } catch {
    return { total: 0, history: [] };
  }
}

function saveStreak(data: StreakData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function savePoints(data: PointsData) {
  try {
    window.localStorage.setItem(POINTS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Tracks daily task-completion streaks and study points.
 * Points are awarded by priority: high=30, medium=20, low=10.
 */
export function useStreak() {
  const mounted = useMounted();
  const streak = mounted ? loadStreak() : { currentStreak: 0, longestStreak: 0, lastCompletionDate: null, totalCompleted: 0 };
  const points = mounted ? loadPoints() : { total: 0, history: [] };

  /** Called when a task is completed (not reopened or recurrence-advanced). Returns newly unlocked achievement IDs. */
  const recordCompletion = useCallback((taskId: string, priority: string): string[] => {
    if (typeof window === "undefined") return [];
    const today = todayStr();
    const data = loadStreak();
    const ptsData = loadPoints();

    // Compute unlocked achievements BEFORE the update
    const statsBefore = {
      totalCompleted: data.totalCompleted,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      studyPoints: ptsData.total,
    };

    // Update streak
    if (data.lastCompletionDate === today) {
      // Already completed a task today, just increment count
      data.totalCompleted += 1;
    } else if (data.lastCompletionDate) {
      const gap = daysBetween(data.lastCompletionDate, today);
      if (gap === 1) {
        // Consecutive day - extend streak
        data.currentStreak += 1;
        data.totalCompleted += 1;
      } else if (gap > 1) {
        // Streak broken - reset
        data.currentStreak = 1;
        data.totalCompleted += 1;
      } else {
        // gap <= 0 shouldn't happen (future date), ignore
        data.totalCompleted += 1;
      }
    } else {
      // First ever completion
      data.currentStreak = 1;
      data.totalCompleted += 1;
    }
    data.lastCompletionDate = today;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
    saveStreak(data);

    // Award points
    const pointsMap: Record<string, number> = { high: 30, medium: 20, low: 10 };
    const earned = pointsMap[priority] || 10;
    ptsData.total += earned;
    ptsData.history.unshift({ date: today, points: earned, taskId });
    // Keep last 100 entries
    ptsData.history = ptsData.history.slice(0, 100);
    savePoints(ptsData);

    // Compute unlocked achievements AFTER the update
    const statsAfter = {
      totalCompleted: data.totalCompleted,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      studyPoints: ptsData.total,
    };

    // Detect newly unlocked achievements by importing the achievements list lazily
    // We use a dynamic check to avoid circular dependency
    try {
      // Inline the achievement checks to avoid import cycle
      const checks: { id: string; check: (s: typeof statsAfter) => boolean }[] = [
        { id: "first-step", check: (s) => s.totalCompleted >= 1 },
        { id: "getting-started", check: (s) => s.totalCompleted >= 5 },
        { id: "on-fire", check: (s) => s.totalCompleted >= 10 },
        { id: "task-master", check: (s) => s.totalCompleted >= 25 },
        { id: "centurion", check: (s) => s.totalCompleted >= 100 },
        { id: "streak-3", check: (s) => s.longestStreak >= 3 },
        { id: "streak-7", check: (s) => s.longestStreak >= 7 },
        { id: "streak-30", check: (s) => s.longestStreak >= 30 },
        { id: "points-100", check: (s) => s.studyPoints >= 100 },
        { id: "points-500", check: (s) => s.studyPoints >= 500 },
        { id: "points-1000", check: (s) => s.studyPoints >= 1000 },
        { id: "streak-1", check: (s) => s.longestStreak >= 1 },
      ];
      const newlyUnlocked = checks
        .filter((c) => !c.check(statsBefore) && c.check(statsAfter))
        .map((c) => c.id);
      return newlyUnlocked;
    } catch {
      return [];
    }
  }, []);

  /** Reset streak (used when undoing a completion on the same day). */
  const undoCompletion = useCallback((taskId: string, priority: string) => {
    if (typeof window === "undefined") return;
    const ptsData = loadPoints();
    const pointsMap: Record<string, number> = { high: 30, medium: 20, low: 10 };
    const earned = pointsMap[priority] || 10;
    // Find and remove the most recent entry for this task
    const idx = ptsData.history.findIndex((h) => h.taskId === taskId);
    if (idx >= 0) {
      ptsData.total -= ptsData.history[idx].points;
      ptsData.history.splice(idx, 1);
    } else {
      ptsData.total -= earned;
    }
    if (ptsData.total < 0) ptsData.total = 0;
    savePoints(ptsData);

    // Decrement total completed
    const data = loadStreak();
    if (data.totalCompleted > 0) data.totalCompleted -= 1;
    saveStreak(data);
  }, []);

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalCompleted: streak.totalCompleted,
    studyPoints: points.total,
    pointsHistory: points.history,
    recordCompletion,
    undoCompletion,
    mounted,
  };
}
