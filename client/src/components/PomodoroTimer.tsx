import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTimerSound } from "@/hooks/useTimerSound";
import { audioManager } from "@/lib/audioManager";
import { startContinuousTimerSound } from "@/lib/timerSounds";
import TimerCompletionNotification from "./TimerCompletionNotification";

type SessionType = "focus" | "short-break" | "long-break";

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);
  const { timerSound } = useTimerSound();

  const durations = {
    focus: 25 * 60,
    "short-break": 5 * 60,
    "long-break": 15 * 60,
  };

  const playCompletionSound = async () => {
    console.log("🔊 POMODORO COMPLETED! Starting continuous completion sound...");
    console.log("🔊 Selected timer sound:", timerSound);
    
    try {
      // Use the new continuous sound system
      const soundGenerator = async () => {
        console.log("🔊 Creating continuous sound for:", timerSound);
        return await startContinuousTimerSound(timerSound);
      };
      
      await audioManager.startContinuousTimerSound(soundGenerator);
      console.log("🔊 Continuous pomodoro completion sound started successfully");
    } catch (error) {
      console.error("🔊 Error playing pomodoro completion sound:", error);
      
      // Fallback to simple continuous beep
      try {
        console.log("🔊 Trying fallback beep sound");
        const soundGenerator = async () => {
          return await startContinuousTimerSound('beep');
        };
        await audioManager.startContinuousTimerSound(soundGenerator);
        console.log("🔊 Fallback continuous beep sound started");
      } catch (fallbackError) {
        console.error("🔊 Fallback continuous sound also failed:", fallbackError);
      }
    }
  };

  const stopCompletionSound = () => {
    console.log("🔇 STOP SOUND: stopCompletionSound called");
    
    // Use the audio manager to stop timer sound
    audioManager.stopTimerSound();
    
    // Also stop all sounds as backup
    audioManager.stopAllTimerSounds();
    
    console.log("🔇 STOP SOUND: All cleanup methods executed");
  };

  const handleNotificationDismiss = () => {
    console.log("🔇 User dismissed pomodoro notification - stopping sound and hiding notification");
    setShowCompletionNotification(false);
    stopCompletionSound();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log("🔊 POMODORO COMPLETED! Starting completion sound...");
            setIsRunning(false);
            setIsCompleted(true);
            setShowCompletionNotification(true);
            
            // Play looping completion sound
            playCompletionSound();
            
            onSessionComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onSessionComplete]);

  // Stop sound when component unmounts
  useEffect(() => {
    return () => {
      console.log("PomodoroTimer unmounting, stopping sound");
      stopCompletionSound();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTypeChange = (type: SessionType) => {
    stopCompletionSound(); // Stop sound when changing session type
    setShowCompletionNotification(false); // Hide notification when changing session type
    setSessionType(type);
    setTimeLeft(durations[type]);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const handleReset = () => {
    stopCompletionSound(); // Stop sound when resetting
    setShowCompletionNotification(false); // Hide notification when resetting
    setTimeLeft(durations[sessionType]);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const progress = ((durations[sessionType] - timeLeft) / durations[sessionType]) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-semibold font-mono" data-testid="text-timer">
              {formatTime(timeLeft)}
            </span>
            {isCompleted && (
              <span className="text-xs text-primary mt-1 font-medium">Completed!</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            onClick={() => {
              if (isCompleted) {
                stopCompletionSound(); // Stop sound when starting new session
                setIsCompleted(false);
                setShowCompletionNotification(false);
              }
              setIsRunning(!isRunning);
            }}
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
          {isCompleted && (
            <Button
              size="sm"
              variant="outline"
              onClick={stopCompletionSound}
              data-testid="button-stop-sound"
            >
              Stop Sound
            </Button>
          )}
        </div>
      </div>

      {/* Persistent Timer Completion Notification */}
      <TimerCompletionNotification
        isVisible={showCompletionNotification}
        sessionTitle={`${sessionType.charAt(0).toUpperCase() + sessionType.slice(1).replace('-', ' ')} Session`}
        sessionDuration={Math.round(durations[sessionType] / 60)}
        isBreakSession={sessionType.includes('break')}
        onDismiss={handleNotificationDismiss}
      />
    </>
  );
}
