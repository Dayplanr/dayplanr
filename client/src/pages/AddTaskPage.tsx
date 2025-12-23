import { useState } from "react";
import { useLocation } from "wouter";
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
const CATEGORIES = ["Personal", "Work", "Health", "Learning", "Other"];
const PRIORITIES = ["low", "medium", "high"] as const;

export default function AddTaskPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState<string | null>(null);
  const [linkedHabit, setLinkedHabit] = useState<string | null>("none");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>("medium");
  const [linkedGoal, setLinkedGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const determinePeriodFromTime = (time: string): "morning" | "afternoon" | "evening" | "night" => {
    if (!time) return "morning";
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const mockHabits = [
    { id: "none", name: t("none") },
    { id: "reading", name: "Reading books" },
    { id: "exercise", name: "Exercise" },
  ];

  const mockGoals = [
    { id: "none", name: t("noGoal") },
    { id: "fitness", name: "Get Fit" },
    { id: "learn", name: "Learn New Skill" },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !user) return;
    setLoading(true);

    try {
      const period = determinePeriodFromTime(startTime);

      const { error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: title.trim(),
          day_period: period,
          time: startTime ? formatShortTime(startTime) : undefined,
          priority: priority,
          completed: false,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task added successfully!",
      });
      navigate("/app");
    } catch (error: any) {
      toast({
        title: "Error adding task",
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
              onClick={() => navigate("/app")}
              data-testid="button-back-today"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ListTodo className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">{t("newTask")}</h1>
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
                    variant={duration === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDuration(duration === d ? null : d)}
                    className="rounded-full"
                    data-testid={`button-duration-${d}`}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("linkToHabitOptional")}</Label>
              <div className="flex flex-wrap gap-2">
                {mockHabits.map((habit) => (
                  <Button
                    key={habit.id}
                    type="button"
                    variant={linkedHabit === habit.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLinkedHabit(habit.id)}
                    className="rounded-full"
                    data-testid={`button-habit-${habit.id}`}
                  >
                    {habit.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">{t("category")}</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    className="rounded-full"
                    data-testid={`button-category-${cat.toLowerCase()}`}
                  >
                    {t(cat.toLowerCase() as any) || cat}
                  </Button>
                ))}
              </div>
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
              <Button
                type="button"
                variant="default"
                className="w-full rounded-full"
                onClick={() => { }}
                data-testid="button-link-goal"
              >
                {t("noGoal")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
