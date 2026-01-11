import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, TestTube } from "lucide-react";
import { useTimerSound } from "@/hooks/useTimerSound";
import { audioManager } from "@/lib/audioManager";
import { startContinuousTimerSound } from "@/lib/timerSounds";
import TimerCompletionNotification from "./TimerCompletionNotification";

export default function TestTimer() {
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds for testing
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);
  const { timerSound } = useTimerSound();

  const playCompletionSound = async () => {
    console.log("🔊 TEST TIMER COMPLETED! Starting continuous completion sound...");
    console.log("🔊 Selected timer sound:", timerSound);
    
    try {
      const soundGenerator = async () => {
        console.log("🔊 Creating continuous sound for:", timerSound);
        return await startContinuousTimerSound(timerSound);
      };
      
      await audioManager.startContinuousTimerSound(soundGenerator);
      console.log("🔊 Continuous test timer completion sound started successfully");
    } catch (error) {
      console.error("🔊 Error playing test timer completion sound:", error);
      
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
    console.log("🔇 STOP SOUND: Test timer stopCompletionSound called");
    audioManager.stopTimerSound();
    audioManager.stopAllTimerSounds();
    console.log("🔇 STOP SOUND: All cleanup methods executed");
  };

  const handleNotificationDismiss = () => {
    console.log("🔇 User dismissed test timer notification - stopping sound and hiding notification");
    setShowCompletionNotification(false);
    stopCompletionSound();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log("🔊 TEST TIMER COMPLETED! Starting completion sound...");
            setIsRunning(false);
            setIsCompleted(true);
            setShowCompletionNotification(true);
            
            // Play looping notification sound
            playCompletionSound();
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Stop sound when component unmounts
  useEffect(() => {
    return () => {
      console.log("TestTimer unmounting, stopping sound");
      stopCompletionSound();
    };
  }, []);

  const formatTime = (seconds: number) => {
    return `00:${seconds.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    stopCompletionSound();
    setShowCompletionNotification(false);
    setTimeLeft(10); // Reset to 10 seconds
    setIsRunning(false);
    setIsCompleted(false);
  };

  const progress = ((10 - timeLeft) / 10) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <Card className="border-2 border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              Test Timer (10 seconds)
            </h3>
          </div>
          
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-6 text-center">
            This timer will complete in 10 seconds to test the persistent notification and sound system.
          </p>

          <div className="relative mb-6">
            <svg width="150" height="150" className="transform -rotate-90">
              <circle
                cx="75"
                cy="75"
                r="65"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="75"
                cy="75"
                r="65"
                stroke="hsl(var(--orange-500))"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference * 0.72} // Adjusted for smaller circle
                strokeDashoffset={strokeDashoffset * 0.72}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold font-mono text-orange-900 dark:text-orange-100">
                {formatTime(timeLeft)}
              </span>
              {isCompleted && (
                <span className="text-xs text-orange-600 mt-1 font-medium">Test Complete!</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="icon"
              onClick={() => {
                if (isCompleted) {
                  stopCompletionSound();
                  setIsCompleted(false);
                  setShowCompletionNotification(false);
                }
                setIsRunning(!isRunning);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleReset}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={stopCompletionSound}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Stop Sound
              </Button>
            )}
          </div>

          {isCompleted && (
            <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-300">
              <p className="text-sm text-orange-800 dark:text-orange-200 text-center">
                ✅ Timer completed! The notification should now be visible with continuous sound.
                <br />
                <span className="font-medium">Only the "X" button in the notification can stop it.</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Persistent Timer Completion Notification */}
      <TimerCompletionNotification
        isVisible={showCompletionNotification}
        sessionTitle="Test Focus Session"
        sessionDuration={1} // Show as 1 minute for display purposes
        isBreakSession={false}
        onDismiss={handleNotificationDismiss}
      />
    </>
  );
}