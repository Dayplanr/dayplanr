import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Target, Clock, CheckCircle2, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { format, subDays, startOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear, type Locale } from "date-fns";
import { enUS, tr, ru } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";

interface TodayInsightsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasksCompleted: number;
  totalTasks: number;
  focusMinutes: number;
  habitsCompleted: number;
  totalHabits: number;
}

const FOCUS_COLOR = "hsl(var(--primary))";
const TASK_COLOR = "#a78bfa";

const localeMap: Record<string, Locale> = {
  en: enUS,
  tr: tr,
  ru: ru,
};

const generateYears = () => {
  return [2026, 2027, 2028, 2029, 2030];
};

const generateWeeks = (year: number, t: any) => {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));
  const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 }); // Monday start

  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return {
      value: index + 1,
      label: `${t("weekly")} ${index + 1}`,
      dateRange: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
      startDate: weekStart,
      endDate: weekEnd
    };
  });
};

export default function TodayInsights({
  open,
  onOpenChange,
  tasksCompleted,
  totalTasks,
  focusMinutes,
  habitsCompleted,
  totalHabits,
}: TodayInsightsProps) {
  const { t, language } = useTranslation();
  const baseLanguage = language.split("-")[0];
  const currentLocale = localeMap[baseLanguage] || enUS;

  const months = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2026, i, 1), "MMMM", { locale: currentLocale })
  );

  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM", { locale: currentLocale }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [rawLinkedTasks, setRawLinkedTasks] = useState<any[]>([]);
  const [goalTitleMap, setGoalTitleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && user) {
      const fetchData = async () => {
        setLoading(true);
        const [tasksRes, focusRes, goalsRes, linkedTasksRes] = await Promise.all([
          supabase.from("tasks").select("scheduled_date, completed").eq("user_id", user.id).eq("completed", true),
          supabase.from("focus_sessions").select("completed_at, duration").eq("user_id", user.id),
          supabase.from("goals").select("id, title").eq("user_id", user.id),
          supabase.from("tasks").select("goal_id, completed, scheduled_date").eq("user_id", user.id).not("goal_id", "is", null),
        ]);

        if (tasksRes.data) setTaskHistory(tasksRes.data);
        if (focusRes.data) setSessionHistory(focusRes.data);
        if (linkedTasksRes.data) setRawLinkedTasks(linkedTasksRes.data);
        if (goalsRes.data) {
          const map: Record<string, string> = {};
          goalsRes.data.forEach((g: any) => { map[g.id] = g.title; });
          setGoalTitleMap(map);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [open, user]);

  const getWeeklyData = () => {
    const weeks = generateWeeks(selectedYear, t);
    const targetWeek = weeks.find(w => w.value === selectedWeek);
    if (!targetWeek) return [];

    const days = eachDayOfInterval({ start: targetWeek.startDate, end: targetWeek.endDate });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dTasks = taskHistory.filter(t => t.scheduled_date === dayStr);
      const dSessions = sessionHistory.filter(s => s.completed_at?.startsWith(dayStr));

      return {
        day: format(day, "EEE", { locale: currentLocale }),
        tasks: dTasks.length,
        focus: dSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const weeklyData = getWeeklyData();

  const getMonthlyData = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dTasks = taskHistory.filter(t => t.scheduled_date === dayStr);
      const dSessions = sessionHistory.filter(s => s.completed_at?.startsWith(dayStr));

      return {
        day: format(day, "d"),
        tasks: dTasks.length,
        focus: dSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const monthlyData = getMonthlyData();

  const getYearlyData = () => {
    return months.map((month, index) => {
      const monthStart = new Date(selectedYear, index, 1);
      const monthEnd = new Date(selectedYear, index + 1, 0);

      const mTasks = taskHistory.filter(t => {
        if (!t.scheduled_date) return false;
        const d = new Date(t.scheduled_date);
        return d >= monthStart && d <= monthEnd;
      });

      const mSessions = sessionHistory.filter(s => {
        if (!s.completed_at) return false;
        const d = new Date(s.completed_at);
        return d >= monthStart && d <= monthEnd;
      });

      return {
        month: format(monthStart, "MMM", { locale: currentLocale }), // Jan
        tasks: mTasks.length,
        focus: mSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const yearlyData = getYearlyData();

  // Period-scoped goal stats
  const getGoalStatsForPeriod = (start: Date, end: Date) => {
    const periodTasks = rawLinkedTasks.filter(t => {
      if (!t.scheduled_date) return false;
      const d = new Date(t.scheduled_date);
      return d >= start && d <= end;
    });
    const statsMap: Record<string, { title: string; done: number; total: number }> = {};
    periodTasks.forEach((t: any) => {
      if (!t.goal_id || !goalTitleMap[t.goal_id]) return;
      if (!statsMap[t.goal_id]) statsMap[t.goal_id] = { title: goalTitleMap[t.goal_id], done: 0, total: 0 };
      statsMap[t.goal_id].total += 1;
      if (t.completed) statsMap[t.goal_id].done += 1;
    });
    return Object.values(statsMap);
  };

  const renderGoalRows = (stats: { title: string; done: number; total: number }[]) => {
    if (stats.length === 0) return null;
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            {t("goal_progress")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map(g => (
            <div key={g.title}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium truncate max-w-[65%]">{g.title}</span>
                <span className="text-muted-foreground">{g.done}/{g.total} {t("tasks")}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${g.total > 0 ? Math.round((g.done / g.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const weeklyProductivityScore = Math.round(
    ((weeklyData.reduce((sum, d) => sum + d.tasks, 0) / 50) * 50) +
    ((weeklyData.reduce((sum, d) => sum + d.focus, 0) / 500) * 50)
  );

  const monthlyProductivityScore = Math.round(
    ((monthlyData.reduce((sum, d) => sum + d.tasks, 0) / 200) * 50) +
    ((monthlyData.reduce((sum, d) => sum + d.focus, 0) / 2000) * 50)
  );

  const yearlyProductivityScore = Math.round(
    ((yearlyData.reduce((sum, d) => sum + d.tasks, 0) / 1500) * 50) +
    ((yearlyData.reduce((sum, d) => sum + d.focus, 0) / 15000) * 50)
  );

  const renderMonthHeatmap = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = getDay(monthStart);
    const emptyCells = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);

    const weekDays = Array.from({ length: 7 }, (_, i) => 
      format(startOfWeek(new Date(), { weekStartsOn: 1 }), "EEEEE", { locale: currentLocale })
    );

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => (
          <div key={i} className="text-xs text-center text-muted-foreground">
            {format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), "EEEEE", { locale: currentLocale })}
          </div>
        ))}
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dTasks = taskHistory.filter(t => t.scheduled_date === dayStr).length;
          const dSessions = sessionHistory.filter(s => s.completed_at?.startsWith(dayStr)).length;
          const activityCount = dTasks + dSessions;

          const getActiveOpacity = (count: number) => {
            if (count === 0) return 0.1;
            if (count <= 2) return 0.3;
            if (count <= 5) return 0.6;
            return 1;
          };

          return (
            <div
              key={day.toISOString()}
              className="aspect-square rounded-sm flex items-center justify-center"
              style={{
                backgroundColor: `hsl(var(--primary) / ${getActiveOpacity(activityCount)})`,
              }}
              title={`${format(day, "MMM d, yyyy")}: ${activityCount} activities`}
            >
              <span className="text-xs">{format(day, "d")}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t("today_insights")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="weekly" data-testid="tab-weekly">{t("weekly")}</TabsTrigger>
              <TabsTrigger value="monthly" data-testid="tab-monthly">{t("monthly")}</TabsTrigger>
              <TabsTrigger value="yearly" data-testid="tab-yearly">{t("yearly")}</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{t("select_week")}</h3>
                <div className="flex gap-2">
                  <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                    <SelectTrigger className="w-32" data-testid="select-week-today">
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
                    <SelectTrigger className="w-20" data-testid="select-year-today-weekly">
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t("tasks_vs_focus")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="tasks" fill={TASK_COLOR} radius={[4, 4, 0, 0]} name={t("tasks")} />
                        <Bar yAxisId="right" dataKey="focus" fill={FOCUS_COLOR} radius={[4, 4, 0, 0]} name={`${t("focus_time")} (min)`} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {t("productivity_score")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-4xl font-mono font-bold" data-testid="text-weekly-productivity">
                      {weeklyProductivityScore}
                    </p>
                    <p className="text-sm text-muted-foreground">{t("out_of_100")}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-weekly-tasks">
                    {weeklyData.reduce((sum, d) => sum + d.tasks, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("tasks_done")}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-weekly-focus">
                    {weeklyData.reduce((sum, d) => sum + d.focus, 0)}m
                  </p>
                  <p className="text-xs text-muted-foreground">{t("focus_time")}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-weekly-best">
                    {weeklyData.reduce((best, d) => d.tasks > best.tasks ? d : best).day}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("best_day")}</p>
                </div>
              </div>
              {(() => {
                const weeks = generateWeeks(selectedYear, t);
                const w = weeks.find(wk => wk.value === selectedWeek);
                if (!w) return null;
                return renderGoalRows(getGoalStatsForPeriod(w.startDate, w.endDate));
              })()}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{t("select_date")}</h3>
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32" data-testid="select-month">
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
                    <SelectTrigger className="w-20" data-testid="select-year">
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{selectedMonth} {selectedYear} {t("activity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMonthHeatmap()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t("tasks_vs_focus")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData.filter((_, i) => i % 3 === 0)}>
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="tasks" stroke={TASK_COLOR} strokeWidth={2} dot={false} name={t("tasks")} />
                        <Line type="monotone" dataKey="focus" stroke={FOCUS_COLOR} strokeWidth={2} dot={false} name={`${t("focus_time")} (min)`} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {t("productivity_score")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-4xl font-mono font-bold" data-testid="text-monthly-productivity">
                      {monthlyProductivityScore}
                    </p>
                    <p className="text-sm text-muted-foreground">{t("out_of_100")}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-monthly-tasks">
                    {monthlyData.reduce((sum, d) => sum + d.tasks, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("tasks_done")}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-monthly-focus">
                    {Math.round(monthlyData.reduce((sum, d) => sum + d.focus, 0) / 60)}h
                  </p>
                  <p className="text-xs text-muted-foreground">{t("focus_time")}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-monthly-avg">
                    {Math.round(monthlyData.reduce((sum, d) => sum + d.tasks, 0) / monthlyData.length)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("avg_per_day")}</p>
                </div>
              </div>
              {renderGoalRows(getGoalStatsForPeriod(
                new Date(selectedYear, months.indexOf(selectedMonth), 1),
                new Date(selectedYear, months.indexOf(selectedMonth) + 1, 0)
              ))}
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t("select_year")}</h3>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-20" data-testid="select-year-yearly">
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {selectedYear} {t("tasks_vs_focus")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="tasks" fill={TASK_COLOR} radius={[4, 4, 0, 0]} name={t("tasks")} />
                        <Bar yAxisId="right" dataKey="focus" fill={FOCUS_COLOR} radius={[4, 4, 0, 0]} name={`${t("focus_time")} (min)`} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {t("productivity_score")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-4xl font-mono font-bold" data-testid="text-yearly-productivity">
                      {yearlyProductivityScore}
                    </p>
                    <p className="text-sm text-muted-foreground">{t("out_of_100")}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-yearly-tasks">
                    {yearlyData.reduce((sum, d) => sum + d.tasks, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("tasks_done")}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-yearly-focus">
                    {Math.round(yearlyData.reduce((sum, d) => sum + d.focus, 0) / 60)}h
                  </p>
                  <p className="text-xs text-muted-foreground">{t("focus_time")}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-yearly-best">
                    {yearlyData.reduce((best, d) => d.tasks > best.tasks ? d : best).month}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("best_month")}</p>
                </div>
              </div>
              {renderGoalRows(getGoalStatsForPeriod(
                new Date(selectedYear, 0, 1),
                new Date(selectedYear, 11, 31)
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
