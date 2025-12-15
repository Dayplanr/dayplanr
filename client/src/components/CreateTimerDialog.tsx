import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, Timer, Rocket, Zap, Brain, Coffee } from "lucide-react";

interface CustomTimer {
  id: string;
  name: string;
  duration: number;
  breakDuration: number;
  icon: string;
}

interface CreateTimerDialogProps {
  onCreateTimer: (timer: CustomTimer) => void;
}

export default function CreateTimerDialog({ onCreateTimer }: CreateTimerDialogProps) {
  const [open, setOpen] = useState(false);
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

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateTimer({
      id: Date.now().toString(),
      name: name.trim(),
      duration: duration[0],
      breakDuration: breakDuration[0],
      icon: selectedIcon,
    });
    setName("");
    setDuration([30]);
    setBreakDuration([5]);
    setSelectedIcon("timer");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" data-testid="button-create-timer">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
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
            <Label>Choose Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(id)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center hover-elevate active-elevate-2 ${
                    selectedIcon === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  data-testid={`button-icon-${id}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Focus Duration</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {duration[0]} min
              </span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={5}
              max={120}
              step={5}
              data-testid="slider-duration"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Break Duration</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {breakDuration[0]} min
              </span>
            </div>
            <Slider
              value={breakDuration}
              onValueChange={setBreakDuration}
              min={0}
              max={30}
              step={1}
              data-testid="slider-break"
            />
          </div>

          <Button className="w-full" onClick={handleCreate} data-testid="button-save-timer">
            Create Timer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
