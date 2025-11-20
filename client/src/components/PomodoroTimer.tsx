import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SessionType = "focus" | "short-break" | "long-break";

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const durations = {
    focus: 25 * 60,
    "short-break": 5 * 60,
    "long-break": 15 * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onSessionComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTypeChange = (type: SessionType) => {
    setSessionType(type);
    setTimeLeft(durations[type]);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(durations[sessionType]);
    setIsRunning(false);
  };

  const progress = ((durations[sessionType] - timeLeft) / durations[sessionType]) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        <Badge
          variant={sessionType === "focus" ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => handleTypeChange("focus")}
          data-testid="button-session-focus"
        >
          Focus
        </Badge>
        <Badge
          variant={sessionType === "short-break" ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => handleTypeChange("short-break")}
          data-testid="button-session-short-break"
        >
          Short Break
        </Badge>
        <Badge
          variant={sessionType === "long-break" ? "default" : "outline"}
          className="cursor-pointer hover-elevate active-elevate-2"
          onClick={() => handleTypeChange("long-break")}
          data-testid="button-session-long-break"
        >
          Long Break
        </Badge>
      </div>

      <div className="relative">
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
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-semibold font-mono" data-testid="text-timer">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="icon"
          onClick={() => setIsRunning(!isRunning)}
          data-testid="button-play-pause"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleReset}
          data-testid="button-reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
