import { format } from "date-fns";

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
  completed: boolean;
  scheduled_date: string | null;
}

export interface FocusSession {
  id: string;
  duration: number;
  completed_at: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  iconType: 'peak' | 'distraction' | 'energy' | 'consistency' | 'time' | 'focus' | 'overwhelm' | 'health' | 'default';
}

const MOOD_LABELS: Record<string, string> = {
  great: "Great",
  good: "Good",
  okay: "Okay",
  stressed: "Stressed",
  tired: "Tired",
  bad: "Bad",
};

export function generateInsights(
  reflections: Reflection[],
  tasks: Task[],
  sessions: FocusSession[]
): Insight[] {
  const insights: Insight[] = [];

  if (!reflections || reflections.length === 0) {
    return [
      {
        id: "new-user",
        title: "Welcome",
        description: "Log your first reflection to start uncovering behavioral patterns.",
        iconType: "consistency",
      }
    ];
  }

  // 1. Challenge Analysis (Keyword extraction)
  const allChallenges = reflections
    .filter(r => r.challenge)
    .map(r => r.challenge!.toLowerCase())
    .join(" ");

  const keywordCategories = [
    {
      type: "distraction",
      title: "Digital Distractions",
      keywords: ["phone", "social media", "tiktok", "instagram", "scroll", "screen"],
      description: "Digital distractions appeared in your challenges. Try setting your phone to Do Not Disturb during focus blocks."
    },
    {
      type: "energy",
      title: "Energy Lows",
      keywords: ["sleep", "tired", "late", "bed", "insomnia", "waking up", "exhausted"],
      description: "Sleep or fatigue was mentioned as a challenge. Prioritizing a consistent bedtime routine could help."
    },
    {
      type: "time",
      title: "Time Management",
      keywords: ["time", "busy", "rushed", "late", "schedule", "planning"],
      description: "Time management came up as a challenge. Try scheduling 15-minute buffer times between tasks."
    },
    {
      type: "focus",
      title: "Focus Struggles",
      keywords: ["procrastination", "focus", "lazy", "delay", "distracted", "motivation"],
      description: "You mentioned struggling with focus. Starting with a 5-minute timer can help overcome procrastination."
    },
    {
      type: "overwhelm",
      title: "Feeling Overwhelmed",
      keywords: ["overwhelmed", "stress", "anxious", "much", "burnout", "hard"],
      description: "You've expressed feeling overwhelmed. Try breaking large goals into much smaller, 10-minute micro-steps."
    },
    {
      type: "health",
      title: "Nutrition & Hydration",
      keywords: ["food", "eat", "diet", "water", "hungry", "snacking", "skip meal"],
      description: "Nutrition came up as a challenge. Keeping a water bottle and healthy snacks nearby might help your energy."
    }
  ];

  keywordCategories.forEach(category => {
    let mentions = 0;
    category.keywords.forEach(kw => {
      const matches = allChallenges.match(new RegExp(`\\b${kw}\\b`, 'g'));
      if (matches) mentions += matches.length;
    });

    if (mentions > 0) {
      insights.push({
        id: `challenge-${category.type}`,
        title: category.title,
        description: category.description,
        iconType: category.type as any,
      });
    }
  });

  // 2. Mood & Productivity Correlation
  if (tasks.length > 0 && reflections.length > 0) {
    const tasksByDate: Record<string, number> = {};
    tasks.filter(t => t.completed && t.scheduled_date).forEach(t => {
      const date = t.scheduled_date!.split("T")[0];
      tasksByDate[date] = (tasksByDate[date] || 0) + 1;
    });

    let bestDate = "";
    let maxTasks = 0;
    for (const [date, count] of Object.entries(tasksByDate)) {
      if (count > maxTasks) {
        maxTasks = count;
        bestDate = date;
      }
    }

    if (bestDate && maxTasks >= 2) {
      const bestReflection = reflections.find(r => r.created_at.startsWith(bestDate));
      if (bestReflection && bestReflection.mood) {
        const moodName = MOOD_LABELS[bestReflection.mood] || bestReflection.mood;
        insights.push({
          id: "peak-productivity",
          title: "Peak Days",
          description: `You are highly productive when you feel '${moodName}'. Keep leveraging those high-energy days!`,
          iconType: "peak",
        });
      }
    }
  }

  // 3. Mood Streaks / Trends
  const tiredReflections = reflections.filter(r => r.mood === "tired" || r.mood === "bad" || r.mood === "stressed");
  if (tiredReflections.length >= 2) {
    insights.push({
      id: "mood-trend-low",
      title: "Rest Needed",
      description: `You've reported feeling drained or stressed in ${tiredReflections.length} recent reflections. Remember to take breaks.`,
      iconType: "energy",
    });
  } else if (reflections.filter(r => r.mood === "great" || r.mood === "good").length >= 2) {
    insights.push({
      id: "mood-trend-high",
      title: "Momentum",
      description: `You've had multiple positive days recently. You're building excellent momentum!`,
      iconType: "peak",
    });
  }

  // 4. Consistency fallback
  if (insights.length < 2 && reflections.length >= 2) {
    insights.push({
      id: "consistency-good",
      title: "Self-Awareness",
      description: `You've logged ${reflections.length} reflections. Building the habit of self-awareness is the first step to growth.`,
      iconType: "consistency",
    });
  }

  // Shuffle and return max 4 insights to keep UI clean
  return insights.sort(() => 0.5 - Math.random()).slice(0, 4);
}
