import { useState } from "react";
import { format, subDays } from "date-fns";
import FocusModeCard from "@/components/FocusModeCard";
import CreateTimerDialog from "@/components/CreateTimerDialog";
import FocusInsights from "@/components/FocusInsights";
import ActiveFocusSession from "@/components/ActiveFocusSession";
import { Timer, Rocket, Zap, Brain, Coffee } from "lucide-react";

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
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [customTimers, setCustomTimers] = useState<CustomTimer[]>([]);

  const weekData = [
    { day: "Mon", pomodoro: 3, deepwork: 1, custom: 0 },
    { day: "Tue", pomodoro: 4, deepwork: 2, custom: 1 },
    { day: "Wed", pomodoro: 2, deepwork: 1, custom: 0 },
    { day: "Thu", pomodoro: 5, deepwork: 0, custom: 2 },
    { day: "Fri", pomodoro: 3, deepwork: 2, custom: 1 },
    { day: "Sat", pomodoro: 1, deepwork: 1, custom: 0 },
    { day: "Sun", pomodoro: 2, deepwork: 0, custom: 0 },
  ];

  const monthData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), "yyyy-MM-dd"),
    minutes: Math.floor(Math.random() * 120) + 10,
  }));

  const yearData = [
    { month: "Jan", minutes: 850 },
    { month: "Feb", minutes: 920 },
    { month: "Mar", minutes: 780 },
    { month: "Apr", minutes: 1100 },
    { month: "May", minutes: 950 },
    { month: "Jun", minutes: 1200 },
    { month: "Jul", minutes: 880 },
    { month: "Aug", minutes: 1050 },
    { month: "Sep", minutes: 1150 },
    { month: "Oct", minutes: 1350 },
    { month: "Nov", minutes: 980 },
    { month: "Dec", minutes: 450 },
  ];

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

  const handleCreateTimer = (timer: CustomTimer) => {
    setCustomTimers((prev) => [...prev, timer]);
  };

  const handleSessionComplete = () => {
    setActiveSession(null);
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

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Focus</h1>
            <p className="text-sm text-muted-foreground">Deep work & productivity</p>
          </div>
          <CreateTimerDialog onCreateTimer={handleCreateTimer} />
        </div>

        {activeSession ? (
          <ActiveFocusSession
            mode={activeSession.mode}
            title={activeSession.title}
            totalMinutes={activeSession.duration}
            breakMinutes={activeSession.breakDuration}
            icon={activeSession.icon}
            onComplete={handleSessionComplete}
            onCancel={() => setActiveSession(null)}
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
                customIcon={getCustomTimerIcon(timer.icon)}
                customColor="bg-emerald-100 dark:bg-emerald-900/30"
              />
            ))}
          </div>
        )}

        <FocusInsights
          todayMinutes={145}
          todaySessions={6}
          weekData={weekData}
          monthData={monthData}
          yearData={yearData}
        />
      </div>
    </div>
  );
}
