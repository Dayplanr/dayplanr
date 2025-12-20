import { format, addDays, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarScrubberProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function CalendarScrubber({ selectedDate, onSelectDate }: CalendarScrubberProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    onSelectDate(addDays(selectedDate, -7));
  };

  const goToNextWeek = () => {
    onSelectDate(addDays(selectedDate, 7));
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={goToPreviousWeek}
        data-testid="button-previous-week"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex gap-2 flex-1 justify-center">
        {days.map((day) => {
          const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              data-testid={`button-date-${format(day, "yyyy-MM-dd")}`}
              className={`flex flex-col items-center justify-center min-w-[56px] p-2 rounded-md hover-elevate active-elevate-2 ${
                isSelected ? "bg-primary text-primary-foreground" : ""
              } ${isToday && !isSelected ? "border-2 border-primary" : ""}`}
            >
              <span className="text-xs font-medium">{format(day, "EEE")}</span>
              <span className="text-lg font-semibold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={goToNextWeek}
        data-testid="button-next-week"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
