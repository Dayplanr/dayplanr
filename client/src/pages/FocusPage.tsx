import { useState } from "react";
import PomodoroTimer from "@/components/PomodoroTimer";
import StatsCard from "@/components/StatsCard";
import SessionHistory from "@/components/SessionHistory";
import { Clock, Calendar, TrendingUp, Zap } from "lucide-react";
import { subHours } from "date-fns";

export default function FocusPage() {
  const [distractionCount, setDistractionCount] = useState(3);

  const sessions = [
    { id: "1", startTime: subHours(new Date(), 1), duration: 25, distractions: 2 },
    { id: "2", startTime: subHours(new Date(), 3), duration: 50, distractions: 1 },
    { id: "3", startTime: subHours(new Date(), 5), duration: 25, distractions: 3 },
    { id: "4", startTime: subHours(new Date(), 7), duration: 25, distractions: 0 },
  ];

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Focus</h1>
          <p className="text-sm text-muted-foreground">Deep work sessions with Pomodoro technique</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex flex-col items-center p-6 bg-card border border-card-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">Current Task</p>
              <PomodoroTimer onSessionComplete={() => console.log("Session complete!")} />
            </div>

            <div className="p-4 bg-card border border-card-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">Distractions Today</h3>
                <button
                  onClick={() => setDistractionCount((prev) => prev + 1)}
                  className="text-xs text-primary hover-elevate active-elevate-2 px-2 py-1 rounded-md"
                  data-testid="button-add-distraction"
                >
                  + Add
                </button>
              </div>
              <p className="text-3xl font-semibold font-mono" data-testid="text-distraction-count">
                {distractionCount}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatsCard icon={Clock} label="Today" value="2h 45m" subtext="4 sessions" />
              <StatsCard icon={Calendar} label="This Week" value="18h 30m" subtext="avg 2h 37m/day" />
              <StatsCard icon={TrendingUp} label="This Month" value="76h 15m" subtext="avg 2h 28m/day" />
              <StatsCard icon={Zap} label="Best Time" value="9-11 AM" subtext="highest focus" />
            </div>

            <SessionHistory sessions={sessions} />
          </div>
        </div>
      </div>
    </div>
  );
}
