import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Check, Flame, Star } from "lucide-react";
import { format, subDays } from "date-fns";
import type { ScheduleType } from "@/types/habits";

interface HabitCardProps {
  id: string;
  title: string;
  category?: string;
  scheduleType?: ScheduleType;
  selectedDays?: string[];
  challengeDays?: number;
  challengeCompleted?: number;
  streak: number;
  bestStreak?: number;
  successRate: number;
  weeklyConsistency: number;
  monthlyConsistency: number;
  completedDates: string[];
  hasTimer: boolean;
  onToggleTimer: () => void;
  onToggleDay?: (date: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  themeColor?: string;
}

function getScheduleLabel(scheduleType?: ScheduleType): string {
  if (!scheduleType || scheduleType === "everyday") {
    return "daily";
  }
  if (scheduleType === "weekdays") {
    return "weekdays";
  }
  if (scheduleType === "challenge") {
    return "challenge";
  }
  return "daily";
}

export default function HabitCard({
  id,
  title,
  category,
  scheduleType,
  streak,
  bestStreak,
  completedDates,
  onToggleDay,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return {
      date,
      dateStr: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
    };
  });

  const scheduleLabel = getScheduleLabel(scheduleType);
  const currentStreak = streak || 0;
  const best = bestStreak || Math.max(currentStreak, 1);

  return (
    <Card className="hover-elevate bg-white dark:bg-card" data-testid={`card-habit-${id}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-habit-title-${id}`}>
            {title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1" data-testid={`button-habit-menu-${id}`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} data-testid={`button-edit-habit-${id}`}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete} 
                className="text-destructive focus:text-destructive"
                data-testid={`button-delete-habit-${id}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">LAST 7 DAYS</p>
          <div className="flex items-center justify-between gap-1">
            {last7Days.map((day) => {
              const isCompleted = completedDates.includes(day.dateStr);
              return (
                <button
                  key={day.dateStr}
                  onClick={() => onToggleDay?.(day.dateStr)}
                  className="flex flex-col items-center gap-1 flex-1"
                  data-testid={`button-day-${day.dateStr}`}
                >
                  <span className="text-xs text-muted-foreground">{day.dayName}</span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      day.dayNumber
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-100 dark:bg-orange-950/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-xl font-bold text-foreground">{currentStreak}d</span>
            </div>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-950/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Best</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="text-xl font-bold text-foreground">{best}d</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="secondary" className="text-xs font-normal" data-testid={`badge-category-${id}`}>
              {category}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs font-normal" data-testid={`badge-schedule-${id}`}>
            {scheduleLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
