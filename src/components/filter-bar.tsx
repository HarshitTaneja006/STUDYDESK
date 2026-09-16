"use client";

import { Search, X, Filter as FilterIcon, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import type { TaskFilters } from "@/hooks/use-tasks";

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (f: TaskFilters) => void;
  categories: string[];
  resultCount: number;
  completedCount?: number;
  onClearCompleted?: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const SORT_OPTIONS = [
  { value: "due", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "created", label: "Recently Added" },
  { value: "manual", label: "Manual (drag)" },
];

export function FilterBar({
  filters,
  onChange,
  categories,
  resultCount,
  completedCount = 0,
  onClearCompleted,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.search.trim() !== "";

  function update<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({
      status: "all",
      priority: "all",
      category: "all",
      search: "",
      sort: filters.sort,
      sortDir: filters.sortDir,
    });
  }

  function toggleSortDir() {
    update("sortDir", filters.sortDir === "asc" ? "desc" : "asc");
  }

  return (
    <div
      style={{
        border: "2px solid #41403e",
        background: "#fffdf7",
        padding: "0.85rem",
        boxShadow: "3px 3px 0 rgba(0,0,0,0.12)",
        marginBottom: "1.25rem",
        position: "relative",
      }}
    >
      {/* Search + count */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "0.7rem",
        }}
      >
        <div
          style={{
            flex: "1 1 220px",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.6rem",
              color: "#868e96",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search title or description... (press / to focus)"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            aria-label="Search tasks"
            style={{
              width: "100%",
              paddingLeft: "2.1rem",
              paddingRight: filters.search ? "2.1rem" : "0.8rem",
              fontFamily: "'Neucha', cursive",
            }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update("search", "")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "0.4rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#868e96",
                padding: "0.2rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <span
          style={{
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "0.95rem",
            color: "#41403e",
            whiteSpace: "nowrap",
          }}
        >
          {resultCount} {resultCount === 1 ? "task" : "tasks"}
        </span>
      </div>

      {/* Filters row */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {/* Status segmented control */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <label
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#868e96",
              fontFamily: "'Neucha', cursive",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <FilterIcon size={12} /> Status
          </label>
          <div
            role="group"
            aria-label="Filter by status"
            style={{
              display: "inline-flex",
              border: "2px solid #41403e",
              background: "#f4f1ea",
              padding: "2px",
            }}
          >
            {STATUS_OPTIONS.map((opt) => {
              const active = filters.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("status", opt.value)}
                  style={{
                    padding: "0.25rem 0.7rem",
                    background: active ? "#41403e" : "transparent",
                    color: active ? "#fffdf7" : "#41403e",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.85rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <label
            htmlFor="fb-prio"
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#868e96",
              fontFamily: "'Neucha', cursive",
            }}
          >
            Priority
          </label>
          <select
            id="fb-prio"
            value={filters.priority}
            onChange={(e) => update("priority", e.target.value)}
            aria-label="Filter by priority"
            style={{ minWidth: "130px" }}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <label
            htmlFor="fb-cat"
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#868e96",
              fontFamily: "'Neucha', cursive",
            }}
          >
            Category
          </label>
          <select
            id="fb-cat"
            value={filters.category}
            onChange={(e) => update("category", e.target.value)}
            aria-label="Filter by category"
            style={{ minWidth: "140px" }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort + direction toggle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <label
            htmlFor="fb-sort"
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#868e96",
              fontFamily: "'Neucha', cursive",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <ArrowDownUp size={12} /> Sort
          </label>
          <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
            <select
              id="fb-sort"
              value={filters.sort}
              onChange={(e) => update("sort", e.target.value as TaskFilters["sort"])}
              aria-label="Sort tasks"
              style={{ minWidth: "150px" }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={toggleSortDir}
              aria-label={
                filters.sortDir === "asc"
                  ? "Currently ascending, switch to descending"
                  : "Currently descending, switch to ascending"
              }
              title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
              style={{
                marginLeft: "-2px",
                border: "2px solid #41403e",
                background: "#f4f1ea",
                color: "#41403e",
                cursor: "pointer",
                padding: "0 0.5rem",
                display: "flex",
                alignItems: "center",
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "0.8rem",
                minWidth: "38px",
                justifyContent: "center",
              }}
            >
              {filters.sortDir === "asc" ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              )}
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              background: "transparent",
              color: "#a7342d",
              border: "2px solid #a7342d",
              cursor: "pointer",
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.85rem",
              padding: "0.45rem 0.7rem",
              boxShadow: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            <X size={14} /> Clear
          </button>
        )}

        {completedCount > 0 && onClearCompleted && (
          <button
            type="button"
            onClick={onClearCompleted}
            title={`Delete all ${completedCount} completed task(s)`}
            style={{
              background: "transparent",
              color: "#7a2118",
              border: "2px dashed #a7342d",
              cursor: "pointer",
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.85rem",
              padding: "0.45rem 0.7rem",
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <X size={14} /> Clear Done ({completedCount})
          </button>
        )}
      </div>
    </div>
  );
}
