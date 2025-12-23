import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, TrendingUp, Clock, CheckCircle2, Flame, ChevronUp, ChevronDown, Bell, ListTodo, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { format, type Locale, startOfDay, endOfDay } from "date-fns";
import { enUS, de, es, fr, it, pt, nl, pl } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  time?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  hasReminder?: boolean;
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
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInsights, setShowInsights] = useState(false);
  const [openSections, setOpenSections] = useState({
    morning: true,
    afternoon: true,
    evening: true,
    night: true,
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    focusMinutes: 0,
    completedHabits: 0,
    totalHabits: 0,
    streak: 0,
  });

  const [tasks, setTasks] = useState<TaskGroups>({
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  });

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);

    // For now, we'll fetch all tasks for the user. 
    // In a real app we'd filter by the created_at date matching selectedDate.
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
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
          time: task.time,
          priority: task.priority,
          completed: task.completed,
          hasReminder: task.has_reminder,
        });
      }
    });

    setTasks(groups);
    setLoading(false);
  };

  const fetchStats = async () => {
    if (!user) return;

    const today = format(selectedDate, "yyyy-MM-dd");

    // Fetch focus sessions for today
    const { data: focusData } = await supabase
      .from("focus_sessions")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("created_at", startOfDay(selectedDate).toISOString())
      .lte("created_at", endOfDay(selectedDate).toISOString());

    const totalFocus = focusData?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

    // Fetch habits
    const { data: habitData } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id);

    const habitsCount = habitData?.length || 0;
    const completedHabitsCount = habitData?.filter(h => h.completed_dates?.includes(today)).length || 0;
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
  }, [user, selectedDate]);

  const handleToggleTask = async (period: keyof TaskGroups, id: string) => {
    const task = tasks[period].find(t => t.id === id);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTasks((prev) => ({
      ...prev,
      [period]: prev[period].map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
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

    setTasks((prev) => ({
      ...prev,
      [period]: prev[period].filter((task) => task.id !== id),
    }));
    toast({ title: t("taskDeleted") || "Task deleted" });
  };

  const handleEditTask = (period: keyof TaskGroups, task: Task) => {
    localStorage.setItem("editTask", JSON.stringify({ ...task, period }));
    navigate("/app/tasks/new");
  };

  const renderTaskSection = (title: string, period: keyof TaskGroups, periodTasks: Task[]) => (
    <Collapsible
      key={period}
      open={openSections[period]}
      onOpenChange={() => toggleSection(period)}
    >
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full py-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {openSections[period] ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">
        {periodTasks.map((task) => (
          <div
            key={task.id}
            className="flex overflow-hidden rounded-lg border border-border bg-card"
            data-testid={`task-item-${task.id}`}
          >
            <div className={`w-1.5 ${priorityBorderColors[task.priority]}`} />
            <div className="flex items-center gap-3 flex-1 p-4">
              <button
                onClick={() => handleToggleTask(period, task.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${task.completed
                  ? "bg-primary border-primary"
                  : "border-muted-foreground"
                  }`}
                data-testid={`button-toggle-task-${task.id}`}
              >
                {task.completed && (
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                )}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
                {task.time && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{task.time}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {task.hasReminder && (
                  <Bell className="w-4 h-4 text-muted-foreground" />
                )}
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${task.priority === "high" ? "text-red-500 border-red-500" :
                    task.priority === "medium" ? "text-yellow-600 border-yellow-500" :
                      "text-green-500 border-green-500"
                    }`}
                >
                  {t(task.priority)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-task-menu-${task.id}`}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditTask(period, task)} data-testid={`menu-edit-task-${task.id}`}>
                      <Pencil className="w-4 h-4 mr-2" />
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteTask(period, task.id)}
                      className="text-red-500"
                      data-testid={`menu-delete-task-${task.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("today")}</h1>
            <p className="text-muted-foreground capitalize">{formattedDate}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full h-11 w-11" data-testid="button-add-task">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/app/tasks/new")} data-testid="menu-add-task">
                <ListTodo className="w-4 h-4 mr-2" />
                {t("addTask")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowInsights(true)} data-testid="menu-today-insights">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("insights")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CalendarScrubber selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-3">
                <TrendingUp className="w-6 h-6 text-black dark:text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{t("dailyProgress")}</p>
              <p className="text-2xl font-bold text-foreground mt-1" data-testid="text-daily-progress">
                {progressPercent}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTasks} {t("of")} {totalTasks}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 mb-3">
                <Clock className="w-6 h-6 text-black dark:text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{t("focusTime")}</p>
              <p className="text-2xl font-bold text-foreground mt-1" data-testid="text-focus-time">
                {todayFocusMinutes}m
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 mb-3">
                <Flame className="w-6 h-6 text-black dark:text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{t("streak")}</p>
              <p className="text-2xl font-bold text-foreground mt-1" data-testid="text-streak">
                {currentStreak}d
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                <CheckCircle2 className="w-6 h-6 text-black dark:text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{t("habits")}</p>
              <p className="text-2xl font-bold text-foreground mt-1" data-testid="text-habits-progress">
                {completedHabits}/{totalHabits}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("complete")}</p>
            </CardContent>
          </Card>
        </div>

        {renderTaskSection(t("morning"), "morning", tasks.morning)}
        {renderTaskSection(t("afternoon"), "afternoon", tasks.afternoon)}
        {renderTaskSection(t("evening"), "evening", tasks.evening)}
        {renderTaskSection(t("night"), "night", tasks.night)}

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
