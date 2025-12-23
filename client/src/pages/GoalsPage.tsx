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
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";
import type { Goal } from "@/types/goals";
import { calculateGoalProgress } from "@/types/goals";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function GoalsPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [loading, setLoading] = useState(true);

  const [goals, setGoals] = useState<Goal[]>([]);

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select(`
          *,
          milestones (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (goalsError) throw goalsError;

      const formattedGoals: Goal[] = goalsData?.map((g: any) => ({
        id: g.id,
        title: g.title,
        purpose: g.purpose,
        category: g.category,
        challengeDuration: g.challenge_duration,
        visionText: g.vision_text,
        streak: g.streak,
        daysWithProgress: g.days_with_progress,
        progress: g.progress,
        createdAt: g.created_at,
        lastActivityAt: g.last_activity_at,
        milestones: g.milestones.map((m: any) => ({
          id: m.id,
          title: m.title,
          completed: m.completed,
        })),
        tags: [],
      })) || [];

      setGoals(formattedGoals);
    } catch (error: any) {
      toast({
        title: "Error fetching goals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    try {
      const { error } = await supabase
        .from("milestones")
        .update({ completed: !milestone.completed })
        .eq("id", milestoneId);

      if (error) throw error;

      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const newProgress = calculateGoalProgress(updatedMilestones);

      await supabase
        .from("goals")
        .update({ progress: newProgress, last_activity_at: new Date().toISOString() })
        .eq("id", goalId);

      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          return {
            ...g,
            milestones: updatedMilestones,
            progress: newProgress,
            lastActivityAt: new Date().toISOString(),
          };
        })
      );
    } catch (error: any) {
      toast({
        title: "Error updating milestone",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowEditGoal(true);
  };

  const handleUpdateGoal = async (goalId: string, data: Partial<Goal>) => {
    // This is a partial update, would need to handle Supabase update here
    // For now, let's keep it simple or implement as needed
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      toast({ title: "Goal deleted" });
    } catch (error: any) {
      toast({
        title: "Error deleting goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("goals")}</h1>
            <p className="text-muted-foreground">{t("goalProgress")}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full h-11 w-11" data-testid="button-goals-menu">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/app/goals/new")} data-testid="menu-add-goal">
                <Target className="w-4 h-4 mr-2" />
                {t("addGoal")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowInsights(true)} data-testid="menu-goals-insights">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("insights")}
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

        {!loading && goals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t("noGoals")}</p>
            <Button onClick={() => navigate("/app/goals/new")} data-testid="button-add-first-goal">
              <Plus className="w-4 h-4 mr-2" />
              {t("addGoal")}
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
