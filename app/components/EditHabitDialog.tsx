import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Trash2 } from "lucide-react";
import type { Habit, ScheduleType } from "@/types/habits";

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

const WEEKDAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const CATEGORIES = [
  { value: "personal", label: "Personal" },
  { value: "health", label: "Health" },
  { value: "work", label: "Work" },
  { value: "learning", label: "Learning" },
  { value: "fitness", label: "Fitness" },
  { value: "custom", label: "Custom" },
];

const CHALLENGE_OPTIONS = [
  { value: "7", label: "7-Day Challenge" },
  { value: "14", label: "14-Day Challenge" },
  { value: "21", label: "21-Day Challenge" },
  { value: "30", label: "30-Day Challenge" },
  { value: "60", label: "60-Day Challenge" },
  { value: "90", label: "90-Day Challenge" },
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
  const [customCategory, setCustomCategory] = useState("");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("everyday");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [challengeDays, setChallengeDays] = useState(30);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.title);
      const knownCategories = CATEGORIES.map(c => c.value).filter(v => v !== "custom");
      const habitCategory = habit.category || "personal";
      if (knownCategories.includes(habitCategory)) {
        setCategory(habitCategory);
        setCustomCategory("");
      } else {
        setCategory("custom");
        setCustomCategory(habitCategory);
      }
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

  const handleSave = () => {
    if (!habit || !name.trim()) return;
    
    const finalCategory = category === "custom" ? customCategory.trim() : category;
    if (category === "custom" && !customCategory.trim()) return;
    
    onSave({
      ...habit,
      title: name.trim(),
      category: finalCategory,
      scheduleType,
      selectedDays: scheduleType === "weekdays" ? selectedDays : [],
      challengeDays: scheduleType === "challenge" ? challengeDays : 0,
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

  const isValid = name.trim() && 
    (scheduleType !== "weekdays" || selectedDays.length > 0) &&
    (category !== "custom" || customCategory.trim());

  if (!habit) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-habit-name">Habit Name</Label>
              <Input
                id="edit-habit-name"
                placeholder="e.g., Morning Meditation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-edit-habit-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-edit-category">
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
                  data-testid="input-edit-custom-category"
                />
              )}
            </div>

            <div className="space-y-3">
              <Label>Schedule</Label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setScheduleType("everyday")}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    scheduleType === "everyday"
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="button-edit-schedule-everyday"
                >
                  <p className="text-sm font-medium">Everyday</p>
                  <p className="text-xs text-muted-foreground">Build a daily habit</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setScheduleType("weekdays")}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    scheduleType === "weekdays"
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="button-edit-schedule-weekdays"
                >
                  <p className="text-sm font-medium">Specific Weekdays</p>
                  <p className="text-xs text-muted-foreground">Choose which days</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setScheduleType("challenge")}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    scheduleType === "challenge"
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="button-edit-schedule-challenge"
                >
                  <p className="text-sm font-medium">Custom Challenge</p>
                  <p className="text-xs text-muted-foreground">Set a streak goal</p>
                </button>
              </div>
            </div>

            {scheduleType === "weekdays" && (
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedDays.includes(day.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover-elevate"
                      }`}
                      data-testid={`button-edit-day-${day.id}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {scheduleType === "challenge" && (
              <div className="space-y-2">
                <Label>Challenge Duration</Label>
                <Select value={String(challengeDays)} onValueChange={(v) => setChallengeDays(Number(v))}>
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
                <p className="text-xs text-muted-foreground">
                  Progress: {habit.challengeCompleted || 0}/{challengeDays} days completed
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="button-delete-habit"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!isValid}
                data-testid="button-save-habit"
              >
                Save Changes
              </Button>
            </div>
          </div>
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
