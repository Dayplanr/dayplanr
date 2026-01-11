import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const DURATIONS = ["5m", "10m", "15m", "30m", "45m", "60m", "90m"];
const CATEGORIES = ["Personal", "Work", "Health", "Learning"];
const PRIORITIES = ["low", "medium", "high"] as const;

export default function AddTaskPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [originalCompleted, setOriginalCompleted] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState<string | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [linkedHabit, setLinkedHabit] = useState<string | null>("none");
  const [category, setCategory] = useState<string | null>("Personal");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>("medium");
  const [linkedGoal, setLinkedGoal] = useState<string | null>("none");
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    // Check for task to edit or a pre-selected date
    const editDataRaw = localStorage.getItem("editTask");
    const preSelectedDate = localStorage.getItem("selectedTaskDate");

    if (preSelectedDate) {
      setScheduledDate(preSelectedDate);
      localStorage.removeItem("selectedTaskDate");
    }

    if (editDataRaw) {
      try {
        const editData = JSON.parse(editDataRaw);
        setTitle(editData.title || "");
        setDescription(editData.description || "");
        if (editData.scheduled_date) {
          setScheduledDate(editData.scheduled_date);
        }
        if (editData.time) {
          // Convert "12:30 PM" back to "24h format" for input type="time"
          const parts = editData.time.split(" ");
          if (parts.length === 2) {
            const [time, ampm] = parts;
            let [hours, minutes] = time.split(":").map(Number);
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            setStartTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
          }
        }
        // Handle duration parsing
        const rawDuration = editData.duration;
        if (rawDuration) {
          if (DURATIONS.includes(rawDuration)) {
            setDuration(rawDuration);
            setIsCustomDuration(false);
          } else {
            setIsCustomDuration(true);
            setCustomDuration(rawDuration.replace("m", ""));
            setDuration(null);
          }
        }

        // Handle category parsing
        const rawCategory = editData.category;
        if (rawCategory) {
          if (rawCategory === "None" || CATEGORIES.includes(rawCategory)) {
            setCategory(rawCategory);
            setIsCustomCategory(false);
          } else {
            // Custom category
            setIsCustomCategory(true);
            setCustomCategory(rawCategory);
            setCategory(null);
          }
        }

        setEditTaskId(editData.id);
        setOriginalCompleted(editData.completed || false);
        setPriority(editData.priority || "medium");
        setLinkedHabit(editData.habit_id || "none");
        setLinkedGoal(editData.goal_id || "none");
        localStorage.removeItem("editTask");
      } catch (e) {
        console.error("Error parsing edit task data", e);
      }
    }

    if (user) {
      const fetchData = async () => {
        const [{ data: habitsData }, { data: goalsData }] = await Promise.all([
          supabase.from("habits").select("id, title").eq("user_id", user.id),
          supabase.from("goals").select("id, title").eq("user_id", user.id).neq("progress", 100)
        ]);
        setHabits([{ id: "none", title: t("none") }, ...(habitsData || [])]);
        setGoals([{ id: "none", title: t("noGoal") }, ...(goalsData || [])]);
      };
      fetchData();
    }
  }, [user]);

  const determinePeriodFromTime = (time: string): "morning" | "afternoon" | "evening" | "night" => {
    if (!time) return "morning";
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const handleSubmit = async () => {
    if (!title.trim() || !user) return;
    setLoading(true);

    try {
      const period = determinePeriodFromTime(startTime);
      const finalDuration = isCustomDuration ? (customDuration ? `${customDuration}m` : null) : duration;

      const taskData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        day_period: period,
        time: startTime ? formatShortTime(startTime) : null,
        priority: priority,
        completed: editTaskId ? originalCompleted : false,
        habit_id: linkedHabit === "none" ? null : linkedHabit,
        goal_id: linkedGoal === "none" ? null : linkedGoal,
        scheduled_date: scheduledDate,
        duration: finalDuration,
        category: isCustomCategory ? (customCategory || null) : category,
      };

      let error;
      if (editTaskId) {
        ({ error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", editTaskId));
      } else {
        ({ error } = await supabase
          .from("tasks")
          .insert(taskData));
      }

      if (error) throw error;

      toast({
        title: t("today"),
        description: editTaskId ? "Task updated successfully!" : "Task added successfully!",
      });
      
      // Check if we should return to a specific date
      const returnToDate = localStorage.getItem("returnToDate");
      if (returnToDate) {
        localStorage.removeItem("returnToDate");
        // If return date is not today, preserve the selected date in TodayPage
        const today = format(new Date(), "yyyy-MM-dd");
        if (returnToDate !== today) {
          localStorage.setItem("preserveSelectedDate", returnToDate);
        }
      }
      
      navigate("/app");
    } catch (error: any) {
      toast({
        title: editTaskId ? "Error updating task" : "Error adding task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatShortTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Check if we should return to a specific date
                const returnToDate = localStorage.getItem("returnToDate");
                if (returnToDate) {
                  localStorage.removeItem("returnToDate");
                  // If return date is not today, preserve the selected date in TodayPage
                  const today = format(new Date(), "yyyy-MM-dd");
                  if (returnToDate !== today) {
                    localStorage.setItem("preserveSelectedDate", returnToDate);
                  }
                }
                navigate("/app");
              }}
              data-testid="button-back-today"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ListTodo className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">{editTaskId ? "Edit Task" : t("newTask")}</h1>
            </div>
            <Button
              variant="ghost"
              onClick={handleSubmit}
              disabled={!title.trim() || loading}
              className="text-primary font-semibold"
              data-testid="button-save-task"
            >
              {loading ? "..." : t("save")}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("taskTitle")}</Label>
              <Input
                placeholder={t("taskTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
                data-testid="input-task-title"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("descriptionOptional")}</Label>
              <Textarea
                placeholder={t("descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-task-description"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("startTimeOptional")}</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                data-testid="input-start-time"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("durationOptional")}</Label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={!isCustomDuration && duration === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setDuration(duration === d ? null : d);
                      setIsCustomDuration(false);
                    }}
                    className="rounded-full"
                    data-testid={`button-duration-${d}`}
                  >
                    {d}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={isCustomDuration ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsCustomDuration(!isCustomDuration)}
                  className="rounded-full"
                  data-testid="button-duration-custom"
                >
                  {t("custom" as any) || "Custom"}
                </Button>
              </div>
              {isCustomDuration && (
                <div className="flex items-center gap-2 mt-2 max-w-[150px]">
                  <Input
                    type="number"
                    placeholder="Enter"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="h-8"
                  />
                  <span className="text-sm text-muted-foreground font-medium">mins</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("linkToHabitOptional")}</Label>
              <div className="flex flex-wrap gap-2">
                {habits.map((habit) => (
                  <Button
                    key={habit.id}
                    type="button"
                    variant={linkedHabit === habit.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLinkedHabit(habit.id)}
                    className="rounded-full"
                    data-testid={`button-habit-${habit.id}`}
                  >
                    {habit.title || habit.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("category")}</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  key="none"
                  type="button"
                  variant={!isCustomCategory && category === "None" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCategory("None");
                    setIsCustomCategory(false);
                  }}
                  className="rounded-full"
                  data-testid="button-category-none"
                >
                  {t("none")}
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={!isCustomCategory && category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCategory(cat);
                      setIsCustomCategory(false);
                    }}
                    className="rounded-full"
                    data-testid={`button-category-${cat.toLowerCase()}`}
                  >
                    {t(cat.toLowerCase() as any) || cat}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={isCustomCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="rounded-full"
                  data-testid="button-category-custom"
                >
                  {t("custom" as any) || "Custom"}
                </Button>
              </div>
              {isCustomCategory && (
                <div className="max-w-[200px] mt-2">
                  <Input
                    type="text"
                    placeholder="Enter category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="h-8"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("priority")}</Label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={priority === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriority(p)}
                    className={`rounded-full flex-1 ${priority === p && p === "medium" ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500" : ""
                      } ${priority === p && p === "high" ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""
                      } ${priority === p && p === "low" ? "bg-green-500 hover:bg-green-600 text-white border-green-500" : ""
                      }`}
                    data-testid={`button-priority-${p}`}
                  >
                    {t(p)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("linkToGoalOptional")}</Label>
              <div className="flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <Button
                    key={goal.id}
                    type="button"
                    variant={linkedGoal === goal.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLinkedGoal(goal.id)}
                    className="rounded-full"
                    data-testid={`button-goal-${goal.id}`}
                  >
                    {goal.title || goal.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
