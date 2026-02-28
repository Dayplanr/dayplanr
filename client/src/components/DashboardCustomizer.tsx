import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings2, GripVertical, Check, Eye, EyeOff } from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

export interface DashboardConfig {
    modules: {
        summary: boolean;
        focus: boolean;
        habits: boolean;
        insights: boolean;
    };
    order: string[];
}

interface DashboardCustomizerProps {
    config: DashboardConfig;
    onUpdate: (newConfig: DashboardConfig) => void;
}

const moduleLabels: Record<string, string> = {
    summary: "dailyProgress",
    focus: "focusTime",
    habits: "habits",
    insights: "insights",
};

export default function DashboardCustomizer({ config, onUpdate }: DashboardCustomizerProps) {
    const { t } = useTranslation();
    const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);

    const handleToggle = (moduleId: keyof DashboardConfig["modules"]) => {
        const newConfig = {
            ...localConfig,
            modules: {
                ...localConfig.modules,
                [moduleId]: !localConfig.modules[moduleId],
            },
        };
        setLocalConfig(newConfig);
        onUpdate(newConfig);
    };

    const handleReorder = (newOrder: string[]) => {
        const newConfig = {
            ...localConfig,
            order: newOrder,
        };
        setLocalConfig(newConfig);
        onUpdate(newConfig);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 border-border/50 bg-background/50 hover:bg-accent backdrop-blur-sm"
                >
                    <Settings2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">{t("customize")}</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">{t("customizeDashboard")}</SheetTitle>
                    <SheetDescription>
                        {t("customizeDashboardDescription")}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-8">
                    <Reorder.Group
                        axis="y"
                        values={localConfig.order}
                        onReorder={handleReorder}
                        className="space-y-4"
                    >
                        {localConfig.order.map((moduleId) => (
                            <Reorder.Item
                                key={moduleId}
                                value={moduleId}
                                className="group bg-card border border-border/50 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-grab active:cursor-grabbing"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">
                                            {t(moduleLabels[moduleId] as any)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {localConfig.modules[moduleId as keyof DashboardConfig["modules"]]
                                                ? t("moduleVisible")
                                                : t("moduleHidden")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        size="icon"
                                        variant={localConfig.modules[moduleId as keyof DashboardConfig["modules"]] ? "default" : "outline"}
                                        className={`w-10 h-10 rounded-full transition-all ${localConfig.modules[moduleId as keyof DashboardConfig["modules"]]
                                            ? "shadow-lg shadow-primary/20"
                                            : "opacity-50"
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggle(moduleId as keyof DashboardConfig["modules"]);
                                        }}
                                    >
                                        {localConfig.modules[moduleId as keyof DashboardConfig["modules"]] ? (
                                            <Eye className="w-4 h-4" />
                                        ) : (
                                            <EyeOff className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                <div className="absolute bottom-8 left-6 right-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary font-medium flex items-center gap-2">
                        <Check className="w-3 h-3" />
                        Changes are saved automatically
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
