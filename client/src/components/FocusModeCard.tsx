import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Timer, Rocket, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface FocusModeCardProps {
  mode: "pomodoro" | "deepwork" | "custom";
  title: string;
  description: string;
  onStart: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  customIcon?: React.ReactNode;
  customColor?: string;
}

export default function FocusModeCard({
  mode,
  title,
  description,
  onStart,
  onEdit,
  onDelete,
  customIcon,
  customColor,
}: FocusModeCardProps) {
  const getIconBackground = () => {
    if (customColor) return customColor;
    switch (mode) {
      case "pomodoro":
        return "bg-violet-100 dark:bg-violet-900/30";
      case "deepwork":
        return "bg-blue-100 dark:bg-blue-900/30";
      default:
        return "bg-muted";
    }
  };

  const getIconColor = () => {
    switch (mode) {
      case "pomodoro":
        return "text-violet-600 dark:text-violet-400";
      case "deepwork":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-foreground";
    }
  };

  const renderIcon = () => {
    if (customIcon) return customIcon;
    switch (mode) {
      case "pomodoro":
        return <Timer className={`w-6 h-6 ${getIconColor()}`} />;
      case "deepwork":
        return <Rocket className={`w-6 h-6 ${getIconColor()}`} />;
      default:
        return <Timer className={`w-6 h-6 ${getIconColor()}`} />;
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-focus-${mode}`}>
      <CardContent className="p-6 flex flex-col items-center text-center relative">
        {mode === "custom" && (onEdit || onDelete) && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5" data-testid={`button-manage-${title}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit} data-testid={`menu-edit-${title}`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive" data-testid={`menu-delete-${title}`}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className={`w-14 h-14 rounded-full ${getIconBackground()} flex items-center justify-center mb-4`}>
          {renderIcon()}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button className="w-full" onClick={onStart} data-testid={`button-start-${mode}`}>
          Start Session
        </Button>
      </CardContent>
    </Card>
  );
}
