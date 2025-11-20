import ChallengeCard from '../ChallengeCard';

export default function ChallengeCardExample() {
  const participants = [
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Smith' },
    { id: '3', name: 'Carol White' },
    { id: '4', name: 'David Brown' },
  ];

  return (
    <div className="p-4 max-w-md">
      <ChallengeCard
        title="21-Day Fitness Challenge"
        daysRemaining={14}
        totalDays={21}
        progress={68}
        participants={participants}
      />
    </div>
  );
}
