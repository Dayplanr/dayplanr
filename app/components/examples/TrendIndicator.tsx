import TrendIndicator from '../TrendIndicator';

export default function TrendIndicatorExample() {
  return (
    <div className="flex gap-4 p-4">
      <TrendIndicator trend="up" />
      <TrendIndicator trend="stable" />
      <TrendIndicator trend="down" />
    </div>
  );
}
