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
import type { Habit, HabitFormData } from "@/types/habits";

export default function HabitsPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [showInsights, setShowInsights] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      title: "Reading books",
      category: "personal",
      scheduleType: "everyday",
      selectedDays: [],
      challengeDays: 0,
      challengeCompleted: 0,
      streak: 1,
      bestStreak: 1,
      successRate: 85,
      weeklyConsistency: 90,
      monthlyConsistency: 78,
      completedDates: [
        format(subDays(new Date(), 2), "yyyy-MM-dd"),
        format(subDays(new Date(), 1), "yyyy-MM-dd"),
      ],
      hasTimer: false,
    },
    {
      id: "2",
      title: "Daily Exercise",
      category: "fitness",
      scheduleType: "weekdays",
      selectedDays: ["mon", "wed", "fri"],
      challengeDays: 0,
      challengeCompleted: 0,
      streak: 3,
      bestStreak: 5,
      successRate: 92,
      weeklyConsistency: 95,
      monthlyConsistency: 88,
      completedDates: [
        format(subDays(new Date(), 4), "yyyy-MM-dd"),
        format(subDays(new Date(), 2), "yyyy-MM-dd"),
        format(new Date(), "yyyy-MM-dd"),
      ],
      hasTimer: false,
    },
  ]);

  useEffect(() => {
    const newHabitData = localStorage.getItem("newHabit");
    if (newHabitData) {
      try {
        const data = JSON.parse(newHabitData) as HabitFormData;
        const newHabit: Habit = {
          id: Date.now().toString(),
          title: data.name,
          category: data.category,
          scheduleType: data.scheduleType,
          selectedDays: data.selectedDays || [],
          challengeDays: data.challengeDays || 0,
          challengeCompleted: 0,
          streak: 0,
          bestStreak: 0,
          successRate: 0,
          weeklyConsistency: 0,
          monthlyConsistency: 0,
          completedDates: [],
          hasTimer: false,
        };
        setHabits((prev) => [...prev, newHabit]);
        localStorage.removeItem("newHabit");
      } catch (e) {
        localStorage.removeItem("newHabit");
      }
    }
  }, []);

  const handleToggleTimer = (habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, hasTimer: !habit.hasTimer } : habit
      )
    );
  };

  const handleToggleDay = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        
        const isCompleted = habit.completedDates.includes(dateStr);
        let newCompletedDates: string[];
        
        if (isCompleted) {
          newCompletedDates = habit.completedDates.filter((d) => d !== dateStr);
        } else {
          newCompletedDates = [...habit.completedDates, dateStr].sort();
        }
        
        const newStreak = calculateStreak(newCompletedDates);
        const newBestStreak = Math.max(habit.bestStreak || 0, newStreak);
        
        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: newStreak,
          bestStreak: newBestStreak,
        };
      })
    );
  };

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

  const handleEditHabit = (updatedHabit: Habit) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
    );
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    setDeletingHabit(null);
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
              <Button size="icon" className="rounded-full" data-testid="button-habits-menu">
                <Plus className="w-4 h-4" />
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
              scheduleType={habit.scheduleType}
              selectedDays={habit.selectedDays}
              challengeDays={habit.challengeDays}
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

          {habits.length === 0 && (
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
