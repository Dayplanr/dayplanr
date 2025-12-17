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
import type { HabitFormData, ScheduleType } from "@/types/habits";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HabitFormData) => void;
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
];

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
  const [scheduleType, setScheduleType] = useState<ScheduleType>("everyday");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [challengeDays, setChallengeDays] = useState(30);

  const handleDayToggle = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((d) => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      category,
      scheduleType,
      selectedDays: scheduleType === "weekdays" ? selectedDays : [],
      challengeDays: scheduleType === "challenge" ? challengeDays : 0,
      challengeCompleted: 0,
    });
    
    setName("");
    setCategory("personal");
    setScheduleType("everyday");
    setSelectedDays([]);
    setChallengeDays(30);
    onOpenChange(false);
  };

  const isValid = name.trim() && (scheduleType !== "weekdays" || selectedDays.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
                data-testid="button-schedule-everyday"
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
                data-testid="button-schedule-weekdays"
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
                data-testid="button-schedule-challenge"
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
                    data-testid={`button-day-${day.id}`}
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
