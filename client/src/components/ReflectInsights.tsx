import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, PieChart as PieChartIcon, BarChart2, Sparkles, Dumbbell, Smartphone, Moon, Target, CheckCircle2, Clock, Brain, Activity, Apple } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear } from "date-fns";
import { enUS, tr, ru } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { generatePatternInsights, Insight, Reflection, Task, FocusSession, Habit, Goal } from "@/lib/insightEngine";

const MOODS = [
  { id: "great", emoji: "✨", color: "#10b981" },
  { id: "okay", emoji: "😐", color: "#6366f1" },
  { id: "stressed", emoji: "😰", color: "#f59e0b" },
  { id: "tired", emoji: "😴", color: "#6b7280" },
  { id: "bad", emoji: "👎", color: "#ef4444" },
];

const generateYears = () => {
  return [2026, 2027, 2028, 2029, 2030];
};

const generateWeeks = (year: number, t: any) => {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));
  const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 });

  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return {
      value: index + 1,
      label: `${t("week")} ${index + 1}`,
      dateRange: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
      startDate: weekStart,
      endDate: weekEnd
    };
  });
};

interface ReflectInsightsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: Reflection[];
}

export default function ReflectInsights({ open, onOpenChange, history }: ReflectInsightsProps) {
  const { t, language } = useTranslation();
  const currentLocale = language === "tr" ? tr : language === "ru" ? ru : enUS;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("timeline");
  
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => 
      format(new Date(2024, i, 1), "MMMM", { locale: currentLocale })
    );
  }, [currentLocale]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM", { locale: currentLocale }));

  const [patternInsights, setPatternInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (open && user && history.length > 0) {
      const fetchRelatedData = async () => {
        setLoadingInsights(true);
        try {
          const [tasksRes, sessionsRes, habitsRes, goalsRes] = await Promise.all([
            supabase.from("tasks").select("id, completed, scheduled_date").eq("user_id", user.id),
            supabase.from("focus_sessions").select("id, duration, completed_at").eq("user_id", user.id),
            supabase.from("habits").select("*").eq("user_id", user.id),
            supabase.from("goals").select("id, title, progress, last_activity_at").eq("user_id", user.id)
          ]);
          
          const tasks = (tasksRes.data || []) as Task[];
          const sessions = (sessionsRes.data || []) as FocusSession[];
          const habits = (habitsRes.data || []) as Habit[];
          const goals = (goalsRes.data || []) as Goal[];
          
          const generated = generatePatternInsights(history, tasks, sessions, habits, goals);
          setPatternInsights(generated);
        } catch (error) {
          console.error("Error generating insights:", error);
        } finally {
          setLoadingInsights(false);
        }
      };
      fetchRelatedData();
    } else if (open && history.length === 0) {
      setPatternInsights(generatePatternInsights([], [], [], [], []));
    }
  }, [open, user, history]);

  const weeklyData = useMemo(() => {
    const weeks = generateWeeks(selectedYear, t);
    const targetWeek = weeks.find(w => w.value === selectedWeek);
    if (!targetWeek) return [];

    const weekReflections = history.filter(item => {
      const date = new Date(item.created_at);
      return date >= targetWeek.startDate && date <= targetWeek.endDate;
    });

    return MOODS.map(mood => ({
      name: mood.emoji + " " + t(`mood_${mood.id}` as any),
      count: weekReflections.filter(r => r.mood === mood.id).length,
      color: mood.color,
    }));
  }, [history, selectedWeek, selectedYear, t]);

  const monthlyData = useMemo(() => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthReflections = history.filter(item => {
      const date = new Date(item.created_at);
      return date.getFullYear() === selectedYear && date.getMonth() === monthIndex;
    });

    return MOODS.map(mood => ({
      name: mood.emoji + " " + t(`mood_${mood.id}` as any),
      value: monthReflections.filter(r => r.mood === mood.id).length,
      color: mood.color,
    })).filter(data => data.value > 0);
  }, [history, selectedMonth, selectedYear, months, t]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "peak": return <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />;
      case "distraction": return <Smartphone className="w-3.5 h-3.5 text-amber-600" />;
      case "energy": return <Moon className="w-3.5 h-3.5 text-indigo-600" />;
      case "consistency": return <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
      case "time": return <Clock className="w-3.5 h-3.5 text-orange-600" />;
      case "focus": return <Brain className="w-3.5 h-3.5 text-purple-600" />;
      case "overwhelm": return <Activity className="w-3.5 h-3.5 text-red-600" />;
      case "health": return <Apple className="w-3.5 h-3.5 text-green-600" />;
      default: return <Target className="w-3.5 h-3.5 text-violet-600" />;
    }
  };

  const getInsightColorClass = (type: string) => {
    switch (type) {
      case "peak": return "bg-emerald-500/10";
      case "distraction": return "bg-amber-500/10";
      case "energy": return "bg-indigo-500/10";
      case "consistency": return "bg-blue-500/10";
      case "time": return "bg-orange-500/10";
      case "focus": return "bg-purple-500/10";
      case "overwhelm": return "bg-red-500/10";
      case "health": return "bg-green-500/10";
      default: return "bg-violet-500/10";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t("insights")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="timeline">{t("timeline")}</TabsTrigger>
              <TabsTrigger value="weekly">{t("weekly")}</TabsTrigger>
              <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
            </TabsList>

            {/* TIMELINE TAB */}
            <TabsContent value="timeline" className="mt-6">
              
              {/* Pattern Insights Row */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 mb-3 px-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{t("pattern_insights")}</h3>
                </div>
                {loadingInsights ? (
                  <div className="flex justify-center p-4">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
                    {patternInsights.map(insight => (
                      <div key={insight.id} className="shrink-0 snap-start bg-card border border-border/40 rounded-xl p-3.5 shadow-sm min-w-[200px] max-w-[220px]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`p-1 rounded-md ${getInsightColorClass(insight.iconType)}`}>
                            {getInsightIcon(insight.iconType)}
                          </div>
                          <span className="text-[13px] font-semibold text-foreground">{insight.title}</span>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-snug">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reflection History Timeline */}
              <div>
                <div className="flex items-center gap-1.5 mb-4 px-1">
                  <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{t("reflection_history")}</h3>
                </div>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic text-center p-8 bg-card rounded-2xl border border-border/50">
                    {t("no_reflections_yet")}
                  </p>
                ) : (
                  <div className="relative pl-4 space-y-6 before:absolute before:inset-y-2 before:left-[21px] before:w-[2px] before:bg-border/50">
                    {history.map((item) => {
                      const moodData = MOODS.find(m => m.id === item.mood);
                      return (
                        <div key={item.id} className="relative pl-6">
                          {/* Timeline Dot */}
                          <div className="absolute left-[-2px] top-[14px] w-2.5 h-2.5 rounded-full bg-background border-2 border-primary z-10" />
                          
                          {/* Compact Card */}
                          <div className="bg-card p-3.5 rounded-xl shadow-sm border border-border/50 flex flex-col gap-2.5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-semibold text-foreground">
                                {format(new Date(item.created_at), "EEE, MMM d", { locale: currentLocale })}
                              </span>
                              {moodData && (
                                <span className="bg-muted px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 font-medium text-muted-foreground">
                                  {moodData.emoji} {t(`mood_${moodData.id}` as any)}
                                </span>
                              )}
                            </div>
                            
                            {(item.progress || item.challenge || item.next_step) && (
                              <div className="space-y-2 pt-2 border-t border-border/30">
                                {item.progress && (
                                  <div>
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold mr-1">{t("progress")}:</span>
                                    <span className="text-[13px] text-foreground/90">{item.progress}</span>
                                  </div>
                                )}
                                {item.challenge && (
                                  <div>
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold mr-1">{t("challenge")}:</span>
                                    <span className="text-[13px] text-foreground/90">{item.challenge}</span>
                                  </div>
                                )}
                                {item.next_step && (
                                  <div>
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold mr-1">{t("next_step")}:</span>
                                    <span className="text-[13px] text-foreground/90">{item.next_step}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* WEEKLY TAB */}
            <TabsContent value="weekly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{t("select_week")}</h3>
                <div className="flex gap-2">
                  <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateWeeks(selectedYear, t).map((week) => (
                        <SelectItem key={week.value} value={week.value.toString()}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(() => {
                const weeks = generateWeeks(selectedYear, t);
                const currentWeek = weeks.find(w => w.value === selectedWeek);
                return (
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm font-medium">
                      {currentWeek ? currentWeek.dateRange : t("no_activity_detected")} {selectedYear}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t("selected_week_range") || "Selected week range"}</p>
                  </div>
                );
              })()}

              <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t("mood_summary")}</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                      <RechartsTooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                        {weeklyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* MONTHLY TAB */}
            <TabsContent value="monthly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{t("select_month")}</h3>
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t("mood_distribution")}</h3>
                </div>
                {monthlyData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {monthlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-sm text-muted-foreground italic">
                    {t("no_mood_data")}
                  </div>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
