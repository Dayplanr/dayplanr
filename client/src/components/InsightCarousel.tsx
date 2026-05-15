import { Sparkles } from "lucide-react";
import InsightCard from "@/components/InsightCard";
import type { Insight } from "@/lib/insightEngine";

interface InsightCarouselProps {
  insights: Insight[];
  compact?: boolean;
  label?: string;
}

export default function InsightCarousel({ insights, compact = true, label = "Insights" }: InsightCarouselProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-3 px-0.5">
        <Sparkles className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {insights.map(insight => (
          <div key={insight.id} className="snap-start">
            <InsightCard
              title={insight.title}
              description={insight.description}
              iconType={insight.iconType}
              compact={compact}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
