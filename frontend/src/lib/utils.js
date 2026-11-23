import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function formatTicketId(id) {
  if (!id) return '#—';
  return `#${id.toString().slice(-6).toUpperCase()}`;
}


export function getStatusColors(status) {
  switch (status) {
    case 'Open':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      };
    case 'In Progress':
      return {
        badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
        dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      };
    case 'Resolved':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      };
    default:
      return {
        badge: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
        dot: 'bg-zinc-400',
        text: 'text-zinc-400',
        bg: 'bg-zinc-500/10',
        border: 'border-zinc-500/20',
        iconBg: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
      };
  }
}


export function getPriorityColors(priority) {
  switch (priority) {
    case 'Low':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
        dot: 'bg-emerald-400',
        text: 'text-emerald-400',
        bar: '#10B981',
      };
    case 'Medium':
      return {
        badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
        dot: 'bg-yellow-400',
        text: 'text-yellow-400',
        bar: '#EAB308',
      };
    case 'High':
      return {
        badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/25',
        dot: 'bg-orange-400',
        text: 'text-orange-400',
        bar: '#F97316',
      };
    case 'Urgent':
      return {
        badge: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
        dot: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        text: 'text-red-400',
        bar: '#EF4444',
      };
    default:
      return {
        badge: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
        dot: 'bg-zinc-400',
        text: 'text-zinc-400',
        bar: '#71717A',
      };
  }
}
