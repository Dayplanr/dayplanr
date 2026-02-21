import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import HabitCard from "@/components/HabitCard";
import EditHabitDialog from "@/components/EditHabitDialog";
import HabitInsights from "@/components/HabitInsights";
import { useTranslation } from "@/lib/i18n";
import { format, subDays } from "date-fns";
import type { Habit } from "@/types/habits";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function HabitsPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showInsights, setShowInsights] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  const [habits, setHabits] = useState<Habit[]>([]);

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;

    const sortedDates = [...completedDates].sort().reverse();
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const fetchHabits = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (habitsError) throw habitsError;

      const formattedHabits: Habit[] = habitsData?.map((h: any) => ({
        id: h.id,
        title: h.title,
        category: h.category,
        tags: h.tags || [],
        scheduleType: h.schedule_type,
        selectedDays: h.selected_days || [],
        challengeDays: h.challenge_days || 0,
        challengeType: h.challenge_type,
        challengeCompleted: h.challenge_completed || 0,
        streak: calculateStreak(h.completed_dates || []),
        bestStreak: h.best_streak || 0,
        successRate: h.success_rate || 0,
        weeklyConsistency: h.weekly_consistency || 0,
        monthlyConsistency: h.monthly_consistency || 0,
        completedDates: h.completed_dates || [],
        hasTimer: false,
        goal_id: h.goal_id,
      })) || [];

      setHabits(formattedHabits);
    } catch (error: any) {
      toast({
        title: "Error fetching habits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const handleToggleTimer = (habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, hasTimer: !habit.hasTimer } : habit
      )
    );
  };

  const handleToggleDay = async (habitId: string, dateStr: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(dateStr);
    let newCompletedDates: string[];

    if (isCompleted) {
      newCompletedDates = habit.completedDates.filter((d) => d !== dateStr);
    } else {
      newCompletedDates = [...habit.completedDates, dateStr].sort();
    }

    const newStreak = calculateStreak(newCompletedDates);
    const newBestStreak = Math.max(habit.bestStreak || 0, newStreak);

    try {
      const { error } = await supabase
        .from("habits")
        .update({
          completed_dates: newCompletedDates,
          streak: newStreak,
          best_streak: newBestStreak,
        })
        .eq("id", habitId);

      if (error) throw error;

      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          return {
            ...h,
            completedDates: newCompletedDates,
            streak: newStreak,
            bestStreak: newBestStreak,
          };
        })
      );
    } catch (error: any) {
      toast({
        title: "Error updating habit",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const handleEditHabit = async (updatedHabit: Habit) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({
          title: updatedHabit.title,
          category: updatedHabit.category,
          tags: updatedHabit.tags,
          schedule_type: updatedHabit.scheduleType,
          selected_days: updatedHabit.selectedDays,
          challenge_days: updatedHabit.challengeDays,
          challenge_type: updatedHabit.challengeType,
          goal_id: updatedHabit.goal_id,
        })
        .eq("id", updatedHabit.id);

      if (error) throw error;

      setHabits((prev) =>
        prev.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
      );
      setEditingHabit(null);
      toast({ title: "Habit updated" });
    } catch (error: any) {
      toast({
        title: "Error updating habit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) throw error;

      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
      setDeletingHabit(null);
      toast({ title: "Habit deleted" });
    } catch (error: any) {
      toast({
        title: "Error deleting habit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = () => {
    if (deletingHabit) {
      handleDeleteHabit(deletingHabit.id);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("habits")}</h1>
            <p className="text-sm text-muted-foreground">{t("habitStreak")}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full h-11 w-11" data-testid="button-focus-menu">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/app/habits/new")} data-testid="menu-add-habit">
                <Sparkles className="w-4 h-4 mr-2" />
                {t("addHabit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowInsights(true)} data-testid="menu-habits-insights">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("insights")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              title={habit.title}
              category={habit.category}
              tags={habit.tags}
              scheduleType={habit.scheduleType}
              selectedDays={habit.selectedDays}
              challengeDays={habit.challengeDays}
              challengeType={habit.challengeType}
              challengeCompleted={habit.challengeCompleted}
              streak={habit.streak}
              bestStreak={habit.bestStreak}
              successRate={habit.successRate}
              weeklyConsistency={habit.weeklyConsistency}
              monthlyConsistency={habit.monthlyConsistency}
              completedDates={habit.completedDates}
              hasTimer={habit.hasTimer}
              onToggleTimer={() => handleToggleTimer(habit.id)}
              onToggleDay={(dateStr) => handleToggleDay(habit.id, dateStr)}
              onEdit={() => setEditingHabit(habit)}
              onDelete={() => setDeletingHabit(habit)}
            />
          ))}

          {!loading && habits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t("noHabits")}</p>
              <Button onClick={() => navigate("/app/habits/new")} data-testid="button-add-first-habit">
                <Plus className="w-4 h-4 mr-2" />
                {t("addHabit")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <EditHabitDialog
        habit={editingHabit}
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
        onSave={handleEditHabit}
        onDelete={(id) => {
          const habit = habits.find((h) => h.id === id);
          if (habit) setDeletingHabit(habit);
        }}
      />

      <AlertDialog open={!!deletingHabit} onOpenChange={(open) => !open && setDeletingHabit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingHabit?.title}"? This action cannot be undone and all your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HabitInsights
        habits={habits}
        open={showInsights}
        onOpenChange={setShowInsights}
      />
    </div>
  );
}
