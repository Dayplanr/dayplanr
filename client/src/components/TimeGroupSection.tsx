import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import TaskCard from "./TaskCard";

interface Task {
  id: string;
  title: string;
  time?: string;
  priority?: "high" | "medium" | "low";
  hasTimer?: boolean;
  hasReminder?: boolean;
  completed: boolean;
}

interface TimeGroupSectionProps {
  title: string;
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

export default function TimeGroupSection({ title, tasks, onToggleTask }: TimeGroupSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover-elevate active-elevate-2" data-testid={`button-toggle-${title.toLowerCase()}`}>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} onToggleComplete={onToggleTask} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
