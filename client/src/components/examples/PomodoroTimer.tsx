import PomodoroTimer from '../PomodoroTimer';

export default function PomodoroTimerExample() {
  return (
    <div className="p-4 flex items-center justify-center">
      <PomodoroTimer onSessionComplete={() => console.log('Session complete!')} />
    </div>
  );
}
