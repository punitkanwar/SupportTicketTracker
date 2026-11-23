import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Ticket,
  CircleDot,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  Activity,
  Layers,
  FolderKanban,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useDashboardStats } from '../hooks/useDashboard.js';
import { AppHeader } from '../components/layout/AppHeader.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { PriorityBadge } from '../components/ui/PriorityBadge.jsx';
import { SkeletonCard, Skeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { formatTicketId } from '../lib/utils.js';


function StatCard({ label, value, icon: Icon, theme = 'indigo', subtitle, loading, to }) {
  if (loading) return <SkeletonCard />;

  const themeConfig = {
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)]',
      indicator: 'bg-indigo-500',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]',
      indicator: 'bg-amber-500',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/50',
      iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)]',
      indicator: 'bg-blue-500',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]',
      indicator: 'bg-emerald-500',
    },
  }[theme];

  const cardBody = (
    <div
      className={`rounded-xl border ${themeConfig.border} bg-[#111111] p-5 transition-all duration-200 group relative overflow-hidden ${themeConfig.glow} ${
        to ? 'cursor-pointer hover:bg-[#141414]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${themeConfig.iconBg} transition-transform group-hover:scale-105`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums mb-1">
        {value ?? '—'}
      </div>
      <div className="flex items-center justify-between mt-2 pt-1">
        {subtitle && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
            <span className={`w-1.5 h-1.5 rounded-full ${themeConfig.indicator}`} />
            <span>{subtitle}</span>
          </div>
        )}
        {to && (
          <span className="text-[11px] font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <span>Filter</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
        {cardBody}
      </Link>
    );
  }

  return cardBody;
}


function ActivityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414] border border-[#2B2B2B] rounded-lg p-3 text-xs shadow-2xl backdrop-blur-md">
      <p className="text-[#8C8C8C] font-mono text-[11px] mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
        <span className="text-white font-semibold">{payload[0].value} tickets created</span>
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414] border border-[#2B2B2B] rounded-lg px-3 py-2 text-xs shadow-2xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
        <span className="text-white font-medium">{payload[0].name}:</span>
        <span className="font-bold text-white tabular-nums">{payload[0].value}</span>
      </div>
    </div>
  );
}


const STATUS_COLORS = {
  Open: '#F59E0B',
  'In Progress': '#3B82F6',
  Resolved: '#10B981',
};

const PRIORITY_COLORS = {
  Low: '#10B981',
  Medium: '#EAB308',
  High: '#F97316',
  Urgent: '#EF4444',
};

const CATEGORY_CONFIG = {
  Technical: { color: '#6366F1', barColor: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/20' },
  Billing: { color: '#10B981', barColor: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20' },
  Account: { color: '#06B6D4', barColor: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/10 border-cyan-500/20' },
  General: { color: '#F59E0B', barColor: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20' },
  Other: { color: '#94A3B8', barColor: 'bg-slate-400', text: 'text-slate-400', badge: 'bg-slate-500/10 border-slate-500/20' },
};

const EMPTY_DASHBOARD_LIST = [];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('14D');

  const { data, isLoading, isError, error, refetch } = useDashboardStats();

  const stats = data?.stats;
  const rawActivity = data?.activityData || EMPTY_DASHBOARD_LIST;
  const statusDist = data?.statusDistribution || [];
  const priorityDist = data?.priorityDistribution || [];
  const categoryDist = data?.categoryDistribution || EMPTY_DASHBOARD_LIST;
  const recentTickets = data?.recentTickets || [];


  const activity = useMemo(() => {
    if (!rawActivity || rawActivity.length === 0) return [];
    if (timeframe === '7D') {
      return rawActivity.slice(-7);
    }
    if (timeframe === '14D') {
      return rawActivity.slice(-14);
    }
    if (timeframe === '30D') {
      return rawActivity.slice(-30);
    }
    return rawActivity;
  }, [rawActivity, timeframe]);


  const categoryBreakdown = useMemo(() => {
    const total = categoryDist.reduce((sum, item) => sum + item.value, 0);
    return categoryDist.map(({ name, value }) => ({
      name,
      count: value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      config: CATEGORY_CONFIG[name] || CATEGORY_CONFIG.Other,
    }));
  }, [categoryDist]);

  const hasActivity = activity.some((d) => d.tickets > 0);
  const hasTickets = (stats?.total || 0) > 0;

  return (
    <div className="flex flex-col flex-1 bg-[#050505]">
      <AppHeader
        title="Overview"
        breadcrumbs={[{ label: 'ResolveDesk' }, { label: 'Overview' }]}
      />

      <div className="flex-1 p-7 space-y-7 max-w-7xl w-full mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1C1C1C]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">Support Operations Overview</h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} · {isLoading ? 'Synchronizing live metrics...' : `${stats?.total ?? 0} total tickets in workspace`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8C8C8C] bg-[#111111] px-3 py-1.5 rounded-lg border border-[#212121]">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Click any KPI card to filter tickets</span>
          </div>
        </div>

        {isError && (
          <ErrorState message={error?.message} onRetry={refetch} />
        )}


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Tickets"
            value={stats?.total}
            icon={Ticket}
            theme="indigo"
            subtitle="All registered cases"
            loading={isLoading}
            to="/tickets"
          />
          <StatCard
            label="Open"
            value={stats?.open}
            icon={CircleDot}
            theme="amber"
            subtitle="Awaiting triage & pickup"
            loading={isLoading}
            to="/tickets?status=Open"
          />
          <StatCard
            label="In Progress"
            value={stats?.inProgress}
            icon={Clock}
            theme="blue"
            subtitle="Actively investigated"
            loading={isLoading}
            to="/tickets?status=In Progress"
          />
          <StatCard
            label="Resolved"
            value={stats?.resolved}
            icon={CheckCircle2}
            theme="emerald"
            subtitle="Successfully closed"
            loading={isLoading}
            to="/tickets?status=Resolved"
          />
        </div>


        <div className="grid lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ticket Activity Volume</h3>
                </div>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  Incoming ticket submissions across the past {timeframe === '7D' ? '7 days' : timeframe === '30D' ? '30 days' : '14 days'}
                </p>
              </div>


              <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-lg border border-[#242424] self-start sm:self-auto">
                {['7D', '14D', '30D'].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      timeframe === tf
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-[#8C8C8C] hover:text-white hover:bg-[#202020]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : !hasActivity ? (
              <div className="h-48 flex items-center justify-center border border-dashed border-[#212121] rounded-lg">
                <p className="text-xs text-[#737373]">No ticket activity recorded in the past {timeframe}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={activity} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="ticketActivityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#737373' }}
                    tickLine={false}
                    axisLine={{ stroke: '#212121' }}
                    tickFormatter={(v) => format(new Date(v + 'T00:00:00'), 'MMM d')}
                    interval={timeframe === '30D' ? 4 : timeframe === '14D' ? 2 : 0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ActivityTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tickets"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fill="url(#ticketActivityGradient)"
                    dot={{ r: 2.5, fill: '#6366F1', stroke: '#111111', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#818CF8', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>


          <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Status Distribution</h3>
              </div>
              <p className="text-[11px] text-[#737373] mt-0.5">Workflow queue balance</p>
            </div>

            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : !hasTickets ? (
              <div className="h-48 flex items-center justify-center border border-dashed border-[#212121] rounded-lg">
                <p className="text-xs text-[#737373]">No tickets recorded</p>
              </div>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={statusDist.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={56}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#111111"
                      strokeWidth={2}
                    >
                      {statusDist.filter((d) => d.value > 0).map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366F1'} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2 mt-2 pt-3 border-t border-[#1C1C1C]">
                  {statusDist.map((item) => {
                    const color = STATUS_COLORS[item.name];
                    return (
                      <Link
                        key={item.name}
                        to={`/tickets?status=${item.name}`}
                        className="flex items-center justify-between text-xs hover:bg-[#181818] px-2 py-1 -mx-2 rounded-md transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-[#A3A3A3] group-hover:text-white font-medium transition-colors">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white tabular-nums">{item.value}</span>
                          <ArrowRight className="w-3 h-3 text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="grid md:grid-cols-2 gap-5">

          <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Priority Breakdown</h3>
                <span className="text-[11px] text-[#737373]">By urgency</span>
              </div>
              <p className="text-[11px] text-[#737373] mb-4">Tickets grouped by urgency severity</p>
            </div>

            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : !hasTickets ? (
              <div className="h-44 flex items-center justify-center border border-dashed border-[#212121] rounded-lg">
                <p className="text-xs text-[#737373]">No tickets recorded</p>
              </div>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={priorityDist} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" horizontal={true} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} axisLine={{ stroke: '#212121' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#737373' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<PieTooltip />} />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      onClick={(data) => {
                        if (data?.name) navigate(`/tickets?priority=${data.name}`);
                      }}
                      className="cursor-pointer"
                    >
                      {priorityDist.map((entry) => (
                        <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6366F1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#1C1C1C]">
                  {priorityDist.map((p) => (
                    <Link
                      key={p.name}
                      to={`/tickets?priority=${p.name}`}
                      className="text-center p-1.5 rounded-lg hover:bg-[#181818] transition-colors group"
                    >
                      <div className="text-[10px] font-semibold text-[#8C8C8C] group-hover:text-white mb-0.5">{p.name}</div>
                      <div className="text-sm font-bold font-mono text-white tabular-nums">{p.value}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>


          <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Category Breakdown</h3>
                </div>
                <span className="text-[11px] text-[#737373]">5 queues</span>
              </div>
              <p className="text-[11px] text-[#737373] mb-4">Volume distribution across operational domains</p>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : !hasTickets ? (
              <div className="h-44 flex items-center justify-center border border-dashed border-[#212121] rounded-lg">
                <p className="text-xs text-[#737373]">No tickets recorded</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {categoryBreakdown.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/tickets?category=${cat.name}`}
                    className="block group hover:bg-[#181818] p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.config.color }} />
                        <span className="text-xs font-medium text-[#E5E5E5] group-hover:text-white transition-colors">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-white tabular-nums">{cat.count}</span>
                        <span className="text-[10px] text-[#737373]">({cat.percentage}%)</span>
                      </div>
                    </div>


                    <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.config.barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.max(cat.percentage, cat.count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>


        <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C1C1C] bg-[#0D0D0D]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Tickets</h3>
              <p className="text-[11px] text-[#737373]">Latest support entries submitted</p>
            </div>
            <Link
              to="/tickets"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View all tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-xs text-[#737373]">No tickets recorded yet</p>
              <Link
                to="/tickets/new"
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create first ticket
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#161616] transition-colors group"
                >
                  <span className="text-xs font-mono text-indigo-400 group-hover:text-indigo-300 w-20 flex-shrink-0 font-medium">
                    {formatTicketId(ticket._id)}
                  </span>
                  <span className="flex-1 text-xs text-[#E5E5E5] group-hover:text-white truncate font-medium">
                    {ticket.subject}
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#161616] border border-[#242424] text-[#A3A3A3]">
                    {ticket.category}
                  </span>
                  <span className="hidden sm:block flex-shrink-0">
                    <PriorityBadge priority={ticket.priority} />
                  </span>
                  <span className="flex-shrink-0">
                    <StatusBadge status={ticket.status} />
                  </span>
                  <span className="hidden lg:block text-xs text-[#737373] font-mono flex-shrink-0">
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#616161] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
