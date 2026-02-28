import { useTranslation } from "@/lib/i18n";
import { useLocation } from "wouter";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HabitsWidgetProps {
    currentStreak: number;
    completedHabits: number;
    totalHabits: number;
}

export default function HabitsWidget({ currentStreak, completedHabits, totalHabits }: HabitsWidgetProps) {
    const { t } = useTranslation();
    const [, navigate] = useLocation();

    return (
        <Card
            className="w-full h-full overflow-hidden border-none shadow-soft glass-card flex flex-col cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => navigate("/habits")}
        >
            <CardContent className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full" />
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 relative ring-1 ring-orange-500/20">
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t("habits")}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <p className="text-2xl font-black text-foreground">
                            {currentStreak}<span className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-tight">d</span>
                        </p>
                        <div className="h-4 w-px bg-border/50 mx-1" />
                        <p className="text-lg font-bold text-muted-foreground">
                            {completedHabits}<span className="text-xs font-semibold">/{totalHabits}</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
