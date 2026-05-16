import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, Bell, Tag, MoreVertical, Pencil, Trash2, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type TranslationKey } from "@/lib/i18n";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModernTaskCardProps {
    id: string;
    title: string;
    description?: string;
    time?: string;
    priority: "high" | "medium" | "low";
    completed: boolean;
    hasReminder?: boolean;
    duration?: string;
    category?: string;
    goalName?: string;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    t: (key: TranslationKey) => string;
}

const priorityColors = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
};

export default function ModernTaskCard({
    id,
    title,
    description,
    time,
    priority,
    completed,
    hasReminder,
    duration,
    category,
    goalName,
    onToggle,
    onEdit,
    onDelete,
    t,
}: ModernTaskCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2, scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            transition={{ duration: 0.2 }}
            className={`group relative flex items-center gap-4 p-5 rounded-[24px] transition-all duration-500 ${completed
                ? "bg-muted/30 opacity-70 grayscale-[0.5]"
                : "bg-card hover:bg-background border border-border/40 shadow-soft hover:shadow-premium ring-1 ring-inset ring-transparent hover:ring-primary/5"
                }`}
        >
            {/* Selection Area / Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className={`relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${completed
                    ? "bg-primary border-primary shadow-lg shadow-primary/20"
                    : "border-muted-foreground/20 group-hover:border-primary/40 bg-background/50"
                    }`}
            >
                <AnimatePresence mode="wait">
                    {completed ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                        >
                            <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="circle"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors"
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Content Area */}
            <div className="flex-1 min-w-0" onClick={onToggle}>
                <div className="flex flex-col mb-2">
                    <div className="flex items-center gap-2">
                        <p className={`font-semibold tracking-tight transition-all duration-500 ${completed ? "text-muted-foreground/60 line-through" : "text-foreground text-[15px]"
                            }`}>
                            {title}
                        </p>
                        {priority === "high" && !completed && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                        )}
                    </div>
                    {description && (
                        <p className={`text-[13px] mt-0.5 line-clamp-1 transition-all duration-500 ${completed ? "text-muted-foreground/40 line-through" : "text-muted-foreground/80 font-medium"
                            }`}>
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {time && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            <span>{time}</span>
                        </div>
                    )}

                    {goalName && !completed && (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-violet-500/5 border border-violet-500/10 transition-colors group-hover:bg-violet-500/10">
                            <Target className="w-3 h-3 text-violet-500/70" />
                            <span className="text-[10px] font-bold text-violet-600/80 dark:text-violet-400/80 uppercase tracking-tight truncate max-w-[140px]">
                                {goalName}
                            </span>
                        </div>
                    )}

                    {category && category !== "None" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/5 border border-primary/10">
                            <Tag className="w-3 h-3 text-primary/60" />
                            <span className="text-[10px] font-bold text-primary/70 uppercase tracking-tight">
                                {category}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {hasReminder && !completed && (
                    <div className="p-2">
                        <Bell className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-9 w-9 rounded-xl hover:bg-muted/80"
                        >
                            <MoreVertical className="w-4 h-4 text-muted-foreground/70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 p-1.5 rounded-[20px] shadow-premium border-border/40 animate-in fade-in zoom-in duration-200">
                        <DropdownMenuItem onClick={onEdit} className="gap-2.5 py-2.5 px-3 cursor-pointer rounded-xl focus:bg-primary/5 transition-colors">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t("edit")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="gap-2.5 py-2.5 px-3 cursor-pointer rounded-xl text-destructive focus:text-destructive focus:bg-destructive/5 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">{t("delete")}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Priority Indicator Dot on far right */}
            {!completed && (
                <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-l-full opacity-60 group-hover:opacity-100 transition-opacity ${priorityColors[priority]}`}
                />
            )}
        </motion.div>
    );
}
