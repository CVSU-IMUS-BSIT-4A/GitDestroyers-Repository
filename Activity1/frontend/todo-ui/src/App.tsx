import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, fetchTasks, updateTask } from './api';
import type { Task } from './api';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const incompleteCount = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);

  async function handleCreate(title: string, description?: string) {
    const created = await createTask({ title, description });
    setTasks(prev => [created, ...prev]);
  }

  async function handleToggle(task: Task) {
    const updated = await updateTask(task.id, { completed: !task.completed });
    setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
  }

  async function handleUpdate(task: Task, title: string, description?: string) {
    const updated = await updateTask(task.id, { title, description });
    setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
  }

  async function handleDelete(task: Task) {
    await deleteTask(task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui, Arial' }}>
      <h1>To-Do List</h1>
      <p>{incompleteCount} remaining</p>
      <TaskForm onCreate={handleCreate} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <TaskList tasks={tasks} onToggle={handleToggle} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
}


