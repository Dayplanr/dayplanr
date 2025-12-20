export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  purpose: string;
  category: string;
  challengeDuration: number; // in days, 0 means no challenge
  milestones: Milestone[];
  tags: string[];
  visionText?: string;
  progress: number;
  createdAt: string;
  lastActivityAt: string;
  streak: number;
  daysWithProgress: number;
}

export interface GoalFormData {
  title: string;
  purpose: string;
  category: string;
  challengeDuration: number;
  milestones: { title: string }[];
  tags: string[];
  visionText?: string;
}

export const GOAL_CATEGORIES = [
  "Health",
  "Work",
  "Personal",
  "Finance",
  "Creativity",
  "Education",
  "Career",
  "Relationships",
] as const;

export const CHALLENGE_DURATIONS = [
  { label: "No Challenge", value: 0 },
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "21 Days", value: 21 },
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
  { label: "90 Days", value: 90 },
  { label: "Custom", value: -1 },
] as const;

export function calculateGoalProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.completed).length;
  return Math.round((completed / milestones.length) * 100);
}

export function getGoalsAtRisk(goals: Goal[]): Goal[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return goals.filter((goal) => {
    const lastActivity = new Date(goal.lastActivityAt);
    return lastActivity < sevenDaysAgo || goal.progress < 10;
  });
}

export function calculateProductivityScore(goal: Goal): number {
  if (goal.progress === 0 && goal.daysWithProgress === 0) return 0;
  
  const progressWeight = 0.4;
  const consistencyWeight = 0.3;
  const milestoneWeight = 0.3;
  
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const milestoneRate = goal.milestones.length > 0 
    ? (completedMilestones / goal.milestones.length) * 100 
    : 0;
  
  const daysSinceCreation = Math.max(1, Math.floor(
    (new Date().getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const consistencyRate = Math.min(100, (goal.daysWithProgress / daysSinceCreation) * 100);
  
  return Math.round(
    goal.progress * progressWeight +
    consistencyRate * consistencyWeight +
    milestoneRate * milestoneWeight
  );
}

export function getFastestProgressingGoal(goals: Goal[]): Goal | null {
  if (goals.length === 0) return null;
  
  return goals.reduce((fastest, current) => {
    const fastestScore = calculateProductivityScore(fastest);
    const currentScore = calculateProductivityScore(current);
    return currentScore > fastestScore ? current : fastest;
  });
}

export function getCategoryBreakdown(goals: Goal[]): { name: string; value: number }[] {
  const breakdown: Record<string, number> = {};
  
  goals.forEach((goal) => {
    breakdown[goal.category] = (breakdown[goal.category] || 0) + 1;
  });
  
  return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
}

export function getOverallProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const total = goals.reduce((sum, goal) => sum + goal.progress, 0);
  return Math.round(total / goals.length);
}

export function getMilestoneStats(goals: Goal[]): { completed: number; pending: number } {
  let completed = 0;
  let pending = 0;
  
  goals.forEach((goal) => {
    goal.milestones.forEach((milestone) => {
      if (milestone.completed) {
        completed++;
      } else {
        pending++;
      }
    });
  });
  
  return { completed, pending };
}
