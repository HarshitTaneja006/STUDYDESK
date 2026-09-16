"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  ListTodo,
  Sparkles,
  CheckSquare,
  Search as SearchIcon,
  CalendarDays,
  LayoutGrid,
  Download,
  MoreHorizontal,
  HelpCircle,
  PartyPopper,
  ChevronDown,
  BarChart3,
  GripVertical,
} from "lucide-react";
import { useTasks, useStats, useHydratedFilters } from "@/hooks/use-tasks";
import { StatsDashboard } from "@/components/stats-dashboard";
import { FilterBar } from "@/components/filter-bar";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { TaskDetail } from "@/components/task-detail";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { CalendarView } from "@/components/calendar-view";
import { ExportImportModal } from "@/components/export-import-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickAddTemplates } from "@/components/quick-add-templates";
import { NotificationSettings } from "@/components/notification-settings";
import { HelpModal } from "@/components/help-modal";
import { TaskListSkeleton } from "@/components/skeleton";
import { ConfettiBurst } from "@/components/confetti";
import { StreakWidget } from "@/components/streak-widget";
import { AchievementsWidget } from "@/components/achievements-widget";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { MotivationQuote } from "@/components/motivation-quote";
import { WeeklyRecapModal } from "@/components/weekly-recap-modal";
import { AchievementBurst } from "@/components/achievement-burst";
import { SortableTaskList } from "@/components/sortable-task-list";
import { useStreak } from "@/hooks/use-streak";
import { ACHIEVEMENTS, type Achievement } from "@/lib/achievements";
import { useToast } from "@/hooks/use-toast";
import type { TaskResponse } from "@/lib/task-utils";

type ViewMode = "list" | "calendar";

export default function Home() {
  const { filters, setFilters, hydrated } = useHydratedFilters();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [detailTask, setDetailTask] = useState<TaskResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | undefined>();
  const [completedCollapsed, setCompletedCollapsed] = useState(false);
  const [weeklyRecapOpen, setWeeklyRecapOpen] = useState(false);
  const [achievementBurst, setAchievementBurst] = useState<Achievement | null>(null);
  const [achievementBurstTrigger, setAchievementBurstTrigger] = useState(0);

  const { tasks, loading, error, refetch } = useTasks(hydrated ? filters : filters);
  const { stats, refetch: refetchStats } = useStats();
  const { toast } = useToast();
  const { recordCompletion } = useStreak();

  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openCreateWithDate(date: Date) {
    setEditingTask(null);
    setFormOpen(true);
    // pre-fill due date — handled via editingTask null + a date hint; simplest: open form then user picks
    // We'll pass date via a global since TaskForm doesn't accept initial date prop yet.
    // For now, just open create; user can use quick chips.
    void date;
  }

  function openEdit(task: TaskResponse) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function openDetail(task: TaskResponse) {
    setDetailTask(task);
    setDetailOpen(true);
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetailTask(null);
  }

  function fireConfetti(task: TaskResponse, x: number, y: number) {
    setConfettiOrigin({ x, y });
    setConfettiTrigger((t) => t + 1);
    // Record streak + points for the completion, get newly unlocked achievements
    const unlockedIds = recordCompletion(task.id, task.priority);
    // Show toast for each newly unlocked achievement + burst animation for the first
    if (unlockedIds.length > 0) {
      for (const id of unlockedIds) {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) {
          toast({
            title: `${ach.emoji} Achievement Unlocked!`,
            description: `${ach.label} — ${ach.description}`,
          });
        }
      }
      // Trigger the full-screen burst for the first (most significant) achievement
      const firstAch = ACHIEVEMENTS.find((a) => a.id === unlockedIds[0]);
      if (firstAch) {
        setAchievementBurst(firstAch);
        setAchievementBurstTrigger((t) => t + 1);
      }
    }
  }

  function closeForm() {
    setFormOpen(false);
    setEditingTask(null);
  }

  async function handleChanged() {
    await Promise.all([refetch(), refetchStats()]);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Skip when typing in inputs or when modal/form open
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;
      if (formOpen) return;
      if (isTyping) {
        // Escape inside search clears focus
        if (e.key === "Escape" && target.tagName === "INPUT") {
          (target as HTMLInputElement).blur();
        }
        return;
      }
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openCreate();
      } else if (e.key === "/") {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>(
          'input[aria-label="Search tasks"]'
        );
        if (el) {
          el.focus();
          el.select?.();
        }
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        setSelectionMode((s) => {
          if (s) setSelectedIds(new Set());
          return !s;
        });
      } else if (e.key === "a" || e.key === "A") {
        if (selectionMode) {
          e.preventDefault();
          setSelectedIds(new Set(tasks.map((t) => t.id)));
        }
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setView("calendar");
      } else if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        setView("list");
      } else if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((h) => !h);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [formOpen, selectionMode, tasks]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(tasks.map((t) => t.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function bulkAction(action: "complete" | "pending" | "delete") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/tasks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Bulk action failed");
      }
      const data = await res.json();
      const verb =
        action === "delete"
          ? `Deleted ${data.deleted} task${data.deleted === 1 ? "" : "s"}`
          : action === "complete"
            ? `Completed ${data.updated} task${data.updated === 1 ? "" : "s"}`
            : `Restored ${data.updated} task${data.updated === 1 ? "" : "s"}`;
      toast({ title: "Bulk action done", description: verb });
      clearSelection();
      await handleChanged();
    } catch (e) {
      toast({
        title: "Bulk action failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBulkBusy(false);
    }
  }

  async function clearCompletedTasks() {
    setBulkBusy(true);
    try {
      const res = await fetch("/api/tasks/clear-completed", {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Clear failed");
      }
      const data = await res.json();
      toast({
        title: "Cleared completed",
        description: `${data.deleted} completed task${
          data.deleted === 1 ? "" : "s"
        } removed.`,
      });
      await handleChanged();
    } catch (e) {
      toast({
        title: "Clear failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBulkBusy(false);
    }
  }

  // Group pending vs completed when "all" status selected
  const grouped = useMemo(() => {
    if (filters.status !== "all") return null;
    const pending = tasks.filter((t) => t.status === "pending");
    const completed = tasks.filter((t) => t.status === "completed");
    return { pending, completed };
  }, [tasks, filters.status]);

  const completedCount = grouped?.completed.length ?? 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticky paper header */}
      <header
        style={{
          borderBottom: "3px solid #41403e",
          background: "#f4f1ea",
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 8px)",
          padding: "0.6rem 0",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                border: "2px solid #41403e",
                background: "#fffdf7",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.15)",
                transform: "rotate(-3deg)",
              }}
              aria-hidden
            >
              <ListTodo size={20} color="#41403e" />
            </span>
            <div>
              <h1
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1.55rem",
                  margin: 0,
                  lineHeight: 1,
                  color: "#1a1a1a",
                }}
              >
                StudyDesk
              </h1>
              <small
                style={{
                  fontFamily: "'Neucha', cursive",
                  color: "#868e96",
                  fontSize: "0.78rem",
                }}
              >
                Student Task Manager
              </small>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* View toggle */}
            <div
              role="group"
              aria-label="View mode"
              style={{
                display: "inline-flex",
                border: "2px solid #41403e",
                background: "#f4f1ea",
                padding: "2px",
              }}
            >
              <button
                type="button"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                title="List view (V)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "34px",
                  height: "30px",
                  background: view === "list" ? "#41403e" : "transparent",
                  color: view === "list" ? "#fffdf7" : "#41403e",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setView("calendar")}
                aria-pressed={view === "calendar"}
                title="Calendar view (C)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "34px",
                  height: "30px",
                  background: view === "calendar" ? "#41403e" : "transparent",
                  color: view === "calendar" ? "#fffdf7" : "#41403e",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <CalendarDays size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectionMode) clearSelection();
                setSelectionMode((s) => !s);
              }}
              aria-pressed={selectionMode}
              title="Toggle bulk select (B)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "0.9rem",
                padding: "0.4rem 0.7rem",
                background: selectionMode ? "#0b74d5" : "transparent",
                color: selectionMode ? "#fffdf7" : "#41403e",
                border: `2px solid ${selectionMode ? "#0b74d5" : "#41403e"}`,
                cursor: "pointer",
              }}
            >
              <CheckSquare size={15} /> Select
            </button>

            <ThemeToggle />

            {/* Help button */}
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Help and keyboard shortcuts"
              title="Help (?)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                background: "transparent",
                color: "#41403e",
                border: "2px solid #41403e",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <HelpCircle size={18} />
            </button>

            {/* Tools dropdown */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setToolsOpen((o) => !o)}
                aria-expanded={toolsOpen}
                aria-label="Tools menu"
                title="Tools"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  background: "transparent",
                  color: "#41403e",
                  border: "2px solid #41403e",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <MoreHorizontal size={18} />
              </button>
              {toolsOpen && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 40,
                    }}
                    onClick={() => setToolsOpen(false)}
                  />
                  <div
                    role="menu"
                    className="fade-in"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.3rem)",
                      right: 0,
                      minWidth: "240px",
                      background: "#fffdf7",
                      border: "2px solid #41403e",
                      boxShadow: "3px 3px 0 rgba(0,0,0,0.15)",
                      zIndex: 41,
                      padding: "0.3rem",
                    }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setToolsOpen(false);
                        setWeeklyRecapOpen(true);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.6rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Neucha', cursive",
                        fontSize: "0.9rem",
                        color: "#41403e",
                      }}
                    >
                      <BarChart3 size={15} /> Weekly Recap
                    </button>
                    <div
                      style={{
                        borderTop: "1px dashed #c1bdb4",
                        margin: "0.2rem 0",
                      }}
                    />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setToolsOpen(false);
                        setExportImportOpen(true);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.6rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Neucha', cursive",
                        fontSize: "0.9rem",
                        color: "#41403e",
                      }}
                    >
                      <Download size={15} /> Export / Import
                    </button>
                    <div
                      style={{
                        borderTop: "1px dashed #c1bdb4",
                        margin: "0.2rem 0",
                      }}
                    />
                    <NotificationSettings tasks={tasks} />
                    <div
                      style={{
                        borderTop: "1px dashed #c1bdb4",
                        margin: "0.2rem 0",
                      }}
                    />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setToolsOpen(false);
                        clearCompletedTasks();
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.6rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Neucha', cursive",
                        fontSize: "0.9rem",
                        color: "#a7342d",
                      }}
                    >
                      <CheckSquare size={15} /> Clear completed
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={openCreate}
              title="New Task (N)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "1rem",
                padding: "0.4rem 0.95rem",
                background: "#41403e",
                color: "#fffdf7",
                border: "2px solid #41403e",
                cursor: "pointer",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
              }}
            >
              <Plus size={18} /> New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          width: "100%",
          padding: "1.25rem 1rem 3rem",
          flex: 1,
        }}
      >
        <MotivationQuote />

        <StreakWidget />

        <AchievementsWidget />

        <PomodoroTimer />

        <StatsDashboard
          stats={stats}
          loading={!hydrated}
          completedCount={completedCount}
          onClearCompleted={clearCompletedTasks}
        />

        <QuickAddTemplates onCreated={handleChanged} />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          categories={categories}
          resultCount={tasks.length}
          completedCount={completedCount}
          onClearCompleted={clearCompletedTasks}
        />

        {selectionMode && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.6rem",
              fontFamily: "'Neucha', cursive",
              fontSize: "0.85rem",
              color: "#41403e",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span>
              {selectedIds.size} of {tasks.length} selected
            </span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                type="button"
                onClick={selectAllVisible}
                style={{
                  background: "transparent",
                  border: "1px dashed #41403e",
                  cursor: "pointer",
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.8rem",
                  padding: "0.2rem 0.5rem",
                  color: "#41403e",
                }}
              >
                Select all visible
              </button>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  style={{
                    background: "transparent",
                    border: "1px dashed #a7342d",
                    cursor: "pointer",
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.5rem",
                    color: "#a7342d",
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        )}

        <BulkActionBar
          selectedCount={selectedIds.size}
          onClear={clearSelection}
          onComplete={() => bulkAction("complete")}
          onPending={() => bulkAction("pending")}
          onDelete={() => bulkAction("delete")}
          busy={bulkBusy}
        />

        {error && (
          <div
            className="alert danger"
            role="alert"
            style={{ marginBottom: "1rem" }}
          >
            <strong>Couldn&apos;t load tasks.</strong> {error}
            <button
              className="btn-small"
              onClick={() => refetch()}
              style={{ marginLeft: "0.75rem" }}
            >
              Retry
            </button>
          </div>
        )}

        {view === "calendar" ? (
          <CalendarView
            tasks={tasks}
            onSelectTask={openDetail}
            onSelectDay={openCreateWithDate}
          />
        ) : loading && tasks.length === 0 ? (
          <TaskListSkeleton count={6} />
        ) : tasks.length === 0 && !error ? (
          <EmptyState
            onCreate={openCreate}
            hasFilters={
              filters.status !== "all" ||
              filters.priority !== "all" ||
              filters.category !== "all" ||
              filters.search.trim() !== ""
            }
            allDone={
              !!stats &&
              stats.total > 0 &&
              stats.pending === 0 &&
              (filters.status === "all" || filters.status === "pending")
            }
          />
        ) : grouped ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {grouped.pending.length > 0 && (
              <section aria-label="Pending tasks">
                <SectionHeader
                  label="Pending"
                  count={grouped.pending.length}
                  color="#7a6e0d"
                  bg="#fbf6d8"
                />
                {filters.sort === "manual" && !selectionMode && (
                  <div
                    style={{
                      marginBottom: "0.6rem",
                      padding: "0.4rem 0.7rem",
                      border: "1px dashed #868e96",
                      background: "#f9f7f0",
                      fontFamily: "'Neucha', cursive",
                      fontSize: "0.8rem",
                      color: "#868e96",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <GripVertical size={12} /> Drag task cards by the handle to reorder them. Your custom order is saved automatically.
                  </div>
                )}
                {filters.sort === "manual" && !selectionMode ? (
                  <SortableTaskList
                    tasks={grouped.pending}
                    onEdit={openEdit}
                    onOpenDetail={openDetail}
                    onTaskCompleted={fireConfetti}
                    onChanged={handleChanged}
                    selectable={selectionMode}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                  />
                ) : (
                  <div
                    className="paper-scroll"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                      gap: "0.85rem",
                      alignContent: "start",
                    }}
                  >
                    {grouped.pending.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onEdit={openEdit}
                        onOpenDetail={openDetail}
                        onTaskCompleted={fireConfetti}
                        onChanged={handleChanged}
                        selectable={selectionMode}
                        selected={selectedIds.has(t.id)}
                        onToggleSelect={toggleSelect}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
            {grouped.completed.length > 0 && (
              <section aria-label="Completed tasks">
                <SectionHeader
                  label="Completed"
                  count={grouped.completed.length}
                  color="#5e7a44"
                  bg="#e6eedb"
                  collapsed={completedCollapsed}
                  onToggle={() => setCompletedCollapsed((c) => !c)}
                />
                {!completedCollapsed && (
                  <div
                    className="paper-scroll"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                      gap: "0.85rem",
                      alignContent: "start",
                    }}
                  >
                    {grouped.completed.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onEdit={openEdit}
                        onOpenDetail={openDetail}
                        onTaskCompleted={fireConfetti}
                        onChanged={handleChanged}
                        selectable={selectionMode}
                        selected={selectedIds.has(t.id)}
                        onToggleSelect={toggleSelect}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          <div
            className="paper-scroll"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
              gap: "0.85rem",
              alignContent: "start",
            }}
          >
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={openEdit}
                onOpenDetail={openDetail}
                onTaskCompleted={fireConfetti}
                onChanged={handleChanged}
                selectable={selectionMode}
                selected={selectedIds.has(t.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "3px solid #41403e",
          background: "#41403e",
          color: "#fffdf7",
          padding: "1rem",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            fontFamily: "'Neucha', cursive",
            fontSize: "0.85rem",
          }}
        >
          <span>StudyDesk &mdash; built with PaperCSS, Next.js &amp; Prisma</span>
          <span
            style={{
              opacity: 0.85,
              display: "inline-flex",
              gap: "0.6rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "inline-flex", gap: "0.2rem", alignItems: "center" }}>
              <kbd>N</kbd> new
            </span>
            <span style={{ display: "inline-flex", gap: "0.2rem", alignItems: "center" }}>
              <kbd>/</kbd> search
            </span>
            <span style={{ display: "inline-flex", gap: "0.2rem", alignItems: "center" }}>
              <kbd>V</kbd> list
            </span>
            <span style={{ display: "inline-flex", gap: "0.2rem", alignItems: "center" }}>
              <kbd>C</kbd> calendar
            </span>
            <span style={{ display: "inline-flex", gap: "0.2rem", alignItems: "center" }}>
              <kbd>B</kbd> bulk
            </span>
            <span style={{ display: "inline-flex", gap: "0.2rem", alignItems: "center" }}>
              <kbd>?</kbd> help
            </span>
          </span>
        </div>
      </footer>

      <TaskForm
        open={formOpen}
        editingTask={editingTask}
        onClose={closeForm}
        onSaved={handleChanged}
      />

      <TaskDetail
        task={detailTask}
        open={detailOpen}
        onClose={closeDetail}
        onEdit={(t) => {
          closeDetail();
          openEdit(t);
        }}
        onChanged={handleChanged}
      />

      <ExportImportModal
        open={exportImportOpen}
        onClose={() => setExportImportOpen(false)}
        onChanged={handleChanged}
      />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <WeeklyRecapModal
        open={weeklyRecapOpen}
        onClose={() => setWeeklyRecapOpen(false)}
      />

      <AchievementBurst
        achievement={achievementBurst}
        trigger={achievementBurstTrigger}
        onDone={() => setAchievementBurst(null)}
      />

      <ConfettiBurst
        trigger={confettiTrigger}
        originX={confettiOrigin?.x}
        originY={confettiOrigin?.y}
      />
    </div>
  );
}

function SectionHeader({
  label,
  count,
  color,
  bg,
  collapsed = false,
  onToggle,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const isCollapsible = !!onToggle;
  return (
    <div
      className="section-header"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.7rem",
      }}
    >
      <h3
        onClick={onToggle}
        style={{
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: "1.3rem",
          margin: 0,
          color: "#41403e",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          cursor: isCollapsible ? "pointer" : "default",
          userSelect: "none",
        }}
      >
        {isCollapsible && (
          <ChevronDown
            size={18}
            style={{
              transition: "transform 0.2s ease",
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              color: "#868e96",
            }}
          />
        )}
        {label}
        <span
          style={{
            background: bg,
            color: color,
            border: `1px solid ${color}`,
            padding: "0.05rem 0.55rem",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      </h3>
    </div>
  );
}

function EmptyState({
  onCreate,
  hasFilters,
  allDone = false,
}: {
  onCreate: () => void;
  hasFilters: boolean;
  allDone?: boolean;
}) {
  return (
    <div
      className="paper-pop"
      style={{
        border: `3px ${allDone ? "solid" : "dashed"} ${allDone ? "#86a361" : "#c1bdb4"}`,
        background: allDone ? "#e6eedb" : "#fffdf7",
        padding: "3rem 1.5rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: allDone
          ? "4px 4px 0 rgba(134,163,97,0.3)"
          : "4px 4px 0 rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "64px",
          height: "64px",
          border: `2px solid ${allDone ? "#5e7a44" : "#41403e"}`,
          background: allDone ? "#d5dfc8" : "#f4f1ea",
          transform: allDone ? "rotate(-2deg)" : "rotate(-4deg)",
          boxShadow: "2px 2px 0 rgba(0,0,0,0.1)",
        }}
      >
        {allDone ? (
          <PartyPopper size={28} color="#5e7a44" />
        ) : (
          <Sparkles size={26} color="#41403e" />
        )}
      </span>
      <h3
        style={{
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: allDone ? "2rem" : "1.6rem",
          margin: 0,
          color: allDone ? "#3a4d28" : "#41403e",
        }}
      >
        {allDone
          ? "All done! Amazing work!"
          : hasFilters
            ? "No tasks match your filters"
            : "Your desk is clear!"}
      </h3>
      <p
        style={{
          fontFamily: "'Neucha', cursive",
          color: allDone ? "#5e7a44" : "#868e96",
          margin: "0 0 0.5rem",
          maxWidth: "420px",
          fontSize: allDone ? "1rem" : "0.9rem",
        }}
      >
        {allDone
          ? "You've completed everything on your list. Time for a well-deserved break, or add a new goal below."
          : hasFilters
            ? "Try adjusting or clearing your filters to see more tasks."
            : "Add your first task to start tracking homework, exams and personal goals."}
      </p>
      {!hasFilters && (
        <button
          type="button"
          onClick={onCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "1rem",
            padding: "0.5rem 1.1rem",
            background: allDone ? "#86a361" : "#41403e",
            color: "#fffdf7",
            border: `2px solid ${allDone ? "#5e7a44" : "#41403e"}`,
            cursor: "pointer",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
          }}
        >
          <Plus size={18} /> {allDone ? "Add Another Task" : "Add Your First Task"}
        </button>
      )}
      {hasFilters && !allDone && (
        <p
          style={{
            fontFamily: "'Neucha', cursive",
            fontSize: "0.8rem",
            color: "#a8a5a0",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <SearchIcon size={12} /> Tip: press <kbd>/</kbd> to focus search
        </p>
      )}
    </div>
  );
}
