import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MoreVertical, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Milestone } from "@/types/goals";

function CircularProgress({ value, size = 48 }: { value: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted/30"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-300"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold tabular-nums">{value}%</span>
      </div>
    </div>
  );
}

interface GoalCardProps {
  id: string;
  title: string;
  purpose?: string;
  category: string;
  progress: number;
  milestones: Milestone[];
  tags: string[];
  visionText?: string;
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
  visionText,
  challengeDuration = 0,
  daysWithProgress = 0,
  onToggleMilestone,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const completedMilestones = milestones.filter(m => m.completed).length;

  return (
    <Card className="border-0 shadow-sm bg-card" data-testid={`card-goal-${id}`}>
      <CardContent className="p-5">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {/* Header with title, percentage circle, and menu */}
          <div className="flex items-start justify-between gap-4">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-4 flex-1 text-left">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground line-clamp-2" data-testid={`text-title-${id}`}>
                    {title}
                  </h3>
                  {purpose && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{purpose}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-muted/60 text-muted-foreground font-normal rounded-full px-3 text-xs"
                    >
                      {category.toLowerCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {completedMilestones}/{milestones.length} milestones
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <div data-testid={`text-progress-${id}`}>
                    <CircularProgress value={progress} size={52} />
                  </div>
                </div>
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
          </div>

          <CollapsibleContent className="space-y-4 mt-4">
            {/* Vision Statement */}
            {visionText && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Vision Statement</h4>
                <p className="text-sm italic text-foreground/80 leading-snug">"{visionText}"</p>
              </div>
            )}

            {/* Challenge duration badge */}
            {challengeDuration > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-muted/60 text-muted-foreground font-normal rounded-full px-3"
                >
                  {daysWithProgress}/{challengeDuration} days
                </Badge>
              </div>
            )}

            {/* Milestones */}
            {milestones.length > 0 && (
              <div className="space-y-3">
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
                        className={`text-sm ${milestone.completed
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
              <div className="flex flex-wrap gap-1.5">
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
