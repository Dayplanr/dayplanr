import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, TrendingUp, Clock, CheckCircle2, Flame, ChevronUp, ChevronDown, Bell, ListTodo } from "lucide-react";
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
import { format, type Locale } from "date-fns";
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
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInsights, setShowInsights] = useState(false);
  const [openSections, setOpenSections] = useState({
    morning: true,
    afternoon: true,
    evening: true,
    night: true,
  });

  const [tasks, setTasks] = useState<TaskGroups>({
    morning: [
      { id: "m1", title: "Morning workout", time: "7:00 AM", priority: "high", completed: false, hasReminder: true },
      { id: "m2", title: "Healthy breakfast", time: "8:00 AM", priority: "medium", completed: false },
    ],
    afternoon: [
      { id: "a1", title: "Team standup meeting", time: "9:30 AM", priority: "high", completed: false, hasReminder: true },
      { id: "a2", title: "Review project proposals", time: "2:00 PM", priority: "medium", completed: false },
    ],
    evening: [
      { id: "e1", title: "Grocery shopping", time: "6:00 PM", priority: "low", completed: false },
    ],
    night: [
      { id: "n1", title: "Reading before bed", time: "10:00 PM", priority: "low", completed: false },
    ],
  });

  const handleToggleTask = (period: keyof TaskGroups, id: string) => {
    setTasks((prev) => ({
      ...prev,
      [period]: prev[period].map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const stored = localStorage.getItem("newTask");
    if (stored) {
      try {
        const taskData = JSON.parse(stored);
        const period = taskData.startTime 
          ? determinePeriodFromTime(taskData.startTime)
          : "morning";
        
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: taskData.title,
          time: taskData.startTime ? formatTime(taskData.startTime) : undefined,
          priority: taskData.priority || "medium",
          completed: false,
        };
        
        setTasks((prev) => ({
          ...prev,
          [period]: [...prev[period], newTask],
        }));
        
        localStorage.removeItem("newTask");
        toast({ title: t("addTask"), description: "Task added successfully!" });
      } catch (e) {
        console.error("Failed to parse new task", e);
      }
    }
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
  const todayFocusMinutes = 0;
  const currentStreak = 0;
  const totalHabits = 2;
  const completedHabits = 0;

  const baseLanguage = language.split("-")[0];
  const currentLocale = localeMap[baseLanguage] || localeMap[language] || enUS;
  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy", { locale: currentLocale });

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
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
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
                <Badge variant="outline" className="text-xs font-medium">
                  {t(task.priority)}
                </Badge>
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
              <DropdownMenuItem onClick={() => navigate("/tasks/new")} data-testid="menu-add-task">
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
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 mb-3">
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
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 mb-3">
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
