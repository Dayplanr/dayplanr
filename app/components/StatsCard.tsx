import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
}

export default function StatsCard({ icon: Icon, label, value, subtext }: StatsCardProps) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-semibold font-mono" data-testid={`text-stats-${label.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
