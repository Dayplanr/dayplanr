import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, X, Target } from "lucide-react";
import { GOAL_CATEGORIES, CHALLENGE_DURATIONS } from "@/types/goals";

export default function CreateGoalPage() {
  const [, navigate] = useLocation();
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

    const goalData = {
      title: title.trim(),
      purpose: purpose.trim(),
      category: finalCategory,
      challengeDuration: finalDuration,
      milestones: milestones.map((m) => ({ title: m })),
      tags,
      visionText: visionText.trim() || undefined,
    };

    localStorage.setItem("newGoal", JSON.stringify(goalData));
    navigate("/goals");
  };

  const isValid = title.trim() && category && (category !== "Custom" || customCategory.trim());

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full bg-background"
    >
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/goals")}
              data-testid="button-back-goals"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Create Goal</h1>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                placeholder="What do you want to achieve?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
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
                className="min-h-[100px]"
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
              <Label>Challenge Duration (Optional)</Label>
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
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={handleAddMilestone}
                  data-testid="button-add-milestone"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {milestones.length > 0 && (
                <div className="space-y-2 mt-3">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm">{milestone}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveMilestone(index)}
                        data-testid={`button-remove-milestone-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleAddTag)}
                  data-testid="input-tag"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={handleAddTag}
                  data-testid="button-add-tag"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
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
              <Label htmlFor="vision-text">Vision Statement (Optional)</Label>
              <Textarea
                id="vision-text"
                placeholder="Describe your vision for achieving this goal..."
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-vision-text"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/goals")}
                data-testid="button-cancel-goal"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmit}
                disabled={!isValid}
                data-testid="button-save-goal"
              >
                Create Goal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
