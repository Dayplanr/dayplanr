import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import type { ScheduleType } from "@/types/habits";

interface HeatmapCalendarProps {
  month: Date;
  completedDates: string[];
  scheduleType?: ScheduleType;
  selectedDays?: string[];
  themeColor?: string;
}

const HEATMAP_DAY_MAP: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export default function HeatmapCalendar({
  month,
  completedDates,
  scheduleType,
  selectedDays = [],
  themeColor = "hsl(var(--primary))",
}: HeatmapCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);
  // firstDayOfWeek: 0(Sun), 1(Mon), 2(Tue), 3(Wed), 4(Thu), 5(Fri), 6(Sat)
  // For Mon-Sun order, empty cells should be:
  // Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6
  const emptyCellsCount = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const emptyCells = Array(emptyCellsCount).fill(null);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const isCompleted = completedDates.includes(dateStr);

    const dayOfWeek = date.getDay();
    // Precise scheduling logic
    const isScheduled = scheduleType === "weekdays"
      ? selectedDays.includes(HEATMAP_DAY_MAP[dayOfWeek])
      : true;

    return { isCompleted, isScheduled, dateStr };
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="text-[10px] text-center text-muted-foreground font-bold">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const { isCompleted, isScheduled, dateStr } = getDayStatus(day);

          let bgColor = "transparent";
          let textColor = "text-muted-foreground";
          let borderColor = "border-border";

          if (isCompleted) {
            bgColor = themeColor;
            textColor = "text-white font-medium";
            borderColor = "border-transparent";
          } else if (isScheduled) {
            // Soft pastel highlighting for explicitly scheduled days
            bgColor = "hsla(var(--primary), 0.15)";
            borderColor = "hsla(var(--primary), 0.2)";
            textColor = "text-primary font-medium";
          }

          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-sm border flex items-center justify-center transition-colors ${borderColor}`}
              style={{
                backgroundColor: bgColor,
              }}
              data-testid={`heatmap-cell-${dateStr}`}
            >
              <span className={`text-[10px] ${textColor}`}>
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
