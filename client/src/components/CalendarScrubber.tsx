import { format, addDays, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="flex items-center gap-4 py-2 px-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={goToPreviousWeek}
        className="rounded-full h-8 w-8 hover:bg-accent/50"
        data-testid="button-previous-week"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </Button>
      <div className="flex gap-2 flex-1 justify-between overflow-x-auto no-scrollbar">
        {days.map((day) => {
          const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          return (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day)}
              data-testid={`button-date-${format(day, "yyyy-MM-dd")}`}
              className={`flex flex-col items-center justify-center min-w-[48px] py-3 rounded-2xl transition-all duration-300 ${isSelected
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "hover:bg-accent/50 text-muted-foreground"
                } ${isToday && !isSelected ? "ring-1 ring-primary/30" : ""}`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground/50"
                }`}>
                {format(day, "EEE")}
              </span>
              <span className="text-sm font-black">
                {format(day, "d")}
              </span>
              {isToday && !isSelected && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={goToNextWeek}
        className="rounded-full h-8 w-8 hover:bg-accent/50"
        data-testid="button-next-week"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
