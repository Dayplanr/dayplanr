import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, Bell, Timer } from "lucide-react";

interface TaskCardProps {
  id: string;
  title: string;
  time?: string;
  priority?: "high" | "medium" | "low";
  hasTimer?: boolean;
  hasReminder?: boolean;
  completed: boolean;
  onToggleComplete: (id: string) => void;
}

export default function TaskCard({
  id,
  title,
  time,
  priority = "medium",
  hasTimer = false,
  hasReminder = false,
  completed,
  onToggleComplete,
}: TaskCardProps) {
  const priorityColors = {
    high: "border-l-destructive",
    medium: "border-l-chart-4",
    low: "border-l-muted-foreground",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-card border border-card-border rounded-md hover-elevate ${priorityColors[priority]} border-l-4`}
      data-testid={`card-task-${id}`}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggleComplete(id)}
        data-testid={`checkbox-task-${id}`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {title}
        </p>
        {time && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {hasReminder && <Bell className="w-4 h-4 text-muted-foreground" />}
        {hasTimer && <Timer className="w-4 h-4 text-muted-foreground" />}
        <Badge variant="outline" className="text-xs">
          {priority}
        </Badge>
      </div>
    </div>
  );
}
