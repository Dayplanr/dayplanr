import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoalCard from "@/components/GoalCard";
import { addDays } from "date-fns";

export default function GoalsPage() {
  const [goals, setGoals] = useState([
    {
      id: "1",
      title: "Learn React Development",
      category: "Career",
      progress: 65,
      trend: "up" as const,
      projectedCompletion: addDays(new Date(), 45),
      keyTasks: [
        { id: "t1", title: "Complete course modules", completed: true },
        { id: "t2", title: "Build practice project", completed: false },
        { id: "t3", title: "Get certification", completed: false },
      ],
    },
    {
      id: "2",
      title: "Run a Half Marathon",
      category: "Health",
      progress: 40,
      trend: "stable" as const,
      projectedCompletion: addDays(new Date(), 90),
      keyTasks: [
        { id: "t4", title: "Run 5km consistently", completed: true },
        { id: "t5", title: "Increase to 10km", completed: false },
        { id: "t6", title: "Complete 21km training", completed: false },
      ],
    },
    {
      id: "3",
      title: "Save for Vacation",
      category: "Finance",
      progress: 80,
      trend: "up" as const,
      projectedCompletion: addDays(new Date(), 30),
      keyTasks: [
        { id: "t7", title: "Set monthly budget", completed: true },
        { id: "t8", title: "Cut unnecessary expenses", completed: true },
        { id: "t9", title: "Reach savings goal", completed: false },
      ],
    },
  ]);

  const handleToggleTask = (goalId: string, taskId: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              keyTasks: goal.keyTasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : goal
      )
    );
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Goals</h1>
            <p className="text-sm text-muted-foreground">Track your long-term objectives</p>
          </div>
          <Button data-testid="button-add-goal">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              {...goal}
              onToggleTask={(taskId) => handleToggleTask(goal.id, taskId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
