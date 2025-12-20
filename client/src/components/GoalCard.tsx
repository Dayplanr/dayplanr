import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Milestone } from "@/types/goals";

interface GoalCardProps {
  id: string;
  title: string;
  purpose?: string;
  category: string;
  progress: number;
  milestones: Milestone[];
  tags: string[];
  challengeDuration?: number;
  daysWithProgress?: number;
  onToggleMilestone: (milestoneId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function GoalCard({
  id,
  title,
  purpose,
  category,
  progress,
  milestones,
  tags,
  challengeDuration = 0,
  daysWithProgress = 0,
  onToggleMilestone,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const completedMilestones = milestones.filter(m => m.completed).length;
  
  return (
    <Card className="border-0 shadow-sm bg-card" data-testid={`card-goal-${id}`}>
      <CardContent className="p-5 space-y-4">
        {/* Header with title and percentage */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xl font-bold text-foreground" data-testid={`text-title-${id}`}>
                {title}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 -mt-1 -mr-2" 
                    data-testid={`button-goal-menu-${id}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit} data-testid={`button-edit-goal-${id}`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    className="text-destructive focus:text-destructive"
                    data-testid={`button-delete-goal-${id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {purpose && (
              <p className="text-sm text-muted-foreground mt-0.5">{purpose}</p>
            )}
          </div>
          <span 
            className="text-3xl font-bold tabular-nums shrink-0" 
            data-testid={`text-progress-${id}`}
          >
            {progress}%
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1.5" />

        {/* Category and challenge badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="secondary" 
            className="bg-muted/60 text-muted-foreground font-normal rounded-full px-3"
          >
            {category.toLowerCase()}
          </Badge>
          {challengeDuration > 0 ? (
            <Badge 
              variant="secondary" 
              className="bg-muted/60 text-muted-foreground font-normal rounded-full px-3"
            >
              {daysWithProgress}/{challengeDuration} days
            </Badge>
          ) : (
            <Badge 
              variant="secondary" 
              className="bg-muted/60 text-muted-foreground font-normal rounded-full px-3"
            >
              No challenge
            </Badge>
          )}
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Milestones
            </h4>
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className="flex items-center gap-3"
                >
                  <Checkbox
                    checked={milestone.completed}
                    onCheckedChange={() => onToggleMilestone(milestone.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    data-testid={`checkbox-milestone-${milestone.id}`}
                  />
                  <span
                    className={`text-sm ${
                      milestone.completed 
                        ? "text-muted-foreground" 
                        : "text-foreground"
                    }`}
                  >
                    {milestone.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags (if any) */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs font-normal rounded-full"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
