import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Rocket } from "lucide-react";

interface FocusModeCardProps {
  mode: "pomodoro" | "deepwork" | "custom";
  title: string;
  description: string;
  onStart: () => void;
  customIcon?: React.ReactNode;
  customColor?: string;
}

export default function FocusModeCard({
  mode,
  title,
  description,
  onStart,
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
      <CardContent className="p-6 flex flex-col items-center text-center">
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
