import { useState } from "react";
import { Plus, TrendingUp, Clock, CheckCircle2, ListTodo, Flame, ChevronUp, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  time?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface TaskGroups {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
  night: Task[];
}

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export default function TodayPage() {
  const { toast } = useToast();
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
      { id: "m1", title: "Morning workout", time: "7:00 AM", priority: "high", completed: false },
      { id: "m2", title: "Healthy breakfast", time: "8:00 AM", priority: "medium", completed: false },
    ],
    afternoon: [
      { id: "a1", title: "Team standup meeting", time: "9:30 AM", priority: "high", completed: false },
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

  const allTasks = Object.values(tasks).flat();
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayFocusMinutes = 0;
  const currentStreak = 0;
  const totalHabits = 2;
  const completedHabits = 0;

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
      <CollapsibleContent className="space-y-2">
        {periodTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border"
            data-testid={`task-item-${task.id}`}
          >
            <button
              onClick={() => handleToggleTask(period, task.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
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
                <p className="text-xs text-muted-foreground">{task.time}</p>
              )}
            </div>
            <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">Today</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full" data-testid="button-today-menu">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => toast({ title: "Add Task", description: "Task creation coming soon!" })}
                data-testid="menu-add-task"
              >
                <ListTodo className="w-4 h-4 mr-2" />
                Add Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowInsights(true)} data-testid="menu-today-insights">
                <TrendingUp className="w-4 h-4 mr-2" />
                Insights
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CalendarScrubber selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-orange-500">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="w-12 h-12 relative">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-orange-500" strokeDasharray={`${progressPercent} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progressPercent}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Daily Progress</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-daily-progress">
                {completedTasks}/{totalTasks}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Focus Time</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-focus-time">
                {todayFocusMinutes}m
              </p>
              <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((todayFocusMinutes / 120) * 100, 100)}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500">
                  <Flame className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-streak">
                {currentStreak} days
              </p>
              <div className="mt-2 flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentStreak ? 'bg-emerald-500' : 'bg-muted/30'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-violet-500">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="w-12 h-12 relative">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-violet-500" strokeDasharray={`${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0} 100`} strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Habits</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-habits-progress">
                {completedHabits}/{totalHabits}
              </p>
            </CardContent>
          </Card>
        </div>

        {renderTaskSection("Morning", "morning", tasks.morning)}
        {renderTaskSection("Afternoon", "afternoon", tasks.afternoon)}
        {renderTaskSection("Evening", "evening", tasks.evening)}
        {renderTaskSection("Night", "night", tasks.night)}

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
