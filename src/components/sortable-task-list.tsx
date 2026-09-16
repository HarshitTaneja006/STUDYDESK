"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { TaskResponse } from "@/lib/task-utils";
import { TaskCard } from "@/components/task-card";
import { loadManualOrder, saveManualOrder } from "@/hooks/use-tasks";

interface SortableTaskListProps {
  tasks: TaskResponse[];
  onEdit: (task: TaskResponse) => void;
  onOpenDetail: (task: TaskResponse) => void;
  onChanged: () => void;
  onTaskCompleted: (task: TaskResponse, x: number, y: number) => void;
  selectable?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

/** Sortable wrapper for a single task card */
function SortableTaskCard({
  task,
  onEdit,
  onOpenDetail,
  onChanged,
  onTaskCompleted,
  selectable,
  selected,
  onToggleSelect,
}: {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
  onOpenDetail: (task: TaskResponse) => void;
  onChanged: () => void;
  onTaskCompleted: (task: TaskResponse, x: number, y: number) => void;
  selectable?: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-task-wrapper">
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        title="Drag to reorder"
        style={{
          position: "absolute",
          top: "4px",
          right: "-2px",
          zIndex: 10,
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(244,241,234,0.85)",
          border: "1px solid #c1bdb4",
          cursor: isDragging ? "grabbing" : "grab",
          padding: 0,
          color: "#868e96",
          opacity: 0,
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => {
          if (!isDragging) e.currentTarget.style.opacity = "0";
        }}
      >
        <GripVertical size={14} />
      </button>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onOpenDetail={onOpenDetail}
        onTaskCompleted={onTaskCompleted}
        onChanged={onChanged}
        selectable={selectable}
        selected={selected}
        onToggleSelect={onToggleSelect}
      />
    </div>
  );
}

export function SortableTaskList({
  tasks,
  onEdit,
  onOpenDetail,
  onChanged,
  onTaskCompleted,
  selectable,
  selectedIds,
  onToggleSelect,
}: SortableTaskListProps) {
  const [items, setItems] = useState(tasks);

  // Sync items when tasks prop changes (e.g., after refetch)
  // We use the tasks array directly for rendering, but maintain order locally
  const orderedTasks = useCallback(() => {
    const manualOrder = loadManualOrder();
    const sorted = [...tasks];
    // Sort by manual order index, tasks without order go to end (by createdAt)
    sorted.sort((a, b) => {
      const aIdx = manualOrder[a.id];
      const bIdx = manualOrder[b.id];
      if (aIdx === undefined && bIdx === undefined) return 0;
      if (aIdx === undefined) return 1;
      if (bIdx === undefined) return -1;
      return aIdx - bIdx;
    });
    return sorted;
  }, [tasks]);

  const currentItems = orderedTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = currentItems.findIndex((t) => t.id === active.id);
      const newIndex = currentItems.findIndex((t) => t.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const newOrder = arrayMove(currentItems, oldIndex, newIndex);
      // Save the new order to localStorage
      const orderMap: Record<string, number> = {};
      newOrder.forEach((t, i) => {
        orderMap[t.id] = i;
      });
      saveManualOrder(orderMap);
      setItems(newOrder);
    },
    [currentItems]
  );

  // Use currentItems for rendering (either from state or computed)
  const displayItems = items.length === currentItems.length ? items : currentItems;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={displayItems.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
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
          {displayItems.map((t) => (
            <SortableTaskCard
              key={t.id}
              task={t}
              onEdit={onEdit}
              onOpenDetail={onOpenDetail}
              onTaskCompleted={onTaskCompleted}
              onChanged={onChanged}
              selectable={selectable}
              selected={selectedIds.has(t.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
