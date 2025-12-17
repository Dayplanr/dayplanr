import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame, Clock, MoreVertical, Pencil, Trash2, Calendar, Target, Repeat } from "lucide-react";
import HeatmapCalendar from "./HeatmapCalendar";
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
  successRate: number;
  weeklyConsistency: number;
  monthlyConsistency: number;
  completedDates: string[];
  hasTimer: boolean;
  onToggleTimer: () => void;
  onEdit: () => void;
  onDelete: () => void;
  themeColor?: string;
}

function getScheduleLabel(
  scheduleType?: ScheduleType,
  selectedDays?: string[],
  challengeDays?: number,
  challengeCompleted?: number
): { label: string; icon: typeof Calendar } {
  if (!scheduleType || scheduleType === "everyday") {
    return { label: "Everyday Habit", icon: Repeat };
  }
  
  if (scheduleType === "weekdays" && selectedDays?.length) {
    const dayMap: Record<string, string> = {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    };
    const dayLabels = selectedDays.map((d) => dayMap[d] || d).join("-");
    return { label: `Specific Weekdays (${dayLabels})`, icon: Calendar };
  }
  
  if (scheduleType === "challenge" && challengeDays) {
    const completed = challengeCompleted || 0;
    return { label: `${completed}/${challengeDays} Challenge`, icon: Target };
  }
  
  return { label: "Everyday Habit", icon: Repeat };
}

export default function HabitCard({
  id,
  title,
  category,
  scheduleType,
  selectedDays,
  challengeDays,
  challengeCompleted,
  streak,
  successRate,
  weeklyConsistency,
  monthlyConsistency,
  completedDates,
  hasTimer,
  onToggleTimer,
  onEdit,
  onDelete,
  themeColor = "hsl(var(--primary))",
}: HabitCardProps) {
  const { label: scheduleLabel, icon: ScheduleIcon } = getScheduleLabel(
    scheduleType,
    selectedDays,
    challengeDays,
    challengeCompleted
  );

  return (
    <Card className="hover-elevate" data-testid={`card-habit-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{title}</CardTitle>
            {category && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Switch checked={hasTimer} onCheckedChange={onToggleTimer} data-testid="switch-timer" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-habit-menu-${id}`}>
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-2xl font-semibold font-mono">{streak}</p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">{successRate}%</p>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
            <div>
              <p className="text-sm font-semibold">{weeklyConsistency}%</p>
              <p className="text-xs text-muted-foreground">Weekly</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ScheduleIcon className="w-3 h-3" />
          <span data-testid={`text-schedule-${id}`}>{scheduleLabel}</span>
        </div>
        
        <HeatmapCalendar month={new Date()} completedDates={completedDates} themeColor={themeColor} />
      </CardContent>
    </Card>
  );
}
