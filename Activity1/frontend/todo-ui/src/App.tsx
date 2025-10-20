import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { createTask, deleteTask, fetchTasks, updateTask } from './api';
import type { Task } from './api';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [dueOnly, setDueOnly] = useState<'all' | 'overdue' | 'dueSoon'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'alpha'>('created');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  const [selectMode, setSelectMode] = useState<boolean>(false);

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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('theme-light');
    else root.classList.remove('theme-light');
    // Smooth theme fade
    root.style.transition = 'background-color .3s ease, color .3s ease';
  }, [theme]);

  const incompleteCount = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);
  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (statusFilter !== 'all') {
      list = list.filter(t => (statusFilter === 'active' ? !t.completed : t.completed));
    }
    if (priorityFilter !== 'all') {
      list = list.filter(t => t.priority === priorityFilter);
    }
    if (dueOnly !== 'all') {
      const now = new Date();
      const soon = new Date();
      soon.setDate(soon.getDate() + 3);
      list = list.filter(t => {
        const d = t.dueDate ? new Date(t.dueDate) : null;
        if (!d) return false;
        return dueOnly === 'overdue' ? d < now && !t.completed : d >= now && d <= soon;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'alpha':
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'updated':
        list = [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'created':
      default:
        list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [tasks, query, statusFilter, priorityFilter, dueOnly, sortBy]);

  async function handleCreate(title: string, description?: string, dueDate?: string | null, priority?: 'low' | 'medium' | 'high') {
    const created = await createTask({ title, description, dueDate: dueDate ?? undefined, priority });
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
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });
  }

  function handleToggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll(ids: number[], checked: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) ids.forEach(id => next.add(id));
      else ids.forEach(id => next.delete(id));
      return next;
    });
  }

  async function handleBulkComplete(ids: number[]) {
    const updates = await Promise.all(
      ids.map(id => {
        const task = tasks.find(t => t.id === id);
        if (!task) return Promise.resolve(null);
        return updateTask(id, { completed: true });
      })
    );
    setTasks(prev => prev.map(t => updates.find(u => u && u.id === t.id) ?? t));
  }

  async function handleBulkDelete(ids: number[]) {
    await Promise.all(ids.map(id => deleteTask(id)));
    setTasks(prev => prev.filter(t => !ids.includes(t.id)));
    setSelectedIds(new Set());
  }

  function toggleSelectMode() {
    setSelectMode(m => {
      const next = !m;
      if (!next) setSelectedIds(new Set());
      return next;
    });
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">To‑Do</h1>
          <div className="pill">{incompleteCount} remaining</div>
        </div>
        <div className="row">
          <button className="button" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>

      <motion.div layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 26 }}>
        <TaskForm onCreate={handleCreate} />
      </motion.div>

      <motion.div className="controls" style={{ marginBottom: 12 }} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 26 }}>
        <input
          className="input"
          placeholder="Search title or description"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="created">Newest</option>
          <option value="updated">Recently Updated</option>
          <option value="alpha">A → Z</option>
        </select>
        <select className="select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)}>
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <div className="controls-actions">
          <button className="button" onClick={toggleSelectMode}>{selectMode ? 'Cancel select' : 'Select'}</button>
        </div>
      </motion.div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <TaskList
        tasks={filteredTasks}
        selectMode={selectMode}
        selectedIds={selectedIds}
        onToggleSelect={selectMode ? handleToggleSelect : undefined}
        onSelectAll={checked => selectMode && handleSelectAll(filteredTasks.map(t => t.id), checked)}
        onBulkComplete={() => handleBulkComplete(Array.from(selectedIds))}
        onBulkDelete={() => handleBulkDelete(Array.from(selectedIds))}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}


