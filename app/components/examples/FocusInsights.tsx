import FocusInsights from '../FocusInsights';
import { format, subDays } from 'date-fns';

export default function FocusInsightsExample() {
  const weekData = [
    { day: 'Mon', pomodoro: 3, deepwork: 1, custom: 0 },
    { day: 'Tue', pomodoro: 4, deepwork: 2, custom: 1 },
    { day: 'Wed', pomodoro: 2, deepwork: 1, custom: 0 },
    { day: 'Thu', pomodoro: 5, deepwork: 0, custom: 2 },
    { day: 'Fri', pomodoro: 3, deepwork: 2, custom: 1 },
    { day: 'Sat', pomodoro: 1, deepwork: 1, custom: 0 },
    { day: 'Sun', pomodoro: 2, deepwork: 0, custom: 0 },
  ];

  const monthData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
    minutes: Math.floor(Math.random() * 120) + 10,
  }));

  const yearData = [
    { month: 'Jan', minutes: 850 },
    { month: 'Feb', minutes: 920 },
    { month: 'Mar', minutes: 780 },
    { month: 'Apr', minutes: 1100 },
    { month: 'May', minutes: 950 },
    { month: 'Jun', minutes: 1200 },
    { month: 'Jul', minutes: 880 },
    { month: 'Aug', minutes: 1050 },
    { month: 'Sep', minutes: 1150 },
    { month: 'Oct', minutes: 1350 },
    { month: 'Nov', minutes: 980 },
    { month: 'Dec', minutes: 450 },
  ];

  return (
    <div className="p-4 max-w-md">
      <FocusInsights
        todayMinutes={145}
        todaySessions={6}
        weekData={weekData}
        monthData={monthData}
        yearData={yearData}
      />
    </div>
  );
}
