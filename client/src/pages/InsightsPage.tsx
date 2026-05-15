import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target, Flame, Brain, ArrowRight, Calendar, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import InsightCard from "@/components/InsightCard";
import InsightCarousel from "@/components/InsightCarousel";
import {
  generatePatternInsights,
  generateWeeklySummary,
  type Reflection,
  type Task,
  type Habit,
  type Goal,
  type WeeklySummary,
} from "@/lib/insightEngine";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { format, subDays } from "date-fns";

const MOOD_EMOJIS: Record<string, string> = {
  great: "✨", good: "😊", okay: "😐", stressed: "😰", tired: "😴", bad: "👎",
};

const TREND_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  improving:       { label: "More productive than last week", color: "text-emerald-600", emoji: "📈" },
  steady:          { label: "Consistent with last week",      color: "text-blue-600",    emoji: "➡️" },
  declining:       { label: "Less active than last week",     color: "text-amber-600",   emoji: "📉" },
  not_enough_data: { label: "Keep going — patterns will emerge", color: "text-muted-foreground", emoji: "🌱" },
};

export default function InsightsPage() {
  const { user } = useAuth();

  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [habits, setHabits]           = useState<Habit[]>([]);
  const [goals, setGoals]             = useState<Goal[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rRes, tRes, hRes, gRes] = await Promise.all([
          supabase.from("reflections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(60),
          supabase.from("tasks").select("id, title, completed, scheduled_date").eq("user_id", user.id),
          supabase.from("habits").select("id, title, category, streak, best_streak, weekly_consistency, completed_dates, selected_days").eq("user_id", user.id),
          supabase.from("goals").select("id, title, progress, last_activity_at").eq("user_id", user.id),
        ]);
        setReflections((rRes.data || []) as Reflection[]);
        setTasks((tRes.data || []) as Task[]);
        setHabits((hRes.data || []).map((h: any) => ({
          id: h.id, title: h.title, category: h.category,
          streak: h.streak || 0, bestStreak: h.best_streak || 0,
          weeklyConsistency: h.weekly_consistency || 0,
          completedDates: h.completed_dates || [],
          selectedDays: h.selected_days || [],
        })) as Habit[]);
        setGoals((gRes.data || []).map((g: any) => ({
          id: g.id, title: g.title, progress: g.progress || 0,
          lastActivityAt: g.last_activity_at,
        })) as Goal[]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const patternInsights = useMemo(
    () => generatePatternInsights(reflections, tasks, habits, goals),
    [reflections, tasks, habits, goals]
  );

  const weeklySummary: WeeklySummary = useMemo(
    () => generateWeeklySummary(reflections, tasks, habits),
    [reflections, tasks, habits, goals]
  );

  // Overview stats
  const completedThisWeek = useMemo(() => {
    const cutoff = format(subDays(new Date(), 7), "yyyy-MM-dd");
    return tasks.filter(t => t.completed && t.scheduled_date && t.scheduled_date >= cutoff).length;
  }, [tasks]);

  const topStreak = useMemo(() =>
    habits.reduce((max, h) => Math.max(max, h.streak || 0), 0), [habits]);

  const activeGoals = useMemo(() =>
    goals.filter(g => g.progress < 100).length, [goals]);

  const recentMood = useMemo(() => {
    const last = reflections.find(r => r.mood);
    return last?.mood || null;
  }, [reflections]);

  // 7-day mood chart data
  const moodChartData = useMemo(() => {
    const MOOD_ORDER = ["great", "good", "okay", "stressed", "tired", "bad"];
    const MOOD_COLORS: Record<string, string> = {
      great: "bg-emerald-400", good: "bg-blue-400", okay: "bg-indigo-400",
      stressed: "bg-amber-400", tired: "bg-slate-400", bad: "bg-rose-400",
    };
    return Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      const ref = reflections.find(r => r.created_at.startsWith(d));
      const dayLabel = format(subDays(new Date(), 6 - i), "EEE");
      return {
        day: dayLabel,
        mood: ref?.mood || null,
        color: ref?.mood ? MOOD_COLORS[ref.mood] : "bg-muted",
        emoji: ref?.mood ? MOOD_EMOJIS[ref.mood] : null,
        heightPct: ref?.mood ? Math.max(20, 100 - MOOD_ORDER.indexOf(ref.mood) * 15) : 8,
      };
    });
  }, [reflections]);

  const statCards = [
    { label: "Tasks This Week", value: completedThisWeek, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Top Habit Streak", value: `${topStreak}d`, icon: Flame, color: "text-orange-600", bg: "bg-orange-500/10" },
    { label: "Active Goals", value: activeGoals, icon: Target, color: "text-violet-600", bg: "bg-violet-500/10" },
    { label: "Latest Mood", value: recentMood ? MOOD_EMOJIS[recentMood] || "—" : "—", icon: Smile, color: "text-pink-600", bg: "bg-pink-500/10", isEmoji: true },
  ];

  const trendInfo = TREND_LABELS[weeklySummary.overallTrend];

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8 bg-background/50">
      <div className="max-w-3xl mx-auto p-4 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          </div>
          <p className="text-sm text-muted-foreground">Your personal growth intelligence hub</p>
        </motion.div>

        {/* Section 1 — Overview */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map(card => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="border-border/40 shadow-sm bg-card">
                  <CardContent className="p-4">
                    <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <p className={`text-2xl font-bold ${card.isEmoji ? "" : "text-foreground"} mb-0.5`}>
                      {loading ? "—" : card.value}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.section>

        {/* Section 2 — Pattern Insights */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pattern Insights</h2>
          </div>
          {loading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 w-[260px] h-36 bg-muted/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : patternInsights.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {patternInsights.map(insight => (
                <InsightCard key={insight.id} title={insight.title} description={insight.description} iconType={insight.iconType} />
              ))}
            </div>
          ) : (
            <Card className="border-border/40 border-dashed bg-card/50">
              <CardContent className="py-8 text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Keep logging reflections and tasks to unlock pattern insights.</p>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* Section 3 — Weekly Summary */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly Summary</h2>
          </div>
          <Card className="border-border/40 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 pt-5 pb-4 border-b border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{trendInfo.emoji}</span>
                  <p className={`text-sm font-semibold ${trendInfo.color}`}>{trendInfo.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {weeklySummary.tasksCompleted} tasks completed · {weeklySummary.reflectionCount} reflection{weeklySummary.reflectionCount !== 1 ? "s" : ""} logged
                </p>
              </div>
              <div className="divide-y divide-border/20">
                {[
                  { label: "Most productive mood", value: weeklySummary.mostProductiveMood },
                  { label: "Strongest habit", value: weeklySummary.strongestHabit },
                  { label: "Biggest challenge", value: weeklySummary.biggestChallenge },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-medium text-foreground">
                      {loading ? "—" : row.value || "Not enough data"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Section 4 — Mood Trend */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-3">
            <Smile className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mood — Last 7 Days</h2>
          </div>
          <Card className="border-border/40 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex items-end gap-2 h-20">
                {moodChartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: 60 }}>
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${d.color}`}
                        style={{ height: `${d.heightPct}%`, minHeight: 4 }}
                        title={d.mood || "No reflection"}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/20">
                {[
                  { mood: "great", label: "Great", color: "bg-emerald-400" },
                  { mood: "good",  label: "Good",  color: "bg-blue-400" },
                  { mood: "okay",  label: "Okay",  color: "bg-indigo-400" },
                  { mood: "stressed", label: "Stressed", color: "bg-amber-400" },
                  { mood: "tired",    label: "Tired",    color: "bg-slate-400" },
                  { mood: "bad",      label: "Low",      color: "bg-rose-400" },
                ].map(m => (
                  <div key={m.mood} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${m.color}`} />
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

      </div>
    </div>
  );
}
