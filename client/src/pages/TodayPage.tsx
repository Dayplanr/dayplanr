import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, Clock, CheckCircle2, Flame, ChevronUp, ChevronDown, Bell, ListTodo, MoreVertical, Pencil, Trash2, Tag, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CalendarScrubber from "@/components/CalendarScrubber";
import TodayInsights from "@/components/TodayInsights";
import ModernTaskCard from "@/components/ModernTaskCard";
import ProgressRing from "@/components/ProgressRing";
import DashboardCustomizer, { type DashboardConfig } from "@/components/DashboardCustomizer";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/hooks/useNotifications";
import { format, type Locale, startOfDay, endOfDay, subDays } from "date-fns";
import { enUS, de, es, fr, it, pt, nl, pl } from "date-fns/locale";
import { isHabitScheduledForDate, calculateHabitStreak, type Habit as HabitType } from "@/types/habits";

interface Task {
  id: string;
  title: string;
  description?: string;
  time?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  hasReminder?: boolean;
  habit_id?: string;
  goal_id?: string;
  scheduled_date?: string;
  duration?: string;
  category?: string;
}

interface TaskGroups {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
  night: Task[];
}

const priorityBorderColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const localeMap: Record<string, Locale> = {
  en: enUS,
  de: de,
  es: es,
  fr: fr,
  it: it,
  pt: pt,
  nl: nl,
  pl: pl,
};

export default function TodayPage() {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const notifications = useNotifications();
  const [location, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInsights, setShowInsights] = useState(false);
  const [openSections, setOpenSections] = useState({
    morning: true,
    afternoon: true,
    evening: true,
    night: true,
  });
  const [progressOpen, setProgressOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    focusMinutes: 0,
    completedHabits: 0,
    totalHabits: 0,
    streak: 0,
  });
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    modules: {
      summary: true,
      focus: true,
      habits: true,
      insights: true,
    },
    order: ["summary", "focus", "habits", "insights"],
  });

  const [tasks, setTasks] = useState<TaskGroups>({
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  });

  const [goalMap, setGoalMap] = useState<Record<string, string>>({});

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);

    const todayStr = format(selectedDate, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("scheduled_date", todayStr)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const groups: TaskGroups = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    data?.forEach((task: any) => {
      const period = task.day_period as keyof TaskGroups;
      if (groups[period]) {
        groups[period].push({
          id: task.id,
          title: task.title,
          description: task.description,
          time: task.time,
          priority: task.priority,
          completed: task.completed,
          hasReminder: task.has_reminder,
          habit_id: task.habit_id,
          goal_id: task.goal_id,
          scheduled_date: task.scheduled_date,
          duration: task.duration,
          category: task.category,
        });
      }
    });

    // Sort tasks within each period by time
    Object.keys(groups).forEach((period) => {
      const periodKey = period as keyof TaskGroups;
      groups[periodKey].sort((a, b) => {
        // Tasks without time go to the end
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;

        // Convert time strings to comparable format (24h)
        const timeA = convertTo24Hour(a.time);
        const timeB = convertTo24Hour(b.time);
        return timeA.localeCompare(timeB);
      });
    });

    setTasks(groups);
    setLoading(false);

    // Schedule notifications for all tasks
    data?.forEach((task: any) => {
      if (!task.completed && task.time) {
        notifications.scheduleTaskNotification({
          id: task.id,
          title: task.title,
          time: task.time,
          scheduled_date: task.scheduled_date,
          completed: task.completed,
        });
      }
    });

    // Schedule incomplete nudge for end of day
    const incompleteTasks = data?.filter((t: any) => !t.completed) || [];
    if (incompleteTasks.length > 0) {
      notifications.scheduleIncompleteNudge(
        incompleteTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          time: t.time,
          scheduled_date: t.scheduled_date,
          completed: t.completed,
        })),
        todayStr
      );
    }
  };

  const fetchGoals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("goals")
      .select("id, title")
      .eq("user_id", user.id);
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((g: any) => { map[g.id] = g.title; });
      setGoalMap(map);
    }
  };

  const fetchDashboardConfig = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("dashboard_config")
        .eq("user_id", user.id)
        .single();

      if (data?.dashboard_config) {
        setDashboardConfig(data.dashboard_config as DashboardConfig);
      }
    } catch (err) {
      console.error("Error fetching dashboard config:", err);
    }
  };

  const saveDashboardConfig = async (newConfig: DashboardConfig) => {
    if (!user) return;
    setDashboardConfig(newConfig);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          dashboard_config: newConfig,
        });

      if (error) throw error;
    } catch (err) {
      toast({
        title: "Error saving configuration",
        description: (err as any).message,
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    const today = format(selectedDate, "yyyy-MM-dd");

    // Fetch focus sessions for today
    const { data: focusData } = await supabase
      .from("focus_sessions")
      .select("duration")
      .eq("user_id", user.id)
      .gte("completed_at", startOfDay(selectedDate).toISOString())
      .lte("completed_at", endOfDay(selectedDate).toISOString());

    const totalFocus = focusData?.reduce((acc, s) => acc + s.duration, 0) || 0;

    // Fetch habits
    const { data: habitData } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id);

    const habitsCount = habitData?.length || 0;

    const completedHabitsCount = habitData?.filter(h => {
      const habit: HabitType = {
        ...h,
        scheduleType: h.schedule_type,
        selectedDays: h.selected_days || [],
        completedDates: h.completed_dates || [],
      } as any;
      return isHabitScheduledForDate(habit, selectedDate) && h.completed_dates?.includes(today);
    }).length || 0;

    const maxStreak = habitData?.reduce((acc, h) => Math.max(acc, h.streak || 0), 0) || 0;

    setStats({
      focusMinutes: totalFocus,
      completedHabits: completedHabitsCount,
      totalHabits: habitsCount,
      streak: maxStreak,
    });
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
    fetchDashboardConfig();
    fetchGoals();
  }, [user, selectedDate, location]);

  useEffect(() => {
    // Check if we need to preserve a selected date when returning from task creation
    const preserveDate = localStorage.getItem("preserveSelectedDate");
    if (preserveDate) {
      localStorage.removeItem("preserveSelectedDate");
      setSelectedDate(new Date(preserveDate));
    }
  }, [location]);

  const handleToggleTask = async (period: keyof TaskGroups, id: string) => {
    const task = tasks[period].find((t: Task) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;

    const { error: taskError } = await supabase
      .from("tasks")
      .update({ completed: newCompleted })
      .eq("id", id);

    if (taskError) {
      toast({
        title: "Error updating task",
        description: taskError.message,
        variant: "destructive",
      });
      return;
    }

    // Sync with linked habit
    if (task.habit_id) {
      const today = format(selectedDate, "yyyy-MM-dd");

      // Fetch current habit data
      const { data: habitData } = await supabase
        .from("habits")
        .select("completed_dates, streak, best_streak, schedule_type, selected_days")
        .eq("id", task.habit_id)
        .single();

      if (habitData) {
        let updatedDates = habitData.completed_dates || [];
        const habit: HabitType = {
          ...habitData,
          id: task.habit_id,
          scheduleType: habitData.schedule_type,
          selectedDays: habitData.selected_days || [],
          completedDates: updatedDates,
        } as any;

        if (newCompleted) {
          if (!updatedDates.includes(today)) {
            updatedDates = [...updatedDates, today].sort();
          }
        } else {
          // Check if any other task for this habit is completed today
          const otherCompleted = Object.values(tasks)
            .flat()
            .some(t => t.id !== id && t.habit_id === task.habit_id && t.completed);

          if (!otherCompleted) {
            updatedDates = updatedDates.filter((d: string) => d !== today);
          }
        }

        // Update habit object with new dates for streak calculation
        habit.completedDates = updatedDates;
        const newStreak = calculateHabitStreak(habit);
        const newBestStreak = Math.max(habitData.best_streak || 0, newStreak);

        await supabase
          .from("habits")
          .update({
            completed_dates: updatedDates,
            streak: newStreak,
            best_streak: newBestStreak
          })
          .eq("id", task.habit_id);
      }
    }

    setTasks((prev: TaskGroups) => ({
      ...prev,
      [period]: prev[period].map((t: Task) =>
        t.id === id ? { ...t, completed: newCompleted } : t
      ),
    }));

    // Cancel notification if task is completed, reschedule if uncompleted
    if (newCompleted) {
      notifications.cancelNotification(id);
    } else {
      const updatedTask = tasks[period].find(t => t.id === id);
      if (updatedTask && updatedTask.time) {
        notifications.scheduleTaskNotification({
          id: updatedTask.id,
          title: updatedTask.title,
          time: updatedTask.time,
          scheduled_date: updatedTask.scheduled_date,
          completed: false,
        });
      }
    }

    // Refresh stats to update habits completed count
    fetchStats();
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev: typeof openSections) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    // Legacy localStorage handling removed to prevent duplication now that we use Supabase directly
  }, []);

  const determinePeriodFromTime = (time: string): keyof TaskGroups => {
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const allTasks = Object.values(tasks).flat();
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayFocusMinutes = stats.focusMinutes;
  const currentStreak = stats.streak;
  const totalHabits = stats.totalHabits;
  const completedHabits = stats.completedHabits;

  const baseLanguage = language.split("-")[0];
  const currentLocale = localeMap[baseLanguage] || localeMap[language] || enUS;
  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy", { locale: currentLocale });

  const handleDeleteTask = async (period: keyof TaskGroups, id: string) => {
    const task = tasks[period].find(t => t.id === id);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Sync with linked habit if the deleted task was completed
    if (task.completed && task.habit_id) {
      const today = format(selectedDate, "yyyy-MM-dd");

      // Check if any OTHER task for this habit is completed today
      const otherCompleted = Object.values(tasks)
        .flat()
        .some((t: Task) => t.id !== id && t.habit_id === task.habit_id && t.completed);

      if (!otherCompleted) {
        // Fetch current habit data to get current completed_dates
        const { data: habitData } = await supabase
          .from("habits")
          .select("completed_dates, streak, best_streak, schedule_type, selected_days")
          .eq("id", task.habit_id)
          .single();

        if (habitData) {
          const updatedDates = (habitData.completed_dates || []).filter((d: string) => d !== today);
          const habit: HabitType = {
            ...habitData,
            id: task.habit_id,
            scheduleType: habitData.schedule_type,
            selectedDays: habitData.selected_days || [],
            completedDates: updatedDates,
          } as any;

          const newStreak = calculateHabitStreak(habit);
          const newBestStreak = Math.max(habitData.best_streak || 0, newStreak);

          await supabase
            .from("habits")
            .update({
              completed_dates: updatedDates,
              streak: newStreak,
              best_streak: newBestStreak
            })
            .eq("id", task.habit_id);
        }
      }
    }

    setTasks((prev: TaskGroups) => ({
      ...prev,
      [period]: prev[period].filter((task: Task) => task.id !== id),
    }));

    toast({ title: t("taskDeleted") || "Task deleted" });
    await fetchStats();
  };

  const handleEditTask = (period: keyof TaskGroups, task: Task) => {
    localStorage.setItem("editTask", JSON.stringify({ ...task, period }));
    localStorage.setItem("selectedTaskDate", format(selectedDate, "yyyy-MM-dd"));
    localStorage.setItem("returnToDate", format(selectedDate, "yyyy-MM-dd"));
    navigate("/app/tasks/new");
  };

  const handleAddTask = () => {
    localStorage.setItem("selectedTaskDate", format(selectedDate, "yyyy-MM-dd"));
    localStorage.setItem("returnToDate", format(selectedDate, "yyyy-MM-dd"));
    navigate("/app/tasks/new");
  };

  const renderTaskSection = (title: string, period: keyof TaskGroups, periodTasks: Task[]) => (
    <Collapsible
      key={period}
      open={openSections[period]}
      onOpenChange={() => toggleSection(period)}
      className="mb-2"
    >
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full py-2 px-1 group">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wider">{title}</h2>
            {periodTasks.length > 0 && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                {periodTasks.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-border hidden group-hover:block" />
            {openSections[period] ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground/50" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
            )}
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 pt-2">
          <AnimatePresence mode="popLayout">
            {periodTasks.length > 0 ? (
              periodTasks.map((task) => (
                <ModernTaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  time={task.time}
                  priority={task.priority}
                  completed={task.completed}
                  hasReminder={task.hasReminder}
                  duration={task.duration}
                  category={task.category}
                  goalName={task.goal_id ? goalMap[task.goal_id] : undefined}
                  onToggle={() => handleToggleTask(period, task.id)}
                  onEdit={() => handleEditTask(period, task)}
                  onDelete={() => handleDeleteTask(period, task.id)}
                  t={t}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center"
              >
                <p className="text-sm text-muted-foreground italic">No tasks for this period</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8 bg-background/50">
      <div className="max-w-3xl mx-auto p-4 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 pt-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {t("today")}
                </h1>
                {progressPercent === 100 && totalTasks > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <CalendarIcon className="w-3.5 h-3.5" />
                <p className="text-sm capitalize">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {dashboardConfig.modules.insights && (
                <Button
                  onClick={() => setShowInsights(true)}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-11 w-11 border-border/50 bg-background/50 hover:bg-accent backdrop-blur-sm shadow-sm"
                  data-testid="button-today-insights-header"
                >
                  <TrendingUp className="w-5 h-5" />
                </Button>
              )}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Button onClick={handleAddTask} className="w-full sm:w-auto rounded-full h-11 px-6 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" data-testid="button-add-task-header">
                  <Plus className="w-5 h-5" />
                  <span className="font-bold">{t("addTask")}</span>
                </Button>
                <div className="w-full">
                  <DashboardCustomizer config={dashboardConfig} onUpdate={saveDashboardConfig} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-md rounded-3xl p-1 border border-border/20 shadow-sm">
            <CalendarScrubber selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {(dashboardConfig.modules.summary || dashboardConfig.modules.focus || dashboardConfig.modules.habits) && (
            <Card className="overflow-hidden border-none shadow-soft glass-card">
              <CardContent className="p-0">
                <div className={`grid grid-cols-1 md:grid-cols-${[dashboardConfig.modules.summary, dashboardConfig.modules.focus, dashboardConfig.modules.habits].filter(Boolean).length
                  } divide-y md:divide-y-0 md:divide-x divide-border/30`}>
                  {dashboardConfig.order.filter(id => id !== 'insights').map((moduleId) => {
                    if (!dashboardConfig.modules[moduleId as keyof DashboardConfig["modules"]]) return null;

                    if (moduleId === "summary") {
                      return (
                        <div key="summary" className="p-6 flex flex-col items-center justify-center text-center bg-primary/5">
                          <ProgressRing progress={progressPercent} size={120} strokeWidth={10} color="hsl(var(--primary))" />
                          <div className="mt-4">
                            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t("dailyProgress")}</p>
                            <p className="text-sm font-black text-foreground mt-1">
                              {completedTasks} <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">of</span> {totalTasks}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (moduleId === "focus") {
                      return (
                        <div key="focus" className="p-6 flex flex-col items-center justify-center text-center hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigate("/focus")}>
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 relative ring-1 ring-blue-500/20">
                              <Clock className="w-8 h-8 text-blue-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t("focusTime")}</p>
                            <p className="text-2xl font-black text-foreground mt-1">
                              {todayFocusMinutes}<span className="text-sm font-bold ml-1 text-muted-foreground">m</span>
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (moduleId === "habits") {
                      return (
                        <div key="habits" className="p-6 flex flex-col items-center justify-center text-center hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigate("/habits")}>
                          <div className="relative">
                            <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full" />
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 relative ring-1 ring-orange-500/20">
                              <Flame className="w-8 h-8 text-orange-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t("habits")}</p>
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <p className="text-2xl font-black text-foreground">
                                {currentStreak}<span className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-tight">d</span>
                              </p>
                              <div className="h-4 w-px bg-border/50 mx-1" />
                              <p className="text-lg font-bold text-muted-foreground">
                                {completedHabits}<span className="text-xs font-semibold">/{totalHabits}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {renderTaskSection(t("morning"), "morning", tasks.morning)}
            {renderTaskSection(t("afternoon"), "afternoon", tasks.afternoon)}
            {renderTaskSection(t("evening"), "evening", tasks.evening)}
            {renderTaskSection(t("night"), "night", tasks.night)}
          </div>
        </motion.div>

      </div>

      <TodayInsights
        open={showInsights}
        onOpenChange={setShowInsights}
        tasksCompleted={completedTasks}
        totalTasks={totalTasks}
        focusMinutes={todayFocusMinutes}
        habitsCompleted={completedHabits}
        totalHabits={totalHabits}
      />
    </div>
  );
}
