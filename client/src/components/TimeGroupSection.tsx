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
  return (
    <div className="mb-2">
      <div className="flex items-center w-full px-2 py-3 rounded-md">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} onToggleComplete={onToggleTask} />
        ))}
      </div>
    </div>
  );
}
