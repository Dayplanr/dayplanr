import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

interface HeatmapCalendarProps {
  month: Date;
  completedDates: string[];
  themeColor?: string;
}

export default function HeatmapCalendar({
  month,
  completedDates,
  themeColor = "hsl(var(--primary))",
}: HeatmapCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const firstDayOfWeek = getDay(monthStart);
  const emptyCells = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);

  const getOpacity = (dateStr: string) => {
    if (completedDates.includes(dateStr)) return "100%";
    return "0%";
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="text-xs text-center text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const opacity = getOpacity(dateStr);
          return (
            <div
              key={dateStr}
              className="aspect-square rounded-sm border border-border flex items-center justify-center"
              style={{
                backgroundColor: opacity === "100%" ? themeColor : "transparent",
                opacity: opacity === "100%" ? 0.7 : 1,
              }}
              data-testid={`heatmap-cell-${dateStr}`}
            >
              <span className={`text-xs ${opacity === "100%" ? "text-white font-medium" : "text-muted-foreground"}`}>
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
