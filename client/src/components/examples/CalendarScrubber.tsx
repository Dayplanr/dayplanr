import { useState } from 'react';
import CalendarScrubber from '../CalendarScrubber';

export default function CalendarScrubberExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-4">
      <CalendarScrubber selectedDate={selectedDate} onSelectDate={setSelectedDate} />
    </div>
  );
}
