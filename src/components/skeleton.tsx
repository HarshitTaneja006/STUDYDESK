"use client";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "rect" | "text" | "card" | "stat" | "circle";
  style?: React.CSSProperties;
}

/**
 * Paper-styled skeleton placeholder with a subtle shimmer animation.
 * Uses hand-drawn-feel dashed borders to match PaperCSS aesthetic.
 */
export function Skeleton({ width = "100%", height = "auto", variant = "rect", style }: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    width,
    height,
    background:
      "repeating-linear-gradient(90deg, #e9e6dd 0px, #e9e6dd 8px, #ddd9d0 8px, #ddd9d0 16px)",
    border: "2px solid #c1bdb4",
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  if (variant === "text") {
    baseStyle.height = height === "auto" ? "0.9em" : height;
    baseStyle.borderRadius = 0;
    return <div className="skeleton-shimmer" style={baseStyle} aria-hidden />;
  }

  if (variant === "circle") {
    baseStyle.borderRadius = "50%";
    return <div className="skeleton-shimmer" style={baseStyle} aria-hidden />;
  }

  if (variant === "stat") {
    return (
      <div
        className="skeleton-shimmer"
        aria-hidden
        style={{
          ...baseStyle,
          padding: "0.85rem 0.9rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          boxShadow: "2px 3px 0 rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ width: "50%", height: "0.7rem", background: "#c1bdb4" }} />
        <div style={{ width: "30%", height: "1.6rem", background: "#c1bdb4" }} />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className="skeleton-shimmer"
        aria-hidden
        style={{
          ...baseStyle,
          minHeight: "92px",
          padding: "0.9rem 0.95rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ width: "26px", height: "26px", border: "2px solid #c1bdb4", flexShrink: 0 }} />
          <div style={{ flex: 1, height: "1.1rem", background: "#c1bdb4", width: "70%" }} />
        </div>
        <div style={{ width: "90%", height: "0.8rem", background: "#c1bdb4" }} />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
          <div style={{ width: "50px", height: "0.7rem", background: "#c1bdb4" }} />
          <div style={{ width: "70px", height: "0.7rem", background: "#c1bdb4" }} />
        </div>
      </div>
    );
  }

  return <div className="skeleton-shimmer" style={baseStyle} aria-hidden />;
}

/** A full dashboard skeleton matching the stats dashboard layout. */
export function StatsSkeleton() {
  return (
    <section aria-label="Loading statistics" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="stat" style={{ flex: "1 1 140px" }} />
        ))}
      </div>
      <div style={{ marginTop: "0.85rem" }}>
        <Skeleton height="68px" />
      </div>
    </section>
  );
}

/** A task list skeleton matching the card grid layout. */
export function TaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      aria-hidden
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
        gap: "0.85rem",
        alignContent: "start",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
