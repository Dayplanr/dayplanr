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

export function generateTodayInsights(tasks: Task[]): Insight[] {
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
      title: `${streak}-Day Streak 🔥`,
      description: `You've completed tasks for ${streak} days in a row. Keep this momentum going!`,
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
      title: "All Tasks Done",
      description: "You've completed everything scheduled for today. Excellent focus!",
      iconType: "peak",
      category: "today",
    });
  } else if (todayTasks.length >= 3 && todayDone >= 2) {
    insights.push({
      id: "today-great-progress",
      title: "Great Progress",
      description: `${todayDone} of ${todayTasks.length} tasks done today. You're on track!`,
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
      title: "Weekday Warrior",
      description: "You complete significantly more tasks on weekdays. Use that weekday energy!",
      iconType: "peak",
      category: "today",
    });
  }

  return insights.slice(0, 2);
}

// ─── Goals Insights ───────────────────────────────────────────────────────────

export function generateGoalInsights(goals: Goal[]): Insight[] {
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
      title: "Goal Needs Attention",
      description: days
        ? `"${inactiveGoal.title}" hasn't had activity in ${days} days. Even one small step counts.`
        : `"${inactiveGoal.title}" hasn't been started yet. What's one action you can take today?`,
      iconType: "warning",
      category: "goals",
    });
  }

  // 2. Goal nearing completion
  const nearDoneGoal = goals.find(g => g.progress >= 75 && g.progress < 100);
  if (nearDoneGoal) {
    insights.push({
      id: "goal-near-done",
      title: "Almost There",
      description: `"${nearDoneGoal.title}" is ${nearDoneGoal.progress}% complete. You're in the final stretch!`,
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
        title: "Leading Goal",
        description: `"${fastest.title}" is your strongest goal at ${fastest.progress}% complete.`,
        iconType: "goal",
        category: "goals",
      });
    }
  }

  return insights.slice(0, 2);
}

// ─── Habits Insights ──────────────────────────────────────────────────────────

export function generateHabitInsights(habits: Habit[]): Insight[] {
  const insights: Insight[] = [];
  if (!habits || habits.length === 0) return insights;

  // 1. Longest streak habit
  const topStreak = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];
  if (topStreak && topStreak.streak >= 3) {
    insights.push({
      id: "habit-top-streak",
      title: "Strongest Streak",
      description: `"${topStreak.title}" has a ${topStreak.streak}-day streak. This is becoming a true habit!`,
      iconType: "streak",
      category: "habits",
    });
  }

  // 2. Low consistency habit
  const lowConsistency = habits.find(h => (h.weeklyConsistency || 0) < 40 && (h.weeklyConsistency || 0) > 0);
  if (lowConsistency) {
    insights.push({
      id: "habit-low-consistency",
      title: "Consistency Opportunity",
      description: `"${lowConsistency.title}" has the lowest consistency. Linking it to an existing habit might help.`,
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
        title: "Weekday Consistency",
        description: `You complete habits ${Math.round(totalWeekdays)}% more often on weekdays. Protect your weekend routine too.`,
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
  tasks: Task[]
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
          title: "Mood Matters",
          description: `Your most productive days align with feeling "${MOOD_LABELS[ref.mood]}". Protect what creates that state.`,
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
      title: "Sleep & Stress Link",
      description: "Stress and low energy appear together in your reflections. Rest may be your most powerful productivity tool.",
      iconType: "energy",
      category: "reflect",
    });
  }

  // 3. Consecutive low moods
  const recentLow = reflections.slice(0, 3).filter(r => LOW_MOODS.includes(r.mood || ""));
  if (recentLow.length >= 2) {
    insights.push({
      id: "reflect-low-moods",
      title: "Take Care of Yourself",
      description: "You've logged lower moods recently. It's okay to slow down. Rest is not wasted time.",
      iconType: "health",
      category: "reflect",
    });
  }

  // 4. Positive streak  
  const recentPositive = reflections.slice(0, 3).filter(r => POSITIVE_MOODS.includes(r.mood || ""));
  if (recentPositive.length >= 2 && recentLow.length === 0) {
    insights.push({
      id: "reflect-positive-streak",
      title: "Positive Momentum",
      description: "You've been feeling good lately. Notice what's working and double down on it.",
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
  goals: Goal[]
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
      title: "Digital Distractions",
      keywords: ["phone", "social media", "tiktok", "instagram", "scroll", "screen"],
      description: "Digital distractions frequently appear in your challenges. Try setting your phone to Do Not Disturb during focus blocks.",
    },
    {
      type: "energy" as InsightIconType,
      title: "Energy Management",
      keywords: ["sleep", "tired", "late", "bed", "insomnia", "exhausted"],
      description: "Sleep or fatigue is a recurring challenge. A consistent bedtime routine could unlock significant energy gains.",
    },
    {
      type: "time" as InsightIconType,
      title: "Time Awareness",
      keywords: ["time", "busy", "rushed", "schedule", "planning", "late"],
      description: "Time management comes up repeatedly. Try time-blocking your mornings to protect your most focused hours.",
    },
    {
      type: "focus" as InsightIconType,
      title: "Focus Patterns",
      keywords: ["procrastination", "focus", "lazy", "delay", "distracted", "motivation"],
      description: "You mention struggling with focus. Starting with just 5 minutes of focused work often breaks the inertia.",
    },
    {
      type: "overwhelm" as InsightIconType,
      title: "Overwhelm Signals",
      keywords: ["overwhelmed", "stress", "anxious", "burnout", "too much"],
      description: "Feelings of overwhelm appear in your data. Breaking goals into smaller daily actions could reduce this significantly.",
    },
    {
      type: "health" as InsightIconType,
      title: "Energy & Nutrition",
      keywords: ["food", "eat", "diet", "water", "hungry", "skip meal"],
      description: "Nutrition and hydration appear as challenges. Small habits like keeping water nearby can noticeably lift your energy.",
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
        const moodName = MOOD_LABELS[ref.mood] || ref.mood;
        insights.push({
          id: "pattern-peak-mood",
          title: "Peak Performance",
          description: `You complete the most tasks when you feel "${moodName}". Protect the conditions that create this state.`,
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
      title: "Habit Champion",
      description: `"${topStreakHabit.title}" is your strongest habit with a ${topStreakHabit.streak}-day streak. Habits like this compound over time.`,
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
      title: "Goals Need Attention",
      description: `${stalledGoals.length} goal${stalledGoals.length > 1 ? "s have" : " has"} stalled. Reconnecting with your 'why' can reignite progress.`,
      iconType: "goal",
      category: "pattern",
    });
  }

  // Positive momentum
  const recentPositive = reflections.slice(0, 5).filter(r => POSITIVE_MOODS.includes(r.mood || ""));
  if (recentPositive.length >= 3 && insights.filter(i => i.iconType === "peak").length === 0) {
    insights.push({
      id: "pattern-momentum",
      title: "Positive Momentum",
      description: "You've had mostly positive moods recently. This is the best time to push toward ambitious goals.",
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
  habits: Habit[]
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
    { label: "Phone & Social Media", keywords: ["phone", "social", "instagram", "tiktok"] },
    { label: "Sleep & Energy", keywords: ["sleep", "tired", "exhausted", "bed"] },
    { label: "Focus & Motivation", keywords: ["focus", "procrastinat", "motivat", "distract"] },
    { label: "Feeling Overwhelmed", keywords: ["overwhelm", "stress", "anxious", "too much"] },
    { label: "Time Management", keywords: ["time", "busy", "rushed", "schedule"] },
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
    mostProductiveMood: mostProductiveMood ? MOOD_LABELS[mostProductiveMood] || mostProductiveMood : null,
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
  range: TimeRange
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
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const tasksByDay: Record<number, number> = {};
  windowTasks.filter(t => t.completed && t.scheduled_date).forEach(t => {
    const d = getDay(new Date(t.scheduled_date!));
    tasksByDay[d] = (tasksByDay[d] || 0) + 1;
  });
  const bestDayNum = Object.entries(tasksByDay).sort((a, b) => +b[1] - +a[1])[0];
  const bestDayName = bestDayNum ? DAY_NAMES[+bestDayNum[0]] : null;

  // ── Dominant mood ──
  const moodCount: Record<string, number> = {};
  windowReflections.filter(r => r.mood).forEach(r => {
    moodCount[r.mood!] = (moodCount[r.mood!] || 0) + 1;
  });
  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const dominantMoodLabel = dominantMood ? MOOD_LABELS[dominantMood] || dominantMood : null;

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
    { label: 'phone & social media', keys: ['phone', 'social', 'instagram', 'tiktok', 'scroll'] },
    { label: 'sleep & low energy', keys: ['sleep', 'tired', 'exhausted', 'bed', 'fatigue'] },
    { label: 'focus & procrastination', keys: ['focus', 'procrastinat', 'distract', 'motivat'] },
    { label: 'feeling overwhelmed', keys: ['overwhelm', 'stress', 'anxious', 'burnout'] },
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
    if (trend === 'improving') headline = 'A stronger week than the last';
    else if (trend === 'declining') headline = 'A quieter week — room to rebuild';
    else if (trend === 'steady') headline = 'Staying consistent this week';
    else headline = 'Starting to build your patterns';

    const parts: string[] = [];
    if (doneCurrent > 0 && donePrev > 0) {
      if (trend === 'improving') {
        parts.push(`You completed ${doneCurrent} tasks this week — more than the ${donePrev} last week.`);
      } else if (trend === 'declining') {
        parts.push(`You completed ${doneCurrent} tasks, slightly less than last week's ${donePrev}. Every week is a fresh start.`);
      } else {
        parts.push(`Consistent pace: ${doneCurrent} tasks completed, similar to last week.`);
      }
    } else if (doneCurrent > 0) {
      parts.push(`You completed ${doneCurrent} tasks this week.`);
    }

    if (bestDayName) parts.push(`${bestDayName} was your most productive day.`);
    if (topHabit && topHabit.score >= 2) parts.push(`"${topHabit.title}" was consistent — routines compound powerfully.`);
    if (topChallenge && maxHits > 0) parts.push(`${topChallenge} appeared as your main obstacle.`);

    narrative = parts.slice(0, 3).join(' ');
    if (bestDayName) highlights.push(`Most productive: ${bestDayName}`);
    if (topHabit && topHabit.score >= 1) highlights.push(`Top habit: ${topHabit.title}`);
    if (topChallenge) highlights.push(`Main blocker: ${topChallenge}`);
    if (dominantMoodLabel) highlights.push(`Mood: ${dominantMoodLabel}`);

  } else if (range === 'monthly') {
    if (trend === 'improving') headline = 'Growing stronger this month';
    else if (trend === 'declining') headline = 'A reflective month';
    else if (trend === 'steady') headline = 'Reliable consistency';
    else headline = 'Your first month of growth';

    const parts: string[] = [];
    if (doneCurrent > 0) parts.push(`Over the past 30 days you completed ${doneCurrent} tasks.`);
    if (topHabit && topHabit.pct >= 50) parts.push(`"${topHabit.title}" was your anchor, completed on ${topHabit.pct}% of days.`);
    if (dominantMoodLabel) parts.push(`Your dominant emotional tone was "${dominantMoodLabel}".`);

    narrative = parts.slice(0, 3).join(' ');
    if (topHabit) highlights.push(`${topHabit.title}: ${topHabit.pct}%`);
    if (doneCurrent > 0) highlights.push(`Tasks done: ${doneCurrent}`);
    if (topChallenge) highlights.push(`Challenge: ${topChallenge}`);

  } else {
    headline = trend === 'improving' ? 'A year of meaningful growth' : 'Reflecting on your year';
    const parts: string[] = [];
    if (doneCurrent > 0) parts.push(`This year you completed ${doneCurrent} tasks.`);
    const completedGoals = goals.filter(g => g.progress >= 100).length;
    if (completedGoals > 0) parts.push(`You finished ${completedGoals} goals.`);
    if (reflections.length >= 5) parts.push(`You've built a record of ${reflections.length} reflections.`);

    narrative = parts.slice(0, 3).join(' ');
    if (doneCurrent > 0) highlights.push(`Total tasks: ${doneCurrent}`);
    if (completedGoals > 0) highlights.push(`Goals finished: ${completedGoals}`);
    if (reflections.length > 0) highlights.push(`Reflections: ${reflections.length}`);
  }

  if (!narrative) narrative = "Keep going — patterns take time to form. Every small action builds self-awareness.";

  return { headline, narrative, trend, highlights: highlights.slice(0, 4) };
}
