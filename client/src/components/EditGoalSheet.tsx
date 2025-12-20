import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Target } from "lucide-react";
import { GOAL_CATEGORIES, CHALLENGE_DURATIONS, type Goal } from "@/types/goals";

interface EditGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSubmit: (goalId: string, data: Partial<Goal>) => void;
}

export default function EditGoalSheet({ open, onOpenChange, goal, onSubmit }: EditGoalSheetProps) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("");
  const [challengeDuration, setChallengeDuration] = useState(0);
  const [customDuration, setCustomDuration] = useState("");
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newMilestone, setNewMilestone] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [visionText, setVisionText] = useState("");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setPurpose(goal.purpose);
      setCategory(goal.category);
      const isCustom = !CHALLENGE_DURATIONS.some(d => d.value === goal.challengeDuration && d.value !== -1);
      if (isCustom && goal.challengeDuration > 0) {
        setChallengeDuration(-1);
        setCustomDuration(goal.challengeDuration.toString());
      } else {
        setChallengeDuration(goal.challengeDuration);
        setCustomDuration("");
      }
      setMilestones([...goal.milestones]);
      setTags([...goal.tags]);
      setVisionText(goal.visionText || "");
    }
  }, [goal]);

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, { 
        id: `m-${Date.now()}`, 
        title: newMilestone.trim(), 
        completed: false 
      }]);
      setNewMilestone("");
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const handleSubmit = () => {
    if (!goal || !title.trim() || !category) return;

    const finalDuration = challengeDuration === -1 
      ? parseInt(customDuration) || 0 
      : challengeDuration;

    onSubmit(goal.id, {
      title: title.trim(),
      purpose: purpose.trim(),
      category,
      challengeDuration: finalDuration,
      milestones,
      tags,
      visionText: visionText.trim() || undefined,
    });

    onOpenChange(false);
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Edit Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-goal-title">Goal Title</Label>
            <Input
              id="edit-goal-title"
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-edit-goal-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-goal-purpose">Purpose / Description</Label>
            <Textarea
              id="edit-goal-purpose"
              placeholder="Why is this goal important to you?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[80px]"
              data-testid="input-edit-goal-purpose"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-edit-goal-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Challenge Duration</Label>
            <Select 
              value={challengeDuration.toString()} 
              onValueChange={(v) => setChallengeDuration(parseInt(v))}
            >
              <SelectTrigger data-testid="select-edit-challenge-duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {CHALLENGE_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {challengeDuration === -1 && (
              <Input
                type="number"
                placeholder="Enter custom days"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="mt-2"
                data-testid="input-edit-custom-duration"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Milestones</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a milestone"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddMilestone)}
                data-testid="input-edit-milestone"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleAddMilestone}
                data-testid="button-edit-add-milestone"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {milestones.length > 0 && (
              <div className="space-y-2 mt-2">
                {milestones.map((milestone, index) => (
                  <div 
                    key={milestone.id} 
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <span className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                      {milestone.title}
                    </span>
                    <button
                      onClick={() => handleRemoveMilestone(index)}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid={`button-edit-remove-milestone-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddTag)}
                data-testid="input-edit-tag"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleAddTag}
                data-testid="button-edit-add-tag"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-foreground"
                      data-testid={`button-edit-remove-tag-${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-vision-text">Vision Text (Optional)</Label>
            <Textarea
              id="edit-vision-text"
              placeholder="Describe your vision when you achieve this goal..."
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              className="min-h-[80px]"
              data-testid="input-edit-vision-text"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!title.trim() || !category}
            data-testid="button-update-goal"
          >
            Update Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
