import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import ChallengeCard from "@/components/ChallengeCard";
import AddHabitDialog from "@/components/AddHabitDialog";
import EditHabitDialog from "@/components/EditHabitDialog";
import HabitInsights from "@/components/HabitInsights";
import { format, subDays } from "date-fns";
import type { Habit, HabitFormData } from "@/types/habits";

export default function HabitsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      title: "Morning Meditation",
      category: "health",
      scheduleType: "everyday",
      selectedDays: [],
      challengeDays: 0,
      challengeCompleted: 0,
      streak: 12,
      successRate: 85,
      weeklyConsistency: 90,
      monthlyConsistency: 78,
      completedDates: [
        format(new Date(), "yyyy-MM-dd"),
        format(subDays(new Date(), 1), "yyyy-MM-dd"),
        format(subDays(new Date(), 2), "yyyy-MM-dd"),
        format(subDays(new Date(), 5), "yyyy-MM-dd"),
      ],
      hasTimer: true,
    },
    {
      id: "2",
      title: "Daily Exercise",
      category: "fitness",
      scheduleType: "weekdays",
      selectedDays: ["mon", "wed", "fri"],
      challengeDays: 0,
      challengeCompleted: 0,
      streak: 8,
      successRate: 92,
      weeklyConsistency: 95,
      monthlyConsistency: 88,
      completedDates: [
        format(new Date(), "yyyy-MM-dd"),
        format(subDays(new Date(), 1), "yyyy-MM-dd"),
        format(subDays(new Date(), 3), "yyyy-MM-dd"),
      ],
      hasTimer: false,
    },
    {
      id: "3",
      title: "Reading Challenge",
      category: "learning",
      scheduleType: "challenge",
      selectedDays: [],
      challengeDays: 30,
      challengeCompleted: 18,
      streak: 5,
      successRate: 60,
      weeklyConsistency: 71,
      monthlyConsistency: 60,
      completedDates: [
        format(new Date(), "yyyy-MM-dd"),
        format(subDays(new Date(), 2), "yyyy-MM-dd"),
        format(subDays(new Date(), 4), "yyyy-MM-dd"),
      ],
      hasTimer: false,
    },
  ]);

  const challenges = [
    {
      id: "1",
      title: "21-Day Fitness Challenge",
      daysRemaining: 14,
      totalDays: 21,
      progress: 68,
      participants: [
        { id: "1", name: "Alice Johnson" },
        { id: "2", name: "Bob Smith" },
        { id: "3", name: "Carol White" },
        { id: "4", name: "David Brown" },
      ],
    },
  ];

  const handleToggleTimer = (habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, hasTimer: !habit.hasTimer } : habit
      )
    );
  };

  const handleAddHabit = (data: HabitFormData) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: data.name,
      category: data.category,
      scheduleType: data.scheduleType,
      selectedDays: data.selectedDays,
      challengeDays: data.challengeDays,
      challengeCompleted: 0,
      streak: 0,
      successRate: 0,
      weeklyConsistency: 0,
      monthlyConsistency: 0,
      completedDates: [],
      hasTimer: false,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleEditHabit = (updatedHabit: Habit) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === updatedHabit.id ? updatedHabit : habit
      )
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
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Habits</h1>
            <p className="text-sm text-muted-foreground">Build consistency and track streaks</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-habit">
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                successRate={habit.successRate}
                weeklyConsistency={habit.weeklyConsistency}
                monthlyConsistency={habit.monthlyConsistency}
                completedDates={habit.completedDates}
                hasTimer={habit.hasTimer}
                onToggleTimer={() => handleToggleTimer(habit.id)}
                onEdit={() => setEditingHabit(habit)}
                onDelete={() => setDeletingHabit(habit)}
              />
            ))}
          </div>

          {habits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No habits yet. Start building your routine!</p>
              <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-first-habit">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Habit
              </Button>
            </div>
          )}

          {challenges.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Shared Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} {...challenge} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddHabitDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddHabit}
      />

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
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
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

      <HabitInsights habits={habits} />
    </div>
  );
}
