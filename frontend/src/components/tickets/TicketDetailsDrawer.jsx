import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  X,
  Clock,
  CheckCircle2,
  CircleDot,
  Calendar,
  GitCommit,
  ExternalLink,
  Trash2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTicket, useUpdateTicketStatus } from '../../hooks/useTickets.js';
import { StatusBadge } from '../ui/StatusBadge.jsx';
import { PriorityBadge } from '../ui/PriorityBadge.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { formatTicketId, getStatusColors } from '../../lib/utils.js';
import { TicketNotes } from './TicketNotes.jsx';

const STATUSES = ['Open', 'In Progress', 'Resolved'];

function StatusIcon({ status }) {
  switch (status) {
    case 'Open': return <CircleDot className="w-4 h-4 text-amber-400" />;
    case 'In Progress': return <Clock className="w-4 h-4 text-blue-400" />;
    case 'Resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    default: return <CircleDot className="w-4 h-4 text-zinc-400" />;
  }
}

function TimelineEvent({ event, isLast }) {
  const statusCfg = getStatusColors(event.newStatus);
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-7 h-7 rounded-lg ${statusCfg.iconBg} flex items-center justify-center`}>
          <StatusIcon status={event.newStatus} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-[#212121] my-1" />}
      </div>
      <div className={`pb-4 min-w-0 ${isLast ? 'pb-1' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {event.previousStatus ? (
            <span className="text-xs text-[#737373]">
              <span className="text-[#A3A3A3] font-medium">{event.previousStatus}</span>
              <span className="mx-1.5 text-indigo-400">→</span>
              <span className="font-bold text-white">{event.newStatus}</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-white">Ticket Created</span>
          )}
          <StatusBadge status={event.newStatus} />
        </div>
        <p className="text-[11px] text-[#737373] font-mono mt-1">
          {format(new Date(event.changedAt), 'MMM d, yyyy · h:mm a')}
        </p>
      </div>
    </div>
  );
}

export function TicketDetailsDrawer({ ticketId, onClose, onDelete }) {
  const navigate = useNavigate();
  const { data: ticket, isLoading, isError, error } = useTicket(ticketId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTicketStatus();

  if (!ticketId) return null;

  const handleStatusChange = (newStatus) => {
    if (newStatus === ticket?.status) return;
    updateStatus(
      { id: ticketId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Status updated to "${newStatus}"`);
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to update status');
        },
      }
    );
  };

  const history = ticket?.statusHistory || [];
  const sortedHistory = [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">

      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-xl bg-[#0C0D12] border-l border-[#1F212D] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

          <div className="px-6 py-4.5 border-b border-[#1C1C24] flex items-center justify-between bg-[#0E0F17]">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {formatTicketId(ticketId)}
              </span>
              <span className="text-xs text-[#737373]">Ticket Details Drawer</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/tickets/${ticketId}`);
                }}
                className="p-1.5 rounded-lg text-[#8C8C8C] hover:text-white hover:bg-[#1E1E28] transition-colors"
                title="Open Dedicated Page"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8C8C8C] hover:text-white hover:bg-[#1E1E28] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>


          <div className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : isError ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Error loading ticket</p>
                <p className="text-xs text-[#737373]">{error?.message || 'Ticket could not be retrieved.'}</p>
              </div>
            ) : (
              <>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {ticket.subject}
                    </h3>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-xs text-[#737373]">in</span>
                    <span className="text-xs font-semibold text-white bg-[#151620] px-2.5 py-0.5 rounded-md border border-[#232536]">
                      {ticket.category}
                    </span>
                    <span className="text-xs text-[#555566] ml-auto font-mono">
                      Created {format(new Date(ticket.createdAt), 'MMM d, yyyy · h:mm a')}
                    </span>
                  </div>
                </div>


                <div className="rounded-xl border border-[#1F212D] bg-[#12131A] p-4.5 space-y-2">
                  <h4 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">Description</h4>
                  <div className="text-xs text-[#D4D4D4] leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>


                <div className="rounded-xl border border-[#1F212D] bg-[#12131A] p-4.5 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Update Status</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUSES.map((s) => {
                      const cfg = getStatusColors(s);
                      const isCurrent = ticket.status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleStatusChange(s)}
                          disabled={isUpdating || isCurrent}
                          className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                            isCurrent
                              ? `${cfg.badge} border-opacity-70 shadow-sm cursor-default`
                              : 'border border-[#222432] bg-[#161722] text-[#8E92A4] hover:bg-[#1C1E2C] hover:text-white disabled:opacity-50'
                          }`}
                        >
                          <StatusIcon status={s} />
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>


                <div className="rounded-xl border border-[#1F212D] bg-[#12131A] p-4.5 space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-[#1C1C28]">
                    <GitCommit className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Status Change History
                    </h4>
                    <span className="ml-auto text-[10px] font-mono text-[#737373]">
                      {sortedHistory.length} event{sortedHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {sortedHistory.length === 0 ? (
                    <p className="text-xs text-[#737373]">No audit history recorded.</p>
                  ) : (
                    <div className="pt-1">
                      {sortedHistory.map((event, idx) => (
                        <TimelineEvent
                          key={idx}
                          event={event}
                          isLast={idx === sortedHistory.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>


                <TicketNotes ticketId={ticketId} />
              </>
            )}
          </div>


          {ticket && (
            <div className="p-4 border-t border-[#1C1C24] bg-[#0E0F17] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onDelete(ticket);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Ticket</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold bg-[#1C1E2A] text-white hover:bg-[#252838] rounded-lg transition-colors"
              >
                Close Drawer
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
