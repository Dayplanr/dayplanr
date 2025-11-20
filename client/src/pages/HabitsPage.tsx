import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import HabitCard from "@/components/HabitCard";
import ChallengeCard from "@/components/ChallengeCard";
import { format, subDays } from "date-fns";

export default function HabitsPage() {
  const [habits, setHabits] = useState([
    {
      id: "1",
      title: "Morning Meditation",
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

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Habits</h1>
            <p className="text-sm text-muted-foreground">Build consistency and track streaks</p>
          </div>
          <Button data-testid="button-add-habit">
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                {...habit}
                onToggleTimer={() => handleToggleTimer(habit.id)}
              />
            ))}
          </div>

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
    </div>
  );
}
