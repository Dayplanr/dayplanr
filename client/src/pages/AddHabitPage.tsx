import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
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
import { ArrowLeft, Repeat } from "lucide-react";
import type { ScheduleType } from "@/types/habits";

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

export default function AddHabitPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("personal");
  const [customCategory, setCustomCategory] = useState("");
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
    
    const finalCategory = category === "custom" ? customCategory.trim() : category;
    if (category === "custom" && !customCategory.trim()) return;
    
    if (scheduleType === "weekdays" && selectedDays.length === 0) return;
    
    const habitData = {
      name: name.trim(),
      category: finalCategory,
      scheduleType,
      selectedDays: scheduleType === "weekdays" ? selectedDays : [],
      challengeDays: scheduleType === "challenge" ? challengeDays : 0,
      challengeCompleted: 0,
    };
    
    localStorage.setItem("newHabit", JSON.stringify(habitData));
    navigate("/app/habits");
  };

  const handleCancel = () => {
    localStorage.removeItem("newHabit");
    navigate("/app/habits");
  };

  const isValid = name.trim() && 
    (scheduleType !== "weekdays" || selectedDays.length > 0) &&
    (category !== "custom" || customCategory.trim());

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
              onClick={() => navigate("/app/habits")}
              data-testid="button-back-habits"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Repeat className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Add Habit</h1>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Morning Meditation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
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

            <div className="space-y-4">
              <Label>Schedule</Label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setScheduleType("everyday")}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    scheduleType === "everyday"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="button-schedule-everyday"
                >
                  <p className="font-medium">Everyday</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Build a daily habit</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setScheduleType("weekdays")}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    scheduleType === "weekdays"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="button-schedule-weekdays"
                >
                  <p className="font-medium">Specific Weekdays</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Choose which days</p>
                </button>

                {scheduleType === "weekdays" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDayToggle(day.id)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedDays.includes(day.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover-elevate"
                        }`}
                        data-testid={`button-day-${day.id}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setScheduleType("challenge")}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    scheduleType === "challenge"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover-elevate"
                  }`}
                  data-testid="button-schedule-challenge"
                >
                  <p className="font-medium">Challenge Mode</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Complete a set number of days</p>
                </button>

                {scheduleType === "challenge" && (
                  <div className="pt-2">
                    <Select 
                      value={challengeDays.toString()} 
                      onValueChange={(v) => setChallengeDays(parseInt(v))}
                    >
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
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
                data-testid="button-cancel-habit"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmit}
                disabled={!isValid}
                data-testid="button-save-habit"
              >
                Add Habit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
