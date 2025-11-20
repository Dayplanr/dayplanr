import { useState } from 'react';
import TaskCard from '../TaskCard';

export default function TaskCardExample() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Morning workout', time: '7:00 AM', priority: 'high' as const, completed: false, hasTimer: true },
    { id: '2', title: 'Team standup meeting', time: '9:30 AM', priority: 'medium' as const, completed: false, hasReminder: true },
    { id: '3', title: 'Review project proposals', priority: 'low' as const, completed: true },
  ]);

  const handleToggle = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-2 p-4">
      {tasks.map(task => (
        <TaskCard key={task.id} {...task} onToggleComplete={handleToggle} />
      ))}
    </div>
  );
}
