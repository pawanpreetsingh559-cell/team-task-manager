export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const COLORS = [
  '#6366f1','#a855f7','#ec4899','#f59e0b','#10b981',
  '#06b6d4','#ef4444','#8b5cf6','#14b8a6','#f97316'
];

export function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
}

export function getDaysLeft(dueDate) {
  if (!dueDate) return null;
  const diff = new Date(dueDate) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return '1d left';
  return `${days}d left`;
}

export const STATUS_CONFIG = {
  'todo':        { label: 'To Do',      color: 'var(--text3)',    dot: '#6b6b85' },
  'in-progress': { label: 'In Progress',color: 'var(--info)',     dot: '#06b6d4' },
  'in-review':   { label: 'In Review',  color: 'var(--warning)',  dot: '#f59e0b' },
  'done':        { label: 'Done',       color: 'var(--success)',  dot: '#22c55e' },
};

export const PRIORITY_CONFIG = {
  'low':    { label: 'Low',    color: 'var(--success)' },
  'medium': { label: 'Medium', color: 'var(--warning)' },
  'high':   { label: 'High',   color: 'var(--danger)'  },
  'urgent': { label: 'Urgent', color: '#ff0000'         },
};
