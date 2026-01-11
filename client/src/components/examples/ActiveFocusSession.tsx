import ActiveFocusSession from '../ActiveFocusSession';

export default function ActiveFocusSessionExample() {
  return (
    <div className="p-4 max-w-md">
      <ActiveFocusSession
        mode="pomodoro"
        title="Pomodoro"
        totalMinutes={25}
        breakMinutes={5}
        icon="timer"
        onComplete={() => console.log('Session complete!')}
        onCancel={() => console.log('Session cancelled')}
        onNotificationDismiss={() => console.log('Notification dismissed')}
      />
    </div>
  );
}
