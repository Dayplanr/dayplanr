import { Zap, Smartphone, Moon, CheckCircle2, Clock, Brain, Activity, Apple, Target, TrendingUp, Heart, Flame, Star, AlertTriangle } from "lucide-react";
import type { InsightIconType } from "@/lib/insightEngine";

interface InsightCardProps {
  title: string;
  description: string;
  iconType: InsightIconType;
  compact?: boolean;
}

const iconConfig: Record<InsightIconType, { icon: React.ComponentType<any>; bg: string; color: string }> = {
  peak:        { icon: Zap,          bg: "bg-emerald-500/10",  color: "text-emerald-600 dark:text-emerald-400" },
  distraction: { icon: Smartphone,   bg: "bg-amber-500/10",    color: "text-amber-600 dark:text-amber-400" },
  energy:      { icon: Moon,         bg: "bg-indigo-500/10",   color: "text-indigo-600 dark:text-indigo-400" },
  consistency: { icon: CheckCircle2, bg: "bg-blue-500/10",     color: "text-blue-600 dark:text-blue-400" },
  time:        { icon: Clock,        bg: "bg-orange-500/10",   color: "text-orange-600 dark:text-orange-400" },
  focus:       { icon: Brain,        bg: "bg-purple-500/10",   color: "text-purple-600 dark:text-purple-400" },
  overwhelm:   { icon: Activity,     bg: "bg-rose-500/10",     color: "text-rose-600 dark:text-rose-400" },
  health:      { icon: Apple,        bg: "bg-green-500/10",    color: "text-green-600 dark:text-green-400" },
  goal:        { icon: Target,       bg: "bg-violet-500/10",   color: "text-violet-600 dark:text-violet-400" },
  habit:       { icon: Flame,        bg: "bg-orange-500/10",   color: "text-orange-600 dark:text-orange-400" },
  mood:        { icon: Heart,        bg: "bg-pink-500/10",     color: "text-pink-600 dark:text-pink-400" },
  streak:      { icon: Star,         bg: "bg-yellow-500/10",   color: "text-yellow-600 dark:text-yellow-400" },
  warning:     { icon: AlertTriangle,bg: "bg-amber-500/10",    color: "text-amber-600 dark:text-amber-400" },
  default:     { icon: TrendingUp,   bg: "bg-primary/10",      color: "text-primary" },
};

export default function InsightCard({ title, description, iconType, compact = false }: InsightCardProps) {
  const config = iconConfig[iconType] || iconConfig.default;
  const Icon = config.icon;

  if (compact) {
    return (
      <div className="flex-shrink-0 w-[220px] bg-card border border-border/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default">
        <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center mb-3`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <p className="text-xs font-semibold text-foreground mb-1 leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-[260px] bg-card border border-border/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-default">
      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
      <p className="text-sm font-semibold text-foreground mb-2 leading-tight">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
