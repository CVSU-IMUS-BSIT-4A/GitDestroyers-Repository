import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from './api';

type Props = {
  tasks: Task[];
  selectMode?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
  onSelectAll?: (checked: boolean) => void;
  onBulkComplete?: () => void | Promise<void>;
  onBulkDelete?: () => void | Promise<void>;
  onToggle: (task: Task) => void | Promise<void>;
  onUpdate: (task: Task, title: string, description?: string) => void | Promise<void>;
  onDelete: (task: Task) => void | Promise<void>;
};

export function TaskList({ tasks, selectMode, selectedIds, onToggleSelect, onSelectAll, onBulkComplete, onBulkDelete, onToggle, onUpdate, onDelete }: Props) {
  const allVisibleIds = useMemo(() => tasks.map(t => t.id), [tasks]);
  const selectedCount = selectedIds ? tasks.filter(t => selectedIds.has(t.id)).length : 0;
  const [confirming, setConfirming] = useState<null | { id: number; title: string }>(null);

  return (
    <div>
      {selectMode && (
      <div className="row" style={{ marginBottom: 8 }}>
        {onSelectAll && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              className="checkbox checkbox-select"
              checked={selectedIds ? selectedCount === tasks.length && tasks.length > 0 : false}
              onChange={e => onSelectAll(e.target.checked)}
            />
            Select all
          </label>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {onBulkComplete && <button className="button" disabled={!selectedCount} onClick={onBulkComplete}>Mark completed</button>}
          {onBulkDelete && <button className="button" disabled={!selectedCount} onClick={onBulkDelete}>Delete selected</button>}
        </div>
      </div>
      )}

      <ul className="list">
        <AnimatePresence initial={false}>
          {tasks.map(task => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.6 }}
              className="card"
            >
              <TaskItem
                task={task}
                selected={selectedIds?.has(task.id) ?? false}
                selectMode={!!selectMode}
                onToggleSelect={onToggleSelect}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={(task) => setConfirming({ id: task.id, title: task.title })}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {confirming && (
        <div className="overlay" role="dialog" aria-modal="true">
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: -10, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: .98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <h3 className="modal-title">Delete task?</h3>
            <div className="item-desc">This action cannot be undone.</div>
            <div className="modal-actions">
              <button className="button" onClick={() => setConfirming(null)}>Cancel</button>
              <button
                className="button danger"
                onClick={async () => {
                  const id = confirming.id;
                  setConfirming(null);
                  const task = tasks.find(t => t.id === id);
                  if (task) await onDelete(task);
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, selected, selectMode, onToggleSelect, onToggle, onUpdate, onDelete }: Omit<Props, 'tasks' | 'selectedIds' | 'onSelectAll' | 'onBulkComplete' | 'onBulkDelete'> & { task: Task; selected?: boolean; selectMode?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');

  async function handleSave() {
    await onUpdate(task, title.trim(), description.trim() || undefined);
    setIsEditing(false);
  }

  return (
    <li className="card">
      <div className="item">
        {selectMode && onToggleSelect && (
          <input className="checkbox checkbox-select" type="checkbox" checked={!!selected} onChange={() => onToggleSelect(task.id)} />
        )}
        <button
          className={`button chip ${task.completed ? 'success' : 'muted'}`}
          onClick={() => onToggle(task)}
          aria-pressed={task.completed}
        >
          {task.completed ? 'Completed' : 'Mark complete'}
        </button>
        {!isEditing ? (
          <div className="item-main">
            <div className="item-title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {task.description && <div className="item-desc">{task.description}</div>}
              {task.priority && <span className="chip">Priority: {task.priority}</span>}
              {task.dueDate && (
                <span className={`chip ${(!task.completed && new Date(task.dueDate) < new Date()) ? 'danger' : 'muted'}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="item-main grid" style={{ gap: 6 }}>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
        )}
        {!isEditing ? (
          <>
            <button className="button" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="button" onClick={() => onDelete(task)}>Delete</button>
          </>
        ) : (
          <>
            <button className="button primary" onClick={handleSave}>Save</button>
            <button className="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        )}
      </div>
    </li>
  );
}


