import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, X, Timer, Rocket, Zap, Brain, Coffee } from "lucide-react";

interface ActiveFocusSessionProps {
  mode: string;
  title: string;
  totalMinutes: number;
  breakMinutes: number;
  icon: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function ActiveFocusSession({
  mode,
  title,
  totalMinutes,
  breakMinutes,
  icon,
  onComplete,
  onCancel,
}: ActiveFocusSessionProps) {
  const [timeLeft, setTimeLeft] = useState(totalMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload notification sound (Soft Bell/Chime)
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);

            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch((e: any) => console.error("Error playing audio", e));
            }

            if (!isBreak && breakMinutes > 0) {
              setIsBreak(true);
              return breakMinutes * 60;
            }
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, breakMinutes, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setTimeLeft(isBreak ? breakMinutes * 60 : totalMinutes * 60);
    setIsRunning(false);
  };

  const getIconComponent = () => {
    const iconMap: Record<string, typeof Timer> = {
      timer: Timer,
      rocket: Rocket,
      zap: Zap,
      brain: Brain,
      coffee: Coffee,
    };
    const IconComponent = iconMap[icon] || Timer;
    return <IconComponent className="w-8 h-8" />;
  };

  const getIconBackground = () => {
    if (mode === "pomodoro") return "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400";
    if (mode === "deepwork") return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
  };

  const progress = isBreak
    ? ((breakMinutes * 60 - timeLeft) / (breakMinutes * 60)) * 100
    : ((totalMinutes * 60 - timeLeft) / (totalMinutes * 60)) * 100;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-8 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBackground()}`}>
              {getIconComponent()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {isBreak ? "Break Time" : "Focus Session"}
              </p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onCancel} data-testid="button-cancel-session">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative mb-8">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={isBreak ? "hsl(var(--chart-2))" : "hsl(var(--primary))"}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-semibold font-mono" data-testid="text-session-timer">
              {formatTime(timeLeft)}
            </span>
            {isBreak && (
              <span className="text-xs text-muted-foreground mt-1">Break</span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            size="icon"
            onClick={() => setIsRunning(!isRunning)}
            data-testid="button-session-play-pause"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleReset}
            data-testid="button-session-reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
