import { useState } from 'react';
import type { Task } from './api';

type Props = {
  tasks: Task[];
  onToggle: (task: Task) => void | Promise<void>;
  onUpdate: (task: Task, title: string, description?: string) => void | Promise<void>;
  onDelete: (task: Task) => void | Promise<void>;
};

export function TaskList({ tasks, onToggle, onUpdate, onDelete }: Props) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />)
      )}
    </ul>
  );
}

function TaskItem({ task, onToggle, onUpdate, onDelete }: Omit<Props, 'tasks'> & { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');

  async function handleSave() {
    await onUpdate(task, title.trim(), description.trim() || undefined);
    setIsEditing(false);
  }

  return (
    <li style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task)} />
        {!isEditing ? (
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
            {task.description && <div style={{ color: '#555' }}>{task.description}</div>}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'grid', gap: 6 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} />
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
        )}
        {!isEditing ? (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(task)}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        )}
      </div>
    </li>
  );
}


