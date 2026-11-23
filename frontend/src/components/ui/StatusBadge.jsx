import { getStatusColors } from '../../lib/utils.js';

export function StatusBadge({ status }) {
  const colors = getStatusColors(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium tracking-wide ${colors.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      <span>{status}</span>
    </span>
  );
}
