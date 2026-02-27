import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FocusModeCard from "@/components/FocusModeCard";
import CreateTimerDialog from "@/components/CreateTimerDialog";
import FocusInsights from "@/components/FocusInsights";
import ActiveFocusSession from "@/components/ActiveFocusSession";
import { useTranslation } from "@/lib/i18n";
import { Timer, Rocket, Zap, Brain, Coffee, Plus, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { stopAllTimerSounds, stopTimerSound } from "@/lib/audioManager";

interface CustomTimer {
  id: string;
  name: string;
  duration: number;
  breakDuration: number;
  icon: string;
}

interface ActiveSession {
  mode: string;
  title: string;
  duration: number;
  breakDuration: number;
  icon: string;
}

export default function FocusPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [customTimers, setCustomTimers] = useState<CustomTimer[]>([]);
  const [showCreateTimer, setShowCreateTimer] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [editingTimer, setEditingTimer] = useState<CustomTimer | null>(null);

  const fetchSessionHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Error fetching session history", error);
      return;
    }
    setSessionHistory(data || []);
  };

  const fetchCustomTimers = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("custom_timers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching custom timers", error);
      return;
    }
    setCustomTimers(data || []);
  };

  useEffect(() => {
    if (user) {
      fetchSessionHistory();
      fetchCustomTimers();
    }
  }, [user]);

  // Add global event listeners to stop timer sounds
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log("Escape key pressed, stopping all timer sounds");
        stopTimerSound();
        stopAllTimerSounds();
      }
    };

    const handleBeforeUnload = () => {
      console.log("Page unloading, stopping all timer sounds");
      stopTimerSound();
      stopAllTimerSounds();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page hidden, stopping all timer sounds");
        stopTimerSound();
        stopAllTimerSounds();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Stop any playing audio when active session is cleared
  useEffect(() => {
    if (!activeSession) {
      // Use the global audio manager to stop all sounds
      console.log("Active session cleared, stopping all timer sounds via audio manager");
      stopTimerSound();
      stopAllTimerSounds();
    }
  }, [activeSession]);

  const handleStartPomodoro = () => {
    setActiveSession({
      mode: "pomodoro",
      title: "Pomodoro",
      duration: 25,
      breakDuration: 5,
      icon: "timer",
    });
  };

  const handleStartDeepWork = () => {
    setActiveSession({
      mode: "deepwork",
      title: "Deep Work",
      duration: 90,
      breakDuration: 0,
      icon: "rocket",
    });
  };

  const handleStartCustomTimer = (timer: CustomTimer) => {
    setActiveSession({
      mode: "custom",
      title: timer.name,
      duration: timer.duration,
      breakDuration: timer.breakDuration,
      icon: timer.icon,
    });
  };

  const handleCreateTimer = async (timerData: Omit<CustomTimer, "id">) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("custom_timers")
        .insert({
          user_id: user.id,
          name: timerData.name,
          duration: timerData.duration,
          break_duration: timerData.breakDuration,
          icon: timerData.icon,
        })
        .select()
        .single();

      if (error) throw error;
      setCustomTimers((prev) => [...prev, data]);
      toast({ title: "Timer created!" });
    } catch (error: any) {
      toast({ title: "Error creating timer", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateTimer = async (timer: CustomTimer) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("custom_timers")
        .update({
          name: timer.name,
          duration: timer.duration,
          break_duration: timer.breakDuration,
          icon: timer.icon,
        })
        .eq("id", timer.id);

      if (error) throw error;
      setCustomTimers((prev) => prev.map(t => t.id === timer.id ? timer : t));
      toast({ title: "Timer updated!" });
    } catch (error: any) {
      toast({ title: "Error updating timer", description: error.message, variant: "destructive" });
    }
    setEditingTimer(null);
  };

  const handleDeleteTimer = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("custom_timers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setCustomTimers((prev) => prev.filter(t => t.id !== id));
      toast({ title: "Timer deleted!" });
    } catch (error: any) {
      toast({ title: "Error deleting timer", description: error.message, variant: "destructive" });
    }
  };

  const handleSessionCancel = () => {
    console.log("Session cancelled, stopping any playing sounds");
    stopTimerSound();
    stopAllTimerSounds(); // Use the global audio manager
    setActiveSession(null);
  };

  const handleSessionComplete = async () => {
    if (activeSession && user) {
      try {
        const { error } = await supabase
          .from("focus_sessions")
          .insert({
            user_id: user.id,
            mode: activeSession.mode,
            title: activeSession.title,
            duration: activeSession.duration,
            break_duration: activeSession.breakDuration,
            icon: activeSession.icon,
          });

        if (error) throw error;

        toast({
          title: "Session complete!",
          description: `You focused for ${activeSession.duration} minutes.`,
        });
        fetchSessionHistory();
      } catch (error: any) {
        toast({
          title: "Error saving session",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    // Don't clear activeSession here - let the notification dismissal handle it
    // setActiveSession(null);
  };

  const getCustomTimerIcon = (iconName: string) => {
    const iconMap: Record<string, typeof Timer> = {
      timer: Timer,
      rocket: Rocket,
      zap: Zap,
      brain: Brain,
      coffee: Coffee,
    };
    const IconComponent = iconMap[iconName] || Timer;
    return <IconComponent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
  };

  const todayMinutes = sessionHistory
    .filter(s => {
      const today = new Date().toISOString().split('T')[0];
      return s.completed_at?.startsWith(today);
    })
    .reduce((acc, s) => acc + (s.duration || 0), 0);

  const todaySessions = sessionHistory.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.completed_at?.startsWith(today);
  }).length;

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("focus")}</h1>
            <p className="text-sm text-muted-foreground">{t("deepWork")}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full h-11 w-11" data-testid="button-focus-menu">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCreateTimer(true)} data-testid="menu-create-timer">
                <Timer className="w-4 h-4 mr-2" />
                {t("create")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowInsights(true)} data-testid="menu-insights">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t("insights")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {activeSession ? (
          <ActiveFocusSession
            mode={activeSession.mode}
            title={activeSession.title}
            totalMinutes={activeSession.duration}
            breakMinutes={activeSession.breakDuration}
            icon={activeSession.icon}
            onComplete={handleSessionComplete}
            onCancel={handleSessionCancel}
            onNotificationDismiss={() => setActiveSession(null)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FocusModeCard
              mode="pomodoro"
              title="Pomodoro"
              description="25 min work · 5 min break"
              onStart={handleStartPomodoro}
            />
            <FocusModeCard
              mode="deepwork"
              title="Deep Work"
              description="90 minutes of uninterrupted focus"
              onStart={handleStartDeepWork}
            />
            {customTimers.map((timer) => (
              <FocusModeCard
                key={timer.id}
                mode="custom"
                title={timer.name}
                description={`${timer.duration} min${timer.breakDuration > 0 ? ` · ${timer.breakDuration} min break` : ""}`}
                onStart={() => handleStartCustomTimer(timer)}
                onEdit={() => {
                  setEditingTimer(timer);
                  setShowCreateTimer(true);
                }}
                onDelete={() => handleDeleteTimer(timer.id)}
                customIcon={getCustomTimerIcon(timer.icon)}
                customColor="bg-emerald-100 dark:bg-emerald-900/30"
              />
            ))}
          </div>
        )}

        <CreateTimerDialog
          open={showCreateTimer}
          onOpenChange={(open) => {
            setShowCreateTimer(open);
            if (!open) setEditingTimer(null);
          }}
          onCreateTimer={editingTimer ? handleUpdateTimer : handleCreateTimer}
          initialData={editingTimer}
        />

        <FocusInsights
          open={showInsights}
          onOpenChange={setShowInsights}
          sessionHistory={sessionHistory}
        />
      </div>
    </div>
  );
}
