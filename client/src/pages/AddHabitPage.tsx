import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Repeat, X } from "lucide-react";
import type { ScheduleType } from "@/types/habits";
import type { Goal } from "@/types/goals";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

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

export default function AddHabitPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("personal");
  const [customCategory, setCustomCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("everyday");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [challengeDays, setChallengeDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("none");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from("goals")
          .select("id, title")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          setGoals(data as Goal[]);
        }
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      }
    };
    fetchGoals();
  }, [user]);

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

  const handleSubmit = async () => {
    if (!name.trim() || !user) return;
    setLoading(true);

    try {
      const finalCategory = category === "custom" ? customCategory.trim() : category;
      if (category === "custom" && !customCategory.trim()) return;

      if (scheduleType === "weekdays" && selectedDays.length === 0) {
        toast({ title: "Please select at least one day", variant: "destructive" });
        setLoading(false);
        return;
      }

      const selectedChallenge = CHALLENGE_OPTIONS.find(opt => opt.value === String(challengeDays));

      const { error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          title: name.trim(),
          category: finalCategory,
          tags: tags,
          schedule_type: scheduleType,
          selected_days: scheduleType === "weekdays" ? selectedDays : [],
          challenge_days: scheduleType === "challenge" ? challengeDays : 0,
          challenge_type: scheduleType === "challenge" ? selectedChallenge?.label : null,
          challenge_completed: 0,
          streak: 0,
          best_streak: 0,
          success_rate: 0,
          weekly_consistency: 0,
          monthly_consistency: 0,
          completed_dates: [],
          goal_id: selectedGoalId === "none" ? null : selectedGoalId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Habit added successfully!",
      });
      navigate("/app/habits");
    } catch (error: any) {
      toast({
        title: "Error adding habit",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/habits");
  };

  const isValid = name.trim() &&
    (category !== "custom" || customCategory.trim()) &&
    (scheduleType !== "weekdays" || selectedDays.length > 0);

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
              <Label>Link to Goal (Optional)</Label>
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                <SelectTrigger data-testid="select-goal">
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Goal</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Schedule</Label>
                {scheduleType === "weekdays" && (
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Step 1: Select days</span>
                )}
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setScheduleType("everyday")}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${scheduleType === "everyday"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover-elevate"
                    }`}
                  data-testid="button-schedule-everyday"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Everyday</p>
                    {scheduleType === "everyday" && <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Build a daily habit</p>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleType("weekdays")}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${scheduleType === "weekdays"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover-elevate"
                    }`}
                  data-testid="button-schedule-weekdays"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Specific Weekdays</p>
                    {scheduleType === "weekdays" && <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">Selected Only</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Choose which days to highlight</p>
                </button>

                {scheduleType === "weekdays" && (
                  <div className="flex justify-between gap-1 py-1">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDayToggle(day.id)}
                        className={`w-9 h-9 rounded-full border text-xs font-bold transition-all flex items-center justify-center ${selectedDays.includes(day.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
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
                  className={`w-full p-4 rounded-xl border text-left transition-all ${scheduleType === "challenge"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover-elevate"
                    }`}
                  data-testid="button-schedule-challenge"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Challenge Mode</p>
                    {scheduleType === "challenge" && <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">Goal Based</Badge>}
                  </div>
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
                disabled={!isValid || loading}
                data-testid="button-save-habit"
              >
                {loading ? "Adding..." : "Add Habit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
