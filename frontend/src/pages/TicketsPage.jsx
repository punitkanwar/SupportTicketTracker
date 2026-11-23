import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTickets, useDeleteTicket, useUpdateTicketStatus } from '../hooks/useTickets.js';
import { ticketService } from '../services/ticketService.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { AppHeader } from '../components/layout/AppHeader.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { TicketRowActions } from '../components/tickets/TicketRowActions.jsx';
import { TicketDetailsDrawer } from '../components/tickets/TicketDetailsDrawer.jsx';
import { formatTicketId } from '../lib/utils.js';
import { getWorkspacePreferences } from './SettingsPage.jsx';

const STATUSES = ['Open', 'In Progress', 'Resolved'];
const CATEGORIES = ['Technical', 'Billing', 'Account', 'General', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

function FilterSelect({ label, value, options, onChange }) {
  const isSelected = !!value;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 pl-3.5 pr-8 text-xs rounded-lg appearance-none cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#181824] border border-indigo-500/50 text-white font-medium'
            : 'bg-[#111111] border border-[#242424] text-[#A3A3A3] hover:border-[#383838] hover:text-white'
        } focus:border-indigo-500 focus:text-white focus:outline-none`}
      >
        <option value="" className="bg-[#141414] text-[#737373]">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#141414] text-white">{opt}</option>
        ))}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none text-[10px]">▾</span>
    </div>
  );
}

function SortButton({ label, field, sortBy, sortOrder, onSort }) {
  const isActive = sortBy === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#737373] hover:text-white transition-colors"
    >
      <span>{label}</span>
      {isActive ? (
        sortOrder === 'desc' ? (
          <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-30" />
      )}
    </button>
  );
}


function DeleteDialog({ ticket, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-[#111111] border border-[#262626] rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-base font-bold text-white mb-2">Delete Ticket</h3>
        <p className="text-xs text-[#A3A3A3] mb-6 leading-relaxed">
          Are you sure you want to permanently delete <span className="font-semibold text-white">"{ticket.subject}"</span>? This will remove all associated audit history.
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

export default function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();


  const initialStatus = searchParams.get('status') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPriority = searchParams.get('priority') || '';

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState(initialPriority);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isExporting, setIsExporting] = useState(false);


  useEffect(() => {
    const s = searchParams.get('status') || '';
    const c = searchParams.get('category') || '';
    const p = searchParams.get('priority') || '';
    setStatus(s);
    setCategory(c);
    setPriority(p);
    setPage(1);
  }, [searchParams]);


  const [activeTicketId, setActiveTicketId] = useState(null);

  const prefs = getWorkspacePreferences();
  const pageSize = Number(prefs.ticketsPerPage) || 10;

  const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicket();
  const { mutate: updateStatus } = useUpdateTicketStatus();


  const { data: urgentQuery } = useTickets({ priority: 'Urgent', limit: 1 });
  const urgentCount = urgentQuery?.pagination?.total || 0;

  const debouncedSetSearch = useDebounce(
    useCallback((val) => {
      setSearch(val);
      setPage(1);
    }, []),
    400
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const handleFilterChange = (setter, paramKey) => (val) => {
    setter(val);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(paramKey, val);
    } else {
      next.delete(paramKey);
    }
    setSearchParams(next);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const hasFilters = Boolean(search || status || category || priority);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setCategory('');
    setPriority('');
    setPage(1);
    setSearchParams({});
  };

  const params = { page, limit: pageSize, search, status, category, priority, sortBy, sortOrder };
  const { data, isLoading, isError, error, refetch } = useTickets(params);

  const tickets = data?.tickets || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0, limit: pageSize };

  const handleDeleteConfirm = () => {
    deleteTicket(deleteTarget._id, {
      onSuccess: () => {
        toast.success('Ticket deleted successfully');
        if (activeTicketId === deleteTarget._id) {
          setActiveTicketId(null);
        }
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to delete ticket');
        setDeleteTarget(null);
      },
    });
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatus(
      { id, status: newStatus },
      {
        onSuccess: () => toast.success(`Status updated to "${newStatus}"`),
        onError: (err) => toast.error(err?.message || 'Failed to update status'),
      }
    );
  };


  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      const dataToExport = await ticketService.getTickets({
        search,
        status,
        category,
        priority,
        sortBy,
        sortOrder,
        limit: 1000,
        page: 1,
      });

      const exportList = dataToExport?.tickets || tickets;

      if (!exportList || exportList.length === 0) {
        toast.info('No tickets found to export.');
        setIsExporting(false);
        return;
      }

      const headers = ['Ticket ID', 'Subject', 'Category', 'Priority', 'Status', 'Description', 'Created At', 'Updated At'];
      const rows = exportList.map((t) => [
        `"${formatTicketId(t._id)}"`,
        `"${(t.subject || '').replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${t.priority || ''}"`,
        `"${t.status || ''}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm:ss')}"`,
        `"${format(new Date(t.updatedAt), 'yyyy-MM-dd HH:mm:ss')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resolvedesk-tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${exportList.length} tickets to CSV`);
    } catch (err) {
      toast.error('Failed to export tickets to CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#050505]">
      <AppHeader
        title="Tickets Management"
        breadcrumbs={[{ label: 'ResolveDesk' }, { label: 'Tickets' }]}
      />

      <div className="flex-1 p-7 max-w-7xl w-full mx-auto space-y-5">

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">

          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <input
                type="text"
                placeholder="Search by subject or description..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full h-9 pl-10 pr-8 text-xs bg-[#111111] border border-[#242424] rounded-lg text-white placeholder-[#616161] focus:border-indigo-500 focus:outline-none transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>


            <button
              type="button"
              onClick={() => {
                handleFilterChange(setPriority, 'priority')(priority === 'Urgent' ? '' : 'Urgent');
              }}
              className={`inline-flex items-center gap-2 h-9 px-3 text-xs font-semibold rounded-lg border transition-all flex-shrink-0 cursor-pointer ${
                priority === 'Urgent'
                  ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                  : 'bg-[#111111] text-[#A3A3A3] border-[#242424] hover:border-red-500/40 hover:text-red-400'
              }`}
              title="Quickly filter and triage Urgent tickets"
            >
              <span className={`w-2 h-2 rounded-full ${priority === 'Urgent' ? 'bg-red-400' : 'bg-red-500'} animate-pulse`} />
              <span>Urgent Triage</span>
              {urgentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  {urgentCount}
                </span>
              )}
            </button>
          </div>


          <div className="flex items-center gap-2 flex-wrap justify-start lg:justify-end">
            <FilterSelect label="Status" value={status} options={STATUSES} onChange={handleFilterChange(setStatus, 'status')} />
            <FilterSelect label="Category" value={category} options={CATEGORIES} onChange={handleFilterChange(setCategory, 'category')} />
            <FilterSelect label="Priority" value={priority} options={PRIORITIES} onChange={handleFilterChange(setPriority, 'priority')} />


            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting || isLoading || (tickets.length === 0 && pagination.total === 0)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-[#CCCCCC] bg-[#141414] border border-[#242424] rounded-lg hover:border-[#383838] hover:text-white hover:bg-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Export tickets matching current filters to CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>


        {hasFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#11121A] border border-indigo-500/25 animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#8E92A4] font-medium flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active Filters:</span>
              </span>

              {priority && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  priority === 'Urgent'
                    ? 'bg-red-500/15 border border-red-500/40 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                    : 'bg-[#181A26] border border-[#2B2E42] text-white'
                }`}>
                  <span>Priority: <strong>{priority}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange(setPriority, 'priority')('')}
                    className="hover:text-white p-0.5 rounded cursor-pointer"
                    title="Remove priority filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {status && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                  <span>Status: <strong>{status}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange(setStatus, 'status')('')}
                    className="hover:text-white p-0.5 rounded cursor-pointer"
                    title="Remove status filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/15 border border-indigo-500/40 text-indigo-300">
                  <span>Category: <strong>{category}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange(setCategory, 'category')('')}
                    className="hover:text-white p-0.5 rounded cursor-pointer"
                    title="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1C1E2C] border border-[#2E3146] text-[#E0E2F0]">
                  <span>Search: "<strong>{search}</strong>"</span>
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                    className="hover:text-white p-0.5 rounded cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#8C90A8] font-mono text-[11px]">
                {pagination.total} ticket{pagination.total !== 1 ? 's' : ''} matching
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}


        <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] overflow-hidden shadow-xs">
          {isError ? (
            <ErrorState message={error?.message} onRetry={refetch} />
          ) : (
            <>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1C1C1C] bg-[#0A0A0A]">
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#737373] w-24">ID</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#737373]">Subject & Preview</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#737373] w-32">Category</th>
                      <th className="px-5 py-3.5 text-xs w-32">
                        <SortButton label="Priority" field="priority" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#737373] w-32">Status</th>
                      <th className="px-5 py-3.5 text-xs w-36">
                        <SortButton label="Created" field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                      </th>
                      <th className="px-5 py-3.5 w-16 text-right" />
                    </tr>
                  </thead>

                  {isLoading ? (
                    <SkeletonTable rows={8} />
                  ) : tickets.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            title={hasFilters ? 'No tickets match the selected filters' : 'No tickets in the system yet'}
                            description={hasFilters ? 'Try clearing your filters to see all tickets.' : 'Submit your first support ticket to begin.'}
                            action={!hasFilters ? 'Create Ticket' : undefined}
                          />
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody className="divide-y divide-[#1A1A1A]">
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket._id}
                          onClick={() => setActiveTicketId(ticket._id)}
                          className="hover:bg-[#161616] cursor-pointer transition-colors group"
                        >

                          <td className="px-5 py-4 font-mono text-xs font-medium text-indigo-400 group-hover:text-indigo-300 align-top pt-4">
                            {formatTicketId(ticket._id)}
                          </td>


                          <td className="px-5 py-4 max-w-md">
                            <span className="text-xs font-semibold text-[#E5E5E5] group-hover:text-white truncate block">
                              {ticket.subject}
                            </span>
                            {ticket.description && (
                              <span className="text-[11px] text-[#737373] line-clamp-1 mt-0.5 leading-relaxed">
                                {ticket.description}
                              </span>
                            )}
                          </td>


                          <td className="px-5 py-4 align-top pt-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#161616] border border-[#242424] text-[#A3A3A3]">
                              {ticket.category}
                            </span>
                          </td>


                          <td className="px-5 py-4 align-top pt-4">
                            <PriorityBadge priority={ticket.priority} />
                          </td>


                          <td className="px-5 py-4 align-top pt-4">
                            <StatusBadge status={ticket.status} />
                          </td>


                          <td className="px-5 py-4 text-xs text-[#737373] whitespace-nowrap font-mono align-top pt-4">
                            {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                          </td>


                          <td className="px-5 py-4 text-right align-top pt-3" onClick={(e) => e.stopPropagation()}>
                            <TicketRowActions
                              ticket={ticket}
                              onDelete={setDeleteTarget}
                              onStatusChange={handleStatusChange}
                              onViewDetails={() => setActiveTicketId(ticket._id)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>


              <div className="md:hidden divide-y divide-[#1A1A1A]">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-24 rounded-lg bg-[#141414] animate-pulse" />
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <EmptyState
                    title={hasFilters ? 'No tickets found' : 'No tickets yet'}
                    description={hasFilters ? 'Adjust search or filters.' : 'Create your first ticket.'}
                    action={!hasFilters ? 'Create Ticket' : undefined}
                  />
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setActiveTicketId(ticket._id)}
                      className="p-4.5 hover:bg-[#161616] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{formatTicketId(ticket._id)}</span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <StatusBadge status={ticket.status} />
                          <TicketRowActions
                            ticket={ticket}
                            onDelete={setDeleteTarget}
                            onStatusChange={handleStatusChange}
                            onViewDetails={() => setActiveTicketId(ticket._id)}
                          />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white mb-1.5 leading-snug">{ticket.subject}</p>
                      {ticket.description && (
                        <p className="text-xs text-[#737373] line-clamp-2 mb-3 leading-relaxed">
                          {ticket.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={ticket.priority} />
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#161616] border border-[#242424] text-[#8C8C8C]">
                          {ticket.category}
                        </span>
                        <span className="text-xs text-[#737373] ml-auto font-mono">
                          {format(new Date(ticket.createdAt), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>


              {!isLoading && tickets.length > 0 && (
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>


      <TicketDetailsDrawer
        ticketId={activeTicketId}
        onClose={() => setActiveTicketId(null)}
        onDelete={(ticket) => setDeleteTarget(ticket)}
      />


      {deleteTarget && (
        <DeleteDialog
          ticket={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
