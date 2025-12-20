import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GoalCard from "@/components/GoalCard";
import EditGoalSheet from "@/components/EditGoalSheet";
import GoalInsights from "@/components/GoalInsights";
import { format, subDays } from "date-fns";
import type { Goal, GoalFormData } from "@/types/goals";
import { calculateGoalProgress } from "@/types/goals";

export default function GoalsPage() {
  const [, navigate] = useLocation();
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Learn React Development",
      purpose: "Advance my career in web development",
      category: "Career",
      challengeDuration: 90,
      milestones: [
        { id: "m1", title: "Complete course modules", completed: true },
        { id: "m2", title: "Build practice project", completed: false },
        { id: "m3", title: "Get certification", completed: false },
      ],
      tags: ["coding", "career"],
      progress: 33,
      createdAt: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      lastActivityAt: format(subDays(new Date(), 2), "yyyy-MM-dd"),
      streak: 5,
      daysWithProgress: 15,
    },
    {
      id: "2",
      title: "Run a Half Marathon",
      purpose: "Improve my health and endurance",
      category: "Health",
      challengeDuration: 60,
      milestones: [
        { id: "m4", title: "Run 5km consistently", completed: true },
        { id: "m5", title: "Increase to 10km", completed: false },
        { id: "m6", title: "Complete 21km training", completed: false },
      ],
      tags: ["fitness", "health"],
      progress: 33,
      createdAt: format(subDays(new Date(), 45), "yyyy-MM-dd"),
      lastActivityAt: format(new Date(), "yyyy-MM-dd"),
      streak: 3,
      daysWithProgress: 20,
    },
    {
      id: "3",
      title: "Save for Vacation",
      purpose: "Take a well-deserved break",
      category: "Finance",
      challengeDuration: 0,
      milestones: [
        { id: "m7", title: "Set monthly budget", completed: true },
        { id: "m8", title: "Cut unnecessary expenses", completed: true },
        { id: "m9", title: "Reach savings goal", completed: false },
      ],
      tags: ["savings", "travel"],
      progress: 67,
      createdAt: format(subDays(new Date(), 60), "yyyy-MM-dd"),
      lastActivityAt: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      streak: 8,
      daysWithProgress: 30,
    },
  ]);

  useEffect(() => {
    const newGoalData = localStorage.getItem("newGoal");
    if (newGoalData) {
      try {
        const data = JSON.parse(newGoalData) as GoalFormData;
        const newGoal: Goal = {
          id: Date.now().toString(),
          title: data.title,
          purpose: data.purpose,
          category: data.category,
          challengeDuration: data.challengeDuration,
          milestones: data.milestones.map((m, i) => ({
            id: `m-${Date.now()}-${i}`,
            title: m.title,
            completed: false,
          })),
          tags: data.tags,
          visionText: data.visionText,
          progress: 0,
          createdAt: format(new Date(), "yyyy-MM-dd"),
          lastActivityAt: format(new Date(), "yyyy-MM-dd"),
          streak: 0,
          daysWithProgress: 0,
        };
        setGoals((prev) => [...prev, newGoal]);
        localStorage.removeItem("newGoal");
      } catch (e) {
        localStorage.removeItem("newGoal");
      }
    }
  }, []);

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;
        
        const updatedMilestones = goal.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        
        return {
          ...goal,
          milestones: updatedMilestones,
          progress: calculateGoalProgress(updatedMilestones),
          lastActivityAt: format(new Date(), "yyyy-MM-dd"),
        };
      })
    );
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowEditGoal(true);
  };

  const handleUpdateGoal = (goalId: string, data: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;
        
        const updatedGoal = { ...goal, ...data };
        if (data.milestones) {
          updatedGoal.progress = calculateGoalProgress(data.milestones);
        }
        updatedGoal.lastActivityAt = format(new Date(), "yyyy-MM-dd");
        
        return updatedGoal;
      })
    );
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Goals</h1>
            <p className="text-muted-foreground">Track your long-term vision</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full h-11 w-11" data-testid="button-goals-menu">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowInsights(true)} data-testid="menu-goals-insights">
                <TrendingUp className="w-4 h-4 mr-2" />
                Insights
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/goals/new")} data-testid="menu-add-goal">
                <Target className="w-4 h-4 mr-2" />
                Add Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              title={goal.title}
              purpose={goal.purpose}
              category={goal.category}
              progress={goal.progress}
              milestones={goal.milestones}
              tags={goal.tags}
              challengeDuration={goal.challengeDuration}
              daysWithProgress={goal.daysWithProgress}
              onToggleMilestone={(milestoneId) => handleToggleMilestone(goal.id, milestoneId)}
              onEdit={() => handleEditGoal(goal)}
              onDelete={() => handleDeleteGoal(goal.id)}
            />
          ))}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No goals yet. Start setting your objectives!</p>
            <Button onClick={() => navigate("/goals/new")} data-testid="button-add-first-goal">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Goal
            </Button>
          </div>
        )}
      </div>

      <EditGoalSheet
        open={showEditGoal}
        onOpenChange={setShowEditGoal}
        goal={editingGoal}
        onSubmit={handleUpdateGoal}
      />

      <GoalInsights
        goals={goals}
        open={showInsights}
        onOpenChange={setShowInsights}
      />
    </div>
  );
}
