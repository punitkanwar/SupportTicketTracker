import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  CircleDot,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu.jsx';

const STATUS_ICONS = {
  Open: CircleDot,
  'In Progress': Clock,
  Resolved: CheckCircle2,
};

const STATUS_COLORS = {
  Open: 'text-amber-400',
  'In Progress': 'text-blue-400',
  Resolved: 'text-emerald-400',
};

export function TicketRowActions({ ticket, onDelete, onStatusChange, onViewDetails }) {
  const navigate = useNavigate();
  const allStatuses = ['Open', 'In Progress', 'Resolved'];

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(ticket);
    } else {
      navigate(`/tickets/${ticket._id}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ticket ${ticket.subject}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#8C8C8C] hover:text-white hover:bg-[#1C1C1C] focus-visible:bg-[#1C1C1C] focus-visible:outline-none transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
        className="w-52 p-1.5"
      >
        <DropdownMenuItem
          onClick={handleViewDetails}
          className="gap-2.5 text-[#E5E5E5] focus:text-white"
        >
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>View Details</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Update Status</DropdownMenuLabel>

        {allStatuses.map((status) => {
          const isCurrent = ticket.status === status;
          const Icon = STATUS_ICONS[status] || CircleDot;
          const colorClass = STATUS_COLORS[status] || 'text-zinc-400';

          return (
            <DropdownMenuItem
              key={status}
              disabled={isCurrent}
              onClick={() => onStatusChange(ticket._id, status)}
              className="gap-2.5 text-xs text-[#A3A3A3] focus:text-white disabled:opacity-40"
            >
              <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
              <span className="flex-1">{status}</span>
              {isCurrent && (
                <span className="text-[10px] font-mono uppercase bg-[#1F1F1F] text-[#8C8C8C] px-1.5 py-0.5 rounded">
                  Current
                </span>
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onDelete(ticket)}
          className="gap-2.5 text-red-400 focus:text-red-300 focus:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Ticket</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
