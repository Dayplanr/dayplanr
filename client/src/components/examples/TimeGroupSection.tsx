import { useState } from 'react';
import TimeGroupSection from '../TimeGroupSection';

export default function TimeGroupSectionExample() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Morning workout', time: '7:00 AM', priority: 'high' as const, completed: false, hasTimer: true },
    { id: '2', title: 'Breakfast and planning', time: '8:00 AM', priority: 'medium' as const, completed: false },
  ]);

  const handleToggle = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="p-4">
      <TimeGroupSection title="Morning" tasks={tasks} onToggleTask={handleToggle} />
    </div>
  );
}
