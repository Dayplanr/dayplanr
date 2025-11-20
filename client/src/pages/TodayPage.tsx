import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarScrubber from "@/components/CalendarScrubber";
import TimeGroupSection from "@/components/TimeGroupSection";
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

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Today</h1>
            <p className="text-sm text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
          </div>
          <Button data-testid="button-add-task">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        <CalendarScrubber selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="space-y-4">
          <TimeGroupSection title="Morning" tasks={tasks.morning} onToggleTask={handleToggleTask} />
          <TimeGroupSection title="Afternoon" tasks={tasks.afternoon} onToggleTask={handleToggleTask} />
          <TimeGroupSection title="Evening" tasks={tasks.evening} onToggleTask={handleToggleTask} />
          <TimeGroupSection title="Night" tasks={tasks.night} onToggleTask={handleToggleTask} />
        </div>
      </div>
    </div>
  );
}
