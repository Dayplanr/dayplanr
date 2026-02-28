import { useTranslation } from "@/lib/i18n";
import ProgressRing from "@/components/ProgressRing";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryWidgetProps {
    progressPercent: number;
    completedTasks: number;
    totalTasks: number;
}

export default function SummaryWidget({ progressPercent, completedTasks, totalTasks }: SummaryWidgetProps) {
    const { t } = useTranslation();

    return (
        <Card className="w-full h-full overflow-hidden border-none shadow-soft glass-card flex flex-col">
            <CardContent className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-primary/5">
                <ProgressRing progress={progressPercent} size={120} strokeWidth={10} color="hsl(var(--primary))" />
                <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t("dailyProgress")}</p>
                    <p className="text-sm font-black text-foreground mt-1">
                        {completedTasks} <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">{t("of")}</span> {totalTasks}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
