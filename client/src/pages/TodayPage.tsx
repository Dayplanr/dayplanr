import { useState } from "react";
import { Plus, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CalendarScrubber from "@/components/CalendarScrubber";
import TimeGroupSection from "@/components/TimeGroupSection";
import TodayInsights from "@/components/TodayInsights";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  time?: string;
  priority?: "high" | "medium" | "low";
  hasTimer?: boolean;
  hasReminder?: boolean;
  completed: boolean;
}

interface TaskGroups {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
  night: Task[];
}

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInsights, setShowInsights] = useState(false);
  const [tasks, setTasks] = useState<TaskGroups>({
    morning: [
      { id: "m1", title: "Morning workout", time: "7:00 AM", priority: "high" as const, completed: false, hasTimer: true, hasReminder: false },
      { id: "m2", title: "Healthy breakfast", time: "8:00 AM", priority: "medium" as const, completed: false, hasTimer: false, hasReminder: false },
    ],
    afternoon: [
      { id: "a1", title: "Team standup meeting", time: "9:30 AM", priority: "high" as const, completed: false, hasReminder: true, hasTimer: false },
      { id: "a2", title: "Review project proposals", time: "2:00 PM", priority: "medium" as const, completed: false, hasTimer: false, hasReminder: false },
    ],
    evening: [
      { id: "e1", title: "Grocery shopping", time: "6:00 PM", priority: "low" as const, completed: false, hasTimer: false, hasReminder: false },
    ],
    night: [
      { id: "n1", title: "Reading before bed", time: "10:00 PM", priority: "low" as const, completed: false, hasTimer: false, hasReminder: false },
    ],
  });

  const handleToggleTask = (id: string) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      for (const period in newTasks) {
        newTasks[period as keyof typeof tasks] = newTasks[period as keyof typeof tasks].map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
      }
      return newTasks;
    });
  };

  const totalTasks = Object.values(tasks).flat().length;
  const completedTasks = Object.values(tasks).flat().filter((t) => t.completed).length;
  const todayFocusMinutes = 45;
  const totalHabits = 2;
  const completedHabits = 0;

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Today</h1>
            <p className="text-sm text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full" data-testid="button-today-menu">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="menu-add-task">
                <Plus className="w-4 h-4 mr-2" />
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

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Daily Progress</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Clock className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold font-mono" data-testid="text-focus-time">
                      {todayFocusMinutes}m
                    </p>
                    <p className="text-xs text-muted-foreground">Focus Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold font-mono" data-testid="text-habits-progress">
                      {completedHabits}/{totalHabits}
                    </p>
                    <p className="text-xs text-muted-foreground">Habits complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <TimeGroupSection title="Morning" tasks={tasks.morning} onToggleTask={handleToggleTask} />
          <TimeGroupSection title="Afternoon" tasks={tasks.afternoon} onToggleTask={handleToggleTask} />
          <TimeGroupSection title="Evening" tasks={tasks.evening} onToggleTask={handleToggleTask} />
          <TimeGroupSection title="Night" tasks={tasks.night} onToggleTask={handleToggleTask} />
        </div>
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
