import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { HabitFormData, ScheduleType } from "@/types/habits";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HabitFormData) => void;
}

const CATEGORIES = [
  { value: "personal", label: "Personal" },
  { value: "health", label: "Health" },
  { value: "work", label: "Work" },
  { value: "learning", label: "Learning" },
  { value: "fitness", label: "Fitness" },
  { value: "custom", label: "Custom" },
];

const SUGGESTED_TAGS = ["Personal", "Challenge", "Healthy", "Work", "Productivity"];

const CHALLENGE_OPTIONS = [
  { value: "7", label: "7-Day Challenge" },
  { value: "14", label: "14-Day Challenge" },
  { value: "21", label: "21-Day Challenge" },
  { value: "30", label: "30-Day Challenge" },
  { value: "60", label: "60-Day Challenge" },
  { value: "90", label: "90-Day Challenge" },
];

export default function AddHabitDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("personal");
  const [customCategory, setCustomCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("everyday");
  const [challengeDays, setChallengeDays] = useState(30);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const finalCategory = category === "custom" ? customCategory.trim() : category;
    if (category === "custom" && !customCategory.trim()) return;

    const selectedChallenge = CHALLENGE_OPTIONS.find(opt => opt.value === String(challengeDays));

    onSubmit({
      name: name.trim(),
      category: finalCategory,
      tags,
      scheduleType,
      selectedDays: scheduleType === "weekdays" ? ["mon", "tue", "wed", "thu", "fri"] : [],
      challengeDays: scheduleType === "challenge" ? challengeDays : 0,
      challengeType: scheduleType === "challenge" ? selectedChallenge?.label : undefined,
      challengeCompleted: 0,
    });

    setName("");
    setCategory("personal");
    setCustomCategory("");
    setTags([]);
    setScheduleType("everyday");
    setChallengeDays(30);
    onOpenChange(false);
  };

  const isValid = name.trim() &&
    (category !== "custom" || customCategory.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning Meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-habit-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category === "custom" && (
              <Input
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
                data-testid="input-custom-category"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
              />
              <Button variant="outline" onClick={() => handleAddTag(tagInput)}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Schedule</Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setScheduleType("everyday")}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${scheduleType === "everyday"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                  }`}
                data-testid="button-schedule-everyday"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Everyday</p>
                  {scheduleType === "everyday" && <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">Active</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">Build a daily habit</p>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType("weekdays")}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${scheduleType === "weekdays"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                  }`}
                data-testid="button-schedule-weekdays"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Weekdays Only</p>
                  {scheduleType === "weekdays" && <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">Mon-Fri</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">Monday to Friday only</p>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType("challenge")}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${scheduleType === "challenge"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                  }`}
                data-testid="button-schedule-challenge"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Custom Challenge</p>
                  {scheduleType === "challenge" && <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">Goal Based</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">Set a streak goal</p>
              </button>
            </div>
          </div>

          {scheduleType === "challenge" && (
            <div className="space-y-2">
              <Label>Challenge Duration</Label>
              <Select value={String(challengeDays)} onValueChange={(v) => setChallengeDays(Number(v))}>
                <SelectTrigger data-testid="select-challenge-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHALLENGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!isValid}
              data-testid="button-create-habit"
            >
              Create Habit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
