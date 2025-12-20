import { useState } from 'react';
import GoalCard from '../GoalCard';
import { addDays } from 'date-fns';

export default function GoalCardExample() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Complete course modules', completed: true },
    { id: '2', title: 'Build practice project', completed: false },
    { id: '3', title: 'Get certification', completed: false },
  ]);

  const handleToggle = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="p-4 max-w-md">
      <GoalCard
        title="Learn React Development"
        category="Career"
        progress={65}
        trend="up"
        projectedCompletion={addDays(new Date(), 45)}
        keyTasks={tasks}
        onToggleTask={handleToggle}
      />
    </div>
  );
}
