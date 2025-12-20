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
  priority?: "high" | "medium" | "low";
  hasTimer?: boolean;
  hasReminder?: boolean;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

export default function TodayPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInsights, setShowInsights] = useState(false);
  const [habitsOpen, setHabitsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Morning workout", time: "7:00 AM", priority: "high", completed: false },
    { id: "2", title: "Team standup meeting", time: "9:30 AM", priority: "high", completed: false },
    { id: "3", title: "Review project proposals", time: "2:00 PM", priority: "medium", completed: false },
    { id: "4", title: "Grocery shopping", time: "6:00 PM", priority: "low", completed: false },
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    { id: "h1", name: "Reading books", streak: 2, completed: false },
    { id: "h2", name: "Meditation", streak: 5, completed: false },
  ]);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayFocusMinutes = 0;
  const currentStreak = 0;
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.completed).length;

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

        <Card className="bg-card">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Daily Progress</p>
            <p className="text-5xl font-bold text-foreground" data-testid="text-daily-progress">
              {progressPercent}%
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {completedTasks} of {totalTasks} tasks complete
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="p-2.5 rounded-xl bg-blue-500 w-fit mb-3">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-muted-foreground">Focus Time</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-focus-time">
                {todayFocusMinutes}m
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="p-2.5 rounded-xl bg-emerald-500 w-fit mb-3">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-streak">
                {currentStreak}d
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500 w-fit">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Habits</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-habits-progress">
                  {completedHabits}/{totalHabits} complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Collapsible open={habitsOpen} onOpenChange={setHabitsOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full py-3">
              <h2 className="text-lg font-semibold text-foreground">Daily Habits</h2>
              {habitsOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                data-testid={`habit-item-${habit.id}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      habit.completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                    data-testid={`button-toggle-habit-${habit.id}`}
                  >
                    {habit.completed && (
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    )}
                  </button>
                  <div>
                    <p className={`font-medium ${habit.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {habit.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{habit.streak} day streak</p>
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full py-3">
              <h2 className="text-lg font-semibold text-foreground">Today's Tasks</h2>
              {tasksOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                data-testid={`task-item-${task.id}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTask(task.id)}
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
                  <div>
                    <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    {task.time && (
                      <p className="text-xs text-muted-foreground">{task.time}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Button
          size="lg"
          className="fixed bottom-24 right-4 md:bottom-6 rounded-full w-14 h-14 shadow-lg"
          data-testid="button-add-floating"
          onClick={() => toast({ title: "Add Task", description: "Task creation coming soon!" })}
        >
          <Plus className="w-6 h-6" />
        </Button>
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
