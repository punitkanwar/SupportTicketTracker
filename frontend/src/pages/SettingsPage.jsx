import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '../components/layout/AppHeader.jsx';
import {
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Palette,
  Building2,
  Mail,
  Zap,
  LayoutGrid,
} from 'lucide-react';

const STORAGE_KEY = 'resolvedesk_preferences';

export function getWorkspacePreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {

  }
  return {
    teamName: 'Support Team',
    supportEmail: 'support@resolvedesk.com',
    defaultPriority: 'Medium',
    ticketsPerPage: 10,
  };
}

export default function SettingsPage() {
  const [teamName, setTeamName] = useState('Support Team');
  const [supportEmail, setSupportEmail] = useState('support@resolvedesk.com');
  const [defaultPriority, setDefaultPriority] = useState('Medium');
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const prefs = getWorkspacePreferences();
    setTeamName(prefs.teamName || 'Support Team');
    setSupportEmail(prefs.supportEmail || 'support@resolvedesk.com');
    setDefaultPriority(prefs.defaultPriority || 'Medium');
    setTicketsPerPage(Number(prefs.ticketsPerPage) || 10);
  }, []);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    const newPrefs = {
      teamName: teamName.trim() || 'Support Team',
      supportEmail: supportEmail.trim() || 'support@resolvedesk.com',
      defaultPriority,
      ticketsPerPage: Number(ticketsPerPage) || 10,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));

      window.dispatchEvent(new Event('resolvedesk_preferences_updated'));
      setSavedFeedback(true);
      toast.success('Workspace preferences saved successfully');
      setTimeout(() => setSavedFeedback(false), 3000);
    } catch (err) {
      toast.error('Failed to save preferences');
    }
  };

  const previewInitials = (teamName.trim() || 'Support Team')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';

  return (
    <div className="flex flex-col flex-1 bg-[#050505]">
      <AppHeader
        title="Settings & Workspace"
        breadcrumbs={[{ label: 'ResolveDesk' }, { label: 'Settings' }]}
      />

      <div className="flex-1 p-7 max-w-4xl w-full mx-auto space-y-7">

        <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1C1C1C]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Workspace Preferences</h2>
                <p className="text-xs text-[#737373] mt-0.5">Customize operational defaults for your support organization</p>
              </div>
            </div>
            {savedFeedback && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Preferences Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A3A3A3] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Support Team Name</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Core Support Team"
                  className="w-full h-10 px-3.5 text-xs bg-[#0E0E0E] border border-[#242424] rounded-lg text-white placeholder-[#616161] focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-[#737373]">Synced with the bottom sidebar profile card and audit authoring.</p>
              </div>


              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A3A3A3] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Support Contact Email</span>
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@resolvedesk.com"
                  className="w-full h-10 px-3.5 text-xs bg-[#0E0E0E] border border-[#242424] rounded-lg text-white placeholder-[#616161] focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-[#737373]">Displayed in the sidebar profile card for primary contact routing.</p>
              </div>


              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A3A3A3] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Default Priority (New Tickets)</span>
                </label>
                <div className="relative">
                  <select
                    value={defaultPriority}
                    onChange={(e) => setDefaultPriority(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-8 text-xs bg-[#0E0E0E] border border-[#242424] rounded-lg text-white appearance-none focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Low">Low — Minor, non-blocking</option>
                    <option value="Medium">Medium — Standard workflow impact</option>
                    <option value="High">High — Critical degradation</option>
                    <option value="Urgent">Urgent — Outage or emergency</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none text-[10px]">▾</span>
                </div>
                <p className="text-[11px] text-[#737373]">Initial priority selected when creating a new ticket.</p>
              </div>


              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A3A3A3] flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Default Tickets Per Page</span>
                </label>
                <div className="relative">
                  <select
                    value={ticketsPerPage}
                    onChange={(e) => setTicketsPerPage(Number(e.target.value))}
                    className="w-full h-10 pl-3.5 pr-8 text-xs bg-[#0E0E0E] border border-[#242424] rounded-lg text-white appearance-none focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value={5}>5 tickets per page</option>
                    <option value={10}>10 tickets per page (Default)</option>
                    <option value={20}>20 tickets per page</option>
                    <option value={50}>50 tickets per page</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none text-[10px]">▾</span>
                </div>
                <p className="text-[11px] text-[#737373]">Pagination density across the tickets directory view.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
              <span className="text-xs text-[#737373]">
                Changes persist instantly in your browser storage.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-[0_0_18px_rgba(99,102,241,0.35)] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>


        <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1C1C1C]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sidebar Profile Sync Preview</h3>
              <p className="text-[11px] text-[#737373] mt-0.5">Real-time appearance of your support profile card in the sidebar</p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Synced
            </span>
          </div>

          <div className="max-w-xs p-3 rounded-lg bg-[#0A0A0A] border border-[#212121]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500/25 to-purple-500/25 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-300">
                {previewInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{teamName || 'Support Team'}</p>
                <p className="text-[10px] text-[#737373] truncate font-mono">{supportEmail || 'support@resolvedesk.com'}</p>
              </div>
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1C1C1C]">
            <Palette className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Semantic Palette Tokens</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { role: 'Open Status', color: 'Amber / Gold', hex: '#F59E0B', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
              { role: 'In Progress', color: 'Blue / Indigo', hex: '#3B82F6', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
              { role: 'Resolved', color: 'Emerald Green', hex: '#10B981', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
              { role: 'Urgent Priority', color: 'Crimson Red', hex: '#EF4444', badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
            ].map((token) => (
              <div key={token.role} className="p-3 rounded-lg bg-[#0D0D0D] border border-[#1C1C1C]">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: token.hex }} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${token.badge}`}>
                    Sample
                  </span>
                </div>
                <p className="text-xs font-bold text-white">{token.role}</p>
                <p className="text-[11px] font-mono text-[#737373] mt-0.5">{token.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
