import { FormEvent, useState } from 'react';

type Props = {
  onCreate: (title: string, description?: string) => void | Promise<void>;
};

export function TaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreate(title.trim(), description.trim() || undefined);
    setTitle('');
    setDescription('');
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        required
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={3}
      />
      <button type="submit">Add Task</button>
    </form>
  );
}


