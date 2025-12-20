import StatsCard from '../StatsCard';
import { Clock, Calendar, Zap } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <StatsCard icon={Clock} label="Today" value="2h 45m" subtext="4 sessions" />
      <StatsCard icon={Calendar} label="This Week" value="18h 30m" subtext="avg 2h 37m/day" />
      <StatsCard icon={Zap} label="Best Time" value="9-11 AM" subtext="highest focus" />
    </div>
  );
}
