import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Timer, Rocket, Zap, Brain, Coffee } from "lucide-react";

interface CustomTimer {
  id: string;
  name: string;
  duration: number;
  breakDuration: number;
  icon: string;
}

interface CreateTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTimer: (timer: CustomTimer) => void;
}

export default function CreateTimerDialog({ open, onOpenChange, onCreateTimer }: CreateTimerDialogProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState([30]);
  const [breakDuration, setBreakDuration] = useState([5]);
  const [selectedIcon, setSelectedIcon] = useState("timer");

  const icons = [
    { id: "timer", icon: Timer, label: "Timer" },
    { id: "rocket", icon: Rocket, label: "Rocket" },
    { id: "zap", icon: Zap, label: "Lightning" },
    { id: "brain", icon: Brain, label: "Brain" },
    { id: "coffee", icon: Coffee, label: "Coffee" },
  ];

  useEffect(() => {
    if (!open) {
      setName("");
      setDuration([30]);
      setBreakDuration([5]);
      setSelectedIcon("timer");
    }
  }, [open]);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateTimer({
      id: Date.now().toString(),
      name: name.trim(),
      duration: duration[0],
      breakDuration: breakDuration[0],
      icon: selectedIcon,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Custom Timer</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="timer-name">Timer Name</Label>
            <Input
              id="timer-name"
              placeholder="e.g., Morning Focus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-timer-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Focus Duration: {duration[0]} minutes</Label>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={5}
              max={120}
              step={5}
              data-testid="slider-duration"
            />
          </div>

          <div className="space-y-2">
            <Label>Break Duration: {breakDuration[0]} minutes</Label>
            <Slider
              value={breakDuration}
              onValueChange={setBreakDuration}
              min={0}
              max={30}
              step={1}
              data-testid="slider-break"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2">
              {icons.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(id)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedIcon === id
                      ? "border-primary bg-primary/10"
                      : "border-border hover-elevate"
                  }`}
                  title={label}
                  data-testid={`button-icon-${id}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="w-full"
            disabled={!name.trim()}
            data-testid="button-create-timer-submit"
          >
            Create Timer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
