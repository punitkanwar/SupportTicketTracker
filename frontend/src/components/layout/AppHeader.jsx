import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';

export function AppHeader({ title, breadcrumbs = [], actions }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-[#050505]/85 backdrop-blur-md border-b border-[#1C1C1C] px-7 py-3.5 flex items-center justify-between gap-4 lg:top-0 mt-14 lg:mt-0">
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[#737373] mb-1 font-medium">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3 text-[#404040]" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#A3A3A3]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-base font-bold text-white tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {actions}
        <button
          onClick={() => navigate('/tickets/new')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Ticket</span>
        </button>
      </div>
    </header>
  );
}
