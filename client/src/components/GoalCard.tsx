import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ProgressRing from "./ProgressRing";
import TrendIndicator from "./TrendIndicator";
import { format, addDays } from "date-fns";

interface GoalCardProps {
  title: string;
  category: string;
  progress: number;
  trend: "up" | "stable" | "down";
  projectedCompletion: Date;
  keyTasks: Array<{ id: string; title: string; completed: boolean }>;
  onToggleTask: (taskId: string) => void;
  themeColor?: string;
}

export default function GoalCard({
  title,
  category,
  progress,
  trend,
  projectedCompletion,
  keyTasks,
  onToggleTask,
  themeColor = "hsl(var(--primary))",
}: GoalCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-goal-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{category}</p>
          </div>
          <ProgressRing progress={progress} size={80} color={themeColor} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <TrendIndicator trend={trend} />
          <span className="text-xs text-muted-foreground">
            Est. {format(projectedCompletion, "MMM d, yyyy")}
          </span>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Key Tasks</h4>
          {keyTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleTask(task.id)}
                data-testid={`checkbox-goal-task-${task.id}`}
              />
              <span
                className={`text-sm ${
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
