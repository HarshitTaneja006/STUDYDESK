export interface Achievement {
  id: string;
  label: string;
  description: string;
  emoji: string;
  color: string;
  bg: string;
  /** Returns true if unlocked given current stats */
  isUnlocked: (stats: {
    totalCompleted: number;
    currentStreak: number;
    longestStreak: number;
    studyPoints: number;
  }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    label: "First Step",
    description: "Complete your first task",
    emoji: "🎯",
    color: "#0b74d5",
    bg: "#d8ebfd",
    isUnlocked: (s) => s.totalCompleted >= 1,
  },
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Complete 5 tasks",
    emoji: "🌱",
    color: "#5e7a44",
    bg: "#d5dfc8",
    isUnlocked: (s) => s.totalCompleted >= 5,
  },
  {
    id: "on-fire",
    label: "On Fire",
    description: "Complete 10 tasks",
    emoji: "🔥",
    color: "#a7342d",
    bg: "#f3d8d5",
    isUnlocked: (s) => s.totalCompleted >= 10,
  },
  {
    id: "task-master",
    label: "Task Master",
    description: "Complete 25 tasks",
    emoji: "⭐",
    color: "#8b8612",
    bg: "#f5f0c6",
    isUnlocked: (s) => s.totalCompleted >= 25,
  },
  {
    id: "centurion",
    label: "Centurion",
    description: "Complete 100 tasks",
    emoji: "🏆",
    color: "#5e7a44",
    bg: "#e6eedb",
    isUnlocked: (s) => s.totalCompleted >= 100,
  },
  {
    id: "streak-3",
    label: "Consistent",
    description: "Maintain a 3-day streak",
    emoji: "📅",
    color: "#0b74d5",
    bg: "#d8ebfd",
    isUnlocked: (s) => s.longestStreak >= 3,
  },
  {
    id: "streak-7",
    label: "Week Warrior",
    description: "Maintain a 7-day streak",
    emoji: "⚔️",
    color: "#a7342d",
    bg: "#f3d8d5",
    isUnlocked: (s) => s.longestStreak >= 7,
  },
  {
    id: "streak-30",
    label: "Unstoppable",
    description: "Maintain a 30-day streak",
    emoji: "💎",
    color: "#0b74d5",
    bg: "#eef4fc",
    isUnlocked: (s) => s.longestStreak >= 30,
  },
  {
    id: "points-100",
    label: "Century Club",
    description: "Earn 100 study points",
    emoji: "💯",
    color: "#8b8612",
    bg: "#f5f0c6",
    isUnlocked: (s) => s.studyPoints >= 100,
  },
  {
    id: "points-500",
    label: "Scholar",
    description: "Earn 500 study points",
    emoji: "🎓",
    color: "#41403e",
    bg: "#e9e6dd",
    isUnlocked: (s) => s.studyPoints >= 500,
  },
  {
    id: "points-1000",
    label: "Legend",
    description: "Earn 1000 study points",
    emoji: "👑",
    color: "#8b8612",
    bg: "#fbf6d8",
    isUnlocked: (s) => s.studyPoints >= 1000,
  },
  {
    id: "streak-1",
    label: "Spark",
    description: "Start a streak (1 day)",
    emoji: "✨",
    color: "#ddcd45",
    bg: "#fbf6d8",
    isUnlocked: (s) => s.longestStreak >= 1,
  },
];
