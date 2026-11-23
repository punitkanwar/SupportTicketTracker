import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Trash2,
  Clock,
  CheckCircle2,
  CircleDot,
  Tag,
  Calendar,
  RefreshCw,
  GitCommit,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTicket, useUpdateTicketStatus, useDeleteTicket } from '../hooks/useTickets.js';
import { AppHeader } from '../components/layout/AppHeader.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { formatTicketId, getStatusColors } from '../lib/utils.js';
import { TicketNotes } from '../components/tickets/TicketNotes.jsx';

const STATUSES = ['Open', 'In Progress', 'Resolved'];

function StatusIcon({ status }) {
  switch (status) {
    case 'Open': return <CircleDot className="w-4 h-4 text-amber-400" />;
    case 'In Progress': return <Clock className="w-4 h-4 text-blue-400" />;
    case 'Resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    default: return <CircleDot className="w-4 h-4 text-zinc-400" />;
  }
}

function DeleteDialog({ onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-[#111111] border border-[#262626] rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-base font-bold text-white mb-2">Delete Ticket</h3>
        <p className="text-xs text-[#A3A3A3] mb-6 leading-relaxed">
          This ticket and its audit log will be permanently removed. This action cannot be reversed.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-medium border border-[#2B2B2B] bg-[#161616] text-[#A3A3A3] rounded-lg hover:bg-[#202020] hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            {isDeleting ? 'Deleting...' : 'Delete Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ event, isFirst, isLast }) {
  const statusCfg = getStatusColors(event.newStatus);
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-7 h-7 rounded-lg ${statusCfg.iconBg} flex items-center justify-center`}>
          <StatusIcon status={event.newStatus} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-[#212121] my-1" />}
      </div>
      <div className={`pb-5 min-w-0 ${isLast ? 'pb-1' : ''}`}>
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

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const { data: ticket, isLoading, isError, error, refetch } = useTicket(id);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTicketStatus();
  const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicket();

  const handleStatusChange = (newStatus) => {
    if (newStatus === ticket?.status) return;
    setStatusChanging(true);
    updateStatus(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Status updated to "${newStatus}"`);
          setStatusChanging(false);
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to update status');
          setStatusChanging(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteTicket(id, {
      onSuccess: () => {
        toast.success('Ticket deleted successfully');
        navigate('/tickets');
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to delete ticket');
        setShowDeleteDialog(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 bg-[#050505]">
        <AppHeader title="Ticket Details" breadcrumbs={[{ label: 'Tickets', to: '/tickets' }, { label: '...' }]} />
        <div className="p-7 max-w-5xl mx-auto w-full grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-52 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const is404 = error?.message?.includes('not found') || error?.message?.includes('404');
    return (
      <div className="flex flex-col flex-1 bg-[#050505]">
        <AppHeader title="Ticket Not Found" breadcrumbs={[{ label: 'Tickets', to: '/tickets' }]} />
        <div className="flex-1 flex flex-col items-center justify-center p-7 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center mb-2">
            <Tag className="w-5 h-5 text-[#737373]" />
          </div>
          <p className="text-base font-bold text-white">{is404 ? 'Ticket not found' : 'Error loading ticket'}</p>
          <p className="text-xs text-[#737373] max-w-sm mb-4">
            {is404 ? 'The requested ticket ID does not exist or was deleted.' : error?.message}
          </p>
          <div className="flex items-center gap-2.5">
            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-[#2B2B2B] bg-[#141414] text-[#A3A3A3] rounded-lg hover:bg-[#1E1E1E] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tickets
            </Link>
            {!is404 && (
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-[#2B2B2B] bg-[#141414] text-[#A3A3A3] rounded-lg hover:bg-[#1E1E1E] hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const history = ticket?.statusHistory || [];
  const sortedHistory = [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

  return (
    <div className="flex flex-col flex-1 bg-[#050505]">
      <AppHeader
        title={ticket?.subject || 'Ticket Details'}
        breadcrumbs={[
          { label: 'ResolveDesk' },
          { label: 'Tickets', to: '/tickets' },
          { label: formatTicketId(ticket?._id) },
        ]}
        actions={
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        }
      />

      <div className="flex-1 p-7 max-w-5xl w-full mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-6 space-y-5 shadow-xs">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-400">{formatTicketId(ticket._id)}</span>
                  <h2 className="text-lg font-bold text-white mt-1 leading-snug">{ticket.subject}</h2>
                </div>
                <StatusBadge status={ticket.status} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Description</h4>
                <div className="text-xs text-[#D4D4D4] leading-relaxed whitespace-pre-wrap bg-[#0E0E0E] p-4 rounded-lg border border-[#1F1F1F]">
                  {ticket.description}
                </div>
              </div>
            </div>


            <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1C1C1C]">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Status History Timeline</h3>
              </div>

              {sortedHistory.length === 0 ? (
                <p className="text-xs text-[#737373]">No history recorded yet.</p>
              ) : (
                <div className="pt-1">
                  {sortedHistory.map((event, index) => (
                    <TimelineEvent
                      key={index}
                      event={event}
                      isFirst={index === 0}
                      isLast={index === sortedHistory.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>


            <TicketNotes ticketId={id} />
          </div>


          <div className="space-y-5">

            <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 shadow-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">Change Status</h3>
              <div className="space-y-2">
                {STATUSES.map((s) => {
                  const cfg = getStatusColors(s);
                  const isCurrent = ticket.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={isUpdating || isCurrent}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isCurrent
                          ? `${cfg.badge} border-opacity-70 shadow-sm cursor-default`
                          : 'border border-[#212121] bg-[#141414] text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white hover:border-[#333333] disabled:opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <StatusIcon status={s} />
                        <span>{s}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>


            <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-[#1C1C1C]">
                Ticket Information
              </h3>
              <div>
                <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block mb-1.5">Priority</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block mb-1">Category</span>
                <span className="text-xs font-semibold text-white">{ticket.category}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block mb-1">Created At</span>
                <div className="flex items-center gap-2 text-xs text-[#A3A3A3] font-mono">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {format(new Date(ticket.createdAt), 'MMM d, yyyy · h:mm a')}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block mb-1">Last Updated</span>
                <div className="flex items-center gap-2 text-xs text-[#A3A3A3] font-mono">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {format(new Date(ticket.updatedAt), 'MMM d, yyyy · h:mm a')}
                </div>
              </div>
            </div>


            <Link
              to="/tickets"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold border border-[#262626] bg-[#111111] text-[#A3A3A3] rounded-lg hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Tickets List
            </Link>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteDialog
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
