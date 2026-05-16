import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Calendar, Smile, TrendingUp, Target, Flame, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import InsightCard from "@/components/InsightCard";
import {
  generatePatternInsights,
  generateGrowthSummary,
  type Reflection,
  type Task,
  type Habit,
  type Goal,
  type TimeRange,
  type GrowthSummary,
} from "@/lib/insightEngine";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const MOOD_EMOJIS: Record<string, string> = {
  great: "✨", good: "😊", okay: "😐", stressed: "😰", tired: "😴", bad: "👎",
};

const TREND_ICONS = {
  improving: { icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Improving" },
  steady:    { icon: Minus,        color: "text-blue-500",    bg: "bg-blue-500/10",    label: "Steady" },
  declining: { icon: ArrowDownRight, color: "text-amber-500",   bg: "bg-amber-500/10",   label: "Declining" },
  new:       { icon: Sparkles,     color: "text-primary",    bg: "bg-primary/10",     label: "Starting" },
};

export default function InsightsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

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
          supabase.from("reflections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(365),
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

  const summary: GrowthSummary = useMemo(
    () => generateGrowthSummary(reflections, tasks, habits, goals, timeRange),
    [reflections, tasks, habits, goals, timeRange]
  );

  const patternInsights = useMemo(
    () => generatePatternInsights(reflections, tasks, habits, goals),
    [reflections, tasks, habits, goals]
  );

  // Productivity Trend Visual
  const productivityData = useMemo(() => {
    const days = timeRange === 'weekly' ? 7 : timeRange === 'monthly' ? 30 : 12;
    if (timeRange === 'yearly') {
      // Monthly averages for the year
      return Array.from({ length: 12 }, (_, i) => {
        const d = subDays(new Date(), (11 - i) * 30);
        const start = subDays(d, 30);
        const count = tasks.filter(t => t.completed && t.scheduled_date && new Date(t.scheduled_date) >= start && new Date(t.scheduled_date) <= d).length;
        return { label: format(d, 'MMM'), value: count };
      });
    }
    return Array.from({ length: days }, (_, i) => {
      const d = subDays(new Date(), (days - 1) - i);
      const str = format(d, 'yyyy-MM-dd');
      const count = tasks.filter(t => t.completed && t.scheduled_date === str).length;
      return { label: format(d, days === 7 ? 'EEE' : 'd'), value: count };
    });
  }, [tasks, timeRange]);

  const maxProd = Math.max(...productivityData.map(d => d.value), 1);

  // Mood Trend Visual
  const moodTrendData = useMemo(() => {
    const days = timeRange === 'weekly' ? 7 : timeRange === 'monthly' ? 30 : 12;
    const MOOD_ORDER = ["great", "good", "okay", "stressed", "tired", "bad"];
    const MOOD_COLORS: Record<string, string> = {
      great: "bg-emerald-400", good: "bg-blue-400", okay: "bg-indigo-400",
      stressed: "bg-amber-400", tired: "bg-slate-400", bad: "bg-rose-400",
    };

    if (timeRange === 'yearly') {
      return Array.from({ length: 12 }, (_, i) => {
        const d = subDays(new Date(), (11 - i) * 30);
        const start = subDays(d, 30);
        const refs = reflections.filter(r => new Date(r.created_at) >= start && new Date(r.created_at) <= d);
        const mood = refs.length > 0 ? MOOD_ORDER.find(m => refs.some(r => r.mood === m)) || null : null;
        return { label: format(d, 'MMM'), mood, color: mood ? MOOD_COLORS[mood] : 'bg-muted/20' };
      });
    }

    return Array.from({ length: days }, (_, i) => {
      const d = subDays(new Date(), (days - 1) - i);
      const str = format(d, 'yyyy-MM-dd');
      const ref = reflections.find(r => r.created_at.startsWith(str));
      return {
        label: format(d, days === 7 ? 'EEE' : 'd'),
        mood: ref?.mood || null,
        color: ref?.mood ? MOOD_COLORS[ref.mood] : 'bg-muted/20',
      };
    });
  }, [reflections, timeRange]);

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8 bg-background/50">
      <div className="max-w-3xl mx-auto p-4 space-y-8">

        {/* Header & Tabs */}
        <div className="pt-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Growth Report</h1>
            </div>
            <p className="text-[15px] text-muted-foreground/80">Understanding your behavior and progress.</p>
          </motion.div>

          <div className="flex p-1 bg-muted/50 rounded-xl w-fit">
            {(['weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 capitalize
                  ${timeRange === range ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1 — Narrative Growth Summary */}
        <motion.section
          key={`summary-${timeRange}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border/40 shadow-soft glass-card overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground leading-tight">{summary.headline}</h2>
                    {TREND_ICONS[summary.trend] && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${TREND_ICONS[summary.trend].bg} ${TREND_ICONS[summary.trend].color}`}>
                        {(() => {
                          const Icon = TREND_ICONS[summary.trend].icon;
                          return <Icon className="w-3.5 h-3.5" />;
                        })()}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{TREND_ICONS[summary.trend].label}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl">
                    {summary.narrative}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {summary.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <span className="text-xs font-medium text-foreground/80">{highlight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Section 2 — Pattern Insights */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pattern Insights</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
            {patternInsights.map(insight => (
              <div key={insight.id} className="snap-start">
                <InsightCard title={insight.title} description={insight.description} iconType={insight.iconType} compact />
              </div>
            ))}
            {patternInsights.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">Log more reflections and tasks to reveal your unique patterns.</p>
            )}
          </div>
        </motion.section>

        {/* Section 3 — Visual Trends */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-4 px-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Behavioral Trends</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Productivity Trend */}
            <Card className="border-border/40 shadow-sm bg-card/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-foreground/70">Task Completion</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{timeRange} activity</p>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {productivityData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full bg-primary/10 rounded-t-sm relative group" style={{ height: `${(d.value / maxProd) * 100}%`, minHeight: 2 }}>
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                      </div>
                      <span className="text-[9px] text-muted-foreground font-medium uppercase">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mood Trend Curve */}
            <Card className="border-border/40 shadow-sm bg-card/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-foreground/70">Emotional Tone</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{timeRange} flow</p>
                </div>
                <div className="flex items-center gap-1.5 h-20">
                  {moodTrendData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${d.color} shadow-sm`} />
                      <span className="text-[9px] text-muted-foreground font-medium uppercase">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-muted-foreground">Positive</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[9px] text-muted-foreground">Mixed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Habit Consistency (Bar Visual) */}
            <Card className="border-border/40 shadow-sm bg-card/40 md:col-span-2">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold text-foreground/70">Habit Formation</p>
                  <p className="text-[10px] text-muted-foreground">Completion rates this {timeRange.replace('ly','')}</p>
                </div>
                <div className="space-y-4">
                  {habits.length > 0 ? habits.slice(0, 3).map(h => {
                    const days = timeRange === 'weekly' ? 7 : 30;
                    const recentDates = Array.from({ length: days }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
                    const count = h.completedDates.filter(d => recentDates.includes(d)).length;
                    const pct = Math.round((count / days) * 100);
                    return (
                      <div key={h.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-foreground/80">{h.title}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary/60 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-xs text-muted-foreground text-center py-2">Start a habit to see consistency trends.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </motion.section>

      </div>
    </div>
  );
}
