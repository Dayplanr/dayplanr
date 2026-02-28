import { useTranslation } from "@/lib/i18n";
import { useLocation } from "wouter";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FocusWidgetProps {
    todayFocusMinutes: number;
}

export default function FocusWidget({ todayFocusMinutes }: FocusWidgetProps) {
    const { t } = useTranslation();
    const [, navigate] = useLocation();

    return (
        <Card
            className="w-full h-full overflow-hidden border-none shadow-soft glass-card flex flex-col cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => navigate("/focus")}
        >
            <CardContent className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 relative ring-1 ring-blue-500/20">
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{t("focusTime")}</p>
                    <p className="text-2xl font-black text-foreground mt-1">
                        {todayFocusMinutes}<span className="text-sm font-bold ml-1 text-muted-foreground">m</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
