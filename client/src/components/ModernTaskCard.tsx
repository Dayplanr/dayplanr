import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Bell, Tag, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${completed
                ? "bg-muted/40 opacity-75"
                : "bg-card hover:bg-accent/5 hover:shadow-lg hover:shadow-primary/5 border border-border/50"
                }`}
        >
            {/* Selection Area / Toggle Button */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className={`relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors duration-300 flex items-center justify-center ${completed
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30 group-hover:border-primary/50"
                    }`}
            >
                {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                ) : (
                    <motion.div
                        initial={false}
                        animate={{ scale: completed ? 1 : 0 }}
                        className="w-2 h-2 rounded-full bg-primary"
                    />
                )}
            </motion.button>

            {/* Content Area */}
            <div className="flex-1 min-w-0" onClick={onToggle}>
                <div className="flex flex-col mb-1.5">
                    <div className="flex items-center gap-2">
                        <p className={`font-medium truncate transition-all duration-300 ${completed ? "text-muted-foreground line-through" : "text-foreground"
                            }`}>
                            {title}
                        </p>
                        {priority === "high" && !completed && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </div>
                    {description && (
                        <p className={`text-xs mt-0.5 truncate transition-all duration-300 ${completed ? "text-muted-foreground/60 line-through" : "text-muted-foreground"}`}>
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {time && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{time}</span>
                        </div>
                    )}

                    {duration && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-full">
                            <span>{duration}</span>
                        </div>
                    )}

                    {category && category !== "None" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                            <Tag className="w-3 h-3 text-primary/70" />
                            <span className="text-[10px] font-medium text-primary/80 capitalize">
                                {category}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {hasReminder && !completed && (
                    <Bell className="w-4 h-4 text-muted-foreground/60" />
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 rounded-xl">
                        <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />
                            {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Priority Indicator Dot on far right */}
            {!completed && (
                <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full ${priorityColors[priority]}`}
                />
            )}
        </motion.div>
    );
}
