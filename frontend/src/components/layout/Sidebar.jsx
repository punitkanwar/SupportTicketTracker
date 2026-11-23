import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Settings,
  X,
  Menu,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { useTickets } from '../../hooks/useTickets.js';
import { getWorkspacePreferences } from '../../pages/SettingsPage.jsx';

const navItems = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', to: '/tickets', icon: Ticket, showCount: true },
  { label: 'Settings', to: '/settings', icon: Settings },
];

function Logo() {
  return (
    <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1C1C1C]">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <span className="text-sm font-bold text-white tracking-tight">ResolveDesk</span>
        <span className="block text-[11px] text-[#737373] font-medium leading-none mt-1">Support Operations</span>
      </div>
    </div>
  );
}

function NavItem({ item, onClick, ticketCount, urgentCount }) {
  const Icon = item.icon;
  const navigate = useNavigate();

  const handleUrgentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/tickets?priority=Urgent');
    if (onClick) onClick();
  };

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group relative',
          isActive
            ? 'bg-gradient-to-r from-indigo-500/15 to-transparent text-white border-l-2 border-indigo-500 pl-3'
            : 'text-[#8C8C8C] hover:bg-[#141414] hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-indigo-400' : 'text-[#737373] group-hover:text-[#A3A3A3]')} />
          <span>{item.label}</span>
          {item.showCount && (
            <div className="ml-auto flex items-center gap-1.5">
              {urgentCount > 0 && (
                <button
                  type="button"
                  onClick={handleUrgentClick}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/60 text-red-400 flex items-center gap-1 transition-all cursor-pointer group/urgent shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                  title="Filter tickets by Urgent priority"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span>{urgentCount}</span>
                </button>
              )}
              {typeof ticketCount === 'number' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] border border-[#262626] text-[#A3A3A3]">
                  {ticketCount}
                </span>
              )}
            </div>
          )}
          {isActive && !item.showCount && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: ticketsData } = useTickets({ page: 1, limit: 1 });
  const { data: urgentData } = useTickets({ priority: 'Urgent', limit: 1 });
  const totalCount = ticketsData?.pagination?.total;
  const urgentCount = urgentData?.pagination?.total || 0;

  const [workspaceInfo, setWorkspaceInfo] = useState({
    teamName: 'Support Team',
    supportEmail: 'support@resolvedesk.com',
  });

  useEffect(() => {
    const updateWorkspace = () => {
      const prefs = getWorkspacePreferences();
      setWorkspaceInfo({
        teamName: prefs.teamName || 'Support Team',
        supportEmail: prefs.supportEmail || 'support@resolvedesk.com',
      });
    };

    updateWorkspace();
    window.addEventListener('resolvedesk_preferences_updated', updateWorkspace);
    return () => window.removeEventListener('resolvedesk_preferences_updated', updateWorkspace);
  }, []);

  const initials = workspaceInfo.teamName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      <Logo />

      <div className="flex-1 px-3.5 py-5 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#525252]">
            Navigation
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                ticketCount={totalCount}
                urgentCount={urgentCount}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      </div>


      <div className="px-3.5 py-4 border-t border-[#1C1C1C]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#111111] border border-[#212121]">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-indigo-300">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{workspaceInfo.teamName}</p>
            <p className="text-[10px] text-[#737373] truncate font-mono">{workspaceInfo.supportEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>

      <aside className="hidden lg:flex flex-col w-60 bg-[#0A0A0A] border-r border-[#1C1C1C] h-screen sticky top-0 flex-shrink-0 z-30">
        <SidebarContent />
      </aside>


      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0A0A0A] border-b border-[#1C1C1C] flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">ResolveDesk</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-1.5 rounded-md text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>


      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 w-60 bg-[#0A0A0A] border-r border-[#1C1C1C] flex flex-col h-full shadow-2xl">
            <div className="absolute right-3 top-4 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-md text-[#737373] hover:text-white hover:bg-[#1C1C1C] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
