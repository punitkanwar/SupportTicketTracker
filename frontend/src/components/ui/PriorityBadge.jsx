import { getPriorityColors } from '../../lib/utils.js';

const priorityIcons = {
  Low: '↓',
  Medium: '→',
  High: '↑',
  Urgent: '⚡',
};

export function PriorityBadge({ priority }) {
  const config = getPriorityColors(priority);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="text-[11px] font-semibold">{priorityIcons[priority] || '•'}</span>
      <span>{priority}</span>
    </span>
  );
}
