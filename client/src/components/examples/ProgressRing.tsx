import ProgressRing from '../ProgressRing';

export default function ProgressRingExample() {
  return (
    <div className="flex gap-4 p-4">
      <ProgressRing progress={25} />
      <ProgressRing progress={50} />
      <ProgressRing progress={75} />
    </div>
  );
}
