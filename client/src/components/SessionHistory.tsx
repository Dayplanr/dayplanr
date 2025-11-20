import { format } from "date-fns";

interface Session {
  id: string;
  startTime: Date;
  duration: number;
  distractions: number;
}

interface SessionHistoryProps {
  sessions: Session[];
}

export default function SessionHistory({ sessions }: SessionHistoryProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Recent Sessions</h3>
      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 p-3 bg-card border border-card-border rounded-md"
            data-testid={`session-${session.id}`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium">
                {format(session.startTime, "h:mm a")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDuration(session.duration)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold font-mono">{session.distractions}</p>
              <p className="text-xs text-muted-foreground">distractions</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
