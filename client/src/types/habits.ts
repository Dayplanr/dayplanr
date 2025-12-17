export type ScheduleType = "everyday" | "weekdays" | "challenge";

export interface Habit {
  id: string;
  title: string;
  category: string;
  scheduleType: ScheduleType;
  selectedDays: string[];
  challengeDays: number;
  challengeCompleted: number;
  streak: number;
  successRate: number;
  weeklyConsistency: number;
  monthlyConsistency: number;
  completedDates: string[];
  hasTimer: boolean;
}

export interface HabitFormData {
  name: string;
  category: string;
  scheduleType: ScheduleType;
  selectedDays: string[];
  challengeDays: number;
  challengeCompleted: number;
}

const DAY_MAP: Record<number, string> = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };

function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  if (!habit.scheduleType || habit.scheduleType === "everyday") {
    return true;
  }
  
  if (habit.scheduleType === "weekdays") {
    const dayOfWeek = date.getDay();
    return habit.selectedDays?.includes(DAY_MAP[dayOfWeek]) || false;
  }
  
  if (habit.scheduleType === "challenge") {
    return true;
  }
  
  return true;
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
