import { FormEvent, useState } from 'react';

type Props = {
  onCreate: (title: string, description?: string, dueDate?: string | null, priority?: 'low' | 'medium' | 'high') => void | Promise<void>;
};

export function TaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreate(title.trim(), description.trim() || undefined, dueDate || null, priority);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 8, marginBottom: 16 }}>
      <input
        className="input"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        required
      />
      <textarea
        className="textarea"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={3}
      />
      <div className="grid grid-2">
        <div>
          <div className="label">Due date</div>
          <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div>
          <div className="label">Priority</div>
          <select className="select" value={priority} onChange={e => setPriority(e.target.value as any)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="button primary" type="submit">Add Task</button>
      </div>
    </form>
  );
}


