import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Flame, Clock } from "lucide-react";
import HeatmapCalendar from "./HeatmapCalendar";

interface HabitCardProps {
  title: string;
  streak: number;
  successRate: number;
  weeklyConsistency: number;
  monthlyConsistency: number;
  completedDates: string[];
  hasTimer: boolean;
  onToggleTimer: () => void;
  themeColor?: string;
}

export default function HabitCard({
  title,
  streak,
  successRate,
  weeklyConsistency,
  monthlyConsistency,
  completedDates,
  hasTimer,
  onToggleTimer,
  themeColor = "hsl(var(--primary))",
}: HabitCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-habit-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Switch checked={hasTimer} onCheckedChange={onToggleTimer} data-testid="switch-timer" />
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
        <HeatmapCalendar month={new Date()} completedDates={completedDates} themeColor={themeColor} />
      </CardContent>
    </Card>
  );
}
