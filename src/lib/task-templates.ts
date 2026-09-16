import type { TaskPriority } from "@/lib/task-utils";

export interface TaskTemplate {
  id: string;
  label: string;
  emoji: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
  dueInHours: number | null; // hours from now, or null for no due date
}

// Common student task templates
export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "hw-problemset",
    label: "Problem Set",
    emoji: "✏️",
    title: "Complete Problem Set",
    description: "Work through all problems, show steps, double-check answers.",
    priority: "high",
    category: "Homework",
    dueInHours: 48,
  },
  {
    id: "reading-chapter",
    label: "Reading",
    emoji: "📖",
    title: "Read Chapter",
    description: "Active reading: take notes, highlight key terms, summarize sections.",
    priority: "low",
    category: "Reading",
    dueInHours: 72,
  },
  {
    id: "exam-prep",
    label: "Exam Prep",
    emoji: "📝",
    title: "Study for Exam",
    description: "Review lecture notes, practice problems, form study group session.",
    priority: "high",
    category: "Exam",
    dueInHours: 168,
  },
  {
    id: "essay-draft",
    label: "Essay Draft",
    emoji: "📄",
    title: "Write Essay Draft",
    description: "Outline → intro → body paragraphs → conclusion. Cite sources.",
    priority: "medium",
    category: "Homework",
    dueInHours: 96,
  },
  {
    id: "project-milestone",
    label: "Project",
    emoji: "🔧",
    title: "Project Milestone",
    description: "Define deliverables, assign tasks, set next check-in date.",
    priority: "medium",
    category: "Project",
    dueInHours: 120,
  },
  {
    id: "lab-report",
    label: "Lab Report",
    emoji: "🧪",
    title: "Write Lab Report",
    description: "Intro, methods, results, discussion, conclusion. Include data tables.",
    priority: "high",
    category: "Homework",
    dueInHours: 72,
  },
  {
    id: "presentation",
    label: "Presentation",
    emoji: "🎯",
    title: "Prepare Presentation",
    description: "Slides, talking points, rehearse timing, prepare Q&A responses.",
    priority: "medium",
    category: "Project",
    dueInHours: 96,
  },
  {
    id: "quiz-review",
    label: "Quiz Review",
    emoji: "⚡",
    title: "Review for Quiz",
    description: "Quick review of key concepts, formulas, and vocabulary.",
    priority: "medium",
    category: "Exam",
    dueInHours: 24,
  },
];
