import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Check, Star } from "lucide-react";
import { format, subDays, addDays, startOfDay, isSameDay } from "date-fns";
import type { ScheduleType } from "@/types/habits";

interface HabitCardProps {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  scheduleType?: ScheduleType;
  selectedDays?: string[];
  challengeDays?: number;
  challengeType?: string;
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

const DAY_MAP: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export default function HabitCard({
  id,
  title,
  category,
  tags = [],
  scheduleType,
  selectedDays = [],
  challengeType,
  streak,
  bestStreak,
  completedDates,
  onToggleDay,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const today = new Date();

  // Calculate the current week's Monday (Mon-Sun order)
  const dayOfWeek = today.getDay(); // 0(Sun), 1(Mon), ... 6(Sat)
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentMonday = startOfDay(subDays(today, diffToMonday));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentMonday, i);
    const dayKey = DAY_MAP[date.getDay()];

    const isScheduled = scheduleType === "weekdays"
      ? selectedDays.includes(dayKey)
      : true;

    return {
      date,
      dateStr: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      dayKey,
      isScheduled,
    };
  });

  const scheduleLabel = getScheduleLabel(scheduleType);
  const currentStreak = streak || 0;
  const best = bestStreak || Math.max(currentStreak, 1);

  // Get the string of selected days for the tag
  const selectedDaysTag = scheduleType === "weekdays"
    ? selectedDays
      .sort((a, b) => {
        const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        return order.indexOf(a) - order.indexOf(b);
      })
      .map(d => DAY_LABELS[d].toUpperCase())
      .join(", ")
    : null;

  return (
    <Card className="hover-elevate bg-white dark:bg-card" data-testid={`card-habit-${id}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground leading-tight" data-testid={`text-habit-title-${id}`}>
              {title}
            </h3>
            {challengeType && (
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                🏆 {challengeType}
              </p>
            )}
          </div>
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
          <p className="text-[10px] font-bold text-muted-foreground mb-3 tracking-wide flex justify-between items-center opacity-80 uppercase">
            <span>Last 7 Days</span>
          </p>
          <div className="flex items-center justify-between gap-1">
            {weekDays.map((day) => {
              const isCompleted = completedDates.includes(day.dateStr);
              const isToday = isSameDay(day.date, today);

              // Soft pastel highlighting for scheduled but not yet completed days
              let bgColor = "bg-muted/50";
              let textColor = "text-muted-foreground/60";
              let ringColor = "";

              if (isCompleted) {
                bgColor = "bg-green-500";
                textColor = "text-white";
              } else if (day.isScheduled) {
                // Soft pastel primary for scheduled days
                bgColor = "bg-primary/20";
                textColor = "text-primary font-bold";
                if (isToday) ringColor = "ring-2 ring-primary ring-offset-2";
              } else if (isToday) {
                ringColor = "ring-2 ring-muted-foreground/30 ring-offset-2";
              }

              return (
                <button
                  key={day.dateStr}
                  onClick={() => onToggleDay?.(day.dateStr)}
                  className={`flex flex-col items-center gap-1 flex-1 relative ${isToday ? "after:content-[''] after:absolute after:-bottom-2 after:w-1 after:h-1 after:bg-primary after:rounded-full" : ""}`}
                  data-testid={`button-day-${day.dateStr}`}
                >
                  <span className={`text-[10px] ${day.isScheduled ? "text-foreground font-medium" : "text-muted-foreground/60"}`}>
                    {day.dayName}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${bgColor} ${textColor} ${ringColor}`}
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
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 border border-orange-100 dark:border-orange-900/30">
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mb-1">Current Streak</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-xl font-bold text-orange-700 dark:text-orange-300">{currentStreak}d</span>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-3 border border-yellow-100 dark:border-yellow-900/30">
            <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-wider mb-1">Best Streak</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{best}d</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <Badge variant="outline" className="text-[10px] font-medium bg-muted/30" data-testid={`badge-category-${id}`}>
              {category}
            </Badge>
          )}
          {scheduleType !== "weekdays" && (
            <Badge variant="secondary" className="text-[10px] font-medium" data-testid={`badge-schedule-${id}`}>
              {scheduleLabel}
            </Badge>
          )}
          {selectedDaysTag && (
            <Badge variant="outline" className="text-[10px] font-bold border-primary/40 text-primary bg-primary/5 uppercase tracking-tighter">
              {selectedDaysTag}
            </Badge>
          )}
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] font-medium border-border text-muted-foreground bg-muted/20">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
