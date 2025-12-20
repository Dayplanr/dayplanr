import FocusModeCard from '../FocusModeCard';

export default function FocusModeCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <FocusModeCard
        mode="pomodoro"
        title="Pomodoro"
        description="25 min work · 5 min break"
        onStart={() => console.log('Start Pomodoro')}
      />
      <FocusModeCard
        mode="deepwork"
        title="Deep Work"
        description="90 minutes of uninterrupted focus"
        onStart={() => console.log('Start Deep Work')}
      />
    </div>
  );
}
