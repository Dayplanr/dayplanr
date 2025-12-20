import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Calendar } from "lucide-react";
import type { Milestone } from "@/types/goals";

interface GoalCardProps {
  id: string;
  title: string;
  category: string;
  progress: number;
  milestones: Milestone[];
  tags: string[];
  challengeDuration?: number;
  daysWithProgress?: number;
  onToggleMilestone: (milestoneId: string) => void;
}

export default function GoalCard({
  id,
  title,
  category,
  progress,
  milestones,
  tags,
  challengeDuration = 0,
  daysWithProgress = 0,
  onToggleMilestone,
}: GoalCardProps) {
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Health: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Work: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Personal: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      Finance: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      Creativity: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
      Education: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      Career: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      Relationships: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };
    return colors[cat] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="hover-elevate" data-testid={`card-goal-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={getCategoryColor(category)}>
                {category}
              </Badge>
              {challengeDuration > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  {challengeDuration} day challenge
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono" data-testid={`text-progress-${id}`}>
              {progress}%
            </p>
            <p className="text-xs text-muted-foreground">progress</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          {challengeDuration > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              Day {daysWithProgress} of {challengeDuration}
            </p>
          )}
        </div>

        {milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Milestones</h4>
            <div className="space-y-1.5">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={milestone.completed}
                    onCheckedChange={() => onToggleMilestone(milestone.id)}
                    data-testid={`checkbox-milestone-${milestone.id}`}
                  />
                  <span
                    className={`text-sm flex-1 ${
                      milestone.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {milestone.title}
                  </span>
                  {milestone.completed && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
