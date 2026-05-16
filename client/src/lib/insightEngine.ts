import { format, subDays, isWeekend, getDay, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Reflection {
  id: string;
  mood: string | null;
  progress: string | null;
  challenge: string | null;
  next_step: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title?: string;
  completed: boolean;
  scheduled_date: string | null;
}

export interface FocusSession {
  id: string;
  duration: number;
  completed_at: string;
}

export interface Habit {
  id: string;
  title: string;
  category?: string;
  streak: number;
  bestStreak?: number;
  successRate?: number;
  weeklyConsistency?: number;
  completedDates: string[];
  selectedDays?: string[];
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  lastActivityAt?: string | null;
  milestones?: { completed: boolean }[];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  iconType: InsightIconType;
  category?: InsightCategory;
}

export type InsightIconType =
  | 'peak' | 'distraction' | 'energy' | 'consistency'
  | 'time' | 'focus' | 'overwhelm' | 'health'
  | 'goal' | 'habit' | 'mood' | 'streak' | 'warning' | 'default';

export type InsightCategory = 'today' | 'goals' | 'habits' | 'reflect' | 'pattern';

export interface WeeklySummary {
  mostProductiveMood: string | null;
  strongestHabit: string | null;
  biggestChallenge: string | null;
  overallTrend: 'improving' | 'steady' | 'declining' | 'not_enough_data';
  reflectionCount: number;
  tasksCompleted: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOOD_LABELS: Record<string, string> = {
  great: "Great", good: "Good", okay: "Okay",
  stressed: "Stressed", tired: "Tired", bad: "Bad",
};

const POSITIVE_MOODS = ["great", "good"];
const LOW_MOODS = ["stressed", "tired", "bad"];

// ─── Today Insights ───────────────────────────────────────────────────────────

export function generateTodayInsights(tasks: Task[], t: (key: any, params?: any) => string): Insight[] {
  const insights: Insight[] = [];
  if (!tasks || tasks.length === 0) return insights;

  // 1. Streak: count consecutive days with at least 1 completed task
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    const hasCompleted = tasks.some(
      t => t.completed && t.scheduled_date?.startsWith(d)
    );
    if (hasCompleted) streak++;
    else break;
  }

  if (streak >= 2) {
    insights.push({
      id: "today-streak",
      title: t("insight_streak_title", { count: streak }),
      description: t("insight_streak_desc", { count: streak }),
      iconType: "streak",
      category: "today",
    });
  }

  // 2. Completion rate for today
  const todayStr = format(today, "yyyy-MM-dd");
  const todayTasks = tasks.filter(t => t.scheduled_date?.startsWith(todayStr));
  const todayDone = todayTasks.filter(t => t.completed).length;
  if (todayTasks.length > 0 && todayDone === todayTasks.length) {
    insights.push({
      id: "today-all-done",
      title: t("insight_all_done_title"),
      description: t("insight_all_done_desc"),
      iconType: "peak",
      category: "today",
    });
  } else if (todayTasks.length >= 3 && todayDone >= 2) {
    insights.push({
      id: "today-great-progress",
      title: t("insight_great_progress_title"),
      description: t("insight_great_progress_desc", { count: todayDone, total: todayTasks.length }),
      iconType: "consistency",
      category: "today",
    });
  }

  // 3. Weekend vs weekday productivity
  const weekdayCompletions = tasks.filter(t => {
    if (!t.completed || !t.scheduled_date) return false;
    const d = new Date(t.scheduled_date);
    return !isWeekend(d);
  }).length;

  const weekendCompletions = tasks.filter(t => {
    if (!t.completed || !t.scheduled_date) return false;
    const d = new Date(t.scheduled_date);
    return isWeekend(d);
  }).length;

  if (weekdayCompletions > weekendCompletions * 2 && weekdayCompletions > 5) {
    insights.push({
      id: "today-weekday",
      title: t("insight_weekday_warrior_title"),
      description: t("insight_weekday_warrior_desc"),
      iconType: "peak",
      category: "today",
    });
  }

  return insights.slice(0, 2);
}

// ─── Goals Insights ───────────────────────────────────────────────────────────

export function generateGoalInsights(goals: Goal[], t: (key: any, params?: any) => string): Insight[] {
  const insights: Insight[] = [];
  if (!goals || goals.length === 0) return insights;

  // 1. Inactive goal
  const inactiveGoal = goals.find(g => {
    if (!g.lastActivityAt) return g.progress < 100;
    const daysSince = Math.floor(
      (Date.now() - new Date(g.lastActivityAt).getTime()) / 86400000
    );
    return daysSince >= 5 && g.progress < 100;
  });

  if (inactiveGoal) {
    const days = inactiveGoal.lastActivityAt
      ? Math.floor((Date.now() - new Date(inactiveGoal.lastActivityAt).getTime()) / 86400000)
      : null;
    insights.push({
      id: "goal-inactive",
      title: t("insight_goal_inactive_title"),
      description: days
        ? t("insight_goal_inactive_desc_days", { title: inactiveGoal.title, count: days })
        : t("insight_goal_inactive_desc_none", { title: inactiveGoal.title }),
      iconType: "warning",
      category: "goals",
    });
  }

  // 2. Goal nearing completion
  const nearDoneGoal = goals.find(g => g.progress >= 75 && g.progress < 100);
  if (nearDoneGoal) {
    insights.push({
      id: "goal-near-done",
      title: t("insight_goal_near_done_title"),
      description: t("insight_goal_near_done_desc", { title: nearDoneGoal.title, percent: nearDoneGoal.progress }),
      iconType: "peak",
      category: "goals",
    });
  }

  // 3. Fastest progressing goal (highest progress overall)
  if (!nearDoneGoal && goals.length >= 2) {
    const fastest = [...goals].sort((a, b) => b.progress - a.progress)[0];
    if (fastest && fastest.progress > 0) {
      insights.push({
        id: "goal-fastest",
        title: t("insight_goal_fastest_title"),
        description: t("insight_goal_fastest_desc", { title: fastest.title, percent: fastest.progress }),
        iconType: "goal",
        category: "goals",
      });
    }
  }

  return insights.slice(0, 2);
}

// ─── Habits Insights ──────────────────────────────────────────────────────────

export function generateHabitInsights(habits: Habit[], t: (key: any, params?: any) => string): Insight[] {
  const insights: Insight[] = [];
  if (!habits || habits.length === 0) return insights;

  // 1. Longest streak habit
  const topStreak = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];
  if (topStreak && topStreak.streak >= 3) {
    insights.push({
      id: "habit-top-streak",
      title: t("insight_habit_top_streak_title"),
      description: t("insight_habit_top_streak_desc", { title: topStreak.title, count: topStreak.streak }),
      iconType: "streak",
      category: "habits",
    });
  }

  // 2. Low consistency habit
  const lowConsistency = habits.find(h => (h.weeklyConsistency || 0) < 40 && (h.weeklyConsistency || 0) > 0);
  if (lowConsistency) {
    insights.push({
      id: "habit-low-consistency",
      title: t("insight_habit_low_consistency_title"),
      description: t("insight_habit_low_consistency_desc", { title: lowConsistency.title }),
      iconType: "focus",
      category: "habits",
    });
  }

  // 3. Weekday vs weekend completion pattern
  const allDates = habits.flatMap(h => h.completedDates || []);
  if (allDates.length >= 7) {
    const weekdayCount = allDates.filter(d => !isWeekend(new Date(d))).length;
    const weekendCount = allDates.filter(d => isWeekend(new Date(d))).length;
    const totalWeekdays = allDates.length > 0 ? (weekdayCount / allDates.length) * 100 : 0;

    if (totalWeekdays > 65) {
      insights.push({
        id: "habit-weekday-pattern",
        title: t("insight_habit_weekday_pattern_title"),
        description: t("insight_habit_weekday_pattern_desc", { percent: Math.round(totalWeekdays) }),
        iconType: "consistency",
        category: "habits",
      });
    }
  }

  return insights.slice(0, 2);
}

// ─── Reflect Insights ─────────────────────────────────────────────────────────

export function generateReflectInsights(
  reflections: Reflection[],
  tasks: Task[],
  t: (key: any, params?: any) => string
): Insight[] {
  const insights: Insight[] = [];
  if (!reflections || reflections.length < 2) return insights;

  const allChallenges = reflections
    .filter(r => r.challenge)
    .map(r => r.challenge!.toLowerCase())
    .join(" ");

  // 1. Mood on productive days
  if (tasks.length > 0) {
    const tasksByDate: Record<string, number> = {};
    tasks.filter(t => t.completed && t.scheduled_date).forEach(t => {
      const d = t.scheduled_date!.split("T")[0];
      tasksByDate[d] = (tasksByDate[d] || 0) + 1;
    });
    const bestDate = Object.entries(tasksByDate).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (bestDate) {
      const ref = reflections.find(r => r.created_at.startsWith(bestDate));
      if (ref?.mood && POSITIVE_MOODS.includes(ref.mood)) {
        insights.push({
          id: "reflect-mood-productive",
          title: t("insight_reflect_mood_productive_title"),
          description: t("insight_reflect_mood_productive_desc", { mood: t(`mood_${ref.mood}` as any) }),
          iconType: "mood",
          category: "reflect",
        });
      }
    }
  }

  // 2. Stress + sleep correlation
  const hasStress = /stressed|anxious|overwhelm/.test(allChallenges);
  const hasSleep = /sleep|tired|exhaust|bed/.test(allChallenges);
  if (hasStress && hasSleep) {
    insights.push({
      id: "reflect-stress-sleep",
      title: t("insight_reflect_stress_sleep_title"),
      description: t("insight_reflect_stress_sleep_desc"),
      iconType: "energy",
      category: "reflect",
    });
  }

  // 3. Consecutive low moods
  const recentLow = reflections.slice(0, 3).filter(r => LOW_MOODS.includes(r.mood || ""));
  if (recentLow.length >= 2) {
    insights.push({
      id: "reflect-low-moods",
      title: t("insight_reflect_low_moods_title"),
      description: t("insight_reflect_low_moods_desc"),
      iconType: "health",
      category: "reflect",
    });
  }

  // 4. Positive streak  
  const recentPositive = reflections.slice(0, 3).filter(r => POSITIVE_MOODS.includes(r.mood || ""));
  if (recentPositive.length >= 2 && recentLow.length === 0) {
    insights.push({
      id: "reflect-positive-streak",
      title: t("insight_reflect_positive_streak_title"),
      description: t("insight_reflect_positive_streak_desc"),
      iconType: "peak",
      category: "reflect",
    });
  }

  return insights.slice(0, 2);
}

// ─── Full Pattern Insights (for Insights Page) ────────────────────────────────

export function generatePatternInsights(
  reflections: Reflection[],
  tasks: Task[],
  habits: Habit[],
  goals: Goal[],
  t: (key: any, params?: any) => string
): Insight[] {
  const insights: Insight[] = [];

  // Combine all reflect + today + habit signals
  const allChallenges = reflections
    .filter(r => r.challenge)
    .map(r => r.challenge!.toLowerCase())
    .join(" ");

  const keywordCategories = [
    {
      type: "distraction" as InsightIconType,
      title: t("insight_cat_distraction_title"),
      keywords: ["phone", "social media", "tiktok", "instagram", "scroll", "screen"],
      description: t("insight_cat_distraction_desc"),
    },
    {
      type: "energy" as InsightIconType,
      title: t("insight_cat_energy_title"),
      keywords: ["sleep", "tired", "late", "bed", "insomnia", "exhausted"],
      description: t("insight_cat_energy_desc"),
    },
    {
      type: "time" as InsightIconType,
      title: t("insight_cat_time_title"),
      keywords: ["time", "busy", "rushed", "schedule", "planning", "late"],
      description: t("insight_cat_time_desc"),
    },
    {
      type: "focus" as InsightIconType,
      title: t("insight_cat_focus_title"),
      keywords: ["procrastination", "focus", "lazy", "delay", "distracted", "motivation"],
      description: t("insight_cat_focus_desc"),
    },
    {
      type: "overwhelm" as InsightIconType,
      title: t("insight_cat_overwhelm_title"),
      keywords: ["overwhelmed", "stress", "anxious", "burnout", "too much"],
      description: t("insight_cat_overwhelm_desc"),
    },
    {
      type: "health" as InsightIconType,
      title: t("insight_cat_health_title"),
      keywords: ["food", "eat", "diet", "water", "hungry", "skip meal"],
      description: t("insight_cat_health_desc"),
    },
  ];

  keywordCategories.forEach(cat => {
    const mentions = cat.keywords.reduce((acc, kw) => {
      const m = allChallenges.match(new RegExp(`\\b${kw}\\b`, "g"));
      return acc + (m?.length || 0);
    }, 0);
    if (mentions > 0) {
      insights.push({ id: `pattern-${cat.type}`, title: cat.title, description: cat.description, iconType: cat.type, category: "pattern" });
    }
  });

  // Mood + productivity correlation
  if (tasks.length > 0 && reflections.length >= 2) {
    const tasksByDate: Record<string, number> = {};
    tasks.filter(t => t.completed && t.scheduled_date).forEach(t => {
      const d = t.scheduled_date!.split("T")[0];
      tasksByDate[d] = (tasksByDate[d] || 0) + 1;
    });
    const bestDate = Object.entries(tasksByDate).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (bestDate) {
      const ref = reflections.find(r => r.created_at.startsWith(bestDate));
      if (ref?.mood) {
        const moodName = t(`mood_${ref.mood}` as any);
        insights.push({
          id: "pattern-peak-mood",
          title: t("insight_pattern_peak_performance_title"),
          description: t("insight_pattern_peak_performance_desc", { mood: moodName }),
          iconType: "peak",
          category: "pattern",
        });
      }
    }
  }

  // Habit streak patterns
  const topStreakHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];
  if (topStreakHabit && topStreakHabit.streak >= 5) {
    insights.push({
      id: "pattern-habit-champion",
      title: t("insight_pattern_habit_champion_title"),
      description: t("insight_pattern_habit_champion_desc", { title: topStreakHabit.title, count: topStreakHabit.streak }),
      iconType: "habit",
      category: "pattern",
    });
  }

  // Goal progress stall
  const stalledGoals = goals.filter(g => g.progress < 30 && g.progress > 0 && g.lastActivityAt && 
    (Date.now() - new Date(g.lastActivityAt).getTime()) / 86400000 > 7);
  if (stalledGoals.length > 0) {
    insights.push({
      id: "pattern-goal-stall",
      title: t("insight_pattern_goal_stall_title"),
      description: t("insight_pattern_goal_stall_desc", { count: stalledGoals.length, plural: stalledGoals.length > 1 ? "s have" : " has" }),
      iconType: "goal",
      category: "pattern",
    });
  }

  // Positive momentum
  const recentPositive = reflections.slice(0, 5).filter(r => POSITIVE_MOODS.includes(r.mood || ""));
  if (recentPositive.length >= 3 && insights.filter(i => i.iconType === "peak").length === 0) {
    insights.push({
      id: "pattern-momentum",
      title: t("insight_reflect_positive_streak_title"),
      description: t("insight_reflect_positive_streak_desc"),
      iconType: "peak",
      category: "pattern",
    });
  }

  // Return shuffled max 5
  return insights.sort(() => 0.5 - Math.random()).slice(0, 5);
}

// ─── Weekly Summary ───────────────────────────────────────────────────────────

export function generateWeeklySummary(
  reflections: Reflection[],
  tasks: Task[],
  habits: Habit[],
  t: (key: any, params?: any) => string
): WeeklySummary {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const weekReflections = reflections.filter(r =>
    isWithinInterval(new Date(r.created_at), { start: weekStart, end: weekEnd })
  );

  const weekTasks = tasks.filter(t =>
    t.scheduled_date && isWithinInterval(new Date(t.scheduled_date), { start: weekStart, end: weekEnd })
  );

  // Most productive mood
  const moodCounts: Record<string, number> = {};
  weekReflections
    .filter(r => r.mood && POSITIVE_MOODS.includes(r.mood))
    .forEach(r => { moodCounts[r.mood!] = (moodCounts[r.mood!] || 0) + 1; });
  const mostProductiveMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Strongest habit this week
  const weekDates = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"));
  const habitScores = habits.map(h => ({
    title: h.title,
    score: h.completedDates.filter(d => weekDates.includes(d)).length,
  }));
  const strongestHabit = habitScores.sort((a, b) => b.score - a.score)[0];

  // Biggest challenge theme
  const allChallenges = weekReflections
    .filter(r => r.challenge).map(r => r.challenge!.toLowerCase()).join(" ");
  let biggestChallenge: string | null = null;
  const challengeMap = [
    { label: t("insight_cat_distraction_title"), keywords: ["phone", "social", "instagram", "tiktok"] },
    { label: t("insight_cat_energy_title"), keywords: ["sleep", "tired", "exhausted", "bed"] },
    { label: t("insight_cat_focus_title"), keywords: ["focus", "procrastinat", "motivat", "distract"] },
    { label: t("insight_cat_overwhelm_title"), keywords: ["overwhelm", "stress", "anxious", "too much"] },
    { label: t("insight_cat_time_title"), keywords: ["time", "busy", "rushed", "schedule"] },
  ];
  let maxHits = 0;
  challengeMap.forEach(c => {
    const hits = c.keywords.reduce((acc, kw) => acc + (allChallenges.split(kw).length - 1), 0);
    if (hits > maxHits) { maxHits = hits; biggestChallenge = c.label; }
  });

  // Overall trend
  const completedThisWeek = weekTasks.filter(t => t.completed).length;
  const prevWeekStart = subDays(weekStart, 7);
  const prevWeekTasks = tasks.filter(t =>
    t.scheduled_date && isWithinInterval(new Date(t.scheduled_date), { start: prevWeekStart, end: subDays(weekStart, 1) })
  );
  const completedLastWeek = prevWeekTasks.filter(t => t.completed).length;
  let overallTrend: WeeklySummary["overallTrend"] = "not_enough_data";
  if (weekTasks.length > 0 || prevWeekTasks.length > 0) {
    if (completedThisWeek > completedLastWeek) overallTrend = "improving";
    else if (completedThisWeek < completedLastWeek) overallTrend = "declining";
    else overallTrend = "steady";
  }

  return {
    mostProductiveMood: mostProductiveMood ? t(`mood_${mostProductiveMood}` as any) : null,
    strongestHabit: (strongestHabit?.score ?? 0) > 0 ? strongestHabit?.title ?? null : null,
    biggestChallenge,
    overallTrend,
    reflectionCount: weekReflections.length,
    tasksCompleted: completedThisWeek,
  };
}

// ─── Growth Summary (Narrative) ───────────────────────────────────────────────

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

export interface GrowthSummary {
  headline: string;       // e.g. "A strong week with consistent mornings"
  narrative: string;      // 2–3 sentence human-readable summary
  trend: 'improving' | 'steady' | 'declining' | 'new';
  highlights: string[];   // 2–3 short bullet highlights
}

export function generateGrowthSummary(
  reflections: Reflection[],
  tasks: Task[],
  habits: Habit[],
  goals: Goal[],
  range: TimeRange,
  t: (key: any, params?: any) => string
): GrowthSummary {
  const now = new Date();

  // ── Date window ──
  let windowDays = range === 'weekly' ? 7 : range === 'monthly' ? 30 : 365;
  const cutoff = subDays(now, windowDays);
  const prevCutoff = subDays(now, windowDays * 2);

  const windowTasks = tasks.filter(t =>
    t.scheduled_date && new Date(t.scheduled_date) >= cutoff
  );
  const prevTasks = tasks.filter(t =>
    t.scheduled_date &&
    new Date(t.scheduled_date) >= prevCutoff &&
    new Date(t.scheduled_date) < cutoff
  );

  const windowReflections = reflections.filter(r =>
    new Date(r.created_at) >= cutoff
  );
  const prevReflections = reflections.filter(r =>
    new Date(r.created_at) >= prevCutoff && new Date(r.created_at) < cutoff
  );

  const doneCurrent = windowTasks.filter(t => t.completed).length;
  const donePrev = prevTasks.filter(t => t.completed).length;

  // ── Trend ──
  let trend: GrowthSummary['trend'] = 'new';
  if (donePrev > 0 || doneCurrent > 0) {
    if (doneCurrent > donePrev) trend = 'improving';
    else if (doneCurrent < donePrev) trend = 'declining';
    else trend = 'steady';
  }

  // ── Best day of week ──
  const DAY_KEYS: any[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const tasksByDay: Record<number, number> = {};
  windowTasks.filter(t => t.completed && t.scheduled_date).forEach(t => {
    const d = getDay(new Date(t.scheduled_date!));
    tasksByDay[d] = (tasksByDay[d] || 0) + 1;
  });
  const bestDayNum = Object.entries(tasksByDay).sort((a, b) => +b[1] - +a[1])[0];
  const bestDayName = bestDayNum ? t(DAY_KEYS[+bestDayNum[0]]) : null;

  // ── Dominant mood ──
  const moodCount: Record<string, number> = {};
  windowReflections.filter(r => r.mood).forEach(r => {
    moodCount[r.mood!] = (moodCount[r.mood!] || 0) + 1;
  });
  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const dominantMoodLabel = dominantMood ? t(`mood_${dominantMood}` as any) : null;

  // ── Strongest habit ──
  const recentDates = Array.from({ length: windowDays }, (_, i) =>
    format(subDays(now, i), 'yyyy-MM-dd')
  );
  const habitScores = habits.map(h => ({
    title: h.title,
    score: h.completedDates.filter(d => recentDates.includes(d)).length,
    pct: recentDates.length > 0 ? Math.round((h.completedDates.filter(d => recentDates.includes(d)).length / recentDates.length) * 100) : 0,
  })).sort((a, b) => b.score - a.score);
  const topHabit = habitScores[0];

  // ── Challenge theme ──
  const allChallengeText = windowReflections
    .filter(r => r.challenge).map(r => r.challenge!.toLowerCase()).join(' ');
  const challengeKeywords = [
    { label: t("insight_cat_distraction_title"), keys: ['phone', 'social', 'instagram', 'tiktok', 'scroll'] },
    { label: t("insight_cat_energy_title"), keys: ['sleep', 'tired', 'exhausted', 'bed', 'fatigue'] },
    { label: t("insight_cat_focus_title"), keys: ['focus', 'procrastinat', 'distract', 'motivat'] },
    { label: t("insight_cat_overwhelm_title"), keys: ['overwhelm', 'stress', 'anxious', 'burnout'] },
  ];
  let topChallenge: string | null = null;
  let maxHits = 0;
  challengeKeywords.forEach(c => {
    const hits = c.keys.reduce((s, k) => s + (allChallengeText.split(k).length - 1), 0);
    if (hits > maxHits) { maxHits = hits; topChallenge = c.label; }
  });

  // ─────────────────────────────────────────────────────
  // Build narrative by range
  // ─────────────────────────────────────────────────────
  let headline = '';
  let narrative = '';
  const highlights: string[] = [];

  if (range === 'weekly') {
    if (trend === 'improving') headline = t("growth_headline_improving");
    else if (trend === 'declining') headline = t("growth_headline_declining");
    else if (trend === 'steady') headline = t("growth_headline_steady");
    else headline = t("growth_headline_new");

    const parts: string[] = [];
    if (doneCurrent > 0 && donePrev > 0) {
      if (trend === 'improving') {
        parts.push(t("growth_narrative_improving", { current: doneCurrent, prev: donePrev }));
      } else if (trend === 'declining') {
        parts.push(t("growth_narrative_declining", { current: doneCurrent, prev: donePrev }));
      } else {
        parts.push(t("growth_narrative_steady", { current: doneCurrent }));
      }
    } else if (doneCurrent > 0) {
      parts.push(t("growth_narrative_generic", { count: doneCurrent }));
    }

    if (bestDayName) parts.push(t("growth_best_day", { day: bestDayName }));
    if (topHabit && topHabit.score >= 2) parts.push(t("growth_habit_anchor", { title: topHabit.title }));
    if (topChallenge && maxHits > 0) parts.push(t("growth_challenge_blocker", { challenge: topChallenge }));

    narrative = parts.slice(0, 3).join(' ');
    if (bestDayName) highlights.push(t("growth_highlight_productive", { day: bestDayName }));
    if (topHabit && topHabit.score >= 1) highlights.push(t("growth_highlight_habit", { title: topHabit.title }));
    if (topChallenge) highlights.push(t("growth_highlight_blocker", { challenge: topChallenge }));
    if (dominantMoodLabel) highlights.push(t("growth_highlight_mood", { mood: dominantMoodLabel }));

  } else if (range === 'monthly') {
    if (trend === 'improving') headline = t("growth_monthly_headline_improving");
    else if (trend === 'declining') headline = t("growth_monthly_headline_declining");
    else if (trend === 'steady') headline = t("growth_monthly_headline_steady");
    else headline = t("growth_monthly_headline_new");

    const parts: string[] = [];
    if (doneCurrent > 0) parts.push(t("growth_month_total", { count: doneCurrent }));
    if (topHabit && topHabit.pct >= 50) parts.push(t("growth_month_habit", { title: topHabit.title, percent: topHabit.pct }));
    if (dominantMoodLabel) parts.push(t("growth_month_mood", { mood: dominantMoodLabel }));

    narrative = parts.slice(0, 3).join(' ');
    if (topHabit) highlights.push(`${topHabit.title}: ${topHabit.pct}%`);
    if (doneCurrent > 0) highlights.push(t("tasksComplete") + `: ${doneCurrent}`);
    if (topChallenge) highlights.push(`${t("reflectChallenge")}: ${topChallenge}`);

  } else {
    headline = trend === 'improving' ? t("growth_yearly_headline_improving") : t("growth_yearly_headline_declining");
    const parts: string[] = [];
    if (doneCurrent > 0) parts.push(t("growth_year_total", { count: doneCurrent }));
    const completedGoals = goals.filter(g => g.progress >= 100).length;
    if (completedGoals > 0) parts.push(t("growth_year_goals", { count: completedGoals }));
    if (reflections.length >= 5) parts.push(t("growth_year_reflections", { count: reflections.length }));

    narrative = parts.slice(0, 3).join(' ');
    if (doneCurrent > 0) highlights.push(`${t("tasksComplete")}: ${doneCurrent}`);
    if (completedGoals > 0) highlights.push(`${t("goals")}: ${completedGoals}`);
    if (reflections.length > 0) highlights.push(`${t("reflect")}: ${reflections.length}`);
  }

  if (!narrative) narrative = t("growth_empty");

  return { headline, narrative, trend, highlights: highlights.slice(0, 4) };
}
