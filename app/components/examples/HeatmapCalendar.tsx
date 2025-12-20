import HeatmapCalendar from '../HeatmapCalendar';
import { format, subDays } from 'date-fns';

export default function HeatmapCalendarExample() {
  const completedDates = [
    format(new Date(), 'yyyy-MM-dd'),
    format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    format(subDays(new Date(), 7), 'yyyy-MM-dd'),
  ];

  return (
    <div className="p-4 max-w-sm">
      <HeatmapCalendar month={new Date()} completedDates={completedDates} />
    </div>
  );
}
