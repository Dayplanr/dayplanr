import { format, subDays, startOfDay, isSameDay } from "date-fns";

export type ScheduleType = "everyday" | "weekdays" | "challenge";

export interface Habit {
  id: string;
  title: string;
  category: string;
  tags: string[];
  scheduleType: ScheduleType;
  selectedDays: string[];
  challengeDays: number;
  challengeType?: string;
  challengeCompleted: number;
  streak: number;
  bestStreak?: number;
  successRate: number;
  weeklyConsistency: number;
  monthlyConsistency: number;
  completedDates: string[];
  hasTimer: boolean;
  goal_id?: string;
}

export interface HabitFormData {
  name: string;
  category: string;
  tags: string[];
  scheduleType: ScheduleType;
  selectedDays: string[];
  challengeDays: number;
  challengeType?: string;
  challengeCompleted: number;
}

const DAY_MAP: Record<number, string> = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  if (!habit.scheduleType || habit.scheduleType === "everyday") {
    return true;
  }

  if (habit.scheduleType === "weekdays") {
    const dayOfWeek = date.getDay();
    // Revert to using selectedDays from habit record
    return habit.selectedDays?.includes(DAY_MAP[dayOfWeek]) || false;
  }

  if (habit.scheduleType === "challenge") {
    return true;
  }

  return true;
}

export function isHabitCompletedOnDate(habit: Habit, date: Date): boolean {
  const dateStr = date.toISOString().split("T")[0];
  return habit.completedDates?.includes(dateStr) || false;
}

export function computeWeeklyData(habits: Habit[] = []): { day: string; completed: number; total: number }[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const safeHabits = habits || [];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayName = dayNames[date.getDay()];

    let completed = 0;
    let total = 0;

    safeHabits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, date)) {
        total++;
        if (habit.completedDates?.includes(dateStr)) {
          completed++;
        }
      }
    });

    return { day: dayName, completed, total };
  });
}

export function computeConsistencyData(habits: Habit[] = [], days: number = 14): { date: string; rate: number }[] {
  const today = new Date();
  const safeHabits = habits || [];

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0];

    let completed = 0;
    let total = 0;

    safeHabits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, date)) {
        total++;
        if (habit.completedDates?.includes(dateStr)) {
          completed++;
        }
      }
    });

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { date: dateStr, rate };
  });
}

export function computeCompletionRate(habits: Habit[] = []): number {
  const weeklyData = computeWeeklyData(habits || []);
  const totalCompleted = weeklyData.reduce((acc, d) => acc + d.completed, 0);
  const totalScheduled = weeklyData.reduce((acc, d) => acc + d.total, 0);
  return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
}
export function calculateHabitStreak(habit: Habit): number {
  if (!habit || !habit.completedDates || habit.completedDates.length === 0) return 0;

  const completedSet = new Set(habit.completedDates);
  const today = startOfDay(new Date());
  let streak = 0;
  let currentDate = today;

  // If not completed today, check if it was completed yesterday
  // to determine if the streak is still alive
  const todayStr = format(today, "yyyy-MM-dd");
  const yesterday = subDays(today, 1);
  const yesterdayStr = format(yesterday, "yyyy-MM-dd");

  const isCompletedToday = completedSet.has(todayStr);
  const isCompletedYesterday = completedSet.has(yesterdayStr);

  // If not completed today AND not completed yesterday, streak might be 0
  // UNLESS today or yesterday were not scheduled days.

  // First, find the starting point (the most recent completed day or a scheduled day that's not yet missed)
  let checkDate = today;
  let alive = false;

  // Look back at most 7 days to find if the streak is still "alive"
  for (let i = 0; i < 7; i++) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (completedSet.has(dateStr)) {
      alive = true;
      currentDate = checkDate;
      break;
    }
    if (isHabitScheduledForDate(habit, checkDate)) {
      // If it was scheduled for this day and not completed, and this day is in the past, streak is dead
      if (isSameDay(checkDate, today)) {
        // Today is fine, maybe we haven't done it yet
      } else {
        alive = false;
        break;
      }
    }
    checkDate = subDays(checkDate, 1);
  }

  if (!alive) return 0;

  // Now count backwards from currentDate
  while (true) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    if (completedSet.has(dateStr)) {
      streak++;
    } else if (isHabitScheduledForDate(habit, currentDate)) {
      // Missing a scheduled day breaks the streak
      break;
    }
    // Non-scheduled days are just skipped (they don't count towards streak but don't break it)
    currentDate = subDays(currentDate, 1);

    // Safety break
    if (streak > 3650) break;
  }

  return streak;
}
