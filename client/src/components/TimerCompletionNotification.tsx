import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerCompletionNotificationProps {
  isVisible: boolean;
  sessionTitle: string;
  sessionDuration: number;
  isBreakSession?: boolean;
  onDismiss: () => void;
}

export default function TimerCompletionNotification({
  isVisible,
  sessionTitle,
  sessionDuration,
  isBreakSession = false,
  onDismiss,
}: TimerCompletionNotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);

  // Prevent background interactions when notification is visible
  useEffect(() => {
    if (isVisible) {
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
      
      // Focus the notification for accessibility
      if (notificationRef.current) {
        notificationRef.current.focus();
      }
    } else {
      // Restore scrolling
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  // Handle keyboard events (only allow Escape to close)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isVisible && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onDismiss();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isVisible, onDismiss]);

  // Prevent clicks outside the notification from dismissing it
  const handleBackdropClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Do nothing - only the X button can dismiss
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-completion-title"
      aria-describedby="timer-completion-description"
    >
      {/* Close Button - Positioned above the card in top-right corner */}
      <div className="relative">
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className={cn(
            "absolute -top-4 -right-4 z-10 h-10 w-10 p-0 rounded-full",
            "hover:bg-red-100 dark:hover:bg-red-900",
            "border-2 border-red-500 bg-red-50 dark:bg-red-950",
            "text-red-600 dark:text-red-400",
            "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            "shadow-lg hover:shadow-xl transition-all duration-200",
            "hover:scale-110 active:scale-95"
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-5 w-5" />
        </Button>

        <Card
          ref={notificationRef}
          className={cn(
            "w-full max-w-md mx-4 shadow-2xl border-2 animate-in zoom-in-95 duration-300",
            isBreakSession 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
              : "border-green-500 bg-green-50 dark:bg-green-950"
          )}
          tabIndex={-1}
        >
          <CardContent className="p-8 text-center">
            {/* Success Icon */}
            <div className={cn(
              "mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center",
              isBreakSession 
                ? "bg-blue-100 dark:bg-blue-800" 
                : "bg-green-100 dark:bg-green-800"
            )}>
              <CheckCircle className={cn(
                "w-8 h-8",
                isBreakSession 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-green-600 dark:text-green-400"
              )} />
            </div>

            {/* Title */}
            <h2 
              id="timer-completion-title"
              className={cn(
                "text-2xl font-bold mb-2",
                isBreakSession 
                  ? "text-blue-900 dark:text-blue-100" 
                  : "text-green-900 dark:text-green-100"
              )}
            >
              {isBreakSession ? 'Break Complete!' : 'Focus Session Complete!'}
            </h2>

            {/* Description */}
            <div 
              id="timer-completion-description"
              className="space-y-2 text-gray-700 dark:text-gray-300"
            >
              <p className="text-lg font-medium">{sessionTitle}</p>
              <p className="text-sm">
                You {isBreakSession ? 'took a break for' : 'focused for'} {formatDuration(sessionDuration)}
              </p>
            </div>

            {/* Pulsing indicator to show it's active */}
            <div className={cn(
              "mt-6 mx-auto w-3 h-3 rounded-full animate-pulse",
              isBreakSession 
                ? "bg-blue-500" 
                : "bg-green-500"
            )} />

            {/* Instructions */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Click the red X button above to dismiss this notification
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}