import { useState } from 'react';
import HabitCard from '../HabitCard';
import { format, subDays } from 'date-fns';

export default function HabitCardExample() {
  const [hasTimer, setHasTimer] = useState(true);
  
  const completedDates = [
    format(new Date(), 'yyyy-MM-dd'),
    format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    format(subDays(new Date(), 5), 'yyyy-MM-dd'),
  ];

  return (
    <div className="p-4 max-w-md">
      <HabitCard
        title="Morning Meditation"
        streak={12}
        successRate={85}
        weeklyConsistency={90}
        monthlyConsistency={78}
        completedDates={completedDates}
        hasTimer={hasTimer}
        onToggleTimer={() => setHasTimer(!hasTimer)}
      />
    </div>
  );
}
