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
        tags: g.tags || [],
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
    if (user) {
      fetchGoals();
    }
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
    if (!user) return;

    try {
      // 1. Update main goal data
      const { error: goalError } = await supabase
        .from("goals")
        .update({
          title: data.title,
          purpose: data.purpose,
          category: data.category,
          challenge_duration: data.challengeDuration,
          vision_text: data.visionText,
          tags: data.tags,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", goalId);

      if (goalError) throw goalError;

      // 2. Handle milestones (this is more complex - for simplicity, let's update titles and ignore deletions for now, 
      // or implement a full sync if needed. Here we assume milestones in 'data' are the current ones)
      if (data.milestones) {
        // Find existing milestones to determine what to update vs insert
        const { data: existingMilestones } = await supabase
          .from("milestones")
          .select("id")
          .eq("goal_id", goalId);

        const existingIds = existingMilestones?.map(m => m.id) || [];
        const currentIds = data.milestones.map(m => m.id).filter(id => !id.startsWith('m-')); // temporary IDs start with 'm-'

        // Delete removed milestones
        const toDelete = existingIds.filter(id => !currentIds.includes(id));
        if (toDelete.length > 0) {
          await supabase.from("milestones").delete().in("id", toDelete);
        }

        // Upsert milestones
        for (const m of data.milestones) {
          if (m.id.startsWith('m-')) {
            // New milestone
            await supabase.from("milestones").insert({
              goal_id: goalId,
              title: m.title,
              completed: m.completed,
            });
          } else {
            // Existing milestone
            await supabase.from("milestones")
              .update({ title: m.title, completed: m.completed })
              .eq("id", m.id);
          }
        }
      }

      toast({ title: "Goal updated successfully" });
      fetchGoals(); // Refresh to get correct IDs and data
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEditingGoal(null);
    }
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
              visionText={goal.visionText}
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
