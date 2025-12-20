import { useState } from "react";
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
import { GOAL_CATEGORIES, CHALLENGE_DURATIONS, type GoalFormData } from "@/types/goals";

interface CreateGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => void;
}

export default function CreateGoalSheet({ open, onOpenChange, onSubmit }: CreateGoalSheetProps) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [challengeDuration, setChallengeDuration] = useState(0);
  const [customDuration, setCustomDuration] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [visionText, setVisionText] = useState("");

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, newMilestone.trim()]);
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
    if (!title.trim() || !category) return;
    
    const finalCategory = category === "Custom" ? customCategory.trim() : category;
    if (category === "Custom" && !customCategory.trim()) return;

    const finalDuration = challengeDuration === -1 
      ? parseInt(customDuration) || 0 
      : challengeDuration;

    onSubmit({
      title: title.trim(),
      purpose: purpose.trim(),
      category: finalCategory,
      challengeDuration: finalDuration,
      milestones: milestones.map((m) => ({ title: m })),
      tags,
      visionText: visionText.trim() || undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setPurpose("");
    setCategory("");
    setCustomCategory("");
    setChallengeDuration(0);
    setCustomDuration("");
    setMilestones([]);
    setNewMilestone("");
    setTags([]);
    setNewTag("");
    setVisionText("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal Title</Label>
            <Input
              id="goal-title"
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-goal-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-purpose">Purpose / Description</Label>
            <Textarea
              id="goal-purpose"
              placeholder="Why is this goal important to you?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[80px]"
              data-testid="input-goal-purpose"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-goal-category">
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
            {category === "Custom" && (
              <Input
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
                data-testid="input-goal-custom-category"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Challenge Duration</Label>
            <Select 
              value={challengeDuration.toString()} 
              onValueChange={(v) => setChallengeDuration(parseInt(v))}
            >
              <SelectTrigger data-testid="select-challenge-duration">
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
                data-testid="input-custom-duration"
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
                data-testid="input-milestone"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleAddMilestone}
                data-testid="button-add-milestone"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {milestones.length > 0 && (
              <div className="space-y-2 mt-2">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <span className="text-sm">{milestone}</span>
                    <button
                      onClick={() => handleRemoveMilestone(index)}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid={`button-remove-milestone-${index}`}
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
                data-testid="input-tag"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleAddTag}
                data-testid="button-add-tag"
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
                      data-testid={`button-remove-tag-${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision-text">Vision Text (Optional)</Label>
            <Textarea
              id="vision-text"
              placeholder="Describe your vision when you achieve this goal..."
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              className="min-h-[80px]"
              data-testid="input-vision-text"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!title.trim() || !category}
            data-testid="button-save-goal"
          >
            Save Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
