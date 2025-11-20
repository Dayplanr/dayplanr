import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  trend: "up" | "stable" | "down";
}

export default function TrendIndicator({ trend }: TrendIndicatorProps) {
  const icons = {
    up: TrendingUp,
    stable: Minus,
    down: TrendingDown,
  };

  const colors = {
    up: "text-green-600",
    stable: "text-muted-foreground",
    down: "text-destructive",
  };

  const Icon = icons[trend];

  return (
    <div className={`flex items-center gap-1 ${colors[trend]}`}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium capitalize">{trend}</span>
    </div>
  );
}
