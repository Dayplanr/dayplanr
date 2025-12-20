import SessionHistory from '../SessionHistory';
import { subHours } from 'date-fns';

export default function SessionHistoryExample() {
  const sessions = [
    { id: '1', startTime: subHours(new Date(), 1), duration: 25, distractions: 2 },
    { id: '2', startTime: subHours(new Date(), 3), duration: 50, distractions: 1 },
    { id: '3', startTime: subHours(new Date(), 5), duration: 25, distractions: 3 },
  ];

  return (
    <div className="p-4 max-w-md">
      <SessionHistory sessions={sessions} />
    </div>
  );
}
