import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Trash2, X } from "lucide-react";
import type { Habit, ScheduleType } from "@/types/habits";
import { useToast } from "@/hooks/use-toast";

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
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

const WEEKDAYS = [
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
  { id: "sun", label: "S" },
];

export default function EditHabitDialog({
  habit,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditHabitDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("personal");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("everyday");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [challengeDays, setChallengeDays] = useState(30);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (habit) {
      setName(habit.title);
      setCategory(habit.category || "personal");
      setTags(habit.tags || []);
      setScheduleType(habit.scheduleType || "everyday");
      setSelectedDays(habit.selectedDays || []);
      setChallengeDays(habit.challengeDays || 30);
    }
  }, [habit]);

  const handleDayToggle = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((d) => d !== dayId)
        : [...prev, dayId]
    );
  };

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

  const handleSave = () => {
    if (!habit || !name.trim()) return;

    if (scheduleType === "weekdays" && selectedDays.length === 0) {
      toast({ title: "Please select at least one day", variant: "destructive" });
      return;
    }

    const selectedChallenge = CHALLENGE_OPTIONS.find(opt => opt.value === String(challengeDays));

    onSave({
      ...habit,
      title: name.trim(),
      category: category,
      tags,
      scheduleType,
      selectedDays: scheduleType === "weekdays" ? selectedDays : [],
      challengeDays: scheduleType === "challenge" ? challengeDays : 0,
      challengeType: scheduleType === "challenge" ? selectedChallenge?.label : habit.challengeType,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (habit) {
      onDelete(habit.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  if (!habit) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Habit Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Read for 30 mins"
                  data-testid="input-edit-habit-name"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Button variant="outline" size="sm" onClick={() => handleAddTag(tagInput)}>
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Schedule</Label>
                  {scheduleType === "weekdays" && (
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Select days to highlight</span>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType("everyday")}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${scheduleType === "everyday"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover-elevate"
                      }`}
                    data-testid="button-edit-schedule-everyday"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">Everyday</p>
                      {scheduleType === "everyday" && <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-wider">Active</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Build a daily habit</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType("weekdays")}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${scheduleType === "weekdays"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover-elevate"
                      }`}
                    data-testid="button-edit-schedule-weekdays"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">Specific Weekdays</p>
                      {scheduleType === "weekdays" && <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-wider">Selected Only</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Choose which days to highlight in calendar</p>
                  </button>

                  {scheduleType === "weekdays" && (
                    <div className="flex justify-between gap-1 py-1 px-1">
                      {WEEKDAYS.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => handleDayToggle(day.id)}
                          className={`w-8 h-8 rounded-full border text-[10px] font-bold transition-all flex items-center justify-center ${selectedDays.includes(day.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                            }`}
                          data-testid={`button-edit-day-${day.id}`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setScheduleType("challenge")}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${scheduleType === "challenge"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover-elevate"
                      }`}
                    data-testid="button-edit-schedule-challenge"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">Challenge Mode</p>
                      {scheduleType === "challenge" && <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-wider">Goal Based</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Complete a set number of days</p>
                  </button>

                  {scheduleType === "challenge" && (
                    <div className="pt-1">
                      <Select
                        value={challengeDays.toString()}
                        onValueChange={(v) => setChallengeDays(parseInt(v))}
                      >
                        <SelectTrigger data-testid="select-edit-challenge-days">
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
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-2 border-t flex flex-row gap-3">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={() => setShowDeleteConfirm(true)}
              data-testid="button-delete-habit"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" data-testid="button-edit-cancel">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" data-testid="button-edit-save">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{habit.title}"? This action cannot be undone and all your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
